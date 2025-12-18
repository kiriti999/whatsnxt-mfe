import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

async function getVideoById(req, res) {
  const { sectionId } = req.params;
  try {
    const section = await mongoose
      .model("sections")
      .findOne({ _id: sectionId });
    if (!section) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Section not found" });
    }
    res.status(StatusCodes.OK).json(section.videos);
  } catch (error) {
    console.error("getVideoById error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
}

export { getVideoById };
