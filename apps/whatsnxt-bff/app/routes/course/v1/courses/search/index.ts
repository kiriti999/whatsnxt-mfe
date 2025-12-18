import express from "express";
const router = express.Router();
import courseSearchController from "../../../../../controllers/course/courseSearchController";

router.get("/", courseSearchController.handler);
router.get("/algolia", courseSearchController.searchAlgolia);

export default router;
