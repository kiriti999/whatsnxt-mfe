import mongoose from "mongoose";
import { generateEbookFromTutorial } from "../helper";
const fs = require("fs").promises;
import fsSync from "fs";
import path from "path";
import { getLogger } from "../../config/logger";
const logger = getLogger("ebookService");

class EbookService {
  constructor() {
    this.validateDependencies();
    this.initializeConnection();
  }

  async initializeConnection() {
    try {
      await this.ensureConnection();
      logger.info("✅ EbookService initialized with database connection");
    } catch (error) {
      logger.error("EbookService :: initializeConnection :: error:", error);
    }
  }

  async ensureConnection() {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database connection is not ready");
    }
  }

  validateDependencies() {
    try {
      // Check if helper function exists
      if (typeof generateEbookFromTutorial !== "function") {
        throw new Error(
          "generateEbookFromTutorial helper function is not available",
        );
      }
      logger.info("✅ EbookService dependencies validated");
    } catch (error) {
      logger.warn(
        "EbookService :: validateDependencies :: warning:",
        error.message,
      );
    }
  }

  async generateEbook(id) {
    await this.ensureConnection();

    try {
      // Input validation
      if (!id) {
        throw new Error("Tutorial ID is required");
      }

      logger.info(
        `📘 EbookService :: generateEbook :: Starting eBook generation for ID: ${id}`,
      );

      // Fetch tutorial data
      const tutorialData = await this.getTutorialData(id);

      // Validate tutorial data
      this.validateTutorialData(tutorialData);

      // Log tutorial details for debugging
      logger.info(`📘 EbookService :: generateEbook :: Tutorial data:`, {
        id: (tutorialData as any)._id,
        title: (tutorialData as any).title,
        tutorialsCount: (tutorialData as any).tutorials?.length || 0,
        categoryName: (tutorialData as any).categoryName,
      });

      // Generate the eBook
      const outputFilePath = await this.generateEbookFile(tutorialData);

      // Validate generated file
      await this.validateGeneratedFile(outputFilePath);

      // Convert file content to base64
      const fileContent = await this.fileToBase64(outputFilePath);

      // Clean up temporary file
      await this.cleanupTempFile(outputFilePath);

      const filename = this.generateFilename((tutorialData as any).title);

      logger.info(
        `📘 EbookService :: generateEbook :: Successfully generated eBook: ${filename}`,
      );

      // Update tutorial with eBook generation metadata
      await this.updateTutorialEbookMetadata(id, filename);

      return {
        filename,
        fileContent,
        tutorialId: id,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("❌ EbookService :: generateEbook :: error:", error);

      // Re-throw with more specific error messages
      if (error.message.includes("Invalid tutorial")) {
        throw new Error(`Invalid tutorial data: ${error.message}`);
      } else if (error.message.includes("File not found")) {
        throw new Error(`Failed to generate eBook file: ${error.message}`);
      } else if (error.message.includes("Cast to ObjectId")) {
        throw new Error(`Invalid tutorial ID format: ${error.message}`);
      } else {
        throw new Error(`Failed to generate eBook: ${error.message}`);
      }
    }
  }

  async getTutorialData(id) {
    await this.ensureConnection();

    try {
      logger.info("EbookService :: getTutorialData :: fetching tutorial:", id);

      const BlogPost = mongoose.model("blogPosts");
      const tutorialData = await BlogPost.findById(id).lean();

      if (!tutorialData) {
        throw new Error("Tutorial not found");
      }

      // Check if it's actually a tutorial
      if (!(tutorialData as any).tutorial) {
        throw new Error("Selected post is not a tutorial");
      }

      logger.info(
        "EbookService :: getTutorialData :: tutorial found:",
        (tutorialData as any).title,
      );
      return tutorialData;
    } catch (error) {
      logger.error("EbookService :: getTutorialData :: error:", error);

      if (error.message.includes("Cast to ObjectId")) {
        throw new Error("Invalid tutorial ID format");
      }

      throw new Error(`Failed to fetch tutorial data: ${error.message}`);
    }
  }

  validateTutorialData(tutorialData) {
    const errors = [];
    const data = tutorialData as any;

    if (!data.title || typeof data.title !== "string") {
      errors.push("Tutorial title is required and must be a string");
    }

    if (!data.tutorials || !Array.isArray(data.tutorials)) {
      errors.push("Tutorial must contain a tutorials array");
    } else if (data.tutorials.length === 0) {
      errors.push("Tutorial must contain at least one tutorial item");
    }

    // Additional validation for tutorial structure
    if (data.tutorials && Array.isArray(data.tutorials)) {
      data.tutorials.forEach((tutorial, index) => {
        if (!tutorial.title) {
          errors.push(`Tutorial item ${index + 1} is missing a title`);
        }
        if (!tutorial.description && !tutorial.content) {
          errors.push(
            `Tutorial item ${index + 1} is missing content or description`,
          );
        }
      });
    }

    if (errors.length > 0) {
      throw new Error(`Invalid tutorial data: ${errors.join(", ")}`);
    }
  }

  async generateEbookFile(tutorialData) {
    try {
      logger.info(
        `📘 EbookService :: generateEbookFile :: Generating eBook file...`,
      );

      const outputFilePath = await generateEbookFromTutorial(tutorialData);

      if (!outputFilePath) {
        throw new Error("eBook generation returned empty file path");
      }

      return outputFilePath;
    } catch (error) {
      logger.error("EbookService :: generateEbookFile :: error:", error);
      throw new Error(`Failed to generate eBook file: ${error.message}`);
    }
  }

  async validateGeneratedFile(filePath) {
    try {
      if (!filePath) {
        throw new Error("File path is empty");
      }

      // Check if file exists
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      if (!fileExists) {
        throw new Error(`Generated file not found at path: ${filePath}`);
      }

      // Check file size
      const stats = await fs.stat(filePath);
      if (stats.size === 0) {
        throw new Error("Generated file is empty");
      }

      // Check file extension
      const ext = path.extname(filePath).toLowerCase();
      if (ext !== ".epub") {
        logger.warn(
          `EbookService :: validateGeneratedFile :: Warning: Generated file has unexpected extension: ${ext}`,
        );
      }

      logger.info(
        `📘 EbookService :: validateGeneratedFile :: File validated successfully. Size: ${stats.size} bytes`,
      );
    } catch (error) {
      logger.error("EbookService :: validateGeneratedFile :: error:", error);
      throw new Error(`File validation failed: ${error.message}`);
    }
  }

  async fileToBase64(filePath) {
    try {
      // Use synchronous read for better error handling
      const fileContent = fsSync.readFileSync(filePath, { encoding: "base64" });

      if (!fileContent) {
        throw new Error("File content is empty");
      }

      logger.info(
        `📘 EbookService :: fileToBase64 :: Converted file to base64. Length: ${fileContent.length} characters`,
      );

      return fileContent;
    } catch (error) {
      logger.error("EbookService :: fileToBase64 :: error:", error);
      throw new Error(`Failed to convert file to base64: ${error.message}`);
    }
  }

  async cleanupTempFile(filePath) {
    try {
      if (!filePath) return;

      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      if (fileExists) {
        await fs.unlink(filePath);
        logger.info(
          `📘 EbookService :: cleanupTempFile :: Temporary file cleaned up: ${filePath}`,
        );
      }
    } catch (error) {
      logger.warn(
        "EbookService :: cleanupTempFile :: Warning: Failed to cleanup temp file:",
        error.message,
      );
      // Don't throw error for cleanup failures
    }
  }

  generateFilename(title) {
    try {
      if (!title || typeof title !== "string") {
        return "untitled_ebook.epub";
      }

      // Sanitize filename
      const sanitized = title
        .trim()
        .replace(/[^a-zA-Z0-9\s\-_]/g, "") // Remove special characters
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/_+/g, "_") // Replace multiple underscores with single
        .substring(0, 50); // Limit length

      return `${sanitized || "untitled_ebook"}.epub`;
    } catch (error) {
      logger.warn(
        "EbookService :: generateFilename :: Warning: Failed to generate filename:",
        error.message,
      );
      return "untitled_ebook.epub";
    }
  }

  async updateTutorialEbookMetadata(tutorialId, filename) {
    await this.ensureConnection();

    try {
      logger.info(
        "EbookService :: updateTutorialEbookMetadata :: updating metadata for:",
        tutorialId,
      );

      const BlogPost = mongoose.model("blogPosts");
      await BlogPost.findByIdAndUpdate(
        tutorialId,
        {
          $set: {
            "ebookMetadata.lastGenerated": new Date(),
            "ebookMetadata.filename": filename,
            "ebookMetadata.generationCount": { $inc: 1 },
          },
        },
        { upsert: true },
      );

      logger.info(
        "EbookService :: updateTutorialEbookMetadata :: metadata updated",
      );
    } catch (error) {
      logger.warn(
        "EbookService :: updateTutorialEbookMetadata :: Warning: Failed to update metadata:",
        error.message,
      );
      // Don't throw error for metadata update failures
    }
  }

  // Enhanced method to get tutorials suitable for eBook generation
  async getTutorialsForEbookGeneration(filters = {}) {
    await this.ensureConnection();

    try {
      logger.info(
        "EbookService :: getTutorialsForEbookGeneration :: fetching tutorials with filters:",
        filters,
      );

      const BlogPost = mongoose.model("blogPosts");

      const query = {
        tutorial: true,
        tutorials: { $exists: true, $not: { $size: 0 } },
        ...filters,
      };

      const tutorials = await BlogPost.find(query)
        .select("_id title categoryName tutorials.length ebookMetadata")
        .lean();

      const enrichedTutorials = tutorials.map((tutorial) => {
        const t = tutorial as any;
        return {
          _id: t._id.toString(),
          title: t.title,
          categoryName: t.categoryName,
          tutorialCount: t.tutorials?.length || 0,
          lastEbookGenerated: t.ebookMetadata?.lastGenerated || null,
          ebookGenerationCount: t.ebookMetadata?.generationCount || 0,
          canGenerateEbook: (t.tutorials?.length || 0) > 0,
        };
      });

      logger.info(
        `EbookService :: getTutorialsForEbookGeneration :: found ${enrichedTutorials.length} tutorials`,
      );
      return enrichedTutorials;
    } catch (error) {
      logger.error(
        "EbookService :: getTutorialsForEbookGeneration :: error:",
        error,
      );
      throw new Error(
        `Failed to fetch tutorials for eBook generation: ${error.message}`,
      );
    }
  }

  // Additional utility methods
  async generateMultipleEbooks(tutorialIds) {
    await this.ensureConnection();

    try {
      if (!Array.isArray(tutorialIds) || tutorialIds.length === 0) {
        throw new Error("Tutorial IDs array is required and must not be empty");
      }

      logger.info(
        `📘 EbookService :: generateMultipleEbooks :: Generating ${tutorialIds.length} eBooks...`,
      );

      const results = [];
      const errors = [];

      for (let i = 0; i < tutorialIds.length; i++) {
        try {
          const result = await this.generateEbook(tutorialIds[i]);
          results.push({
            id: tutorialIds[i],
            success: true,
            ...result,
          });
        } catch (error) {
          errors.push({
            id: tutorialIds[i],
            success: false,
            error: error.message,
          });
        }
      }

      logger.info(
        `📘 EbookService :: generateMultipleEbooks :: Completed. Success: ${results.length}, Failed: ${errors.length}`,
      );

      return {
        successful: results,
        failed: errors,
        summary: {
          total: tutorialIds.length,
          successful: results.length,
          failed: errors.length,
        },
      };
    } catch (error) {
      logger.error("EbookService :: generateMultipleEbooks :: error:", error);
      throw new Error(`Failed to generate multiple eBooks: ${error.message}`);
    }
  }

  async getTutorialPreview(id) {
    await this.ensureConnection();

    try {
      logger.info(
        "EbookService :: getTutorialPreview :: getting preview for:",
        id,
      );

      const tutorialData = await this.getTutorialData(id);
      const data = tutorialData as any;

      const preview = {
        id: data._id,
        title: data.title,
        categoryName: data.categoryName,
        tutorialsCount: data.tutorials?.length || 0,
        tutorials:
          data.tutorials?.map((tutorial, index) => ({
            index: index + 1,
            title: tutorial.title,
            hasDescription: !!tutorial.description,
            hasContent: !!tutorial.content,
            descriptionLength: tutorial.description?.length || 0,
            contentLength: tutorial.content?.length || 0,
          })) || [],
        estimatedPages: Math.ceil((data.tutorials?.length || 0) * 2.5), // Rough estimate
        estimatedReadTime: Math.ceil((data.tutorials?.length || 0) * 3), // Minutes
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ebookMetadata: data.ebookMetadata || null,
      };

      logger.info("EbookService :: getTutorialPreview :: preview generated");
      return preview;
    } catch (error) {
      logger.error("EbookService :: getTutorialPreview :: error:", error);
      throw new Error(`Failed to get tutorial preview: ${error.message}`);
    }
  }

  async validateEbookRequirements(id) {
    await this.ensureConnection();

    try {
      logger.info(
        "EbookService :: validateEbookRequirements :: validating for:",
        id,
      );

      const tutorialData = await this.getTutorialData(id);
      const data = tutorialData as any;

      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        requirements: {
          hasTitle: !!data.title,
          hasTutorials: !!data.tutorials && data.tutorials.length > 0,
          minTutorialCount: (data.tutorials?.length || 0) >= 1,
          allTutorialsHaveTitle: true,
          allTutorialsHaveContent: true,
          isTutorialType: !!data.tutorial,
        },
      };

      // Check requirements
      if (!validation.requirements.isTutorialType) {
        validation.errors.push("Post must be marked as a tutorial");
        validation.isValid = false;
      }

      if (!validation.requirements.hasTitle) {
        validation.errors.push("Tutorial must have a title");
        validation.isValid = false;
      }

      if (!validation.requirements.hasTutorials) {
        validation.errors.push("Tutorial must contain tutorial items");
        validation.isValid = false;
      }

      if (!validation.requirements.minTutorialCount) {
        validation.errors.push(
          "Tutorial must contain at least 1 tutorial item",
        );
        validation.isValid = false;
      }

      // Check each tutorial item
      if (data.tutorials && Array.isArray(data.tutorials)) {
        data.tutorials.forEach((tutorial, index) => {
          if (!tutorial.title) {
            validation.errors.push(
              `Tutorial item ${index + 1} is missing a title`,
            );
            validation.requirements.allTutorialsHaveTitle = false;
            validation.isValid = false;
          }

          if (!tutorial.description && !tutorial.content) {
            validation.warnings.push(
              `Tutorial item ${index + 1} has no content or description`,
            );
            validation.requirements.allTutorialsHaveContent = false;
          }

          // Check for minimum content length
          const contentLength =
            (tutorial.description?.length || 0) +
            (tutorial.content?.length || 0);
          if (contentLength < 50) {
            validation.warnings.push(
              `Tutorial item ${index + 1} has very little content (${contentLength} characters)`,
            );
          }
        });
      }

      logger.info(
        "EbookService :: validateEbookRequirements :: validation completed. Valid:",
        validation.isValid,
      );
      return validation;
    } catch (error) {
      logger.error(
        "EbookService :: validateEbookRequirements :: error:",
        error,
      );
      throw new Error(
        `Failed to validate eBook requirements: ${error.message}`,
      );
    }
  }

  async getEbookGenerationStats() {
    await this.ensureConnection();

    try {
      logger.info(
        "EbookService :: getEbookGenerationStats :: calculating stats",
      );

      const BlogPost = mongoose.model("blogPosts");

      const stats = await BlogPost.aggregate([
        {
          $match: { tutorial: true },
        },
        {
          $group: {
            _id: null,
            totalTutorials: { $sum: 1 },
            tutorialsWithEbooks: {
              $sum: {
                $cond: [{ $exists: "$ebookMetadata.lastGenerated" }, 1, 0],
              },
            },
            totalEbooksGenerated: {
              $sum: { $ifNull: ["$ebookMetadata.generationCount", 0] },
            },
            avgTutorialLength: {
              $avg: { $size: { $ifNull: ["$tutorials", []] } },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalTutorials: 1,
            tutorialsWithEbooks: 1,
            tutorialsWithoutEbooks: {
              $subtract: ["$totalTutorials", "$tutorialsWithEbooks"],
            },
            totalEbooksGenerated: 1,
            avgTutorialLength: { $round: ["$avgTutorialLength", 1] },
            ebookCoverage: {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$tutorialsWithEbooks", "$totalTutorials"] },
                    100,
                  ],
                },
                1,
              ],
            },
          },
        },
      ]);

      const result = stats[0] || {
        totalTutorials: 0,
        tutorialsWithEbooks: 0,
        tutorialsWithoutEbooks: 0,
        totalEbooksGenerated: 0,
        avgTutorialLength: 0,
        ebookCoverage: 0,
      };

      logger.info(
        "EbookService :: getEbookGenerationStats :: stats calculated",
      );
      return result;
    } catch (error) {
      logger.error("EbookService :: getEbookGenerationStats :: error:", error);
      throw new Error(`Failed to get eBook generation stats: ${error.message}`);
    }
  }

  // Get service information
  getServiceInfo() {
    return {
      service: "EbookService",
      supportedFormats: ["epub"],
      helperFunction:
        typeof generateEbookFromTutorial === "function"
          ? "Available"
          : "Not available",
      features: [
        "single_ebook_generation",
        "bulk_ebook_generation",
        "tutorial_preview",
        "requirement_validation",
        "generation_stats",
        "metadata_tracking",
      ],
      dependencies: {
        fs: !!fs,
        path: !!path,
        mongoose: !!mongoose,
      },
      databaseType: "mongoose",
    };
  }
}

// Create singleton instance
const ebookService = new EbookService();

export { EbookService, ebookService };
