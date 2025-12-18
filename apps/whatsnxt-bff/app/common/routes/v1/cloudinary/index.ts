import express from "express";
const router = express.Router();
import multer from "multer";
const cloudinary = require("cloudinary").v2;
import path from "path";
import fs from "fs";

// Import middleware and services
import { cloudinaryService } from "../../../../services/cloudinaryService";
import { getLogger } from "../../../../../config/logger";
const logger = getLogger("index");

// Configure cloudinary
cloudinary.config({ secure: true });

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Disk storage configuration
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// Course upload configuration
const multerConfig = multer({
  storage: diskStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for course files
  },
});

// Cleanup function to remove temporary files
const cleanupTempFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error("Error cleaning up temp file:", err);
      } else {
        logger.info("Temp file cleaned up:", filePath);
      }
    });
  }
};

// ===========================================
// UPLOAD ROUTES
// ===========================================

// upload route
router.post("/upload", multerConfig.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          type: "VALIDATION_ERROR",
          message: "Unable to find file",
        },
      });
    }

    const { resource_type, folder } = req.body;

    logger.info("router.post:: resource_type:", resource_type);
    logger.info("router.post:: folder:", folder);

    const result = await cloudinaryService.uploadFileViaWorker(
      req.file,
      resource_type,
      folder,
    );

    // Clean up temporary file after successful upload
    cleanupTempFile(req.file.path);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Course upload error:", error);

    // Clean up temporary file on error
    if (req.file) {
      cleanupTempFile(req.file.path);
    }

    // Categorize errors for better frontend handling
    let statusCode = 500;
    let errorType = "INTERNAL_ERROR";

    if (error.message.includes("Filename is too long")) {
      statusCode = 400;
      errorType = "FILENAME_TOO_LONG";
    } else if (error.message.includes("File is required")) {
      statusCode = 400;
      errorType = "FILE_REQUIRED";
    } else if (error.message.includes("invalid characters")) {
      statusCode = 400;
      errorType = "INVALID_FILENAME";
    } else if (error.message.includes("Failed to upload")) {
      statusCode = 500;
      errorType = "UPLOAD_FAILED";
    }

    res.status(statusCode).json({
      success: false,
      error: {
        type: errorType,
        message: error.message,
      },
    });
  }
});

// ===========================================
// DELETE ASSET ROUTES
// ===========================================

// Delete multiple assets
router.delete("/delete-multiple-assets", async (req, res) => {
  try {
    const { assetsList, accessToken } = req.body;
    logger.info(" router.delete :: assets:", assetsList);

    let assetsToDelete;

    // Handle different payload formats
    if (assetsList) {
      // New format: [{ public_id: "id", type: "image" }]
      assetsToDelete = assetsList;
    } else {
      return res.status(400).json({
        success: false,
        error: "Assets array or public_ids array is required",
      });
    }

    // Validate that we have assets to delete
    if (
      !assetsToDelete ||
      !Array.isArray(assetsToDelete) ||
      assetsToDelete.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Assets array is required and must not be empty",
      });
    }

    logger.info("Processing assets for deletion:", assetsToDelete);
    // Direct service call with proper error handling
    const result = await cloudinaryService.deleteMultiAssets(assetsToDelete);

    return res.status(200).json({
      success: true,
      result: result,
    });
  } catch (error) {
    logger.error("Delete multiple assets error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete multiple assets",
    });
  }
});

// ===========================================
// FOLDER MANAGEMENT ROUTES
// ===========================================

/**
 * DELETE /delete-empty-folders
 * Delete all empty folders from Cloudinary with rate limiting and batching
 *
 * Body parameters:
 * - dryRun (boolean, optional): If true, only preview what would be deleted (default: false)
 * - excludeFolders (array, optional): Array of folder paths to exclude from deletion
 * - continueOnError (boolean, optional): Continue if individual deletions fail (default: true)
 * - batchSize (number, optional): Number of folders to process per batch (default: 10)
 * - delayBetweenBatches (number, optional): Delay in ms between batches (default: 2000)
 * - maxApiCallsPerMinute (number, optional): Max API calls per minute (default: 100)
 * - useBatching (boolean, optional): Use batched approach to avoid rate limits (default: true)
 */
router.delete("/delete-empty-folders", async (req, res) => {
  try {
    logger.info("cloudinary:: delete-empty-folders:: start");

    const {
      dryRun = false,
      excludeFolders = [],
      continueOnError = true,
      batchSize = 10,
      delayBetweenBatches = 2000,
      maxApiCallsPerMinute = 100,
      useBatching = true,
    } = req.body;

    logger.info("delete-empty-folders options:", {
      dryRun,
      excludeFolders,
      continueOnError,
      batchSize,
      delayBetweenBatches,
      maxApiCallsPerMinute,
      useBatching,
    });

    // Validate excludeFolders is an array if provided
    if (excludeFolders && !Array.isArray(excludeFolders)) {
      return res.status(400).json({
        success: false,
        error: {
          type: "VALIDATION_ERROR",
          message: "excludeFolders must be an array",
        },
      });
    }

    // Validate batch parameters
    if (batchSize < 1 || batchSize > 50) {
      return res.status(400).json({
        success: false,
        error: {
          type: "VALIDATION_ERROR",
          message: "batchSize must be between 1 and 50",
        },
      });
    }

    if (delayBetweenBatches < 500 || delayBetweenBatches > 10000) {
      return res.status(400).json({
        success: false,
        error: {
          type: "VALIDATION_ERROR",
          message: "delayBetweenBatches must be between 500ms and 10000ms",
        },
      });
    }

    // Choose the appropriate service method
    let result;
    if (useBatching) {
      logger.info("🔄 Using batched approach with rate limiting...");
      result = await cloudinaryService.deleteAllEmptyFoldersWithRateLimit({
        dryRun,
        excludeFolders,
        continueOnError,
        batchSize,
        delayBetweenBatches,
        maxApiCallsPerMinute,
      });
    } else {
      logger.info("⚡ Using batched approach with rate limiting...");
      result = await cloudinaryService.deleteAllEmptyFoldersWithRateLimit({
        dryRun,
        excludeFolders,
        continueOnError,
        batchSize,
        delayBetweenBatches,
        maxApiCallsPerMinute,
      });
    }

    logger.info("delete-empty-folders completed:", result.summary);

    // Return success response
    return res.status(200).json({
      success: true,
      data: result,
      message: dryRun
        ? `Found ${result.summary.emptyFoldersFound} empty folders (${result.summary.totalBatches || 0} batches processed)`
        : `Successfully deleted ${result.summary.foldersDeleted} empty folders (${result.summary.totalBatches || 0} batches processed)`,
    });
  } catch (error) {
    logger.error("Delete empty folders error:", error);

    // Categorize errors for better frontend handling
    let statusCode = 500;
    let errorType = "INTERNAL_ERROR";

    if (error.message.includes("Rate Limit Exceeded")) {
      statusCode = 429;
      errorType = "RATE_LIMIT_EXCEEDED";
    } else if (error.message.includes("Failed to fetch folders")) {
      statusCode = 500;
      errorType = "FETCH_FOLDERS_FAILED";
    } else if (error.message.includes("Failed to check if folder")) {
      statusCode = 500;
      errorType = "FOLDER_CHECK_FAILED";
    } else if (error.message.includes("Failed to delete")) {
      statusCode = 500;
      errorType = "DELETION_FAILED";
    } else if (error.message.includes("Cloudinary")) {
      statusCode = 500;
      errorType = "CLOUDINARY_ERROR";
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        type: errorType,
        message: error.message || "Failed to delete empty folders",
      },
    });
  }
});

/**
 * GET /service-info
 * Get Cloudinary service configuration info
 */
router.get("/service-info", async (req, res) => {
  try {
    logger.info("cloudinary:: service-info:: start");

    const serviceInfo = cloudinaryService.getServiceInfo();

    return res.status(200).json({
      success: true,
      data: serviceInfo,
      message: "Service information retrieved successfully",
    });
  } catch (error) {
    logger.error("Get service info error:", error);

    return res.status(500).json({
      success: false,
      error: {
        type: "SERVICE_INFO_FAILED",
        message: error.message || "Failed to get service information",
      },
    });
  }
});

// ===========================================
// ERROR HANDLING MIDDLEWARE
// ===========================================

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: {
          type: "FILE_TOO_LARGE",
          message: "File size too large",
        },
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        type: "MULTER_ERROR",
        message: error.message,
      },
    });
  }

  // Clean up any temporary files on error
  if (req.file) {
    cleanupTempFile(req.file.path);
  }

  next(error);
});

export default router;
