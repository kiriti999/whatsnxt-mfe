import mongoose from "mongoose";
import User from "../../common/models/user";
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";

const courseAccountController = {
  getAccount: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.userId);

      const user = await mongoose
        .model("users")
        .aggregate([
          { $match: { _id: userId } },
          {
            $lookup: {
              from: "EnrolledCourses", // Ensure collection name is in lowercase
              localField: "_id",
              foreignField: "userId",
              as: "enrolled_courses",
            },
          },
          { $project: { password: 0 } },
        ])
        .then((result) => result[0]); // Extract the first result

      if (user) {
        res.status(StatusCodes.OK).json(user);
      } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("accountController::getAccount: error:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error fetching account details" });
    }
  },
};

export default courseAccountController;
