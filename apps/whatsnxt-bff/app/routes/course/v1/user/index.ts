import express from "express";
const router = express.Router();
import userController from "../../../../controllers/course/userController";
import authMiddleware from "../../../../common/middlewares/auth-middleware";

router.post("/apply", authMiddleware, userController.apply);

export default router;
