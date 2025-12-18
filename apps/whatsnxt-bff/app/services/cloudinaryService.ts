import { v2 as cloudinary } from "cloudinary";
import { promises as fs } from "fs";
import { cloudinaryAssetManager } from "../worker/cloudinaryAssetManager";
import { ValidationError } from "class-validator";
import { getLogger } from "../../config/logger";
const logger = getLogger("cloudinaryService");
class CloudinaryService {
  private config: any;

  constructor() {
    // Initialize Cloudinary configuration
    this.initializeCloudinary();
  }

  initializeCloudinary() {
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "cloudinary999",
      api_key: process.env.CLOUDINARY_API_KEY || "429854764125427",
      api_secret:
        process.env.CLOUDINARY_API_SECRET || "PxEdUKCLC9Shs-DJbMWUEmZGC-s",
    };

    // Validate configuration
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      logger.warn(
        "Warning: Cloudinary credentials not found in environment variables. Using default values.",
      );
    }

    cloudinary.config(config);

    // Store config for reference
    this.config = config;
  }

  async uploadFileViaWorker(
    file,
    resource_type = "auto",
    folder = "whatsnxt",
    options = {},
  ) {
    try {
      if (!file) {
        throw new Error("File is required");
      }

      if (file.originalname.length > 110) {
        throw new Error(
          `Filename is too long. Maximum 110 characters allowed, but got ${file.originalname.length} characters. Please rename your file and try again.`,
        );
      }

      // Read file from disk into buffer for worker
      const fileBuffer = await fs.readFile(file.path);

      // Extract filename without extension for public_id
      const fileNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
      const fileExtension = file.originalname.split(".").pop();

      const workerOptions = {
        folder,
        resourceType: resource_type,
        useUniqueFileName: true,
        fileExtension: fileExtension,
        cloudinaryOptions: {
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          public_id: fileNameWithoutExt,
          ...options,
        },
      };

      logger.info(
        "CloudinaryService :: uploadAsset :: workerOptions:",
        workerOptions,
      );

      // Use the worker-based asset manager
      const result = await cloudinaryAssetManager(
        fileBuffer,
        fileNameWithoutExt,
        workerOptions,
      );

      return result;
    } catch (error) {
      logger.error("CloudinaryService :: uploadAsset :: error:", error);
      // @ts-ignore
      if (error instanceof ValidationError || error instanceof UploadError) {
        throw error;
      }

      // Wrap unexpected errors as UploadError
      // @ts-ignore
      throw new UploadError(`Unexpected upload error: ${error.message}`);
    }
  }

  // Alternative method that keeps the original approach (for backwards compatibility)
  async uploadAssetDirect(
    file,
    resource_type = "auto",
    folder = "whatsnxt",
    options = {},
  ) {
    try {
      if (!file) {
        throw new Error("File is required");
      }

      if (file.originalname.length > 110) {
        throw new Error(
          `Filename is too long. Maximum 110 characters allowed, but got ${file.originalname.length} characters. Please rename your file and try again.`,
        );
      }

      const uploadOptions = {
        folder,
        resource_type: resource_type,
        use_filename: true,
        unique_filename: true,
        overwrite: true,
        public_id: file.originalname,
        ...options,
      };

      logger.info(
        "CloudinaryService :: uploadAssetDirect :: uploadOptions:",
        uploadOptions,
      );

      // Use async/await with promisified cloudinary upload
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          file.path, // Use the file path from disk storage
          // @ts-ignore
          uploadOptions,
          (error, result) => {
            if (error) {
              logger.error(
                "CloudinaryService :: uploadAssetDirect :: upload error:",
                error,
              );
              return reject(error);
            }
            resolve(result);
          },
        );
      });

      return result;
    } catch (error) {
      logger.error("CloudinaryService :: uploadAssetDirect :: error:", error);
      // Re-throw custom errors as-is
      // @ts-ignore
      if (error instanceof ValidationError || error instanceof UploadError) {
        throw error;
      }

      // Wrap unexpected errors as UploadError
      // @ts-ignore
      throw new UploadError(`Unexpected upload error: ${error.message}`);
    }
  }

  async deleteMultiAssets(assets) {
    logger.info(
      " @@@CloudinaryService :: deleteMultiAssets :: assets:",
      assets,
    );
    try {
      // Type mapping for flexibility
      const typeMapping = {
        image: "image",
        images: "image",
        video: "video",
        videos: "video",
        raw: "raw",
        document: "raw",
        auto: "auto",
      };

      // Normalize asset types before processing
      const normalizedAssets = assets.map((asset) => ({
        ...asset,
        resource_type: typeMapping[asset.resource_type] || asset.resource_type,
      }));

      logger.info(
        "normalizedAssets:",
        JSON.stringify(normalizedAssets, null, 2),
      );

      // Helper function to delete resources by type using async/await
      const deleteByResourceType = async (ids, resourceType) => {
        if (ids.length === 0) {
          return { deleted: {}, deleted_counts: { [resourceType]: 0 } };
        }

        try {
          logger.info(
            `🗑️ Deleting ${ids.length} ${resourceType} resources:`,
            ids,
          );

          return await new Promise((resolve, reject) => {
            cloudinary.api.delete_resources(
              ids,
              {
                resource_type: resourceType,
                invalidate: true,
              },
              (error, result) => {
                if (result) {
                  logger.info(`✅ Deleted ${resourceType} resources:`, result);
                  resolve(result);
                } else {
                  logger.error(
                    `❌ Failed to delete ${resourceType} resources:`,
                    error,
                  );
                  reject(
                    error ||
                      new Error(`Failed to delete ${resourceType} resources`),
                  );
                }
              },
            );
          });
        } catch (error) {
          throw new Error(
            `Failed to delete ${resourceType} resources: ${error.message}`,
          );
        }
      };

      // Separate public IDs by resource type using normalized assets
      const imageIds = normalizedAssets
        .filter((asset) => asset.resource_type === "image")
        .map((asset) => asset.public_id);
      const videoIds = normalizedAssets
        .filter((asset) => asset.resource_type === "video")
        .map((asset) => asset.public_id);
      const rawIds = normalizedAssets
        .filter((asset) => asset.resource_type === "raw")
        .map((asset) => asset.public_id);
      const autoIds = normalizedAssets
        .filter((asset) => asset.resource_type === "auto")
        .map((asset) => asset.public_id);

      logger.info("📝 Grouped assets by resource type:", {
        image: imageIds,
        video: videoIds,
        raw: rawIds,
        auto: autoIds,
      });

      // Delete each type of resource
      const results = await Promise.allSettled([
        imageIds.length > 0
          ? deleteByResourceType(imageIds, "image")
          : Promise.resolve({ skipped: "image" }),
        videoIds.length > 0
          ? deleteByResourceType(videoIds, "video")
          : Promise.resolve({ skipped: "video" }),
        rawIds.length > 0
          ? deleteByResourceType(rawIds, "raw")
          : Promise.resolve({ skipped: "raw" }),
        autoIds.length > 0
          ? deleteByResourceType(autoIds, "auto")
          : Promise.resolve({ skipped: "auto" }),
      ]);

      // Process results
      const processedResults = {
        successful: [],
        failed: [],
        summary: {
          totalAssets: assets.length,
          normalizedAssets: normalizedAssets.length,
          successfulDeletions: 0,
          failedDeletions: 0,
        },
      };

      results.forEach((result, index) => {
        const resourceTypes = ["image", "video", "raw", "auto"];
        const resourceType = resourceTypes[index];

        if (result.status === "fulfilled") {
          processedResults.successful.push({
            resourceType,
            result: result.value,
          });

          const resultValue = result.value as any;
          if (resultValue.deleted_counts) {
            const deletedCount = Object.values(
              resultValue.deleted_counts,
            ).reduce((sum: number, count: any) => sum + count, 0) as number;
            processedResults.summary.successfulDeletions += deletedCount;
          }
        } else {
          processedResults.failed.push({
            resourceType,
            error: result.reason.message || result.reason,
          });
        }
      });

      processedResults.summary.failedDeletions =
        processedResults.summary.totalAssets -
        processedResults.summary.successfulDeletions;

      logger.info("📊 Deletion summary:", processedResults.summary);

      return processedResults;
    } catch (error) {
      logger.error("CloudinaryService :: deleteMultiAssets :: error:", error);
      throw error;
    }
  }

  // #region FOLDER MANAGEMENT METHODS - BATCHED VERSION
  // ===========================================
  // FOLDER MANAGEMENT METHODS - BATCHED VERSION
  // ===========================================

  /**
   * Delete all empty folders with rate limiting and batching
   * @param {Object} options - Options for deletion
   * @param {boolean} options.dryRun - If true, only identify empty folders without deleting (default: false)
   * @param {number} options.batchSize - Number of folders to process per batch (default: 10)
   * @param {number} options.delayBetweenBatches - Delay in ms between batches (default: 2000)
   * @param {number} options.maxApiCallsPerMinute - Max API calls per minute (default: 100)
   * @param {Array<string>} options.excludeFolders - Folder paths to exclude from deletion
   * @param {boolean} options.continueOnError - Continue if individual deletions fail (default: true)
   * @returns {Promise<Object>} - Results of the deletion operation
   */
  // @ts-ignore
  async deleteAllEmptyFoldersWithRateLimit(options: any = {}) {
    try {
      const {
        dryRun = false,
        batchSize = 10,
        delayBetweenBatches = 2000, // 2 seconds between batches
        maxApiCallsPerMinute = 100,
        excludeFolders = [],
        continueOnError = true,
      } = options;

      logger.info(
        "CloudinaryService :: deleteAllEmptyFoldersWithRateLimit :: options:",
        options,
      );

      const results = {
        emptyFolders: [],
        deletedFolders: [],
        failedDeletions: [],
        excludedFolders: [],
        batches: [],
        summary: {
          totalBatches: 0,
          totalFoldersScanned: 0,
          emptyFoldersFound: 0,
          foldersDeleted: 0,
          failedDeletions: 0,
          excludedFromDeletion: 0,
          totalApiCalls: 0,
          dryRun,
        },
      };

      // Rate limiting tracker
      const rateLimiter = {
        startTime: Date.now(),
        apiCalls: 0,
        lastBatchTime: Date.now(),
      };

      // Step 1: Get folders in batches
      logger.info("📁 Fetching folders in batches...");
      const allFolders = await this.getAllFoldersWithRateLimit({
        batchSize,
        delayBetweenBatches,
        maxApiCallsPerMinute,
      });

      results.summary.totalFoldersScanned = allFolders.length;
      logger.info(`📊 Found ${allFolders.length} total folders to scan`);

      // Step 2: Process folders in batches
      const folderBatches = this.chunkArray(allFolders, batchSize);
      results.summary.totalBatches = folderBatches.length;

      logger.info(
        `🔄 Processing ${folderBatches.length} batches of ${batchSize} folders each`,
      );

      for (let i = 0; i < folderBatches.length; i++) {
        const batch = folderBatches[i];
        const batchStartTime = Date.now();

        logger.info(
          `\n📦 Processing batch ${i + 1}/${folderBatches.length} (${batch.length} folders)`,
        );

        const batchResults = {
          batchNumber: i + 1,
          foldersInBatch: batch.length,
          emptyFoldersFound: 0,
          foldersDeleted: 0,
          errors: 0,
          apiCalls: 0,
          processingTime: 0,
        };

        // Check rate limiting before processing batch
        await this.enforceRateLimit(rateLimiter, maxApiCallsPerMinute);

        // Process each folder in the batch
        for (const folder of batch) {
          try {
            // Check if folder is empty
            // @ts-ignore
            const isEmpty = await this.isFolderEmpty(folder.path);
            rateLimiter.apiCalls++;
            batchResults.apiCalls++;

            if (isEmpty) {
              results.emptyFolders.push(folder);
              results.summary.emptyFoldersFound++;
              batchResults.emptyFoldersFound++;

              // Check if folder should be excluded
              if (excludeFolders.includes(folder.path)) {
                results.excludedFolders.push(folder);
                results.summary.excludedFromDeletion++;
                logger.info(
                  `⚠️  Excluding folder from deletion: ${folder.path}`,
                );
                continue;
              }

              if (dryRun) {
                logger.info(
                  `🔍 [DRY RUN] Would delete empty folder: ${folder.path}`,
                );
              } else {
                // Delete the empty folder
                logger.info(`🗑️  Deleting empty folder: ${folder.path}`);

                try {
                  // @ts-ignore
                  const deleteResult = await this.deleteSingleFolder(
                    folder.path,
                  );
                  rateLimiter.apiCalls++;
                  batchResults.apiCalls++;

                  results.deletedFolders.push({
                    folder,
                    result: deleteResult,
                  });
                  results.summary.foldersDeleted++;
                  batchResults.foldersDeleted++;
                  logger.info(`✅ Successfully deleted: ${folder.path}`);
                } catch (deleteError) {
                  results.failedDeletions.push({
                    folder,
                    error: deleteError.message,
                  });
                  results.summary.failedDeletions++;
                  batchResults.errors++;
                  logger.error(
                    `❌ Failed to delete ${folder.path}:`,
                    deleteError.message,
                  );

                  if (!continueOnError) {
                    throw deleteError;
                  }
                }
              }
            } else {
              logger.info(`📄 Folder has content, skipping: ${folder.path}`);
            }

            // Small delay between individual folder operations
            await this.delay(100);
          } catch (error) {
            logger.error(
              `❌ Error processing folder ${folder.path}:`,
              error.message,
            );
            results.failedDeletions.push({
              folder,
              error: `Failed to process folder: ${error.message}`,
            });
            results.summary.failedDeletions++;
            batchResults.errors++;

            if (!continueOnError) {
              throw error;
            }
          }
        }

        batchResults.processingTime = Date.now() - batchStartTime;
        results.batches.push(batchResults);
        results.summary.totalApiCalls = rateLimiter.apiCalls;

        logger.info(
          `📊 Batch ${i + 1} completed: ${batchResults.emptyFoldersFound} empty, ${batchResults.foldersDeleted} deleted, ${batchResults.errors} errors, ${batchResults.apiCalls} API calls`,
        );

        // Delay between batches (except for the last batch)
        if (i < folderBatches.length - 1) {
          logger.info(
            `⏱️  Waiting ${delayBetweenBatches}ms before next batch...`,
          );
          await this.delay(delayBetweenBatches);
        }
      }

      // Final summary
      logger.info("\n📋 Batched Empty Folders Deletion Summary:");
      logger.info(
        `   Total batches processed: ${results.summary.totalBatches}`,
      );
      logger.info(
        `   Total folders scanned: ${results.summary.totalFoldersScanned}`,
      );
      logger.info(
        `   Empty folders found: ${results.summary.emptyFoldersFound}`,
      );
      if (dryRun) {
        logger.info(
          `   Folders that would be deleted: ${results.summary.emptyFoldersFound - results.summary.excludedFromDeletion}`,
        );
      } else {
        logger.info(
          `   Folders successfully deleted: ${results.summary.foldersDeleted}`,
        );
        logger.info(`   Failed deletions: ${results.summary.failedDeletions}`);
      }
      logger.info(
        `   Excluded from deletion: ${results.summary.excludedFromDeletion}`,
      );
      logger.info(`   Total API calls made: ${results.summary.totalApiCalls}`);

      return results;
    } catch (error) {
      logger.error(
        "CloudinaryService :: deleteAllEmptyFoldersWithRateLimit :: error:",
        error,
      );
      throw new Error(
        `Failed to delete empty folders with rate limiting: ${error.message}`,
      );
    }
  }

  /**
   * Get all folders with rate limiting and batching
   * @param {Object} options - Options for fetching folders
   * @returns {Promise<Array>} - Flat array of all folders
   */
  async getAllFoldersWithRateLimit(options: any = {}) {
    try {
      const {
        batchSize = 10,
        delayBetweenBatches = 2000,
        maxApiCallsPerMinute = 100,
      } = options;

      const allFolders = [];
      const rateLimiter = {
        startTime: Date.now(),
        apiCalls: 0,
        lastBatchTime: Date.now(),
      };

      logger.info("📁 Fetching root folders...");

      // Get root folders with pagination
      let nextCursor = null;
      do {
        await this.enforceRateLimit(rateLimiter, maxApiCallsPerMinute);

        // @ts-ignore
        const rootResult = await this.getFolders({
          max_results: 100, // Smaller batches
          next_cursor: nextCursor,
        });
        rateLimiter.apiCalls++;

        if (rootResult.folders) {
          allFolders.push(...rootResult.folders);
          logger.info(
            `📂 Found ${rootResult.folders.length} root folders (total so far: ${allFolders.length})`,
          );
        }

        nextCursor = rootResult.next_cursor;

        if (nextCursor) {
          await this.delay(500); // Small delay between pagination calls
        }
      } while (nextCursor);

      logger.info(`📊 Total root folders: ${allFolders.length}`);

      // Get subfolders in batches
      const rootFolders = allFolders.filter(
        (folder) => !folder.path.includes("/"),
      );
      const rootBatches = this.chunkArray(rootFolders, batchSize);

      logger.info(
        `🔄 Processing ${rootBatches.length} batches of root folders for subfolders`,
      );

      for (let i = 0; i < rootBatches.length; i++) {
        const batch = rootBatches[i];
        logger.info(
          `📦 Processing root folder batch ${i + 1}/${rootBatches.length}`,
        );

        await this.enforceRateLimit(rateLimiter, maxApiCallsPerMinute);

        // Process each root folder in the batch for subfolders
        for (const rootFolder of batch) {
          try {
            await this.getSubfoldersRecursivelyWithRateLimit(
              rootFolder.path,
              allFolders,
              rateLimiter,
              maxApiCallsPerMinute,
            );
          } catch (error) {
            logger.warn(
              `Warning: Could not get subfolders for '${rootFolder.path}':`,
              error.message,
            );
          }
        }

        // Delay between batches
        if (i < rootBatches.length - 1) {
          logger.info(
            `⏱️  Waiting ${delayBetweenBatches}ms before next batch...`,
          );
          await this.delay(delayBetweenBatches);
        }
      }

      logger.info(`📊 Total folders found: ${allFolders.length}`);
      return allFolders;
    } catch (error) {
      logger.error(
        "CloudinaryService :: getAllFoldersWithRateLimit :: error:",
        error,
      );
      throw new Error(
        `Failed to get all folders with rate limiting: ${error.message}`,
      );
    }
  }

  /**
   * Recursively get subfolders with rate limiting
   * @param {string} folderPath - Path of the folder
   * @param {Array} allFolders - Array to accumulate all folders
   * @param {Object} rateLimiter - Rate limiting tracker
   * @param {number} maxApiCallsPerMinute - Max API calls per minute
   */
  async getSubfoldersRecursivelyWithRateLimit(
    folderPath,
    allFolders,
    rateLimiter,
    maxApiCallsPerMinute,
  ) {
    try {
      await this.enforceRateLimit(rateLimiter, maxApiCallsPerMinute);

      let nextCursor = null;
      do {
        // @ts-ignore
        const subResult = await this.getSubfolders(folderPath, {
          max_results: 100,
          next_cursor: nextCursor,
        });
        rateLimiter.apiCalls++;

        if (subResult.folders && subResult.folders.length > 0) {
          allFolders.push(...subResult.folders);

          // Recursively get subfolders of subfolders
          for (const subfolder of subResult.folders) {
            await this.getSubfoldersRecursivelyWithRateLimit(
              subfolder.path,
              allFolders,
              rateLimiter,
              maxApiCallsPerMinute,
            );
          }
        }

        nextCursor = subResult.next_cursor;

        if (nextCursor) {
          await this.delay(200);
        }
      } while (nextCursor);
    } catch (error) {
      logger.warn(
        `Could not get subfolders for '${folderPath}':`,
        error.message,
      );
    }
  }

  /**
   * Enforce rate limiting
   * @param {Object} rateLimiter - Rate limiting tracker
   * @param {number} maxApiCallsPerMinute - Max API calls per minute
   */
  async enforceRateLimit(rateLimiter, maxApiCallsPerMinute) {
    const now = Date.now();
    const minutesSinceStart = (now - rateLimiter.startTime) / (1000 * 60);

    if (minutesSinceStart >= 1) {
      // Reset the counter every minute
      rateLimiter.startTime = now;
      rateLimiter.apiCalls = 0;
    } else {
      // Check if we're approaching the limit
      const callsPerMinute =
        rateLimiter.apiCalls / Math.max(minutesSinceStart, 0.01);

      if (callsPerMinute >= maxApiCallsPerMinute * 0.8) {
        // 80% of limit
        const waitTime = Math.max(
          1000,
          60000 - (now - rateLimiter.startTime) + 1000,
        );
        logger.info(
          `⏱️  Rate limiting: waiting ${waitTime}ms (${rateLimiter.apiCalls} calls in ${minutesSinceStart.toFixed(2)} minutes)`,
        );
        await this.delay(waitTime);

        // Reset after waiting
        rateLimiter.startTime = Date.now();
        rateLimiter.apiCalls = 0;
      }
    }
  }

  /**
   * Utility method to chunk array into smaller arrays
   * @param {Array} array - Array to chunk
   * @param {number} size - Size of each chunk
   * @returns {Array} - Array of chunks
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Utility method for delays
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} - Promise that resolves after delay
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  // #endregion

  // Get service status and configuration
  getServiceInfo() {
    return {
      cloudName: this.config.cloud_name,
      apiKey: this.config.api_key
        ? "***" + this.config.api_key.slice(-4)
        : "Not configured",
      configured: !!(
        this.config.cloud_name &&
        this.config.api_key &&
        this.config.api_secret
      ),
    };
  }
}

// Create singleton instance
const cloudinaryService = new CloudinaryService();

export { CloudinaryService, cloudinaryService };
