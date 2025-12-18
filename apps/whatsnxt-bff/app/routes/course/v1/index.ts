import express from "express";
const courseRouter = express.Router();
import { redisCachingMiddleware } from "../../../common/middlewares/redis-middleware";
import authMiddleware from "../../../common/middlewares/auth-middleware";

import cart from "./cart";
import course from "./courses/course";
import feedback from "./courses/feedback";
import courseBuilder from "./courses/course-builder";
import courseComments from "./courseComments";
import category from "./courses/category";
import enrolled from "./courses/enrolled";
import popularity from "./courses/popularity";
import search from "./courses/search";
import trainer from "./courses/trainer";
import mail from "./mail";
import user from "./user";
import payment from "./payment";
import razorpay from "./payment/razorpay";
import video from "./video";
import orders from "./orders";
import language from "./languages";
import interview from "./courses/interview";
import trainerContactedPayment from "./trainer-contacted-payment";
import analytics from "./analytics";
import sentry from "./sentry";
import webhooks from "./webhooks";
import redisCache from "./redis";

// Basic Routes
courseRouter.use("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Course API",
    timestamp: new Date().toISOString(),
  });
});

// App Routes (General application endpoints)
courseRouter.use("/redis-cache", redisCache);

courseRouter.use("/cart", cart);
courseRouter.use("/orders", orders);
courseRouter.use("/sentry", sentry);

// Courses Section -- start
courseRouter.use("/courses/course-builder", authMiddleware, courseBuilder);
courseRouter.use("/courses/popularity", popularity);
courseRouter.use("/courses/search", search);
courseRouter.use("/courses/trainer", trainer);

courseRouter.use(
  "/courses/categories",
  redisCachingMiddleware({
    // No invalidation paths needed for read-only data
  }),
  category,
);

courseRouter.use(
  "/courses/course",
  redisCachingMiddleware({
    invalidationPaths: [
      "/courses/course/", // POST / (create course)
      "/courses/course/:courseId/publish", // POST /:courseId/publish
      "/courses/course/:id", // DELETE /:id
      "/courses/course/sections/:sectionId/videos/publishAll", // POST /sections/:sectionId/videos/publishAll
      "/courses/course/sections/:sectionId/videos/:videoId/publish", // POST /sections/:sectionId/videos/:videoId/publish
    ],
  }),
  course,
);

// courseRouter.use('/courses/course', redisCachingMiddleware({
//     invalidationPaths: [
//         '/courses/course/*'  // Catches all modification routes
//     ]
// }), course);

courseRouter.use(
  "/courses/enrolled",
  redisCachingMiddleware({
    invalidationPaths: [
      "/courses/enrolled/", // Matches POST / and PATCH /
      "/courses/enrolled/:courseId", // Matches DELETE /:courseId
    ],
  }),
  enrolled,
);

courseRouter.use(
  "/courses/feedback",
  redisCachingMiddleware({
    invalidationPaths: [
      "/courses/feedback/:courseId/reviews", // POST /:courseId/reviews
      "/courses/feedback/:commentId/edit", // PATCH /:commentId/edit
      "/courses/feedback/:commentId", // DELETE /:commentId
      "/courses/feedback/:id/toggleLike", // POST /:id/toggleLike
      "/courses/feedback/:id/toggleDislike", // POST /:id/toggleDislike
      "/courses/feedback/:id/flag", // PATCH /:id/flag
      "/courses/feedback/:courseId/rating", // POST, PATCH, DELETE /:courseId/rating
    ],
  }),
  feedback,
);

// courseRouter.use('/courses/feedback', redisCachingMiddleware({
//     invalidationPaths: [
//         '/courses/feedback/*'  // Catches all modification routes
//     ]
// }), feedback);

// Courses Section -- end

courseRouter.use("/interview", interview);
courseRouter.use("/comment", authMiddleware, courseComments);
courseRouter.use("/mail", mail);
courseRouter.use("/user", user);
courseRouter.use("/payment", payment);
courseRouter.use("/payment/razorpay", razorpay);

courseRouter.use("/video", video);
courseRouter.use(
  "/language",
  redisCachingMiddleware({
    // No invalidation paths needed for read-only data
  }),
  language,
);
courseRouter.use("/trainer-contacted-payment", trainerContactedPayment);

courseRouter.use("/analytics", analytics);
courseRouter.use("/webhooks", webhooks);

export default courseRouter;
