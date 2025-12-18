import express from "express";
const commonRouter = express.Router();

import auth from "./auth";
import algolia from "./algolia";
import profile from "./profile";
import account from "./account";
import cloudinary from "./cloudinary";
import imagekit from "./imagekit";
import { redisCachingMiddleware } from "../../middlewares/redis-middleware";

// Basic Routes
commonRouter.use("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Common API",
    timestamp: new Date().toISOString(),
  });
});

// Profile Routes
// commonRouter.use('/profile', redisCachingMiddleware({
//     invalidationPaths: [
//         '/profile',
//         '/profile/edit-profile',
//         '/profile/edit-password',
//         '/profile/edit-profile-info'
//     ]
// }), profile);

commonRouter.use("/cloudinary", cloudinary);
commonRouter.use("/imagekit", imagekit);
commonRouter.use("/profile", profile);
commonRouter.use("/algolia", algolia);
commonRouter.use("/account", account);
commonRouter.use("/auth", auth);

export default commonRouter;
