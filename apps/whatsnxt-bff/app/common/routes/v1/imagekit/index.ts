import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import fs from "fs";

// Import middleware and services
import { imageKitService } from "../../../../services/imageKitService";
import { getLogger } from "../../../../../config/logger";
const logger = getLogger("ImageKitRoute");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Disk storage configuration
const diskStorage = multer.diskStorage({
  // @ts-ignore
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  // @ts-ignore
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// Memory storage for direct upload to ImageKit
const memoryStorage = multer.memoryStorage();

// Course upload configuration
// @ts-ignore
const multerConfig = multer({
  storage: diskStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for course files
  },
});

// Memory upload configuration for direct ImageKit upload
const multerMemoryConfig = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
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

// Upload route (using worker)
router.post("/upload", multerMemoryConfig.single("file"), async (req, res) => {
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

    const { folder } = req.body;
    logger.info("router.post :: folder:", folder);

    // Get file extension from original filename
    const fileExtension =
      path.extname(req.file.originalname).substring(1) || "bin";
    const fileName = req.file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension

    // Upload using worker - Remove problematic custom metadata
    const result = await imageKitService.uploadFileViaWorker(
      req.file.buffer,
      fileName,
      {
        folder: folder || "/uploads",
        fileExtension: fileExtension,
        tags: ["course-upload"],
        useUniqueFileName: true,
        // Removed customMetadata that was causing issues
      },
    );

    // Transform response to match frontend expectations exactly
    const resultData: any = result;
    const frontendCompatibleResponse = {
      // ImageKit native fields
      fileId: resultData.fileId,
      name: resultData.name,
      url: resultData.url,
      filePath: resultData.filePath,
      size: resultData.size,
      fileType: resultData.fileType,
      height: resultData.height || 0,
      width: resultData.width || 0,

      // CRITICAL: Frontend validates these fields exist
      secure_url: resultData.url, // Frontend checks for this
      public_id: resultData.fileId, // Frontend checks for this

      // Additional compatibility fields that frontend expects
      format: resultData.fileType || fileExtension,
      resource_type: resultData.fileType,
      timestamp: resultData.timestamp || Date.now(),
      duration: resultData.duration || 0,

      // Original file metadata (without ImageKit custom metadata issues)
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),

      // Full ImageKit response for debugging
      _fullResponse: result,
    };

    logger.info(
      "router.post :: Frontend-compatible response:",
      frontendCompatibleResponse,
    );

    res.status(200).json(frontendCompatibleResponse);
  } catch (error) {
    logger.error("Course upload error:", error);

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
    } else if (error.message.includes("Invalid custom metadata")) {
      statusCode = 400;
      errorType = "METADATA_ERROR";
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

// Direct upload route (no worker)
router.post(
  "/upload-direct",
  multerMemoryConfig.single("file"),
  async (req, res) => {
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

      const { folder } = req.body;
      const fileExtension =
        path.extname(req.file.originalname).substring(1) || "bin";
      const fileName = req.file.originalname.replace(/\.[^/.]+$/, "");

      // Direct upload (no worker)
      const result = await imageKitService.uploadFileDirect(
        req.file.buffer,
        `${fileName}.${fileExtension}`,
        {
          folder: folder || "/uploads",
          tags: ["direct-upload"],
          customMetadata: {
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
          },
        },
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Direct upload error:", error);
      res.status(500).json({
        success: false,
        error: {
          type: "UPLOAD_FAILED",
          message: error.message,
        },
      });
    }
  },
);

// ===========================================
// DELETE ASSET ROUTES
// ===========================================

// Delete multiple assets
router.delete("/delete-multiple-assets", async (req, res) => {
  try {
    // @ts-ignore
    const { assetsList, accessToken } = req.body;
    logger.info("router.delete :: assets:", assetsList);

    let assetsToDelete;

    // Handle different payload formats
    if (assetsList) {
      // Format: [{ fileId: "id" }] or [{ public_id: "id" }] for compatibility
      assetsToDelete = assetsList;
    } else {
      return res.status(400).json({
        success: false,
        error: "Assets array is required",
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

    // Use ImageKit service for deletion
    const result = await imageKitService.deleteMultiAssets(assetsToDelete);

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

// Delete single asset
router.delete("/delete-asset/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: "File ID is required",
      });
    }

    const result = await imageKitService.deleteFile(fileId);

    return res.status(200).json({
      success: true,
      data: result,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    logger.error("Delete asset error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete asset",
    });
  }
});

// ===========================================
// FILE MANAGEMENT ROUTES
// ===========================================

/**
 * GET /files
 * Get all files from ImageKit with optional filtering
 *
 * Query parameters:
 * - skip (number, optional): Number of files to skip (default: 0)
 * - limit (number, optional): Maximum results per call (default: 1000)
 * - searchQuery (string, optional): Search query to filter files
 * - folder (string, optional): Filter by folder path
 * - fileType (string, optional): Filter by file type (image, video, etc.)
 */
router.get("/files", async (req, res) => {
  try {
    logger.info("imagekit:: get-files:: start");

    const {
      skip = 0,
      limit = 1000,
      searchQuery = "",
      folder = "",
      fileType = "",
    } = req.query;

    logger.info("get-files options:", {
      // @ts-ignore
      skip: parseInt(skip),
      // @ts-ignore
      limit: parseInt(limit),
      searchQuery,
      folder,
      fileType,
    });

    const listOptions = {
      // @ts-ignore
      skip: parseInt(skip),
      // @ts-ignore
      limit: parseInt(limit),
      searchQuery: searchQuery || undefined,
      path: folder || undefined,
      fileType: fileType || undefined,
    };

    const result = await imageKitService.listFiles(listOptions);

    logger.info(`get-files completed: ${result.length || 0} files found`);

    return res.status(200).json({
      success: true,
      data: {
        files: result,
        total: result.length,
        options: listOptions,
      },
      message: `Found ${result.length || 0} files`,
    });
  } catch (error) {
    logger.error("Get files error:", error);

    return res.status(500).json({
      success: false,
      error: {
        type: "FETCH_FILES_FAILED",
        message: error.message || "Failed to fetch files",
      },
    });
  }
});

/**
 * GET /file-details/:fileId
 * Get details of a specific file
 */
router.get("/file-details/:fileId", async (req, res) => {
  try {
    logger.info("imagekit:: get-file-details:: start");

    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: {
          type: "VALIDATION_ERROR",
          message: "File ID is required",
        },
      });
    }

    logger.info("get-file-details fileId:", fileId);

    const result = await imageKitService.getFileDetails(fileId);

    logger.info("get-file-details completed");

    return res.status(200).json({
      success: true,
      data: result,
      message: "File details retrieved successfully",
    });
  } catch (error) {
    logger.error("Get file details error:", error);

    let statusCode = 500;
    let errorType = "GET_FILE_DETAILS_FAILED";

    if (error.message.includes("not found")) {
      statusCode = 404;
      errorType = "FILE_NOT_FOUND";
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        type: errorType,
        message: error.message || "Failed to get file details",
      },
    });
  }
});

/**
 * POST /generate-url
 * Generate a transformed URL for an image
 *
 * Body parameters:
 * - path (string, required): File path in ImageKit
 * - transformations (array, optional): Array of transformation objects
 * - signed (boolean, optional): Generate signed URL (default: false)
 * - expireSeconds (number, optional): URL expiry time in seconds
 */
router.post("/generate-url", async (req, res) => {
  try {
    logger.info("imagekit:: generate-url:: start");

    const {
      path,
      transformations = [],
      signed = false,
      expireSeconds,
    } = req.body;

    if (!path) {
      return res.status(400).json({
        success: false,
        error: {
          type: "VALIDATION_ERROR",
          message: "File path is required",
        },
      });
    }

    logger.info("generate-url options:", {
      path,
      transformations,
      signed,
      expireSeconds,
    });

    const urlOptions = {
      path,
      transformation: transformations,
      signed,
      expireSeconds,
    };

    const url = imageKitService.url(urlOptions);

    logger.info("generate-url completed");

    return res.status(200).json({
      success: true,
      data: {
        url,
        path,
        transformations,
        signed,
        expireSeconds,
      },
      message: "URL generated successfully",
    });
  } catch (error) {
    logger.error("Generate URL error:", error);

    return res.status(500).json({
      success: false,
      error: {
        type: "URL_GENERATION_FAILED",
        message: error.message || "Failed to generate URL",
      },
    });
  }
});

/**
 * GET /auth-params
 * Get authentication parameters for client-side uploads
 */
// @ts-ignore
router.get("/auth-params", async (req, res) => {
  try {
    logger.info("imagekit:: get-auth-params:: start");

    const authParams = imageKitService.getAuthenticationParameters();

    logger.info("get-auth-params completed");

    return res.status(200).json({
      success: true,
      data: authParams,
      message: "Authentication parameters generated successfully",
    });
  } catch (error) {
    logger.error("Get auth params error:", error);

    return res.status(500).json({
      success: false,
      error: {
        type: "AUTH_PARAMS_FAILED",
        message:
          error.message || "Failed to generate authentication parameters",
      },
    });
  }
});

/**
 * GET /service-info
 * Get ImageKit service configuration info
 */
// @ts-ignore
router.get("/service-info", async (req, res) => {
  try {
    logger.info("imagekit:: service-info:: start");

    const serviceInfo = {
      service: "ImageKit",
      publicKey: imageKitService.config.publicKey
        ? "***configured***"
        : "not configured",
      privateKey: imageKitService.config.privateKey
        ? "***configured***"
        : "not configured",
      urlEndpoint: imageKitService.config.urlEndpoint || "not configured",
      status: "active",
    };

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
// BULK OPERATIONS (ImageKit specific)
// ===========================================

/**
 * POST /bulk-delete-by-tags
 * Delete files by tags (useful for cleanup)
 *
 * Body parameters:
 * - tags (array, required): Array of tags to match
 * - dryRun (boolean, optional): Preview what would be deleted (default: false)
 */
router.post("/bulk-delete-by-tags", async (req, res) => {
  try {
    logger.info("imagekit:: bulk-delete-by-tags:: start");

    const { tags, dryRun = false } = req.body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          type: "VALIDATION_ERROR",
          message: "Tags array is required and must not be empty",
        },
      });
    }

    logger.info("bulk-delete-by-tags options:", { tags, dryRun });

    // First, find files with the specified tags
    const searchQuery = `tags IN [${tags.map((tag) => `"${tag}"`).join(",")}]`;
    const files = await imageKitService.listFiles({ searchQuery, limit: 1000 });

    if (dryRun) {
      return res.status(200).json({
        success: true,
        data: {
          files: files.map((f) => ({
            fileId: f.fileId,
            name: f.name,
            tags: f.tags,
          })),
          count: files.length,
          dryRun: true,
        },
        message: `Found ${files.length} files matching the specified tags (dry run)`,
      });
    }

    // Delete the files
    if (files.length > 0) {
      const assetsToDelete = files.map((file) => ({ fileId: file.fileId }));
      const deleteResult =
        await imageKitService.deleteMultiAssets(assetsToDelete);

      return res.status(200).json({
        success: true,
        data: deleteResult,
        message: `Deleted ${deleteResult.summary.successfulDeletions} files with specified tags`,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: { summary: { successfulDeletions: 0, failedDeletions: 0 } },
        message: "No files found with the specified tags",
      });
    }
  } catch (error) {
    logger.error("Bulk delete by tags error:", error);

    return res.status(500).json({
      success: false,
      error: {
        type: "BULK_DELETE_FAILED",
        message: error.message || "Failed to delete files by tags",
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
