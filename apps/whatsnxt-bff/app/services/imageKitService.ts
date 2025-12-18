import ImageKit from "imagekit";
import { imageKitAssetManager } from "../worker/imageKitAssetManager";
import { getLogger } from "../../config/logger";
const logger = getLogger("ImageKitService");

interface ImageKitConfig {
  publicKey: string | undefined;
  privateKey: string | undefined;
  urlEndpoint: string | undefined;
}

class ImageKitService {
  private imagekit: any;
  public config: ImageKitConfig;

  constructor() {
    // Initialize ImageKit configuration
    this.initializeImageKit();
  }

  initializeImageKit() {
    const config = {
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    };

    // Validate configuration
    if (!config.publicKey || !config.privateKey || !config.urlEndpoint) {
      logger.warn(
        "Warning: ImageKit credentials not found in environment variables.",
      );
      throw new Error("ImageKit credentials are required");
    }

    // Initialize ImageKit instance
    this.imagekit = new ImageKit(config);

    // Store config for reference
    this.config = config;
  }

  // Method that actually uses the worker (updated to use assetManager)
  async uploadFileViaWorker(fileData, fileName, options: any = {}) {
    try {
      logger.info(
        "ImageKitService :: uploadFileViaWorker :: Starting upload for:",
        fileName,
      );

      // Use the assetManager worker directly with fileData (no base64 conversion)
      const result = await imageKitAssetManager(fileData, fileName, options);

      logger.info(
        "ImageKitService :: uploadFileViaWorker :: Upload successful via worker",
      );
      return result;
    } catch (error) {
      logger.error("ImageKitService :: uploadFileViaWorker :: error:", error);
      throw new Error(`Worker upload failed: ${error.message}`);
    }
  }

  // Direct upload method (no worker) for when you need synchronous behavior
  async uploadFileDirect(fileData, fileName, options: any = {}) {
    try {
      logger.info(
        "ImageKitService :: uploadFileDirect :: Starting direct upload for:",
        fileName,
      );

      const uploadOptions = {
        file: fileData, // Can be base64, buffer, or file path
        fileName: fileName,
        folder: options.folder || "/uploads",
        tags: options.tags || ["direct-upload"],
        useUniqueFileName: options.useUniqueFileName || false,
        customMetadata: {
          uploadedVia: "direct",
          uploadTime: new Date().toISOString(),
          ...options.customMetadata,
        },
        ...options,
      };

      const result = await this.imagekit.upload(uploadOptions);

      logger.info("ImageKitService :: uploadFileDirect :: Upload successful:", {
        fileId: result.fileId,
        name: result.name,
        url: result.url,
      });

      return {
        fileId: result.fileId,
        name: result.name,
        url: result.url,
        filePath: result.filePath,
        size: result.size,
        fileType: result.fileType,
        height: result.height,
        width: result.width,

        // Compatibility fields for easier migration from Cloudinary
        public_id: result.fileId,
        secure_url: result.url,

        _fullResponse: result,
      };
    } catch (error) {
      logger.error("ImageKitService :: uploadFileDirect :: error:", error);
      throw new Error(`Direct upload failed: ${error.message}`);
    }
  }

  async deleteMultiAssets(assets) {
    logger.info("ImageKitService :: deleteMultiAssets :: assets:", assets);
    try {
      // ImageKit doesn't have resource types like Cloudinary, so we'll process all as files
      const fileIds = assets.map((asset) => asset.fileId || asset.public_id);

      logger.info("📝 Files to delete:", fileIds);

      // Helper function to delete files in batches (ImageKit has rate limits)
      const deleteBatch = async (ids, batchSize = 10) => {
        const results = [];

        for (let i = 0; i < ids.length; i += batchSize) {
          const batch = ids.slice(i, i + batchSize);
          logger.info(
            `🗑️ Deleting batch ${Math.floor(i / batchSize) + 1}: ${batch.length} files`,
          );

          const batchResults = await Promise.allSettled(
            batch.map(async (fileId) => {
              try {
                const result = await this.imagekit.deleteFile(fileId);
                logger.info(`✅ Deleted file: ${fileId}`);
                return { fileId, success: true, result };
              } catch (error) {
                logger.error(`❌ Failed to delete file: ${fileId}`, error);
                return { fileId, success: false, error: error.message };
              }
            }),
          );

          results.push(...batchResults);

          // Add delay between batches to respect rate limits
          if (i + batchSize < ids.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        return results;
      };

      // Delete all files
      const deleteResults = await deleteBatch(fileIds);

      // Process results
      const processedResults = {
        successful: [],
        failed: [],
        summary: {
          totalAssets: assets.length,
          successfulDeletions: 0,
          failedDeletions: 0,
        },
      };

      deleteResults.forEach((result) => {
        if (result.status === "fulfilled") {
          if (result.value.success) {
            processedResults.successful.push(result.value);
            processedResults.summary.successfulDeletions++;
          } else {
            processedResults.failed.push(result.value);
            processedResults.summary.failedDeletions++;
          }
        } else {
          processedResults.failed.push({
            error: result.reason.message || result.reason,
            success: false,
          });
          processedResults.summary.failedDeletions++;
        }
      });

      logger.info("📊 Deletion summary:", processedResults.summary);

      return processedResults;
    } catch (error) {
      logger.error("ImageKitService :: deleteMultiAssets :: error:", error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      const result = await this.imagekit.deleteFile(fileId);
      logger.info("ImageKitService :: deleteFile :: success:", result);
      return result;
    } catch (error) {
      logger.error("ImageKitService :: deleteFile :: error:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async listFiles(options: any = {}) {
    try {
      const listOptions = {
        skip: options.skip || 0,
        limit: options.limit || 1000,
        searchQuery: options.searchQuery || "",
        ...options,
      };

      const result = await this.imagekit.listFiles(listOptions);
      return result;
    } catch (error) {
      logger.error("ImageKitService :: listFiles :: error:", error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  async getFileDetails(fileId) {
    try {
      const result = await this.imagekit.getFileDetails(fileId);
      return result;
    } catch (error) {
      logger.error("ImageKitService :: getFileDetails :: error:", error);
      throw new Error(`Failed to get file details: ${error.message}`);
    }
  }

  // Helper method to generate authentication parameters for client-side uploads
  getAuthenticationParameters() {
    try {
      return this.imagekit.getAuthenticationParameters();
    } catch (error) {
      logger.error(
        "ImageKitService :: getAuthenticationParameters :: error:",
        error,
      );
      throw new Error(
        `Failed to generate authentication parameters: ${error.message}`,
      );
    }
  }

  // Helper method to generate URLs with transformations
  url(options) {
    try {
      return this.imagekit.url(options);
    } catch (error) {
      logger.error("ImageKitService :: url :: error:", error);
      throw new Error(`Failed to generate URL: ${error.message}`);
    }
  }
}

// Create singleton instance
const imageKitService = new ImageKitService();

export { ImageKitService, imageKitService };
