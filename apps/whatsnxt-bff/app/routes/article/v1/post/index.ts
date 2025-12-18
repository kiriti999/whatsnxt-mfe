// post.controller.js
import express from "express";
import { postService } from "../../../../services/postService";
import authMiddleware from "../../../../common/middlewares/auth-middleware";
import extractUser from "../../../../common/middlewares/extract-user";
import { getLogger } from "../../../../../config/logger";
const logger = getLogger("index");

const router = express.Router();

// POST /posts/create
router.post("/createBlog", authMiddleware, async (req, res) => {
  try {
    const result = await postService.createBlog((req as any).userId, req.body);

    res.status(201).json({
      success: true,
      message: "Draft created successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /posts/getPosts
router.get("/getPosts", async (req, res) => {
  try {
    const { start = 1, limit = 10, type, search, filter } = req.query;
    const result = await postService.getPosts(
      parseInt(String(start)),
      parseInt(String(limit)),
      type as string,
      search as string,
      filter as string,
    );
    res.json(result);
  } catch (error) {
    logger.error("getPosts:: Route error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /posts/getPostsByCategory
router.get("/getPostsByCategory", async (req, res) => {
  try {
    const { categoryName } = req.query;
    const result = await postService.getPostsByCategory(categoryName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /posts/getPopularPosts
router.get("/getPopularPosts", async (req, res) => {
  try {
    const result = await postService.getPopularPosts();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /posts/suggestionByChatGpt
router.post("/suggestionByChatGpt", async (req, res) => {
  try {
    const { question } = req.body;
    const result = await postService.getSuggestionByChatGpt(question);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /posts/:postId
router.get("/getPostById/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await postService.getPost(postId);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /posts/slug/:slug (with optional authentication)
router.get("/slug/:slug", extractUser, async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = (req as any)?.userId; // Set by JWT middleware

    const isPublic = !userId;

    const start = performance.now();
    const post = await postService.getPostBySlug(slug, userId);

    const duration = performance.now() - start;

    if (!post) {
      return res.status(404).json({
        error: `Post with slug '${slug}' does not exist!`,
      });
    }

    // Add additional context for debugging
    const response = {
      ...post,
      _meta: {
        isAuthenticated: !isPublic,
        userId,
        cached: false,
        executionTime: `${duration.toFixed(2)}ms`,
      },
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /tutorials/my-drafts
router.get("/my-drafts", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const result = await postService.getDrafts(
      (req as any).userId,
      parseInt(String(page)),
      parseInt(String(limit)),
      search as string,
    );

    res.status(200).json({
      success: true,
      message: "Tutorial drafts retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /tutorials/my-published
router.get("/my-published", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const result = await postService.getMyPublishedPosts(
      (req as any).userId,
      parseInt(String(page)),
      parseInt(String(limit)),
      search as string,
      undefined,
    );

    res.status(200).json({
      success: true,
      message: "Published tutorials retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /tutorials/my-all
router.get("/my-all", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const result = await postService.getMyAllContent(
      (req as any).userId,
      parseInt(String(page)),
      parseInt(String(limit)),
      search as string,
      undefined,
    );

    res.status(200).json({
      success: true,
      message: "All tutorials retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// PUT /posts/edit/:postId
router.put("/editBlog/:postId", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { postId } = req.params;

    const result = await postService.editBlog(userId, postId, req.body);
    logger.info(" router.put :: result:", result);

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE /posts/delete/:postId
router.delete("/delete/:postId", authMiddleware, async (req, res) => {
  try {
    const { email } = (req as any).user;
    const { postId } = req.params;

    const result = await postService.deleteBlog(postId);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE /history/deleteBlog
router.delete("/deleteBlog/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await postService.deleteBlog(id);
    res.json({ data: { deletePost: result } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
