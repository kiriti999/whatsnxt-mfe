import mongoose from "mongoose";
const commentModel = require("../../models/courseComments");
import { StatusCodes } from "http-status-codes";

class CommentController {
  async create(req, res) {
    try {
      const { content, author, email, parentId, lessonId } = req.body;

      const countDoc = await commentModel.countDocuments({ parentId });
      if (parentId && countDoc >= Number(process.env.COMMENT_DEPTH)) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({
            error: `Maximum nesting depth of ${process.env.COMMENT_DEPTH} exceeded`,
          });
        return;
      }

      const comment = {
        lessonId,
        content,
        author,
        email,
        parentId,
        flags: 0,
        likedBy: [],
        disLikedBy: [],
        isHidden: false,
      };

      const result = await commentModel.create(comment);
      // Fetch and return the newly inserted comment
      const newComment = await commentModel.findOne({ _id: result._id });

      if (!newComment) {
        throw new Error("Failed to retrieve the newly created comment");
      }

      console.log(
        "🚀 ~ CommentController ~ createComment ~ newComment:",
        newComment,
      );
      res.status(StatusCodes.ACCEPTED).json(newComment);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to create comment", details: error.message });
    }
  }

  async getComments(req, res) {
    try {
      const { parentId = null, limit = 3, offset = 0, lessonId } = req.query;
      const query = { parentId, lessonId };

      const commentsWithChildCount = await commentModel.aggregate([
        { $match: { ...query, flags: { $lt: 5 } } },
        { $skip: Number(offset) },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: "courseComments",
            let: { parent_id: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: [{ $toString: "$parentId" }, "$$parent_id"] },
                },
              },
            ],
            as: "childComments",
          },
        },
        { $addFields: { childCount: { $size: "$childComments" } } },
        {
          $project: {
            _id: 1,
            content: 1,
            author: 1,
            email: 1,
            parentId: 1,
            flags: 1,
            likes: 1,
            dislikes: 1,
            likedBy: 1,
            disLikedBy: 1,
            childCount: 1,
            createdAt: 1,
            updatedAt: 1,
            lessonId: 1,
          },
        },
      ]);

      res.status(StatusCodes.OK).json(commentsWithChildCount);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to retrieve comments", details: error.message });
    }
  }

  async flagComment(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const comment = await commentModel.findById(id);

      if (!comment) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Comment not found" });
        return;
      }

      // Check if the user has already flagged the comment
      if (comment.flaggedBy.includes(userId)) {
        res
          .status(StatusCodes.CONFLICT)
          .json({ error: "You have already flagged this comment" });
      }

      // Add user to flaggedBy and increment flags
      comment.flaggedBy.push(userId);
      comment.flags += 1;
      comment.isHidden = comment.flags > 5;

      await comment.save();
      res.status(StatusCodes.OK).json(comment);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to flag comment", details: error.message });
    }
  }

  async toggleLike(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const comment = await commentModel.findById(id);
      if (!comment) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Comment not found" });
        return;
      }

      const userIdStr = userId.toString();
      const hasLiked = comment.likedBy.includes(userIdStr);
      const hasDisliked = comment.disLikedBy.includes(userIdStr);

      if (hasLiked) {
        comment.likes -= 1;
        comment.likedBy = comment.likedBy.filter(
          (uid) => uid.toString() !== userIdStr,
        );
      } else {
        comment.likes += 1;
        comment.likedBy.push(userIdStr);
        if (hasDisliked) {
          comment.dislikes -= 1;
          comment.disLikedBy = comment.disLikedBy.filter(
            (uid) => uid.toString() !== userIdStr,
          );
        }
      }

      await comment.save();
      res.status(StatusCodes.OK).json(comment);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to toggle like", details: error.message });
    }
  }

  async toggleDislike(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const comment = await commentModel.findById(id);
      if (!comment) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Comment not found" });
        return;
      }

      const userIdStr = userId.toString();
      const hasLiked = comment.likedBy.includes(userIdStr);
      const hasDisliked = comment.disLikedBy.includes(userIdStr);

      if (hasDisliked) {
        comment.dislikes -= 1;
        comment.disLikedBy = comment.disLikedBy.filter(
          (uid) => uid.toString() !== userIdStr,
        );
      } else {
        comment.dislikes += 1;
        comment.disLikedBy.push(userIdStr);
        if (hasLiked) {
          comment.likes -= 1;
          comment.likedBy = comment.likedBy.filter(
            (uid) => uid.toString() !== userIdStr,
          );
        }
      }

      await comment.save();
      res.status(StatusCodes.OK).json(comment);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to toggle dislike", details: error.message });
    }
  }

  async editComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const comment = await commentModel.findById(id);
      if (!comment) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Comment not found" });
        return;
      }

      comment.content = content;
      comment.updatedAt = new Date();
      await comment.save();

      res.status(StatusCodes.OK).json(comment);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to edit comment", details: error.message });
    }
  }

  async deleteComment(req, res) {
    try {
      const { id } = req.params;

      const comment = await commentModel.findById(id);
      if (!comment) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Comment not found" });
        return;
      }

      await commentModel.deleteMany({ parentId: id });
      await commentModel.findByIdAndDelete(id);

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to delete comment", details: error.message });
    }
  }
}

export { CommentController };
