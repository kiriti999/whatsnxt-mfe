// comment.controller.js
import express from "express";
import { redisService } from "../../../../services/redisService";
import authMiddleware from "../../../../common/middlewares/auth-middleware";
import { blogCommentService } from "../../../../services/blogCommentService";

const router = express.Router();

// GET /comment/getComments
router.get("/getComments", async (req, res) => {
  try {
    const {
      id,
      contentId,
      offset = 0,
      limit = 10,
      parentId = null,
    } = req.query;
    const result = await blogCommentService.getComments({
      blogId: id,
      contentId,
      offset: parseInt(String(offset)),
      limit: parseInt(String(limit)),
      parentId,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /comment/createComment
router.post("/createComment", authMiddleware, async (req, res) => {
  try {
    const { contentId, content, email, parentId } = req.body;
    const result = await blogCommentService.createComment({
      contentId,
      content,
      email,
      parentId,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /comment/editComment
router.put("/editComment", authMiddleware, async (req, res) => {
  try {
    const { contentId, content, id, email } = req.body;
    const result = await blogCommentService.editComment({
      contentId,
      content,
      commentId: id,
      email,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /comment/deleteComment
router.delete("/deleteComment", authMiddleware, async (req, res) => {
  try {
    const { id, contentId, email } = req.query;
    const result = await blogCommentService.deleteComment({
      id,
      contentId,
      email,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /comment/toggleLike
router.post("/toggleLike", async (req, res) => {
  try {
    const { id, email } = req.body;
    const result = await blogCommentService.toggleLike({
      commentId: id,
      email,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /comment/toggleDislike
router.post("/toggleDislike", async (req, res) => {
  try {
    const { id, email } = req.body;
    const result = await blogCommentService.toggleDislike({
      commentId: id,
      email,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /comment/flagComment
router.post("/flagComment", async (req, res) => {
  try {
    const { id, email } = req.body;
    const result = await blogCommentService.flagComment({
      id,
      email,
    });
    res.json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
