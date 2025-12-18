import express from "express";
const router = express.Router();
import coursePopularityController from "../../../../../controllers/course/coursePopularityController";

router.get("/", coursePopularityController.handler);

export default router;
