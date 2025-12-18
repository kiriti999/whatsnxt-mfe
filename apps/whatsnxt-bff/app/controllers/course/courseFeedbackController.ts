import mongoose from "mongoose";
import Course from "../../models/course";
import { StatusCodes } from "http-status-codes";

async function updateCourseRating(courseId) {
  const ObjectId = mongoose.Types.ObjectId;

  // Ensure courseId is an ObjectId
  if (!ObjectId.isValid(courseId)) {
    console.error("❌ Invalid courseId format:", courseId);
    return { averageRating: 0, rateArray: [0, 0, 0, 0, 0] };
  }

  const ratingsData = await mongoose.model("courseFeedbacks").aggregate([
    {
      $match: { courseId: new ObjectId(courseId) }, // Ensure ObjectId match
    },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
  ]);

  // If no ratings found, return an empty rateArray
  if (!ratingsData || ratingsData.length === 0) {
    console.warn("⚠️ No ratings found for courseId:", courseId);
    return { averageRating: 0, rateArray: [0, 0, 0, 0, 0] };
  }

  // Initialize rateArray [1-star, 2-star, 3-star, 4-star, 5-star] as all zeros
  let rateArray = [0, 0, 0, 0, 0];

  // Populate rateArray with actual counts
  ratingsData.forEach(({ _id, count }) => {
    if (_id >= 1 && _id <= 5) {
      rateArray[5 - _id] = count; // Ensure 5-star maps to index 0
    }
  });

  // Calculate average rating
  const totalRatings = ratingsData.reduce(
    (acc, { _id, count }) => acc + _id * count,
    0,
  );
  const totalUsers = ratingsData.reduce((acc, { count }) => acc + count, 0);
  const averageRating =
    totalUsers > 0 ? (totalRatings / totalUsers).toFixed(1) : 0;

  // Update Course model with new averageRating and rateArray
  const updatedCourse = await mongoose
    .model("coursesPublished")
    .findByIdAndUpdate(
      courseId,
      { $set: { rating: averageRating, rateArray } },
      { new: true },
    );

  return { averageRating, rateArray };
}

class CourseFeedbackController {
  async createFeedbackComment(req, res) {
    try {
      const { content, author, email, courseId } = req.body;

      const comment = {
        content,
        author,
        userId: author,
        email,
        courseId,
        flags: 0,
        likedBy: [],
        disLikedBy: [],
        is_editable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await mongoose.model("courseFeedbacks").create(comment);
      console.log("🚀 ~ CommentController ~ create ~ result:", result);
      // Fetch and return the newly inserted comment
      const newComment = await mongoose
        .model("courseFeedbacks")
        .findOne({ _id: result._id });

      if (!newComment) {
        throw new Error("Failed to retrieve the newly created comment");
      }

      res.status(StatusCodes.CREATED).json(newComment);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to create comment", details: error.message });
    }
  }

  async getFeedbackComments(req, res) {
    try {
      const courseId = req.params?.courseId;
      const limit = 10;
      const page = req.query?.page || 1;
      const skip = (page - 1) * limit;

      const feedbackComments = await mongoose
        .model("courseFeedbacks")
        .aggregate([
          {
            $match: {
              courseId: new mongoose.Types.ObjectId(courseId),
              flags: { $lt: 5 },
            },
          },
          { $skip: Number(skip) },
          { $limit: Number(limit) },

          {
            $project: {
              _id: 1,
              content: 1,
              userId: 1,
              email: 1,
              courseId: 1,
              flags: 1,
              likes: 1,
              dislikes: 1,
              likedBy: 1,
              disLikedBy: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ]);
      console.log(feedbackComments);
      res.status(StatusCodes.OK).json({ feedbackComments });
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to retrieve comments", details: error.message });
    }
  }

  async getUserFeedbackComment(req, res) {
    try {
      const { userId, courseId } = req.query;

      const comment = await mongoose.model("courseFeedbacks").findOne({
        courseId: new mongoose.Types.ObjectId(courseId),
        userId: new mongoose.Types.ObjectId(userId),
      });

      res.status(StatusCodes.OK).json(comment);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to retrieve comments", details: error.message });
    }
  }

  async flagFeedbackComment(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const comment = await mongoose.model("courseFeedbacks").findById(id);

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

  async toggleFeedbackLike(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const comment = await mongoose.model("courseFeedbacks").findById(id);
      if (!comment) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Comment not found" });
        return;
      }

      const userIdStr = userId.toString();
      const hasLiked = comment.likedBy.includes(userIdStr);
      const hasDisliked = comment.disLikedBy.includes(userIdStr);

      if (hasLiked) {
        comment.likes -= 1;
        comment.likedBy = comment.likedBy.filter((uid) => uid != userIdStr);
      } else {
        comment.likes += 1;
        comment.likedBy.push(userIdStr);
        if (hasDisliked) {
          comment.dislikes -= 1;
          comment.disLikedBy = comment.disLikedBy.filter(
            (uid) => uid != userIdStr,
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

  async toggleFeedbackDislike(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const comment = await mongoose.model("courseFeedbacks").findById(id);
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
          (uid) => uid != userIdStr,
        );
      } else {
        comment.dislikes += 1;
        comment.disLikedBy.push(userIdStr);
        if (hasLiked) {
          comment.likes -= 1;
          comment.likedBy = comment.likedBy.filter((uid) => uid != userIdStr);
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

  async editFeedbackComment(req, res) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;

      const comment = await mongoose
        .model("courseFeedbacks")
        .findById(commentId);
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

  async deleteFeedbackComment(req, res) {
    try {
      const { commentId } = req.params;

      const comment = await mongoose
        .model("courseFeedbacks")
        .findById(commentId);
      if (!comment) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Comment not found" });
        return;
      }

      await mongoose.model("courseFeedbacks").findByIdAndDelete(commentId);

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to delete comment", details: error.message });
    }
  }

  // This method is read optimised to get the rating than write
  // As there will be more reads than writes, having the 'rating` field on course schema serves the purpose
  async addRating(req, res) {
    const { courseId, rating } = req.body;

    try {
      // Update or insert user's rating in courseFeedback
      await mongoose
        .model("courseFeedbacks")
        .updateOne(
          { courseId, userId: req.userId },
          { $set: { rating } },
          { upsert: true },
        );

      // Recalculate and update average rating
      const averageRating = await updateCourseRating(courseId);

      res
        .status(StatusCodes.OK)
        .json({ message: "Rating added successfully", averageRating });
    } catch (error) {
      console.error("Error adding rating:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error adding rating" });
    }
  }

  async updateRating(req, res) {
    const courseId = req.params.courseId;
    const { userId, rating } = req.body;

    try {
      // Update the user's rating in courseFeedback
      await mongoose
        .model("courseFeedbacks")
        .updateOne({ courseId, userId }, { $set: { rating } });

      // Recalculate and update average rating in case of update as well
      const averageRating = await updateCourseRating(courseId);

      res
        .status(StatusCodes.OK)
        .json({ message: "Rating updated successfully", averageRating });
    } catch (error) {
      console.error("Error updating rating:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error updating rating" });
    }
  }

  async getRating(req, res) {
    try {
      const courseId = req.params.courseId;
      const userId = req.query.userId;

      const rating = await mongoose
        .model("courseFeedbacks")
        .findOne({ courseId, userId });

      res.status(StatusCodes.OK).json(rating);
    } catch (error) {
      console.error("Error getting rating:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error getting rating" });
    }
  }

  async deleteRating(req, res) {
    try {
      const courseId = req.params.courseId;
      const userId = req.userId;

      await mongoose
        .model("courseFeedbacks")
        .findOneAndDelete({ courseId, userId });
      await updateCourseRating(courseId);
      res.status(StatusCodes.OK).json({ message: "Rating deleted" });
    } catch (error) {
      console.error("Error deleting rating:", error.message);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error deleting rating" });
    }
  }
}

export { CourseFeedbackController };
