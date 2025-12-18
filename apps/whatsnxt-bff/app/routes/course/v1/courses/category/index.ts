import express from "express";
const router = express.Router();
import courseCategoryController from "../../../../../controllers/course/courseCategoryController";

router.get("/categoryByCount", courseCategoryController.listByCount);
router.get("/:categoryName", courseCategoryController.searchByName);
router.get("/", courseCategoryController.handler);

export default router;
