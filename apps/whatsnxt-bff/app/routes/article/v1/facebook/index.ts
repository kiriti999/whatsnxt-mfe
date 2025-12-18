// facebook.controller.js
import express from "express";
import { FacebookService } from "../../../../services/facebookService";

const router = express.Router();
const facebookService = new FacebookService();

// POST /facebook/post-article
router.post("/post-article", async (req, res) => {
  try {
    const { message, photoUrl } = req.body;
    const result = await facebookService.postArticleWithPhoto(
      message,
      photoUrl || null,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
