import express from "express";
const router = express.Router();
import * as analyticsController from "../../../../controllers/course/analyticsController";

router.get("/", (analyticsController as any).getData);

export default router;
