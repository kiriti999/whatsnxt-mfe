import mongoose from "mongoose";
import { getLogger } from "../../config/logger";
const logger = getLogger("blogCommentService");

class BlogCommentService {
  private modelName: string;
  private Model: any;
  private userModelName: string;
  private UserModel: any;

  constructor(modelName = "blogComments", userModelName = "users") {
    this.modelName = modelName;
    this.Model = mongoose.model(modelName);
    this.userModelName = userModelName;
    this.UserModel = mongoose.model(userModelName); // Add this line

    try {
      this.UserModel = mongoose.model(userModelName);
    } catch (error) {
      logger.error("Error loading UserModel:", error.message);
      throw new Error(
        `UserModel '${userModelName}' not found. Make sure the User model is registered.`,
      );
    }
  }

  async getComments(payload) {
    const { parentId = null, limit = 10, offset = 0, contentId } = payload;
    try {
      if (!contentId) {
        throw new Error("Content ID is required");
      }

      // Validate contentId
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        throw new Error("Invalid content ID format");
      }

      // Build query
      const query: any = {
        contentId: new mongoose.Types.ObjectId(contentId),
        flags: { $lt: 5 },
      };

      if (parentId) {
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
          throw new Error("Invalid parent ID format");
        }
        query.parentId = new mongoose.Types.ObjectId(parentId);
      } else {
        query.parentId = null;
      }

      const data = await this.Model.aggregate([
        // Match comments based on the query
        { $match: query },

        // Sort by creation date in descending order
        { $sort: { createdAt: -1 } },

        // Skip for pagination
        { $skip: offset },

        // Limit for pagination
        { $limit: limit },

        // Lookup to find replies for each comment
        {
          $lookup: {
            from: this.Model.collection.name,
            localField: "_id",
            foreignField: "parentId",
            as: "replies",
          },
        },

        // Add a field to count the number of replies
        {
          $addFields: {
            childCount: { $size: "$replies" },
          },
        },

        // Project only necessary fields
        {
          $project: {
            _id: 1,
            content: 1,
            email: 1,
            parentId: 1,
            contentId: 1,
            tutorialId: 1,
            flags: 1,
            likes: 1,
            dislikes: 1,
            likedBy: 1,
            disLikedBy: 1,
            childCount: 1,
            createdAt: 1,
            updatedAt: 1,
            flaggedBy: 1,
          },
        },
      ]);

      return data;
    } catch (error) {
      logger.error("CommentService :: getComments :: error:", error);
      throw error;
    }
  }

  async createComment(payload) {
    logger.info("BlogCommentService :: createComment :: payload:", payload);
    let { contentId, content, email, parentId } = payload;

    try {
      if (!contentId || !content || !email) {
        throw new Error("Content, email, and content ID are required");
      }

      // Validate content
      if (content.trim().length === 0) {
        throw new Error("Comment content cannot be empty");
      }

      if (content.length > 1000) {
        throw new Error("Comment content cannot exceed 1000 characters");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      // Validate and convert contentId
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        throw new Error("Invalid content ID format");
      }

      if (parentId) {
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
          throw new Error("Invalid parent ID format");
        }

        // Check for nesting limit
        const nestingDepth = await this.Model.countDocuments({
          parentId: new mongoose.Types.ObjectId(parentId),
        });
        if (nestingDepth >= 6) {
          throw new Error("Maximum nesting depth of 6 exceeded");
        }

        // Verify parent comment exists
        const parentComment = await this.Model.findById(parentId);
        if (!parentComment) {
          throw new Error("Parent comment not found");
        }
      }

      const commentData = {
        content: content.trim(),
        email: email.toLowerCase(),
        parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
        contentId: new mongoose.Types.ObjectId(contentId),
        flags: 0,
        likes: 0,
        dislikes: 0,
        likedBy: [],
        disLikedBy: [],
        flaggedBy: [],
        isHidden: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const comment = new this.Model(commentData);
      const savedComment = await comment.save();

      return savedComment.toObject();
    } catch (error) {
      logger.error("CommentService :: createComment :: error:", error);
      throw error;
    }
  }

  async editComment(payload) {
    try {
      logger.info("BlogCommentService :: editComment :: payload:", payload);
      const { commentId, email, content, contentId } = payload;

      if (!commentId || !email || !content || !contentId) {
        throw new Error(
          "commentId, email, content, and content ID are required",
        );
      }

      // Validate inputs
      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new Error("Invalid comment ID format");
      }

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        throw new Error("Invalid content ID format");
      }

      if (content.trim().length === 0) {
        throw new Error("Comment content cannot be empty");
      }

      if (content.length > 1000) {
        throw new Error("Comment content cannot exceed 1000 characters");
      }

      const updatedComment = await this.Model.findOneAndUpdate(
        {
          _id: commentId,
          contentId: contentId,
          email: email.toLowerCase(),
        },
        {
          $set: {
            content: content.trim(),
            updatedAt: new Date().toISOString(),
          },
        },
        { new: true },
      );

      logger.info(
        "BlogCommentService :: editComment :: updatedComment:",
        updatedComment,
      );

      if (!updatedComment) {
        throw new Error(
          "Comment not found or you are not authorized to edit this comment",
        );
      }

      return updatedComment.toObject();
    } catch (error) {
      logger.error("CommentService :: editComment :: error:", error);
      throw error;
    }
  }

  async deleteComment(payload) {
    logger.info("BlogCommentService :: deleteComment :: payload:", payload);
    try {
      const { id, email, contentId } = payload;
      if (!id || !email || !contentId) {
        throw new Error("ID, email, and content ID are required");
      }

      // Validate inputs
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid comment ID format");
      }

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        throw new Error("Invalid content ID format");
      }

      const comment = await this.Model.findOne({
        _id: id,
        email: email.toLowerCase(),
        contentId: contentId,
      });

      if (!comment) {
        throw new Error(
          "Comment not found or you are not authorized to delete this comment",
        );
      }

      // Delete replies associated with the comment
      const repliesDeleted = await this.Model.deleteMany({
        parentId: id,
        contentId: contentId,
      });

      // Delete the comment itself
      const commentDeleted = await this.Model.deleteOne({
        _id: id,
        contentId: contentId,
      });

      if (commentDeleted.deletedCount === 0) {
        throw new Error("Failed to delete comment");
      }

      return {
        success: true,
        message: "Comment deleted successfully",
        repliesDeleted: repliesDeleted.deletedCount,
      };
    } catch (error) {
      logger.error("CommentService :: deleteComment :: error:", error);
      throw error;
    }
  }

  async flagComment(payload) {
    try {
      const { id, email } = payload;

      if (!id || !email) {
        throw new Error("ID and email are required");
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid comment ID format");
      }

      // Find user by email to get their ObjectId (consistent with like/dislike methods)
      const user = await this.UserModel.findOne({
        email: email.toLowerCase(),
      });

      if (!user) {
        throw new Error("User not found");
      }
      const userId = user._id;

      const comment = await this.Model.findById(id);

      if (!comment) {
        throw new Error("Comment not found");
      }

      // Check if user already flagged using ObjectId comparison (consistent with like/dislike)
      const alreadyFlagged = comment.flaggedBy.some((id) => id.equals(userId));
      if (alreadyFlagged) {
        throw new Error("The comment is already flagged by this user!");
      }

      // Update the comment with flag
      const updatedComment = await this.Model.findByIdAndUpdate(
        id,
        {
          $inc: { flags: 1 },
          $push: { flaggedBy: userId }, // Store ObjectId, not email
          $set: {
            updatedAt: new Date().toISOString(),
            isHidden: false, // Will be updated based on flags count
          },
        },
        { new: true },
      );

      // Update isHidden if flags exceed threshold
      if (updatedComment.flags > 4) {
        await this.Model.updateOne({ _id: id }, { $set: { isHidden: true } });
        updatedComment.isHidden = true;
      }

      // Add user-specific status to the response (for frontend)
      const response = updatedComment.toObject();
      response.hasFlagged = updatedComment.flaggedBy.some((id) =>
        id.equals(userId),
      );

      return response;
    } catch (error) {
      logger.error("CommentService :: flagComment :: error:", error);
      throw error;
    }
  }

  async toggleLike(payload) {
    try {
      const { commentId, email } = payload;
      logger.info("toggleLike - Input:", { commentId, email });

      if (!commentId || !email) {
        throw new Error("ID and email are required");
      }

      const _id = commentId.toString();
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        throw new Error("Invalid comment ID format");
      }

      // Find user by email
      const user = await this.UserModel.findOne({
        email: email.toLowerCase(),
      });
      logger.info("toggleLike - User found:", !!user, user?._id);

      if (!user) {
        throw new Error("User not found");
      }
      const userId = user._id;

      // Find comment by ID
      const comment = await this.Model.findById(_id);
      logger.info("toggleLike - Comment found:", !!comment);

      if (!comment) {
        throw new Error("Comment not found");
      }

      // Check current status
      const hasLiked = comment.likedBy.some((id) => id.equals(userId));
      const hasDisliked = comment.disLikedBy.some((id) => id.equals(userId));

      logger.info("toggleLike - Current status:", {
        hasLiked,
        hasDisliked,
        currentLikes: comment.likes,
        currentDislikes: comment.dislikes,
        likedByCount: comment.likedBy.length,
        dislikedByCount: comment.disLikedBy.length,
      });

      // Build update query
      let update: any = {
        $inc: {},
        $set: { updatedAt: new Date().toISOString() },
      };

      if (hasLiked) {
        // User is un-liking the comment
        update.$inc.likes = -1;
        update.$pull = { likedBy: userId };
        logger.info("toggleLike - Action: Removing like");
      } else {
        // User is liking the comment
        update.$inc.likes = 1;
        update.$push = { likedBy: userId };
        logger.info("toggleLike - Action: Adding like");

        if (hasDisliked) {
          // If previously disliked, remove the dislike
          update.$inc.dislikes = -1;
          update.$pull = {
            ...update.$pull,
            disLikedBy: userId,
          };
          logger.info("toggleLike - Action: Also removing dislike");
        }
      }

      logger.info(
        "toggleLike - Update query:",
        JSON.stringify(update, null, 2),
      );

      // Perform the update
      const updatedComment = await this.Model.findByIdAndUpdate(_id, update, {
        new: true,
      });

      if (!updatedComment) {
        throw new Error("Failed to update comment");
      }

      return updatedComment.toObject();
    } catch (error) {
      logger.error("CommentService :: toggleLike :: error:", error);
      throw error;
    }
  }

  async toggleDislike(payload) {
    try {
      let { commentId, email } = payload;
      if (!commentId || !email) {
        throw new Error("ID and email are required");
      }

      // Convert to string if it's an ObjectId instance
      const _id = commentId.toString();

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        throw new Error("Invalid comment ID format");
      }

      // Find user by email to get their ObjectId
      const user = await this.UserModel.findOne({
        email: email.toLowerCase(),
      });

      if (!user) {
        throw new Error("User not found");
      }
      const userId = user._id;

      const comment = await this.Model.findById(_id);

      if (!comment) {
        throw new Error("Comment not found");
      }

      // Check if the user has already disliked the comment (using ObjectId comparison)
      const hasLiked = comment.likedBy.some((id) => id.equals(userId));
      const hasDisliked = comment.disLikedBy.some((id) => id.equals(userId));

      let update: any = {
        $inc: {},
        $set: { updatedAt: new Date().toISOString() },
      };

      if (hasDisliked) {
        // User is removing their dislike
        update.$inc.dislikes = -1;
        update.$pull = { disLikedBy: userId };
      } else {
        // User is disliking the comment
        update.$inc.dislikes = 1;
        update.$push = { disLikedBy: userId };

        if (hasLiked) {
          // If previously liked, remove the like
          update.$inc.likes = -1;
          update.$pull = {
            ...update.$pull,
            likedBy: userId,
          };
        }
      }

      const updatedComment = await this.Model.findByIdAndUpdate(_id, update, {
        new: true,
      });

      return updatedComment.toObject();
    } catch (error) {
      logger.error("CommentService :: toggleDislike :: error:", error);
      throw error;
    }
  }
}

// Create service instances for different comment types
const blogCommentService = new BlogCommentService("blogComments");

export { BlogCommentService, blogCommentService };
