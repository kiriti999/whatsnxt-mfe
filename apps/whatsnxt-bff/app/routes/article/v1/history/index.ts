// history.controller.js
import express from "express";
import { redisService } from "../../../../services/redisService";
import authMiddleware from "../../../../common/middlewares/auth-middleware";
import { historyService } from "../../../../services/historyService";

const router = express.Router();

// GET /history/getHistory
router.get("/getHistory", async (req, res) => {
  try {
    const { start = 1, limit = 10, type, search, filter } = req.query;
    const result = await historyService.getContentHistory(
      parseInt(String(start)),
      parseInt(String(limit)),
      type as string,
      search as string,
      filter as string,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /history/downloadEBook
router.get("/downloadEBook", async (req, res) => {
  try {
    const { id } = req.query;
    const result = await historyService.generateEbook(id);
    res.json({ data: { generateEbook: result } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /history/downloadPDF
router.get("/downloadPDF", async (req, res) => {
  try {
    const { id } = req.query;
    const result = await historyService.generatePDF(id);
    res.json({ data: { generatePDF: result } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /history/downloadPPT
router.get("/downloadPPT", async (req, res) => {
  try {
    const { id } = req.query;
    const result = await historyService.generatePpt(id);
    res.json({ data: { generatePPT: result } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /history/publishDraft
router.put("/publishDraft", authMiddleware, async (req, res) => {
  try {
    const { postId, shouldPublish } = req.body;
    const result = await historyService.publishDraft(
      (req as any).userId,
      postId,
      shouldPublish,
    );
    res.status(200).json({
      success: true,
      message: "Published successfully",
      data: { publishPost: result },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
