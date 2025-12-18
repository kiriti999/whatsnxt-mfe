import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

const coursePopularityController = {
  handler: async function (req, res) {
    try {
      const enrolled = await mongoose
        .model("enrolledCourses")
        .aggregate()
        // .group({ _id: '$course', count: { $sum: 1 } })
        .project({ _id: 0, courseId: "$_id", count: 1 })
        .sort({ count: -1 })
        .limit(req.query.limit || 10)
        .exec();

      res.status(StatusCodes.OK).send({ enrolled });
    } catch (error) {
      console.log(error);
    }
  },
};

export default coursePopularityController;
