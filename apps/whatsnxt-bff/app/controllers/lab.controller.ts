import Lab from "../models/Lab";
import { getLogger } from "../../config/logger";
const logger = getLogger("lab.controller");

export const list = async (req, res) => {
  try {
    const labs = await Lab.find().sort({ createdAt: -1 });
    res.json({ success: true, data: labs });
  } catch (error) {
    logger.error("Error listing labs:", error);
    res.status(500).json({ success: false, message: "Failed to list labs" });
  }
};

export const create = async (req, res) => {
  try {
    const lab = new Lab(req.body);
    // If we have user info in req.user or req.userId, we can set createdBy
    if (req.user) {
      lab.createdBy = req.user._id;
    } else if (req.userId) {
      lab.createdBy = req.userId;
    }
    await lab.save();
    res.status(201).json({ success: true, data: lab });
  } catch (error) {
    logger.error("Error creating lab:", error);
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to create lab",
        error: error.message,
      });
  }
};

export const get = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ success: false, message: "Lab not found" });
    }
    res.json({ success: true, data: lab });
  } catch (error) {
    logger.error("Error getting lab:", error);
    res.status(500).json({ success: false, message: "Failed to get lab" });
  }
};

export const update = async (req, res) => {
  try {
    const lab = await Lab.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lab) {
      return res.status(404).json({ success: false, message: "Lab not found" });
    }
    res.json({ success: true, data: lab });
  } catch (error) {
    logger.error("Error updating lab:", error);
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to update lab",
        error: error.message,
      });
  }
};

export const remove = async (req, res) => {
  try {
    const lab = await Lab.findByIdAndDelete(req.params.id);
    if (!lab) {
      return res.status(404).json({ success: false, message: "Lab not found" });
    }
    res.json({ success: true, message: "Lab deleted successfully" });
  } catch (error) {
    logger.error("Error deleting lab:", error);
    res.status(500).json({ success: false, message: "Failed to delete lab" });
  }
};
