import { isMainThread, workerData, parentPort } from "worker_threads";
const cloudinary = require("cloudinary").v2;

if (!isMainThread) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  try {
    const { fileData, customFilename, options } = JSON.parse(workerData);

    // Build filename with extension
    const fileExtension = options.fileExtension || "svg";
    const fileName = customFilename.includes(".")
      ? customFilename.replace(/\.[^/.]+$/, "") // Remove extension for Cloudinary public_id
      : customFilename;

    // Prepare upload options
    const uploadOptions: any = {
      public_id: fileName,
      folder: options.folder || "whatsnxt",
      resource_type: options.resourceType || "auto",
      use_filename: options.useUniqueFileName ? false : true,
      unique_filename: options.useUniqueFileName || false,
      overwrite: options.overwrite || false,
      tags: options.tags || [],
    };

    // Add transformation if provided
    if (
      options.transformation &&
      Object.keys(options.transformation).length > 0
    ) {
      uploadOptions.transformation = options.transformation;
    }

    // Add context (custom metadata) if provided
    if (options.context && Object.keys(options.context).length > 0) {
      uploadOptions.context = options.context;
    }

    // Add any additional Cloudinary-specific options
    if (options.cloudinaryOptions) {
      Object.assign(uploadOptions, options.cloudinaryOptions);
    }

    console.log("Cloudinary Worker :: Starting upload:", {
      public_id: uploadOptions.public_id,
      folder: uploadOptions.folder,
      resource_type: uploadOptions.resource_type,
      unique_filename: uploadOptions.unique_filename,
      hasTransformation: !!uploadOptions.transformation,
      hasContext: !!uploadOptions.context,
    });

    // Convert base64 to data URI for Cloudinary
    const dataUri = `data:image/${fileExtension};base64,${fileData}`;

    cloudinary.uploader
      .upload(dataUri, uploadOptions)
      .then((result) => {
        console.log("Cloudinary Worker :: Upload successful:", result);

        // Ensure we have the required fields for frontend validation
        const responseData = {
          // Cloudinary native fields
          public_id: result.public_id,
          version: result.version,
          signature: result.signature,
          width: result.width || 0,
          height: result.height || 0,
          format: result.format,
          resource_type: result.resource_type,
          created_at: result.created_at,
          bytes: result.bytes,
          type: result.type,
          etag: result.etag,
          placeholder: result.placeholder || false,
          url: result.url,
          secure_url: result.secure_url,

          // Additional compatibility fields
          fileId: result.public_id, // For compatibility with ImageKit
          name: result.original_filename || fileName,
          filePath: result.public_id,
          size: result.bytes,
          fileType: result.format,
          timestamp: new Date(result.created_at).getTime(),
          duration: result.duration || 0,

          // Full response for debugging
          _fullResponse: result,
        };

        // Validate that we have the required fields before sending
        if (!responseData.secure_url || !responseData.public_id) {
          console.error("Cloudinary Worker :: Missing required fields:", {
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
        console.error("Cloudinary Worker :: Error uploading:", error);

        // Send error message in the format expected by frontend
        parentPort?.postMessage({
          status: "error",
          error: error.message || "Failed to upload image to Cloudinary",
          details: error,
        });
      });
  } catch (parseError) {
    console.error(
      "Cloudinary Worker :: Error parsing worker data:",
      parseError,
    );

    // Send error message in the format expected by frontend
    parentPort?.postMessage({
      status: "error",
      error: parseError.message || "Failed to parse worker data",
      details: parseError,
    });
  }
}
