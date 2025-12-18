import mongoose from "mongoose";
import { cloudinaryService } from "../services/cloudinaryService";
import { HttpException, HttpStatus } from "../utils/dbHelper";
import { applySlug } from "../common/utils";
import { getLogger } from "../../config/logger";
const logger = getLogger("tutorialService");

class TutorialService {
  constructor() {
    // Models are accessed directly via mongoose.model() throughout the class
  }

  async addTutorial(userId, addTutorialArgs) {
    try {
      if (!userId || !addTutorialArgs) {
        throw new Error("userId and tutorial arguments are required");
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }

      const user = await mongoose.model("users").findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Validate category exists
      if (addTutorialArgs.categoryName) {
        const categoryDetails = await mongoose.model("blogCategories").findOne({
          categoryName: addTutorialArgs.categoryName,
        });
        if (!categoryDetails) {
          throw new Error(
            `Category ${addTutorialArgs.categoryName} does not exist.`,
          );
        }
        addTutorialArgs.categoryId = categoryDetails._id.toString();
      }

      // Validate and check duplicates
      const slug = applySlug(addTutorialArgs.title);

      const [duplicateInDrafts, duplicateInPosts] = await Promise.all([
        mongoose.model("drafts").findOne({ slug }),
        mongoose.model("blogPosts").findOne({ slug }),
      ]);

      if (duplicateInDrafts || duplicateInPosts) {
        throw new Error("Duplicate Tutorial title/slug");
      }

      const tutorialData = {
        userId: user._id,
        title: addTutorialArgs.title,
        description: addTutorialArgs.description,
        slug,
        categoryId: addTutorialArgs.categoryId,
        categoryName: addTutorialArgs.categoryName,
        subCategory: addTutorialArgs.subCategory,
        nestedSubCategory: addTutorialArgs.nestedSubCategory,
        imageUrl: addTutorialArgs.imageUrl,
        cloudinaryAssets: addTutorialArgs.cloudinaryAssets || [],
        tutorial: true,
        tutorials: addTutorialArgs.tutorials || [],
        published: false,
        listed: false,
      };

      const tutorialDraft = new (mongoose.model("drafts") as any)(tutorialData);
      const savedTutorial = await tutorialDraft.save();

      logger.info(
        `TutorialService :: addTutorial :: Tutorial saved as draft: ${savedTutorial._id}`,
      );
      return savedTutorial.toObject();
    } catch (error) {
      logger.error("TutorialService :: addTutorial :: error:", error);
      throw error;
    }
  }

  async getTutorialById(tutorialId, userId) {
    try {
      if (!tutorialId) {
        throw new Error("Tutorial ID is required");
      }

      if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
        throw new Error("Invalid tutorial ID format");
      }

      // First try to find in published tutorials
      let tutorial = await mongoose
        .model("blogPosts")
        .findOne({
          _id: tutorialId,
          tutorial: true,
        })
        .lean();

      // If not found and userId provided, check drafts
      if (!tutorial && userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          throw new Error("Invalid user ID format");
        }

        const user = await mongoose.model("users").findById(userId);
        if (user) {
          tutorial = await mongoose
            .model("drafts")
            .findOne({
              _id: tutorialId,
              userId: user._id,
              tutorial: true,
            })
            .lean();
        }
      }

      return tutorial;
    } catch (error) {
      logger.error("TutorialService :: getTutorialById :: error:", error);
      throw error;
    }
  }

  async getTutorialDrafts(userId, start = 1, limit = 10, search) {
    try {
      if (!userId) {
        throw new Error("userId is required");
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }

      const user = await mongoose.model("users").findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const skip = (start - 1) * limit;
      const filter: any = {
        userId: user._id,
        tutorial: true,
      };

      if (search) {
        filter.title = { $regex: search, $options: "i" };
      }

      const [tutorials, totalRecords] = await Promise.all([
        mongoose
          .model("drafts")
          .find(filter)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        mongoose.model("drafts").countDocuments(filter),
      ]);

      return {
        tutorials,
        totalRecords,
        pagination: {
          page: start,
          limit,
          totalPages: Math.ceil(totalRecords / limit),
        },
      };
    } catch (error) {
      logger.error("TutorialService :: getTutorialDrafts :: error:", error);
      throw error;
    }
  }

  async getPublishedTutorials(start = 1, limit = 10, categoryName, search) {
    try {
      const skip = (start - 1) * limit;
      const filter: any = {
        tutorial: true,
        published: true,
        listed: true,
      };

      if (categoryName) {
        filter.categoryName = categoryName;
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const [tutorials, totalRecords] = await Promise.all([
        mongoose
          .model("blogPosts")
          .find(filter)
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        mongoose.model("blogPosts").countDocuments(filter),
      ]);

      return {
        tutorials,
        totalRecords,
        pagination: {
          page: start,
          limit,
          totalPages: Math.ceil(totalRecords / limit),
        },
      };
    } catch (error) {
      logger.error("TutorialService :: getPublishedTutorials :: error:", error);
      throw error;
    }
  }

  async getAllTutorials(userId, start = 1, limit = 10, search) {
    try {
      let allTutorials = [];

      if (userId) {
        // User is authenticated - get from both drafts and tutorials
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          throw new Error("Invalid user ID format");
        }

        const user = await mongoose.model("users").findById(userId);
        if (!user) {
          throw new Error("User not found");
        }

        const filter: any = {
          userId: user._id,
          tutorial: true,
        };

        if (search) {
          filter.title = { $regex: search, $options: "i" };
        }

        // Get from both collections for authenticated user
        const [draftTutorials, publishedTutorials] = await Promise.all([
          mongoose.model("drafts").find(filter).lean(),
          mongoose.model("blogPosts").find(filter).lean(),
        ]);

        // Combine and mark draft/published status
        allTutorials = [
          ...draftTutorials.map((t) => ({
            ...t,
            isDraft: true,
            isPublished: false,
          })),
          ...publishedTutorials.map((t) => ({
            ...t,
            isDraft: false,
            isPublished: true,
          })),
        ];
      } else {
        // No userId - only get published tutorials
        const filter: any = {
          tutorial: true,
          published: true,
          listed: true,
        };

        if (search) {
          filter.title = { $regex: search, $options: "i" };
        }

        logger.info(" TutorialService :: getAllTutorials :: filter:", filter);
        // Only get from tutorials collection for public access
        const publishedTutorials = await mongoose
          .model("blogPosts")
          .find(filter)
          .lean();
        logger.info(
          " TutorialService :: getAllTutorials :: publishedTutorials:",
          publishedTutorials,
        );

        allTutorials = publishedTutorials.map((t) => ({
          ...t,
          isDraft: false,
          isPublished: true,
        }));
      }

      // Sort by updated date (newest first)
      allTutorials.sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.updatedAt || a.createdAt);
        const dateB = new Date(b.publishedAt || b.updatedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      // Apply pagination
      const skip = (start - 1) * limit;
      const paginatedTutorials = allTutorials.slice(skip, skip + limit);

      return {
        tutorials: paginatedTutorials,
        totalRecords: allTutorials.length,
        pagination: {
          page: start,
          limit,
          totalPages: Math.ceil(allTutorials.length / limit),
          hasNextPage: start * limit < allTutorials.length,
          hasPrevPage: start > 1,
        },
        isAuthenticated: !!userId,
      };
    } catch (error) {
      logger.error("TutorialService :: getAllTutorials :: error:", error);
      throw error;
    }
  }

  async updateTutorial(tutorialId, userId, updateData) {
    try {
      if (!tutorialId || !userId || !updateData) {
        throw new Error("Tutorial ID, user ID, and update data are required");
      }

      if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
        throw new Error("Invalid tutorial ID format");
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }

      const user = await mongoose.model("users").findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // If title is being updated, check for duplicate slug
      if (updateData.title) {
        const slug = applySlug(updateData.title);
        const [duplicateInDrafts, duplicateInPosts] = await Promise.all([
          mongoose.model("drafts").findOne({ slug, _id: { $ne: tutorialId } }),
          mongoose
            .model("blogPosts")
            .findOne({ slug, _id: { $ne: tutorialId } }),
        ]);

        if (duplicateInDrafts || duplicateInPosts) {
          throw new Error("Duplicate tutorial title/slug");
        }

        updateData.slug = slug;
      }

      const options = { new: true, runValidators: true };

      // Try to update in drafts first
      let updatedTutorial = await mongoose
        .model("drafts")
        .findOneAndUpdate(
          { _id: tutorialId, userId: user._id, tutorial: true },
          { $set: updateData },
          options,
        );

      // If not found in drafts, try published posts
      if (!updatedTutorial) {
        updatedTutorial = await mongoose
          .model("blogPosts")
          .findOneAndUpdate(
            { _id: tutorialId, userId: user._id, tutorial: true },
            { $set: updateData },
            options,
          );
      }

      if (!updatedTutorial) {
        throw new Error("Tutorial not found or access denied");
      }

      return updatedTutorial.toObject();
    } catch (error) {
      logger.error("TutorialService :: updateTutorial :: error:", error);
      throw error;
    }
  }

  async publishTutorial(tutorialId, userId) {
    try {
      if (!tutorialId || !userId) {
        throw new Error("Tutorial ID and user ID are required");
      }

      if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
        throw new Error("Invalid tutorial ID format");
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }

      const user = await mongoose.model("users").findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Find tutorial in drafts
      const draft = await mongoose.model("drafts").findOne({
        _id: tutorialId,
        userId: user._id,
        tutorial: true,
      });

      if (!draft) {
        throw new Error("Tutorial draft not found or access denied");
      }

      // Create published version
      const publishedData = {
        ...draft.toObject(),
        _id: undefined, // Remove _id to generate new one
        published: true,
        listed: true,
        publishedAt: new Date(),
        publishedBy: user._id,
      };

      const publishedTutorial = new (mongoose.model("blogPosts") as any)(
        publishedData,
      );
      await publishedTutorial.save();

      // Remove from drafts
      await mongoose.model("drafts").findByIdAndDelete(tutorialId);

      logger.info(
        `TutorialService :: publishTutorial :: Tutorial published: ${publishedTutorial._id}`,
      );
      return publishedTutorial.toObject();
    } catch (error) {
      logger.error("TutorialService :: publishTutorial :: error:", error);
      throw error;
    }
  }

  async unpublishTutorial(tutorialId, userId) {
    try {
      if (!tutorialId || !userId) {
        throw new Error("Tutorial ID and user ID are required");
      }

      if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
        throw new Error("Invalid tutorial ID format");
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }

      const user = await mongoose.model("users").findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Find tutorial in published posts
      const publishedTutorial = await mongoose.model("blogPosts").findOne({
        _id: tutorialId,
        userId: user._id,
        tutorial: true,
      });

      if (!publishedTutorial) {
        throw new Error("Published tutorial not found or access denied");
      }

      // Create draft version
      const draftData = {
        ...publishedTutorial.toObject(),
        _id: undefined, // Remove _id to generate new one
        published: false,
        listed: false,
        publishedAt: undefined,
        publishedBy: undefined,
        unpublishedAt: new Date(),
        unpublishedBy: user._id,
      };

      const draftTutorial = new (mongoose.model("drafts") as any)(draftData);
      await draftTutorial.save();

      // Remove from published posts
      await mongoose.model("blogPosts").findByIdAndDelete(tutorialId);

      logger.info(
        `TutorialService :: unpublishTutorial :: Tutorial unpublished: ${draftTutorial._id}`,
      );
      return draftTutorial.toObject();
    } catch (error) {
      logger.error("TutorialService :: unpublishTutorial :: error:", error);
      throw error;
    }
  }

  async getTutorialsByCategory(categoryName, start = 1, limit = 10, search) {
    try {
      if (!categoryName) {
        throw new Error("Category name is required");
      }

      const skip = (start - 1) * limit;
      const filter: any = {
        tutorial: true,
        published: true,
        listed: true,
        categoryName: categoryName,
      };

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const [tutorials, totalRecords] = await Promise.all([
        mongoose
          .model("blogPosts")
          .find(filter)
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        mongoose.model("blogPosts").countDocuments(filter),
      ]);

      return {
        tutorials,
        totalRecords,
        pagination: {
          page: start,
          limit,
          totalPages: Math.ceil(totalRecords / limit),
        },
        category: categoryName,
      };
    } catch (error) {
      logger.error(
        "TutorialService :: getTutorialsByCategory :: error:",
        error,
      );
      throw error;
    }
  }

  async createTutorialFromBlogs(userId, blogIds, title) {
    try {
      if (!userId || !blogIds || !title) {
        throw new Error("userId, blog IDs, and title are required");
      }

      // Fetch blog details from the database
      const blogs = await mongoose
        .model("blogPosts")
        .find({
          _id: { $in: blogIds.map((id) => new mongoose.Types.ObjectId(id)) },
        })
        .lean();

      if (!blogs.length) {
        throw new HttpException(
          "No valid blogs found with the provided IDs",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Extract relevant fields from the first blog (assuming consistency across selected blogs)
      const primaryBlog = blogs[0];

      const tutorials = blogs.map((blog) => ({
        title: blog.title,
        description: blog.description,
        cloudinaryAssets: blog.cloudinaryAssets || [],
      }));

      const tutorialData = {
        title,
        description: `A tutorial created using selected blogs`,
        categoryId: primaryBlog.categoryId || null,
        categoryName: primaryBlog.categoryName || "Uncategorized",
        subCategory: primaryBlog.subCategory || null,
        nestedSubCategory: primaryBlog.nestedSubCategory || null,
        imageUrl: primaryBlog.imageUrl || null,
        cloudinaryAssets: primaryBlog.cloudinaryAssets || [],
        tutorials,
        published: false,
        tutorial: true,
        listed: false,
        slug: applySlug(title),
        userId,
      };

      // Insert into drafts collection as a tutorial
      const DraftModel = mongoose.model("drafts");
      const tutorialDraft = new DraftModel(tutorialData);
      const savedTutorial = await tutorialDraft.save();

      return savedTutorial.toObject();
    } catch (error) {
      logger.info(
        " TutorialService :: createTutorialFromBlogs :: error:",
        error,
      );
      throw new HttpException(
        error.message || "Failed to create tutorial",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createTutorialFromBlogs2(userId, blogIds, title) {
    try {
      if (!userId || !blogIds || !title) {
        throw new Error("userId, blog IDs, and title are required");
      }

      if (!Array.isArray(blogIds) || blogIds.length === 0) {
        throw new Error("Blog IDs must be a non-empty array");
      }

      // Check user authentication and permissions
      const user = await mongoose.model("users").findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Validate ObjectIds
      const invalidIds = blogIds.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id),
      );
      if (invalidIds.length > 0) {
        throw new Error(`Invalid blog IDs: ${invalidIds.join(", ")}`);
      }

      // Fetch blog details from BOTH collections
      const objectIds = blogIds.map((id) => new mongoose.Types.ObjectId(id));

      const [draftBlogs, publishedBlogs] = await Promise.all([
        mongoose
          .model("drafts")
          .find({
            _id: { $in: objectIds },
            userId: user._id,
          })
          .lean(),
        mongoose
          .model("blogPosts")
          .find({
            _id: { $in: objectIds },
            $or: [{ userId: user._id }, { published: true, listed: true }],
          })
          .lean(),
      ]);

      const blogs = [...draftBlogs, ...publishedBlogs];

      if (!blogs.length) {
        throw new Error("No valid blogs found with the provided IDs");
      }

      const primaryBlog = blogs[0];
      const tutorials = blogs.map((blog) => ({
        title: blog.title,
        description: blog.description,
        cloudinaryAssets: blog.cloudinaryAssets || [],
        originalBlogId: blog._id.toString(),
      }));

      const slug = applySlug(title);

      // Check for duplicate slug
      const [duplicateInDrafts, duplicateInPosts] = await Promise.all([
        mongoose.model("drafts").findOne({ slug }),
        mongoose.model("blogPosts").findOne({ slug }),
      ]);

      if (duplicateInDrafts || duplicateInPosts) {
        throw new Error("Duplicate tutorial title/slug");
      }

      const tutorialData = {
        userId: user._id,
        title,
        description: `A tutorial created from selected blogs: ${blogs.map((b) => b.title).join(", ")}`,
        slug,
        categoryId: primaryBlog.categoryId || null,
        categoryName: primaryBlog.categoryName || "Uncategorized",
        subCategory: primaryBlog.subCategory || null,
        nestedSubCategory: primaryBlog.nestedSubCategory || null,
        imageUrl: primaryBlog.imageUrl || null,
        cloudinaryAssets: primaryBlog.cloudinaryAssets || [],
        tutorials,
        published: false,
        tutorial: true,
        listed: false,
        sourceBlogIds: blogIds,
      };

      const tutorialDraft = new (mongoose.model("drafts") as any)(tutorialData);
      const savedTutorial = await tutorialDraft.save();

      return savedTutorial.toObject();
    } catch (error) {
      logger.error(
        "TutorialService :: createTutorialFromBlogs2 :: error:",
        error,
      );
      throw error;
    }
  }

  async editTutorial(userId, tutorialId, editTutorialArgs) {
    try {
      if (!userId || !tutorialId || !editTutorialArgs) {
        throw new Error("userId, tutorial ID, and edit arguments are required");
      }

      if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
        throw new Error("Invalid tutorial ID format");
      }

      const slug = applySlug(editTutorialArgs.title);

      const editData = {
        title: editTutorialArgs.title,
        slug: slug,
        categoryId: editTutorialArgs.categoryId,
        categoryName: editTutorialArgs.categoryName,
        subCategory: editTutorialArgs.subCategory,
        nestedSubCategory: editTutorialArgs.nestedSubCategory,
        imageUrl: editTutorialArgs.imageUrl,
        tutorials: [],
      };

      // Process tutorials
      for (let i = 0; i < editTutorialArgs.tutorials.length; i++) {
        const tutorialObj = editTutorialArgs.tutorials[i];
        const tutorial = {
          title: tutorialObj.title,
          slug: tutorialObj.title,
          description: tutorialObj.description,
          cloudinaryAssets: tutorialObj.cloudinaryAssets || [],
        };

        editData.tutorials.push(tutorial);
      }

      // Try to update in published posts first
      let editedPost = await mongoose
        .model("blogPosts")
        .findByIdAndUpdate(
          tutorialId,
          { $set: editData },
          { new: true, runValidators: true },
        );

      // If not found in published posts, try drafts
      if (!editedPost) {
        editedPost = await mongoose
          .model("drafts")
          .findByIdAndUpdate(
            tutorialId,
            { $set: editData },
            { new: true, runValidators: true },
          );
      }

      if (!editedPost) {
        throw new Error("Tutorial not found");
      }

      return editedPost.toObject();
    } catch (error) {
      logger.error("TutorialService :: editTutorial :: error:", error);
      throw error;
    }
  }

  async deleteTutorial(userId, tutorialId) {
    try {
      if (!userId || !tutorialId) {
        throw new Error("userId and tutorial ID are required");
      }

      if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
        throw new Error("Invalid tutorial ID format");
      }

      // Try to find tutorial in published posts first
      let tutorial = await mongoose.model("blogPosts").findById(tutorialId);
      let isDraft = false;

      if (!tutorial) {
        tutorial = await mongoose.model("drafts").findById(tutorialId);
        isDraft = true;
      }

      if (!tutorial) {
        throw new HttpException("Tutorial not found", HttpStatus.NOT_FOUND);
      }

      // Collect all cloudinary assets from the tutorials
      const cloudinaryAssets = tutorial.tutorials.reduce((assets, t) => {
        return [...assets, ...(t.cloudinaryAssets || [])];
      }, []);

      // Get main cloudinaryAsset
      const tutorialAsset = tutorial.cloudinaryAssets;
      if (tutorialAsset && tutorialAsset.length > 0) {
        cloudinaryAssets.push(...tutorialAsset);
      }

      // Delete Cloudinary assets
      if (cloudinaryAssets.length > 0) {
        try {
          // TODO: Implement cloudinary deletion
          // await this.cloudinaryService.deleteMultiAssets(cloudinaryAssets);
          logger.info(
            "TutorialService :: deleteTutorial :: Would delete Cloudinary assets:",
            cloudinaryAssets.length,
          );
        } catch (cloudinaryError: any) {
          logger.warn(
            "TutorialService :: deleteTutorial :: Failed to delete Cloudinary assets:",
            cloudinaryError.message,
          );
        }
      }

      // Delete all comments from the tutorial
      await mongoose
        .model("blogComments")
        .deleteMany({ contentId: tutorialId });

      // Delete the tutorial from the appropriate collection
      const deletedTutorial = isDraft
        ? await mongoose.model("drafts").deleteOne({ _id: tutorialId })
        : await mongoose.model("blogPosts").deleteOne({ _id: tutorialId });

      return {
        ...deletedTutorial,
        slug: tutorial.slug,
        categoryName: tutorial.categoryName,
      };
    } catch (error) {
      logger.error("TutorialService :: deleteTutorial :: error:", error);
      throw error;
    }
  }

  // Get service information
  getServiceInfo() {
    return {
      service: "TutorialService",
      collections: ["blogPosts", "drafts"],
      features: [
        "create",
        "publish",
        "unpublish",
        "edit",
        "delete",
        "createFromBlogs",
      ],
      supportedOperations: ["draft", "publish", "unpublish", "toggle"],
      cloudinaryIntegration: true,
    };
  }
}

// Create singleton instance
const tutorialService = new TutorialService();

export { TutorialService, tutorialService };
