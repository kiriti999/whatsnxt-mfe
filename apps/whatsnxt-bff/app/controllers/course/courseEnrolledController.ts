import Course from "../../models/course";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
const {
  updateEnrolledCoursesCache,
  removeFromEnrolledCoursesCache,
} = require("../../utils/course/courseEnrolledCacheUtil");

const courseEnrolledController = {
  createEnrolledCourse: async (req, res) => {
    const { courseId, cost, email } = req.body;

    if (Object.keys(req.body).length === 0) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "request body is empty" });
    }

    try {
      const userId = req.userId.toString();
      const isEnrolled = await mongoose
        .model("enrolledCourses")
        .findOne({ course: courseId });
      const isExists = isEnrolled?.user.toString() === userId;
      if (isExists) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send("Course already purchased");
      }
      const coursesPublished = await mongoose
        .model("coursesPublished")
        .find({ courseId });
      const sectionModel = mongoose.model("sections");
      const sections = await sectionModel.find({ courseId });
      const lessons = sections.flatMap((section) =>
        section.videos.map((video) => {
          return {
            lesson_id: video._id,
            is_completed: false,
            section_id: section._id,
          };
        }),
      );

      const newEnrollment = await mongoose.model("enrolledCourses").create({
        buyerEmail: email,
        cost,
        user: userId,
        course: courseId,
        lessons,
        coursesPublished,
      });
      console.log(" newEnrollment :: newEnrollment:", newEnrollment);

      // Update the cache with the new enrollment data
      await updateEnrolledCoursesCache(userId, newEnrollment);

      res.status(StatusCodes.ACCEPTED).json("Enrolled successful!");
    } catch (error) {
      console.error(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error processing charge", error });
    }
  },

  deleteEnrolledCourse: async (req, res) => {
    const { courseId } = req.params;
    if (!courseId) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "courseId must be provided!" });
    }

    try {
      await mongoose
        .model("enrolledCourses")
        .findOneAndRemove({ user: req.userId, course: courseId });

      // Remove specific course from the cache
      await removeFromEnrolledCoursesCache(req.userId, courseId);

      res
        .status(StatusCodes.OK)
        .json("Enrolled data has been deleted successfully!");
    } catch (err) {
      console.error(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to delete enrolled data", err });
    }
  },

  handler: async (req, res) => {
    try {
      const condition = { user: req.userId };

      // Fix sorting by moving it out of the `find` options
      const enrolledCourses = await mongoose
        .model("enrolledCourses")
        .find(condition)
        .sort({ createdAt: 1 })
        .populate({ path: "coursesPublished", strictPopulate: false })
        .populate("lessons")
        .populate("lessons_watched")
        .lean();

      const result = await Promise.all(
        enrolledCourses.map(async (enrolled) => {
          const courseId = enrolled.course?.toString();

          const coursesPublished = await mongoose
            .model("coursesPublished")
            .findOne({ courseId });

          // Fix reference to course ID
          const courseFeedback = await mongoose
            .model("courseFeedbacks")
            .find({ courseId, author: req.userId })
            .exec();

          const courseRatings = await mongoose
            .model("courseFeedbacks")
            .find({ courseId, userId: req.userId })
            .exec();

          const result = {
            ...enrolled,
            course: coursesPublished,
            courseFeedback,
            courseRatings,
          };
          return result;
        }),
      );

      // Fix total count retrieval
      const total = await mongoose
        .model("enrolledCourses")
        .countDocuments(condition);

      res.status(StatusCodes.OK).json({ enrolled: result, total });
    } catch (error) {
      console.error("enrolledCourses:: error: ", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  },

  isEnrolled: async function (req, res) {
    try {
      const { courseId } = req.query;
      const isExists = await mongoose
        .model("enrolledCourses")
        .findOne({ user: req.userId, course: courseId });
      res
        .status(StatusCodes.OK)
        .send(isExists?.user.toString() === req.userId.toString());
    } catch (error) {
      console.log("course/exist:: error: ", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
  },

  handleVideo: async (req, res) => {
    const { courseId } = req.query;

    try {
      const videos = await mongoose
        .model("videos")
        .find({ course: courseId }, { sort: { createdAt: 1 } })
        .populate("courseId");
      res.status(StatusCodes.OK).send({ videos });
    } catch (error) {
      console.log("video:: error: ", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  },

  enrolledCount: async (req, res) => {
    const course = req.params.id;

    try {
      const enrolled = await mongoose
        .model("enrolledCourses")
        .count({ course });
      res.status(StatusCodes.OK).send({ count: enrolled });
    } catch (error) {
      console.log("enrolledCourseCount:: error: ", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
  },

  handleCourseProgress: async (req, res) => {
    try {
      const { courseId, userId, lessonId } = req.body;

      const newEnroll = await mongoose
        .model("enrolledCourses")
        .findOneAndUpdate(
          {
            user: userId,
            course: courseId,
            lessons: {
              $elemMatch: { lesson_id: lessonId, is_completed: false },
            },
          },
          {
            $inc: { lessons_watched: 1 },
            $set: { "lessons.$.is_completed": true },
          },
          { new: true },
        );

      res.status(StatusCodes.OK).send({ newEnroll });
    } catch (error) {
      console.log("courseProgressUpdate:: error: ", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
  },
};

export default courseEnrolledController;
