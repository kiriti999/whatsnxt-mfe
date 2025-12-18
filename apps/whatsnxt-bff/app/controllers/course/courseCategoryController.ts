import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

const courseCategoryController = {
  listByCount: async (req, res) => {
    try {
      const categories = await mongoose.model("courseCategories").aggregate([
        {
          $lookup: {
            from: "courses",
            let: { categoryName: "$categoryName" }, // Changed from "$name" to "$categoryName"
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$categoryName", "$$categoryName"] },
                      { $eq: ["$published", true] },
                    ],
                  },
                },
              },
            ],
            as: "postList",
          },
        },
        {
          $project: {
            categoryId: { $toString: "$_id" },
            categoryName: "$categoryName", // Changed from "$name" to "$categoryName"
            count: { $size: "$postList" },
            _id: 0,
          },
        },
        {
          $match: {
            count: { $gt: 0 },
          },
        },
      ]);

      res.set("Cache-Control", "public, max-age=3600");
      res.status(StatusCodes.OK).json({
        data: { categoriesCount: categories },
      });
    } catch (error) {
      console.error("❌ Error in listByCount:", error);
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "get categoryByCount route error", error });
    }
  },

  searchByName: async (req, res) => {
    const { categoryName } = req.params;

    try {
      const category = await mongoose
        .model("courseCategories")
        .findOne({ name: categoryName });
      res.set("Cache-Control", "public, max-age=3600");
      res.status(StatusCodes.OK).json({ category });
    } catch (err) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "get by categoryName route error", error: err });
    }
  },

  handler: async (req, res) => {
    try {
      const categories = await mongoose.model("courseCategories").find();
      res.set("Cache-Control", "public, max-age=3600");
      res.status(StatusCodes.OK).json({ categories });
    } catch (err) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "get categories route error", error: err });
    }
  },
};

export default courseCategoryController;
