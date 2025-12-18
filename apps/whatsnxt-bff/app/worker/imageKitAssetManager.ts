import { Worker, isMainThread } from "worker_threads";
import path from "path";

const imageKitAssetManager = async (
  formData: any,
  customFilename: any,
  options: any = {},
) => {
  if (!isMainThread) return null;

  return new Promise((resolve, reject) => {
    const workerPath = path.resolve(__dirname, "imagekit-worker.js");

    // Extract file data from FormData
    let fileBuffer = null;
    let fileName = customFilename;

    if (formData instanceof FormData) {
      // Get the file from FormData
      const file = formData.get("file");
      if (file) {
        // Convert file to buffer for worker transmission
        const reader = new FileReader();
        reader.onload = () => {
          fileBuffer = Buffer.from(reader.result as ArrayBuffer);
          startWorker();
        };
        reader.onerror = () =>
          reject(new Error("Failed to read file from FormData"));
        reader.readAsArrayBuffer(file as Blob);
        return;
      } else {
        reject(new Error("No file found in FormData"));
        return;
      }
    } else if (Buffer.isBuffer(formData)) {
      fileBuffer = formData;
      startWorker();
    } else if (typeof formData === "string") {
      // Assume it's base64 or file path
      fileBuffer = formData;
      startWorker();
    } else {
      reject(new Error("Unsupported file data type"));
      return;
    }

    function startWorker() {
      const workerDataPayload = {
        fileData: fileBuffer.toString("base64"), // Convert buffer to base64 for worker
        customFilename: fileName,
        options: {
          folder: options.folder || "whatsnxt",
          useUniqueFileName: options.useUniqueFileName || false,
          fileExtension: options.fileExtension || "svg",
          ...options,
        },
      };

      const worker = new Worker(workerPath, {
        workerData: JSON.stringify(workerDataPayload),
      });

      // Set timeout to prevent hanging workers
      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error("Worker timeout: Upload took too long"));
      }, 30000);

      worker.on("message", (result) => {
        clearTimeout(timeout);

        // Add detailed logging for debugging
        console.log(
          "Asset Manager :: Worker response:",
          JSON.stringify(result, null, 2),
        );

        if (result && result.error) {
          console.error(
            "Asset Manager :: Worker returned error:",
            result.error,
          );
          reject(new Error(result.error));
        } else if (result && result.status === "success") {
          // Handle success response from worker
          console.log(
            "Asset Manager :: Success response received:",
            result.response,
          );
          resolve(result.response);
        } else if (result && result.status === "error") {
          // Handle error response from worker
          console.error(
            "Asset Manager :: Error response received:",
            result.error,
          );
          reject(new Error(result.error));
        } else {
          // Handle legacy format or unexpected response
          console.log(
            "Asset Manager :: Legacy or unexpected response format:",
            result,
          );
          resolve(result);
        }
      });

      worker.on("error", (error) => {
        clearTimeout(timeout);
        console.error("Asset Manager :: Worker error event:", error);
        reject(error);
      });

      worker.on("exit", (code) => {
        clearTimeout(timeout);
        if (code !== 0) {
          console.error("Asset Manager :: Worker exited with code:", code);
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });

      // Gracefully shut down the worker thread when it is no longer needed
      const cleanup = () => {
        clearTimeout(timeout);
        worker.terminate();
      };

      process.on("exit", cleanup);
      process.on("SIGINT", cleanup);
      process.on("SIGTERM", cleanup);

      // Allow the Node.js process to exit even if the worker thread is still running
      worker.unref();
    }
  });
};

export { imageKitAssetManager };
