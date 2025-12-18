// linkedin.controller.js
import express from "express";
import { LinkedInService } from "../../../../services/linkedInService";
import auth from "../../../../common/middlewares/auth-middleware";
import { getLogger } from "../../../../../config/logger";
const logger = getLogger("index");

const router = express.Router();
const linkedInService = new LinkedInService();

// GET /linkedIn/token-check
router.get("/token-check", async (req, res) => {
  try {
    const tokenAvailable = await linkedInService.isTokenAvailable();
    res.status(200).json({ tokenAvailable });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to check LinkedIn token availability" });
  }
});

// GET /linkedIn/auth-url
router.get("/auth-url", async (req, res) => {
  try {
    const { authUrl } = await linkedInService.generateAuthUrl();
    res.status(200).json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate auth URL" });
  }
});

// GET /linkedIn/callback
router.get("/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    // Handle OAuth errors from LinkedIn
    if (error) {
      logger.error("❌ LinkedIn OAuth error:", error);
      return res.redirect(
        `${process.env.FRONTEND_URL}?error=oauth_error&details=${encodeURIComponent(String(error))}`,
      );
    }

    logger.info("✅ LinkedIn callback received, exchanging code for token...");

    // Exchange code for access token
    await linkedInService.exchangeAuthCode(code);

    logger.info("✅ Token exchange successful, redirecting to frontend...");

    // Redirect back to frontend with success indicator
    return res.redirect(`${process.env.FRONTEND_URL}?linkedin_auth=success`);
  } catch (error) {
    logger.error("❌ OAuth callback failed:", error);
    res.redirect(
      `${process.env.FRONTEND_URL}?error=callback_failed&details=${encodeURIComponent(error.message)}`,
    );
  }
});

// POST /linkedIn/share
router.post("/share", auth, async (req, res) => {
  logger.info(" share:: router.post :: req.userId:", (req as any).userId);
  try {
    const { url, title, text, media, email, thumbnailUrn } = req.body;
    logger.info("📤 Sharing LinkedIn post:", { title, email });
    logger.info(" router.post :: req.body:", req.body);

    if (!text) {
      return res.status(400).json({
        message: "Text for the post is required",
      });
    }

    const result = await linkedInService.sharePost(
      url,
      title,
      email,
      text,
      thumbnailUrn,
      media || [],
      "v1",
      (req as any).userId,
    );
    res.status(200).json({
      message: "Post shared successfully",
      data: result,
    });
  } catch (error) {
    logger.error("❌ Share post error:", error);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: "Failed to share post on LinkedIn",
      error: error.response?.data || error.message,
    });
  }
});

// PUT /linkedIn/update
router.put("/update", async (req, res) => {
  try {
    const { postId, text, email } = req.body;

    if (!postId || !text) {
      return res.status(400).json({
        message: "Post ID and updated text are required",
      });
    }

    const result = await linkedInService.updatePost(
      email,
      postId,
      text,
      undefined,
    );
    res.status(200).json({
      message: "Post updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update LinkedIn post",
      error: error.message,
    });
  }
});

// DELETE /linkedIn/delete
router.delete("/delete", async (req, res) => {
  try {
    const { postId, email } = req.body;

    if (!postId) {
      return res.status(400).json({
        message: "Post ID is required",
      });
    }

    const result = await linkedInService.deletePost(email, postId, undefined);
    res.status(200).json({
      message: "Post deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete LinkedIn post",
      error: error.message,
    });
  }
});

// GET /linkedIn/debug
router.get("/debug", async (req, res) => {
  try {
    const authData = await linkedInService.generateAuthUrl();
    res.status(200).json({
      authUrl: authData.authUrl,
      redirectUri: process.env.LINKEDIN_REDIRECT_URI,
      frontendUrl: process.env.FRONTEND_URL,
      clientId: process.env.LINKEDIN_CLIENT_ID ? "Set" : "Missing",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

export default router;
