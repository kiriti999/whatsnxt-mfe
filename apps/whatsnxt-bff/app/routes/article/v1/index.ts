import express from "express";
const articleRouter = express.Router();
import { redisCachingMiddleware } from "../../../common/middlewares/redis-middleware";

// Import all route modules
import category from "./category";
import facebook from "./facebook";
import linkedin from "./linkedIn";
import post from "./post";
import comment from "./comment";
import tutorial from "./tutorial";
import history from "./history";
import { getLogger } from "../../../../config/logger";
const logger = getLogger("index");

// Add this debug middleware at the top (avoid passing '*' to router.use to be compatible
// with newer path-to-regexp versions)
articleRouter.use((req, res, next) => {
  logger.info("🔍 Article Router - Request:", req.method, req.originalUrl);
  next();
});

// Basic Routes
articleRouter.use("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Article API",
    timestamp: new Date().toISOString(),
  });
});

// App Routes with Redis Caching

// Posts with caching - cache invalidated when posts are created, updated, or deleted
// Also invalidates /getHistory cache when posts are modified
articleRouter.use(
  "/post",
  /** @type {import('express').RequestHandler} */ redisCachingMiddleware({
    invalidationPaths: [
      "/post/createBlog",
      "/post/editBlog",
      "/post/delete",
      "/post/deleteBlog",
    ],
    crossPathInvalidation: [
      "/history/getHistory", // Invalidate history cache when posts are modified
    ],
  }),
  post,
);

// Tutorials with caching - cache invalidated when tutorials are modified
// Also invalidates /getHistory cache when tutorials are modified
articleRouter.use(
  "/tutorial",
  /** @type {import('express').RequestHandler} */ redisCachingMiddleware({
    invalidationPaths: [
      "/tutorial/createTutorial",
      "/tutorial/createTutorialFromBlogs",
      "/tutorial/editTutorial",
      "/tutorial/deleteTutorial",
    ],
    crossPathInvalidation: [
      "/history/getHistory", // Invalidate history cache when tutorials are modified
    ],
  }),
  tutorial,
);

// Comments with caching - cache invalidated when comments are added, edited, or deleted
articleRouter.use(
  "/comment",
  /** @type {import('express').RequestHandler} */ redisCachingMiddleware({
    invalidationPaths: [
      "/comment/create",
      "/comment/update",
      "/comment/delete",
      "/comment/reply",
      "/comment/approve",
      "/comment/moderate",
    ],
  }),
  comment,
);

// History with caching - typically read-heavy, cache invalidated when content is published
articleRouter.use(
  "/history",
  /** @type {import('express').RequestHandler} */ redisCachingMiddleware({
    invalidationPaths: ["/history/publishDraft"],
    crossPathInvalidation: [
      "/history/getHistory", // Invalidate history cache when drafts are published
    ],
  }),
  history,
);

// Categories with caching - these are read-only endpoints, no invalidation needed for current routes
articleRouter.use(
  "/category",
  /** @type {import('express').RequestHandler} */ redisCachingMiddleware({
    invalidationPaths: [
      // No invalidation paths currently as these are read-only endpoints
      // Add here if you add create/update/delete category endpoints
    ],
  }),
  category,
);

// Social Media Integration Routes
// These might not need heavy caching as they often involve external API calls
// But you can add caching for configuration or settings endpoints

// Facebook integration - cache configuration and settings
articleRouter.use("/facebook", facebook);

// LinkedIn integration - cache configuration and settings
articleRouter.use("/linkedin", linkedin);

export default articleRouter;
