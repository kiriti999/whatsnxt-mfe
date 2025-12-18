import { generatePptFromTutorial } from "../helper";
import { ObjectId } from "mongodb";
const fs = require("fs").promises;
import fsSync from "fs";
import path from "path";
import { getLogger } from "../../config/logger";
const logger = getLogger("pptService");

class PPTService {
  constructor() {
    // Validate required dependencies
    this.validateDependencies();
  }

  validateDependencies() {
    try {
      // Check if helper function exists
      if (typeof generatePptFromTutorial !== "function") {
        throw new Error(
          "generatePptFromTutorial helper function is not available",
        );
      }
    } catch (error) {
      logger.warn(
        "PPTService :: validateDependencies :: warning:",
        error.message,
      );
    }
  }

  async generatePpt(db, id) {
    try {
      // Input validation
      if (!db) {
        throw new Error("Database connection is required");
      }

      if (!id) {
        throw new Error("Tutorial ID is required");
      }

      // Validate ObjectId format
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid tutorial ID format");
      }

      logger.info(
        `🎯 PPTService :: generatePpt :: Starting PowerPoint generation for ID: ${id}`,
      );

      // Fetch tutorial data
      const tutorialData = await this.getTutorialData(db, id);

      // Validate tutorial data
      this.validateTutorialData(tutorialData);

      // Log tutorial details for debugging
      logger.info(`🎯 PPTService :: generatePpt :: Tutorial data:`, {
        id: tutorialData._id,
        title: tutorialData.title,
        tutorialsCount: tutorialData.tutorials?.length || 0,
        categoryName: tutorialData.categoryName,
      });

      // Generate the PowerPoint file
      const outputFilePath = await this.generatePptFile(tutorialData);

      // Validate generated file
      await this.validateGeneratedFile(outputFilePath);

      // Convert file content to base64
      const fileContent = await this.fileToBase64(outputFilePath);

      // Clean up temporary file
      await this.cleanupTempFile(outputFilePath);

      const filename = this.generateFilename(tutorialData.title);

      logger.info(
        `🎯 PPTService :: generatePpt :: Successfully generated PowerPoint: ${filename}`,
      );

      return {
        filename,
        fileContent,
      };
    } catch (error) {
      logger.error("❌ PPTService :: generatePpt :: error:", error);

      // Re-throw with more specific error messages
      if (error.message.includes("Invalid tutorial")) {
        throw new Error(`Invalid tutorial data: ${error.message}`);
      } else if (error.message.includes("File not found")) {
        throw new Error(`Failed to generate PowerPoint file: ${error.message}`);
      } else if (error.message.includes("ObjectId")) {
        throw new Error(`Invalid tutorial ID: ${error.message}`);
      } else {
        throw new Error(`Failed to generate PowerPoint: ${error.message}`);
      }
    }
  }

  async getTutorialData(db, id) {
    try {
      const tutorialData = await db.collection("blogPosts").findOne({
        _id: ObjectId.createFromHexString(id),
      });

      if (!tutorialData) {
        throw new Error("Tutorial not found");
      }

      return tutorialData;
    } catch (error) {
      logger.error("PPTService :: getTutorialData :: error:", error);

      if (error.message.includes("ObjectId")) {
        throw new Error("Invalid tutorial ID format");
      }

      throw new Error(`Failed to fetch tutorial data: ${error.message}`);
    }
  }

  validateTutorialData(tutorialData) {
    const errors = [];

    if (!tutorialData.title || typeof tutorialData.title !== "string") {
      errors.push("Tutorial title is required and must be a string");
    }

    if (!tutorialData.tutorials || !Array.isArray(tutorialData.tutorials)) {
      errors.push("Tutorial must contain a tutorials array");
    } else if (tutorialData.tutorials.length === 0) {
      errors.push("Tutorial must contain at least one tutorial item");
    }

    // Additional validation for tutorial structure
    if (tutorialData.tutorials && Array.isArray(tutorialData.tutorials)) {
      tutorialData.tutorials.forEach((tutorial, index) => {
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

  async generatePptFile(tutorialData) {
    try {
      logger.info(
        `🎯 PPTService :: generatePptFile :: Generating PowerPoint file...`,
      );

      const outputFilePath = await generatePptFromTutorial(tutorialData);

      if (!outputFilePath) {
        throw new Error("PowerPoint generation returned empty file path");
      }

      return outputFilePath;
    } catch (error) {
      logger.error("PPTService :: generatePptFile :: error:", error);
      throw new Error(`Failed to generate PowerPoint file: ${error.message}`);
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
      if (ext !== ".pptx") {
        logger.warn(
          `PPTService :: validateGeneratedFile :: Warning: Generated file has unexpected extension: ${ext}`,
        );
      }

      logger.info(
        `🎯 PPTService :: validateGeneratedFile :: File validated successfully. Size: ${stats.size} bytes`,
      );
    } catch (error) {
      logger.error("PPTService :: validateGeneratedFile :: error:", error);
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
        `🎯 PPTService :: fileToBase64 :: Converted file to base64. Length: ${fileContent.length} characters`,
      );

      return fileContent;
    } catch (error) {
      logger.error("PPTService :: fileToBase64 :: error:", error);
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
          `🎯 PPTService :: cleanupTempFile :: Temporary file cleaned up: ${filePath}`,
        );
      }
    } catch (error) {
      logger.warn(
        "PPTService :: cleanupTempFile :: Warning: Failed to cleanup temp file:",
        error.message,
      );
      // Don't throw error for cleanup failures
    }
  }

  generateFilename(title) {
    try {
      if (!title || typeof title !== "string") {
        return "untitled_presentation.pptx";
      }

      // Sanitize filename
      const sanitized = title
        .trim()
        .replace(/[^a-zA-Z0-9\s\-_]/g, "") // Remove special characters
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/_+/g, "_") // Replace multiple underscores with single
        .substring(0, 50); // Limit length

      return `${sanitized || "untitled_presentation"}.pptx`;
    } catch (error) {
      logger.warn(
        "PPTService :: generateFilename :: Warning: Failed to generate filename:",
        error.message,
      );
      return "untitled_presentation.pptx";
    }
  }

  // Additional utility methods

  async generateMultiplePresentations(db, tutorialIds) {
    try {
      if (!Array.isArray(tutorialIds) || tutorialIds.length === 0) {
        throw new Error("Tutorial IDs array is required and must not be empty");
      }

      logger.info(
        `🎯 PPTService :: generateMultiplePresentations :: Generating ${tutorialIds.length} presentations...`,
      );

      const results = [];
      const errors = [];

      for (let i = 0; i < tutorialIds.length; i++) {
        try {
          const result = await this.generatePpt(db, tutorialIds[i]);
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
      logger.error(
        "PPTService :: generateMultiplePresentations :: error:",
        error,
      );
      throw error;
    }
  }

  async getTutorialPreview(db, id) {
    try {
      const tutorialData = await this.getTutorialData(db, id);

      return {
        id: tutorialData._id,
        title: tutorialData.title,
        categoryName: tutorialData.categoryName,
        tutorialsCount: tutorialData.tutorials?.length || 0,
        tutorials:
          tutorialData.tutorials?.map((tutorial, index) => ({
            index: index + 1,
            title: tutorial.title,
            hasDescription: !!tutorial.description,
            hasContent: !!tutorial.content,
            descriptionLength: tutorial.description?.length || 0,
            contentLength: tutorial.content?.length || 0,
          })) || [],
        estimatedSlides:
          Math.ceil((tutorialData.tutorials?.length || 0) * 1.5) + 2, // Rough estimate including title and conclusion slides
        createdAt: tutorialData.createdAt,
        updatedAt: tutorialData.updatedAt,
      };
    } catch (error) {
      logger.error("PPTService :: getTutorialPreview :: error:", error);
      throw error;
    }
  }

  async validatePresentationRequirements(db, id) {
    try {
      const tutorialData = await this.getTutorialData(db, id);

      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        requirements: {
          hasTitle: !!tutorialData.title,
          hasTutorials:
            !!tutorialData.tutorials && tutorialData.tutorials.length > 0,
          minTutorialCount: (tutorialData.tutorials?.length || 0) >= 1,
          allTutorialsHaveTitle: true,
          allTutorialsHaveContent: true,
          titleLength: tutorialData.title?.length || 0,
          maxTitleLength: 100,
        },
      };

      // Check requirements
      if (!validation.requirements.hasTitle) {
        validation.errors.push("Tutorial must have a title");
        validation.isValid = false;
      }

      if (
        validation.requirements.titleLength >
        validation.requirements.maxTitleLength
      ) {
        validation.warnings.push(
          `Title is very long (${validation.requirements.titleLength} characters). Consider shortening for better display.`,
        );
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
      if (tutorialData.tutorials && Array.isArray(tutorialData.tutorials)) {
        tutorialData.tutorials.forEach((tutorial, index) => {
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

          if (tutorial.title && tutorial.title.length > 80) {
            validation.warnings.push(
              `Tutorial item ${index + 1} title is very long. Consider shortening for better slide display.`,
            );
          }
        });
      }

      return validation;
    } catch (error) {
      logger.error(
        "PPTService :: validatePresentationRequirements :: error:",
        error,
      );
      throw error;
    }
  }

  async generatePresentationWithCustomTemplate(
    db,
    id,
    templateOptions: any = {},
  ) {
    try {
      const tutorialData = await this.getTutorialData(db, id);

      // Add template options to tutorial data
      const enhancedTutorialData = {
        ...tutorialData,
        templateOptions: {
          theme: templateOptions.theme || "default",
          colorScheme: templateOptions.colorScheme || "blue",
          fontSize: templateOptions.fontSize || "medium",
          includeImages: templateOptions.includeImages !== false,
          includeTransitions: templateOptions.includeTransitions !== false,
          slideLayout: templateOptions.slideLayout || "standard",
          ...templateOptions,
        },
      };

      // Generate with custom options
      const outputFilePath = await this.generatePptFile(enhancedTutorialData);
      await this.validateGeneratedFile(outputFilePath);
      const fileContent = await this.fileToBase64(outputFilePath);
      await this.cleanupTempFile(outputFilePath);

      const filename = this.generateCustomFilename(
        tutorialData.title,
        templateOptions.theme,
      );

      return {
        filename,
        fileContent,
        templateOptions: enhancedTutorialData.templateOptions,
      };
    } catch (error) {
      logger.error(
        "PPTService :: generatePresentationWithCustomTemplate :: error:",
        error,
      );
      throw error;
    }
  }

  generateCustomFilename(title, theme) {
    const baseFilename = this.generateFilename(title);
    if (theme && theme !== "default") {
      return baseFilename.replace(".pptx", `_${theme}.pptx`);
    }
    return baseFilename;
  }

  // Utility method to estimate presentation duration
  estimatePresentationDuration(tutorialData) {
    try {
      if (!tutorialData || !tutorialData.tutorials) {
        return 0;
      }

      const slidesCount = tutorialData.tutorials.length + 2; // Include title and conclusion
      const averageTimePerSlide = 2; // minutes
      const readingTime = tutorialData.tutorials.reduce((total, tutorial) => {
        const contentLength =
          (tutorial.description || "").length + (tutorial.content || "").length;
        return total + Math.ceil(contentLength / 1000); // Rough estimate: 1000 chars = 1 minute
      }, 0);

      return Math.max(slidesCount * averageTimePerSlide, readingTime);
    } catch (error) {
      logger.warn(
        "PPTService :: estimatePresentationDuration :: Warning:",
        error.message,
      );
      return 0;
    }
  }

  // Get comprehensive tutorial analysis for presentation
  async getTutorialAnalysis(db, id) {
    try {
      const tutorialData = await this.getTutorialData(db, id);
      const preview = await this.getTutorialPreview(db, id);
      const validation = await this.validatePresentationRequirements(db, id);
      const estimatedDuration = this.estimatePresentationDuration(tutorialData);

      return {
        ...preview,
        validation,
        estimatedDuration,
        recommendations: this.generateRecommendations(tutorialData, validation),
      };
    } catch (error) {
      logger.error("PPTService :: getTutorialAnalysis :: error:", error);
      throw error;
    }
  }

  generateRecommendations(tutorialData, validation) {
    const recommendations = [];

    if (validation.warnings.length > 0) {
      recommendations.push({
        type: "warning",
        message:
          "Consider addressing the warnings to improve presentation quality",
        details: validation.warnings,
      });
    }

    if (tutorialData.tutorials && tutorialData.tutorials.length > 20) {
      recommendations.push({
        type: "suggestion",
        message:
          "Consider breaking this into multiple presentations for better audience engagement",
        reason: "Very long presentations can lose audience attention",
      });
    }

    if (tutorialData.tutorials && tutorialData.tutorials.length < 3) {
      recommendations.push({
        type: "suggestion",
        message:
          "Consider adding more content sections for a more comprehensive presentation",
        reason: "Short presentations may not provide enough value",
      });
    }

    return recommendations;
  }

  // Get service information
  getServiceInfo() {
    return {
      service: "PPTService",
      supportedFormats: ["pptx"],
      helperFunction:
        typeof generatePptFromTutorial === "function"
          ? "Available"
          : "Not available",
      features: [
        "generatePpt",
        "generateMultiplePresentations",
        "getTutorialPreview",
        "validatePresentationRequirements",
        "generatePresentationWithCustomTemplate",
        "getTutorialAnalysis",
      ],
      dependencies: {
        fs: !!fs,
        path: !!path,
        mongodb: !!ObjectId,
      },
      templateOptions: [
        "theme",
        "colorScheme",
        "fontSize",
        "includeImages",
        "includeTransitions",
        "slideLayout",
      ],
    };
  }
}

// Create singleton instance
const pptService = new PPTService();

export { PPTService, pptService };
