import express from "express";
const router = express.Router();
import verifyAuth from "../../../../common/middlewares/course/authorization";
import { handleInvalidation } from "../../../../controllers/course/cacheController";

router.get("/invalidate-all", verifyAuth.verifyAdminUser, handleInvalidation);

export default router;
