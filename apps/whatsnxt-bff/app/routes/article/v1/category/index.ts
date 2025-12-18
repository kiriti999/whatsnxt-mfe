// post.controller.js
import express from "express";
import { categoryService } from "../../../../services/categoryService";

const router = express.Router();

router.get("/getArticleCountByCategory", async (req, res) => {
  try {
    const result = await categoryService.getArticleCountByCategory();
    res.set("Cache-Control", "public, max-age=3600");
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/getCategories", async (req, res) => {
  try {
    const result = await categoryService.getCategories();
    res.set("Cache-Control", "public, max-age=3600");
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
