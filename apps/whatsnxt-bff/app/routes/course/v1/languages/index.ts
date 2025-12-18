import express from "express";
const router = express.Router();
import languageController from "../../../../controllers/course/languageController";

router.get("/", languageController.handler);

export default router;
