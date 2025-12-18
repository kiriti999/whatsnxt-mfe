import { isMainThread, workerData, parentPort } from "worker_threads";
import ImageKit from "imagekit";

if (!isMainThread) {
  const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });

  try {
    const { fileData, customFilename, options } = JSON.parse(workerData);

    // Build filename with extension
    const fileExtension = options.fileExtension || "svg";
    const fileName = customFilename.includes(".")
      ? customFilename
      : `${customFilename}.${fileExtension}`;

    // Prepare upload options - Remove problematic custom metadata
    const uploadOptions: any = {
      file: fileData, // base64 string (converted from FormData buffer)
      fileName: fileName,
      useUniqueFileName: options.useUniqueFileName || true,
      folder: options.folder || "whatsnxt",
      tags: options.tags || [],
    };

    // Only add custom metadata if it exists and contains valid fields
    if (
      options.customMetadata &&
      Object.keys(options.customMetadata).length > 0
    ) {
      // Filter out the problematic fields
      const validCustomMetadata = {};
      const invalidFields = [
        "uploadedVia",
        "uploadTime",
        "originalName",
        "mimeType",
        "size",
      ];

      for (const [key, value] of Object.entries(options.customMetadata)) {
        if (!invalidFields.includes(key)) {
          validCustomMetadata[key] = value;
        }
      }

      // Only add customMetadata if there are valid fields
      if (Object.keys(validCustomMetadata).length > 0) {
        uploadOptions.customMetadata = validCustomMetadata;
      }
    }

    console.log("ImageKit Worker :: Starting upload:", {
      fileName: uploadOptions.fileName,
      folder: uploadOptions.folder,
      useUniqueFileName: uploadOptions.useUniqueFileName,
      hasCustomMetadata: !!uploadOptions.customMetadata,
    });

    imagekit
      .upload(uploadOptions)
      .then((result) => {
        console.log("ImageKit Worker :: Upload successful:", result);

        // Ensure we have the required fields for frontend validation
        const responseData = {
          // ImageKit native fields
          fileId: result.fileId,
          name: result.name,
          url: result.url,
          filePath: result.filePath,
          size: result.size,
          fileType: result.fileType,
          height: result.height || 0,
          width: result.width || 0,

          // Required compatibility fields that frontend checks for
          secure_url: result.url, // Frontend checks for this
          public_id: result.fileId, // Frontend checks for this

          // Additional compatibility fields
          format: result.fileType || fileExtension,
          resource_type: getResourceType(result.fileType || fileExtension),
          timestamp: Date.now(),
          duration: 0, // Default for non-video files

          // Full response for debugging
          _fullResponse: result,
        };

        // Validate that we have the required fields before sending
        if (!responseData.secure_url || !responseData.public_id) {
          console.error("ImageKit Worker :: Missing required fields:", {
            secure_url: responseData.secure_url,
            public_id: responseData.public_id,
            originalResult: result,
          });

          parentPort?.postMessage({
            status: "error",
            error:
              "Invalid response structure: missing secure_url or public_id",
            details: { responseData, originalResult: result },
          });
          return;
        }

        // Send success message in the format expected by frontend
        parentPort?.postMessage({
          status: "success",
          response: responseData,
        });
      })
      .catch((error) => {
        console.error("ImageKit Worker :: Error uploading:", error);

        // Send error message in the format expected by frontend
        parentPort?.postMessage({
          status: "error",
          error: error.message || "Failed to upload image to ImageKit",
          details: error,
        });
      });
  } catch (parseError) {
    console.error("ImageKit Worker :: Error parsing worker data:", parseError);

    // Send error message in the format expected by frontend
    parentPort?.postMessage({
      status: "error",
      error: parseError.message || "Failed to parse worker data",
      details: parseError,
    });
  }
}

// Helper function to determine resource type based on file extension
function getResourceType(fileType) {
  if (!fileType) return "auto";

  const imageTypes = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "svg",
    "webp",
    "bmp",
    "tiff",
  ];
  const videoTypes = ["mp4", "avi", "mov", "wmv", "flv", "webm"];

  const type = fileType.toLowerCase();

  if (imageTypes.includes(type)) return "image";
  if (videoTypes.includes(type)) return "video";
  return "raw";
}
