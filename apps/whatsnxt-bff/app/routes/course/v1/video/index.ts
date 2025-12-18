import express from "express";
const router = express.Router();
const videoController = require("../../../../controllers/course/video");
import authMiddleware from "../../../../common/middlewares/auth-middleware";

router.get("/:sectionId", authMiddleware, videoController.getVideoById);
router.post("/:sectionId", authMiddleware, videoController.getVideoById);

export default router;
