import mongoose from "mongoose";
const fs = require("fs").promises;
import { cloudinaryService } from "./cloudinaryService";
import { HttpException, HttpStatus } from "../utils/dbHelper";
import {
  generateEbookFromTutorial,
  generatePdfFromTutorial,
  generatePptFromTutorial,
} from "../helper/index";
import { getLogger } from "../../config/logger";
const logger = getLogger("historyService");

class HistoryService {
  private cloudinaryService: any;
  private User: any;
  private Draft: any;
  private BlogPost: any;
  private BlogComment: any;

  constructor() {
    this.cloudinaryService = cloudinaryService;
    this.initializeModels();
  }

  initializeModels() {
    try {
      // Get existing models or they should be defined elsewhere
      this.User = mongoose.model("users");
      this.Draft = mongoose.model("drafts");
      this.BlogPost = mongoose.model("blogPosts");
      this.BlogComment = mongoose.model("blogComments");
    } catch (error) {
      logger.error("HistoryService :: initializeModels :: error:", error);
      // Models should be defined elsewhere in your application
    }
  }

  async getContentHistory(
    start = 1,
    limit = 10,
    type = "both",
    search,
    filter = {},
  ) {
    try {
      const skip = (start - 1) * limit;

      // Construct the filter object
      const queryFilter = {
        ...(type !== "both" ? { tutorial: type === "tutorial" || null } : {}),
        ...(search && { title: { $regex: search, $options: "i" } }),
        ...filter,
      };

      const projection = {
        title: 1,
        slug: 1,
        description: 1,
        categoryId: 1,
        categoryName: 1,
        subCategory: 1,
        nestedSubCategory: 1,
        tutorial: 1,
        tutorials: 1,
        published: 1,
        listed: 1,
        updatedAt: 1,
        cloudinaryAssets: 1,
        imageUrl: 1,
      };

      const sort = { updatedAt: -1 };

      // Query both collections in parallel
      const [draftsResult, postsResult] = await Promise.all([
        // Drafts collection
        Promise.all([
          this.Draft.find(queryFilter).select(projection).sort(sort).lean(),
          this.Draft.countDocuments(queryFilter),
        ]),
        // Posts collection
        Promise.all([
          this.BlogPost.find(queryFilter).select(projection).sort(sort).lean(),
          this.BlogPost.countDocuments(queryFilter),
        ]),
      ]);

      const [draftDocuments, draftsCount] = draftsResult;
      const [postDocuments, postsCount] = postsResult;

      // Combine and add source information
      const allDocuments: any[] = [
        ...draftDocuments.map((doc) => ({ ...(doc as any), source: "draft" })),
        ...postDocuments.map((doc) => ({
          ...(doc as any),
          source: "published",
        })),
      ];

      // Sort combined results by updatedAt
      allDocuments.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

      // Apply pagination to combined results
      const paginatedDocuments = allDocuments.slice(skip, skip + limit);

      // Map each document to the Post type
      const posts = paginatedDocuments.map((doc) => ({
        _id: doc._id.toString(),
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        categoryId: doc.categoryId,
        categoryName: doc.categoryName,
        subCategory: doc.subCategory || null,
        nestedSubCategory: doc.nestedSubCategory || null,
        tutorial: doc.tutorial,
        tutorials: doc.tutorials,
        published: doc.published,
        listed: doc.listed,
        updatedAt: doc.updatedAt,
        cloudinaryAssets: doc.cloudinaryAssets,
        imageUrl: doc.imageUrl || null,
        source: doc.source,
      }));

      const totalRecords = draftsCount + postsCount;

      return { posts, totalRecords };
    } catch (error) {
      logger.error("HistoryService :: getContentHistory :: error:", error);
      throw new Error(`Failed to get content history: ${error.message}`);
    }
  }

  async publishDraft(userId, postId, shouldPublish) {
    try {
      if (!postId || !userId) {
        throw new Error("Post ID and userId are required");
      }

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new Error("Invalid post ID format");
      }

      const user = await this.User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (shouldPublish) {
        // PUBLISH: Move from drafts to posts
        const draft = await this.Draft.findOne({
          _id: postId,
        });

        if (!draft) {
          throw new Error("Draft not found or access denied");
        }

        const publishedPostData = {
          ...(draft as any).toObject(),
          _id: undefined,
          publishedAt: new Date(),
          publishedBy: (user as any)._id,
          published: true,
          listed: true,
        };

        // Insert into posts collection
        const publishedPost = new this.BlogPost(publishedPostData);
        await publishedPost.save();

        // Remove from drafts collection
        await this.Draft.findByIdAndDelete(postId);

        logger.info(
          `HistoryService :: publishDraft :: Post published successfully: ${(publishedPost as any)._id}`,
        );
        return (publishedPost as any).toObject();
      } else {
        // UNPUBLISH: Move from posts to drafts
        const existingDraft = await this.Draft.findOne({
          _id: postId,
        });

        if (existingDraft) {
          return {
            success: false,
            message: "Post is already a draft",
          };
        }

        // Check if post exists in posts collection
        const post = await this.BlogPost.findOne({
          _id: postId,
        });

        if (!post) {
          throw new Error("Published post not found or access denied");
        }

        const draftData = {
          ...(post as any).toObject(),
          _id: undefined,
          publishedAt: undefined,
          publishedBy: undefined,
          published: false,
          listed: false,
          unpublishedAt: new Date(),
          unpublishedBy: (user as any)._id,
        };

        // Insert into drafts collection
        const unpublishedDraft = new this.Draft(draftData);
        await unpublishedDraft.save();

        // Remove from posts collection
        await this.BlogPost.findByIdAndDelete(postId);

        return {
          success: true,
          message: "Post unpublished successfully",
          draft: (unpublishedDraft as any).toObject(),
        };
      }
    } catch (error) {
      logger.error("HistoryService :: publishDraft :: error:", error);
      throw new Error(
        `Unable to ${shouldPublish ? "publish" : "unpublish"} post: ${error.message}`,
      );
    }
  }

  async generateEbook(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid tutorial ID format");
      }

      const tutorialData = await this.BlogPost.findById(id).lean();

      if (!tutorialData) {
        throw new HttpException("Tutorial not found", HttpStatus.NOT_FOUND);
      }

      // Ensure tutorialData is valid
      const data = tutorialData as any;
      if (!data.title || !data.tutorials || data.tutorials.length === 0) {
        throw new HttpException(
          'Invalid tutorial data. "title" and "tutorials" are required fields.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate the eBook
      const outputFilePath = await generateEbookFromTutorial(tutorialData);

      // Convert file content to base64
      const fileContent = await fs.readFile(outputFilePath, {
        encoding: "base64",
      });

      // Return base64 content and filename
      return {
        filename: `${data.title.replace(/\s+/g, "_")}.epub`,
        fileContent,
      };
    } catch (error) {
      logger.error("HistoryService :: generateEbook :: error:", error);
      throw new HttpException(
        "Failed to generate eBook",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generatePDF(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid tutorial ID format");
      }

      const tutorialData = await this.BlogPost.findById(id).lean();

      if (!tutorialData) {
        throw new HttpException("Tutorial not found", HttpStatus.NOT_FOUND);
      }

      // Ensure tutorialData is valid
      const data = tutorialData as any;
      if (!data.title || !data.tutorials || data.tutorials.length === 0) {
        throw new HttpException(
          'Invalid tutorial data. "title" and "tutorials" are required fields.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate the PDF
      const outputFilePath = await generatePdfFromTutorial(tutorialData);

      // Convert file content to base64
      const fileContent = await fs.readFile(outputFilePath, {
        encoding: "base64",
      });

      // Return base64 content and filename
      return {
        filename: `${data.title.replace(/\s+/g, "_")}.pdf`,
        fileContent,
      };
    } catch (error) {
      logger.error("HistoryService :: generatePDF :: error:", error);
      throw new HttpException(
        "Failed to generate PDF",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generatePpt(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid tutorial ID format");
      }

      const tutorialData = await this.BlogPost.findById(id).lean();

      if (!tutorialData) {
        throw new HttpException("Tutorial not found", HttpStatus.NOT_FOUND);
      }

      // Ensure tutorialData is valid
      const data = tutorialData as any;
      if (!data.title || !data.tutorials || data.tutorials.length === 0) {
        throw new HttpException(
          'Invalid tutorial data. "title" and "tutorials" are required fields.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate the PowerPoint
      const outputFilePath = await generatePptFromTutorial(tutorialData);

      // Convert file content to base64
      const fileContent = await fs.readFile(outputFilePath, {
        encoding: "base64",
      });

      // Return base64 content and filename
      return {
        filename: `${data.title.replace(/\s+/g, "_")}.pptx`,
        fileContent,
      };
    } catch (error) {
      logger.error("HistoryService :: generatePpt :: error:", error);
      throw new HttpException(
        "Failed to generate PowerPoint",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get service information
  getServiceInfo() {
    return {
      service: "HistoryService",
      collections: ["blogPosts", "drafts", "blogComments"],
      supportedTypes: ["blog", "tutorial", "both"],
      features: ["create", "publish", "edit", "delete", "search"],
      aiIntegration: !!process.env.OPENAI_API_KEY,
      cloudinaryIntegration: true,
    };
  }
}

// Create singleton instance
const historyService = new HistoryService();

export { HistoryService, historyService };
