import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

const courseSearchController = {
  handler: async (req, res) => {
    console.log("routes:: search/index.js:: searching with query ", req.query);
    const { id } = req.query;

    if (id) {
      try {
        const existingData = await mongoose
          .model("coursesPublished")
          .findOne({ courseId: id });
        res.status(StatusCodes.OK).send({ existingData });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const courses = await mongoose
          .model("coursesPublished")
          .aggregate()
          .lookup({
            from: "users",
            localField: "users",
            foreignField: "_id",
            as: "users",
          })
          .lookup({
            from: "enrolledCourses",
            localField: "_id",
            foreignField: "courseId",
            as: "enrolled_courses",
          })
          .sort({ createdAt: -1 })
          .exec();

        res.status(StatusCodes.OK).send({ data: courses });
      } catch (error) {
        console.log(error);
      }
    }
  },

  searchAlgolia: async (req, res) => {
    try {
      const courses = await mongoose.model("course").find({ published: true });
      const algoliaCourses = courses.map((course) => {
        const newCourse = course.toObject();
        return {
          ...newCourse,
          objectID: newCourse._id,
        };
      });
      res.status(StatusCodes.OK).json(algoliaCourses);
    } catch (e) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: e.message });
    }
  },
};

export default courseSearchController;
