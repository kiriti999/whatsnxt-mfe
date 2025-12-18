import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

const languageController = {
  handler: async function (req, res) {
    try {
      const languages = await mongoose.model("languages").find();
      res.set("Cache-Control", "public, max-age=3600");
      res.status(StatusCodes.OK).json(languages);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error in language handler", error });
    }
  },
};

export default languageController;
