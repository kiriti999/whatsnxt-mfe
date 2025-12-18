// tutorial.controller.js
import express from "express";
import { tutorialService } from "../../../../services/tutorialService";
import authMiddleware from "../../../../common/middlewares/auth-middleware";
import extractUser from "../../../../common/middlewares/extract-user";

const router = express.Router();

router.get("/", extractUser, async (req, res) => {
  try {
    const { start = 1, limit = 10, search } = req.query;

    const result = await tutorialService.getAllTutorials(
      (req as any).userId,
      parseInt(String(start)),
      parseInt(String(limit)),
      search as string,
    );

    res.status(200).json({
      success: true,
      message: result.isAuthenticated
        ? "User tutorials retrieved successfully"
        : "Public tutorials retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /tutorials/:tutorialId
router.get("/:tutorialId", async (req, res) => {
  try {
    const { tutorialId } = req.params;
    const result = await tutorialService.getTutorialById(tutorialId, undefined);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Tutorial not found",
      });
    }

    res.json({
      success: true,
      message: "Tutorial retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /tutorials/slug/:slug (with optional authentication)
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // Since tutorialService doesn't have getBySlug, we'll find by slug in both collections
    const db = await (tutorialService as any).getNativeDb();

    let tutorial = await db.collection("blogTutorials").findOne({
      slug,
      tutorial: true,
      published: true,
      listed: true,
    });

    if (!tutorial) {
      return res.status(404).json({
        success: false,
        message: `Tutorial with slug '${slug}' not found`,
      });
    }

    res.json({
      success: true,
      message: "Tutorial retrieved successfully",
      data: tutorial,
      cached: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /tutorials/create
router.post("/createTutorial", authMiddleware, async (req, res) => {
  try {
    const result = await tutorialService.addTutorial(
      (req as any).userId,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Tutorial draft created successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /tutorials/info/service
router.get("/info/service", (req, res) => {
  try {
    const info = tutorialService.getServiceInfo();
    res.json({
      success: true,
      message: "Service information retrieved successfully",
      data: info,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /history/createTutorialFromBlogs
router.post("/createTutorialFromBlogs", authMiddleware, async (req, res) => {
  try {
    const { blogIds, title } = req.body;
    const result = await tutorialService.createTutorialFromBlogs(
      (req as any).userId,
      blogIds,
      title,
    );
    res.json({ data: { CreateTutorialFromBlogs: result } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /posts/edit/:postId
router.put("/editTutorial/:tutorialId", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { tutorialId } = req.params;

    const result = await tutorialService.editTutorial(
      userId,
      tutorialId,
      req.body,
    );

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

// DELETE /history/deleteTutorial
router.delete("/deleteTutorial/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tutorialService.deleteTutorial(
      (req as any).userId,
      id,
    );
    res.json({ data: { deleteTutorial: result } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
