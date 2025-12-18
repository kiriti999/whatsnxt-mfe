// ========================================
// PDF SERVICE
// ========================================
import { generatePdfFromTutorial } from "../helper";
import { ObjectId } from "mongodb";
const fs = require("fs").promises;
import fsSync from "fs";
import { getLogger } from "../../config/logger";
const logger = getLogger("pdfService");

class PDFService {
  constructor() {
    this.validateDependencies();
  }

  validateDependencies() {
    try {
      if (typeof generatePdfFromTutorial !== "function") {
        throw new Error(
          "generatePdfFromTutorial helper function is not available",
        );
      }
    } catch (error) {
      logger.warn(
        "PDFService :: validateDependencies :: warning:",
        error.message,
      );
    }
  }

  async generatePDF(db, id) {
    try {
      if (!db || !id) {
        throw new Error("Database connection and tutorial ID are required");
      }

      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid tutorial ID format");
      }

      logger.info(
        `📄 PDFService :: generatePDF :: Starting PDF generation for ID: ${id}`,
      );

      const tutorialData = await db.collection("blogPosts").findOne({
        _id: ObjectId.createFromHexString(id),
      });

      if (!tutorialData) {
        throw new Error("Tutorial not found");
      }

      logger.info(`📄 PDFService :: generatePDF :: Tutorial data:`, {
        id: tutorialData._id,
        title: tutorialData.title,
        tutorialsCount: tutorialData.tutorials?.length || 0,
      });

      // Validate tutorial data
      if (
        !tutorialData.title ||
        !tutorialData.tutorials ||
        tutorialData.tutorials.length === 0
      ) {
        throw new Error(
          'Invalid tutorial data. "title" and "tutorials" are required fields.',
        );
      }

      // Generate the PDF
      const outputFilePath = await generatePdfFromTutorial(tutorialData);

      if (!outputFilePath) {
        throw new Error("PowerPoint generation returned empty file path");
      }

      // Validate generated file
      const fileExists = await fs
        .access(outputFilePath)
        .then(() => true)
        .catch(() => false);
      if (!fileExists) {
        throw new Error(
          `Generated PowerPoint file not found at: ${outputFilePath}`,
        );
      }

      // Convert file content to base64
      const fileContent = fsSync.readFileSync(outputFilePath, {
        encoding: "base64",
      });

      if (!fileContent) {
        throw new Error("Generated PowerPoint file is empty");
      }

      // Clean up temporary file
      try {
        await fs.unlink(outputFilePath);
        logger.info(
          `🎯 PPTService :: generatePpt :: Temporary file cleaned up: ${outputFilePath}`,
        );
      } catch (cleanupError) {
        logger.warn(
          "PPTService :: generatePpt :: Warning: Failed to cleanup temp file:",
          cleanupError.message,
        );
      }

      const filename = `${tutorialData.title.replace(/\s+/g, "_")}.pptx`;
      logger.info(
        `🎯 PPTService :: generatePpt :: Successfully generated PowerPoint: ${filename}`,
      );

      return { filename, fileContent };
    } catch (error) {
      logger.error("❌ PPTService :: generatePpt :: error:", error);
      throw new Error(`Failed to generate PowerPoint: ${error.message}`);
    }
  }

  getServiceInfo() {
    return {
      service: "PPTService",
      supportedFormats: ["pptx"],
      helperFunction:
        typeof generatePdfFromTutorial === "function"
          ? "Available"
          : "Not available",
    };
  }
}

// Create singleton instances
const pdfService = new PDFService();

export { pdfService };
