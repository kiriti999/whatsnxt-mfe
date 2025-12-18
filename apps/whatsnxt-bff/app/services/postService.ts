import mongoose from "mongoose";
import { cloudinaryService } from "../services/cloudinaryService";
import calculateTimeToRead from "../utils/timeToRead";
import { formatDate } from "../utils/formatDate";
import { OpenAI } from "openai";
import { applySlug } from "../utils/course/index";
import { invalidateSpecificCaches } from "../common/middlewares/redis-middleware";
import { getLogger } from "../../config/logger";
const logger = getLogger("postService");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper functions
async function checkDuplicateSlug(slug) {
  try {
    const Draft = mongoose.model("drafts");
    const BlogPost = mongoose.model("blogPosts");
    const [draftPost, publishedPost] = await Promise.all([
      Draft.findOne({ slug }).lean(),
      BlogPost.findOne({ slug }).lean(),
    ]);
    return !!(draftPost || publishedPost);
  } catch (error) {
    logger.error("checkDuplicateSlug :: error:", error);
    throw error;
  }
}

class PostService {
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
      logger.error("PostService :: initializeModels :: error:", error);
      // Models should be defined elsewhere in your application
    }
  }

  async createBlog(userId, addPostArgs) {
    try {
      if (!userId || !addPostArgs)
        throw new Error("userId and post arguments are required");
      const User = mongoose.model("users");
      const user = await User.findById(userId).lean();
      if (!user) throw new Error("User not found");

      const slug = applySlug(addPostArgs.title);
      if (!addPostArgs.description) {
        throw new Error("description is required");
      }

      // Check for duplicate slug
      const isDuplicate = await checkDuplicateSlug(slug);
      if (isDuplicate) throw new Error("Duplicate blog title or slug");

      const BlogCategory = mongoose.model("blogCategories");
      const categoryDetails = await BlogCategory.findOne({
        categoryName: addPostArgs.categoryName,
      }).lean();
      if (!categoryDetails)
        throw new Error(`Category ${addPostArgs.categoryName} does not exist.`);

      const postData = {
        ...addPostArgs,
        userId: (user as any)._id,
        slug,
        categoryId: (categoryDetails as any)._id.toString(),
        cloudinaryAssets: addPostArgs.cloudinaryAssets || [],
        timeToRead: calculateTimeToRead(addPostArgs.wordCount),
        updatedAt: new Date().toISOString(),
      };

      logger.info(" PostService :: createBlog :: postData:", postData);
      const Draft = mongoose.model("drafts");
      const draft = await Draft.create(postData);

      logger.info(
        `PostService :: createBlog :: Draft created successfully: ${draft._id}`,
      );
      return draft.toObject();
    } catch (error) {
      logger.error("PostService :: createBlog :: error:", error);
      throw error;
    }
  }

  async getPosts(start = 1, limit = 10, type = "both", search, filter = {}) {
    try {
      const isTutorial = type === "tutorial";
      const PostModel = mongoose.model(
        isTutorial ? "blogTutorials" : "blogPosts",
      );
      const skip = (start - 1) * limit;

      const finalFilter: any = { ...filter };

      // Fix the tutorial filter logic
      if (type === "tutorial") {
        finalFilter.tutorial = true;
      } else if (type === "blog") {
        // For blog posts, either tutorial is false OR doesn't exist
        finalFilter.$or = [
          { tutorial: false },
          { tutorial: { $exists: false } },
          { tutorial: null },
        ];
      }

      if (search) finalFilter.title = { $regex: search, $options: "i" };

      const [postDocuments, totalRecords] = await Promise.all([
        PostModel.find(finalFilter)
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        PostModel.countDocuments(finalFilter),
      ]);

      const posts = postDocuments.map((doc) => ({
        _id: doc._id.toString(),
        userId: doc.userId?.toString() || "missing_userId",
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        categoryId: doc.categoryId,
        categoryName: doc.categoryName,
        subCategory: doc.subCategory || null,
        nestedSubCategory: doc.nestedSubCategory || null,
        tutorial: doc.tutorial,
        tutorials: doc.tutorials,
        published: true,
        listed: doc.listed,
        updatedAt: doc.publishedAt || doc.updatedAt,
        cloudinaryAssets: doc.cloudinaryAssets,
        imageUrl: doc.imageUrl || null,
      }));

      // Return structure that matches your API expectations
      return {
        data: posts, // Posts array
        totalCount: totalRecords, // Total count for pagination
        currentPage: start,
        limit: limit,
      };
    } catch (error) {
      logger.error("PostService :: getPosts :: error:", error);
      throw new Error(`Failed to get posts: ${error.message}`);
    }
  }

  async getPost(postId) {
    logger.info("PostService :: getPost :: postId:", postId);
    try {
      const BlogPost = mongoose.model("blogPosts");
      const Draft = mongoose.model("drafts");
      let post = await BlogPost.findById(postId).lean();
      if (!post) post = await Draft.findById(postId).lean();
      return post;
    } catch (error) {
      logger.error("PostService :: getPost :: error:", error);
      throw error;
    }
  }

  async getPostBySlug(searchStr, userId) {
    const start =
      typeof performance !== "undefined" && performance.now
        ? performance.now()
        : Date.now();
    try {
      const slug = decodeURIComponent(searchStr.toLowerCase());
      const BlogPost = mongoose.model("blogPosts");
      const Draft = mongoose.model("drafts");
      const User = mongoose.model("users");
      let post = await BlogPost.findOne({ slug, listed: true }).lean();
      if (!post && userId) {
        const user = await User.findById(userId).lean();
        if (user) {
          post = await Draft.findOne({
            slug,
            userId: (user as any)._id,
          }).lean();
        }
      }
      if ((post as any)?.updatedAt)
        (post as any).updatedAt = formatDate((post as any).updatedAt);
      return post;
    } catch (error) {
      logger.error("PostService :: getPostBySlug :: error:", error);
      throw error;
    } finally {
      const duration =
        typeof performance !== "undefined" && performance.now
          ? performance.now() - start
          : Date.now() - start;
      logger.info(
        `PostService :: getPostBySlug :: execution time: ${duration.toFixed(2)}ms`,
      );
    }
  }

  async getPopularPosts() {
    try {
      const BlogPost = mongoose.model("blogPosts");
      return await BlogPost.find({}).sort({ publishedAt: -1 }).limit(3).lean();
    } catch (error) {
      logger.error("PostService :: getPopularPosts :: error:", error);
      throw new Error(`Failed to get popular posts: ${error.message}`);
    }
  }

  async getSuggestionByChatGpt(question) {
    try {
      if (!question) throw new Error("Question is required");
      if (!process.env.OPENAI_API_KEY)
        throw new Error("OpenAI API key not configured");
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: question }],
        temperature: 0.7,
      });
      return { suggestion: response.choices[0].message.content };
    } catch (error) {
      logger.error("PostService :: getSuggestionByChatGpt :: error:", error);
      throw new Error(`Unable to get AI suggestion: ${error.message}`);
    }
  }

  async getPostsByCategory(categoryName) {
    logger.info(
      " PostService :: getPostsByCategory :: categoryName:",
      categoryName,
    );
    try {
      if (!categoryName) throw new Error("Category name is required");
      const BlogPost = mongoose.model("blogPosts");
      return await BlogPost.find({ categoryName }).lean();
    } catch (error) {
      logger.error("PostService :: getPostsByCategory :: error:", error);
      throw error;
    }
  }

  async getDrafts(userId, start = 1, limit = 10, search) {
    try {
      if (!userId) throw new Error("userId is required");
      const User = mongoose.model("users");
      const Draft = mongoose.model("drafts");
      const user = await User.findById(userId).lean();
      if (!user) throw new Error("User not found");
      const skip = (start - 1) * limit;
      const filter: any = { userId: (user as any)._id };
      if (search) filter.title = { $regex: search, $options: "i" };
      const [draftPosts, totalRecords] = await Promise.all([
        Draft.find(filter)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Draft.countDocuments(filter),
      ]);
      const mappedPosts = draftPosts.map((doc) => ({
        _id: doc._id.toString(),
        userId: doc.userId?.toString(),
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        categoryId: doc.categoryId,
        categoryName: doc.categoryName,
        subCategory: doc.subCategory || null,
        nestedSubCategory: doc.nestedSubCategory || null,
        tutorial: doc.tutorial,
        tutorials: doc.tutorials,
        published: false,
        listed: doc.listed || false,
        updatedAt: doc.updatedAt || doc.updatedAt,
        cloudinaryAssets: doc.cloudinaryAssets,
        imageUrl: doc.imageUrl || null,
        timeToRead: doc.timeToRead,
      }));
      return { posts: mappedPosts, totalRecords };
    } catch (error) {
      logger.error("PostService :: getDrafts :: error:", error);
      throw error;
    }
  }

  async getMyPublishedPosts(userId, start = 1, limit = 10, type, search) {
    try {
      if (!userId) throw new Error("userId is required");
      const User = mongoose.model("users");
      const BlogPost = mongoose.model("blogPosts");
      const user = await User.findById(userId).lean();
      if (!user) throw new Error("User not found");
      const skip = (start - 1) * limit;
      const filter: any = { userId: (user as any)._id };
      if (type && type !== "both") filter.tutorial = type === "tutorial";
      if (search) filter.title = { $regex: search, $options: "i" };
      const [posts, totalRecords] = await Promise.all([
        BlogPost.find(filter)
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        BlogPost.countDocuments(filter),
      ]);
      const mappedPosts = posts.map((doc) => ({
        _id: doc._id.toString(),
        userId: doc.userId?.toString(),
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        categoryId: doc.categoryId,
        categoryName: doc.categoryName,
        subCategory: doc.subCategory || null,
        nestedSubCategory: doc.nestedSubCategory || null,
        tutorial: doc.tutorial,
        tutorials: doc.tutorials,
        published: true,
        listed: doc.listed,
        updatedAt: doc.updatedAt,
        cloudinaryAssets: doc.cloudinaryAssets,
        imageUrl: doc.imageUrl || null,
        timeToRead: doc.timeToRead,
        publishedAt: doc.publishedAt,
      }));
      return { posts: mappedPosts, totalRecords };
    } catch (error) {
      logger.error("PostService :: getMyPublishedPosts :: error:", error);
      throw error;
    }
  }

  async getMyAllContent(userId, start = 1, limit = 10, type, search) {
    try {
      if (!userId) throw new Error("userId is required");
      const User = mongoose.model("users");
      const Draft = mongoose.model("drafts");
      const BlogPost = mongoose.model("blogPosts");
      const user = await User.findById(userId).lean();
      if (!user) throw new Error("User not found");
      const filter: any = { userId: (user as any)._id };
      if (type && type !== "both") filter.tutorial = type === "tutorial";
      if (search) filter.title = { $regex: search, $options: "i" };
      const [draftPosts, publishedPosts] = await Promise.all([
        Draft.find(filter).lean(),
        BlogPost.find(filter).lean(),
      ]);
      const allPosts = [
        ...draftPosts.map((doc) => ({
          ...doc,
          isDraft: true,
          isPublished: false,
        })),
        ...publishedPosts.map((doc) => ({
          ...doc,
          isDraft: false,
          isPublished: true,
        })),
      ].sort((a: any, b: any) => {
        const dateA = new Date(a.publishedAt || a.updatedAt || a.updatedAt);
        const dateB = new Date(b.publishedAt || b.updatedAt || b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });
      const skip = (start - 1) * limit;
      const paginatedPosts = allPosts.slice(skip, skip + limit);
      const mappedPosts = paginatedPosts.map((doc) => {
        const d = doc as any;
        return {
          _id: d._id.toString(),
          userId: d.userId?.toString(),
          title: d.title,
          slug: d.slug,
          description: d.description,
          categoryId: d.categoryId,
          categoryName: d.categoryName,
          subCategory: d.subCategory || null,
          nestedSubCategory: d.nestedSubCategory || null,
          tutorial: d.tutorial,
          tutorials: d.tutorials,
          published: d.isPublished,
          listed: d.listed,
          updatedAt: d.publishedAt || d.updatedAt || d.updatedAt,
          cloudinaryAssets: d.cloudinaryAssets,
          imageUrl: d.imageUrl || null,
          timeToRead: d.timeToRead,
          publishedAt: d.publishedAt,
          isDraft: d.isDraft,
          isPublished: d.isPublished,
        };
      });
      return { posts: mappedPosts, totalRecords: allPosts.length };
    } catch (error) {
      logger.error("PostService :: getMyAllContent :: error:", error);
      throw error;
    }
  }

  async editBlog(userId, postId, editPostArgs) {
    try {
      if (!userId || !postId || !editPostArgs) {
        throw new Error("userId, post ID, and edit arguments are required");
      }

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new Error("Invalid post ID format");
      }

      const user = await this.User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Get the current post to check for slug changes
      let currentPost = await this.Draft.findOne({
        _id: postId,
        userId: user._id,
      });
      if (!currentPost) {
        currentPost = await this.BlogPost.findOne({
          _id: postId,
          userId: user._id,
        });
      }

      if (!currentPost) {
        throw new Error("Post not found or access denied");
      }

      const oldSlug = currentPost.slug; // Store the old slug
      const newSlug = applySlug(editPostArgs.title);

      if (!editPostArgs.description) {
        throw new Error("description is required");
      }

      // Check for duplicate slug (excluding current post)
      const [duplicateInDrafts, duplicateInPosts] = await Promise.all([
        this.Draft.findOne({
          slug: newSlug,
          _id: { $ne: postId },
        }),
        this.BlogPost.findOne({
          slug: newSlug,
          _id: { $ne: postId },
        }),
      ]);

      if (duplicateInDrafts || duplicateInPosts) {
        throw new Error("Duplicate blog title/slug");
      }

      const editData = {
        title: editPostArgs.title,
        slug: newSlug,
        description: editPostArgs.description,
        categoryId: editPostArgs.categoryId,
        categoryName: editPostArgs.categoryName,
        subCategory: editPostArgs.subCategory || null,
        nestedSubCategory: editPostArgs.nestedSubCategory || null,
        timeToRead: calculateTimeToRead(editPostArgs.wordCount),
        ...(editPostArgs.imageUrl && { imageUrl: editPostArgs.imageUrl }),
      };

      logger.info("PostService :: editBlog :: editData:", editData);

      const updateOptions = {
        new: true,
        runValidators: true,
      };

      // Try to update in drafts first
      let updatedPost = await this.Draft.findOneAndUpdate(
        { _id: postId, userId: user._id },
        {
          $set: editData,
          ...(editPostArgs.cloudinaryAssets && {
            $push: {
              cloudinaryAssets: { $each: editPostArgs.cloudinaryAssets },
            },
          }),
        },
        updateOptions,
      );

      // If not found in drafts, try published posts
      if (!updatedPost) {
        updatedPost = await this.BlogPost.findOneAndUpdate(
          { _id: postId, userId: user._id },
          {
            $set: editData,
            ...(editPostArgs.cloudinaryAssets && {
              $push: {
                cloudinaryAssets: { $each: editPostArgs.cloudinaryAssets },
              },
            }),
          },
          updateOptions,
        );
      }

      if (!updatedPost) {
        throw new Error("Post not found or access denied");
      }

      // Invalidate caches for both old and new slugs
      await invalidateSpecificCaches(newSlug, oldSlug);

      return updatedPost.toObject();
    } catch (error) {
      logger.error("HistoryService :: editBlog :: error:", error);
      throw error;
    }
  }

  async deleteBlog(postId) {
    try {
      if (!postId) {
        throw new Error("userId and post ID are required");
      }

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new Error("Invalid post ID format");
      }

      // Find post in either collection
      let post = await this.Draft.findOne({
        _id: postId,
      });

      let isDraft = true;

      if (!post) {
        post = await this.BlogPost.findOne({
          _id: postId,
        });
        isDraft = false;
      }

      if (!post) {
        throw new Error("Post not found or access denied");
      }

      // Delete associated blog comments
      await this.BlogComment.deleteMany({ contentId: postId });

      // Delete the post from the appropriate collection
      const result = isDraft
        ? await this.Draft.deleteOne({ _id: postId })
        : await this.BlogPost.deleteOne({ _id: postId });

      return {
        ...result,
        isTutorial: !!post.tutorial,
        slug: post.slug,
        categoryName: post.categoryName,
      };
    } catch (error) {
      logger.error("HistoryService :: deleteBlog :: error:", error);
      throw new Error(`Unable to delete post: ${error.message}`);
    }
  }

  getServiceInfo() {
    return {
      service: "PostService",
      collections: ["blogPosts", "drafts", "blogComments"],
      supportedTypes: ["blog", "tutorial", "both"],
      features: ["create", "publish", "edit", "delete", "search"],
      aiIntegration: !!process.env.OPENAI_API_KEY,
      cloudinaryIntegration: true,
      databaseType: "mongoose",
    };
  }
}

// Singleton instance
const postService = new PostService();

export { PostService, postService };
