import express from "express";
const router = express.Router();
import sentryController from "../../../../controllers/course/sentryController";

router.get("/debug-test", sentryController.handler);

export default router;
