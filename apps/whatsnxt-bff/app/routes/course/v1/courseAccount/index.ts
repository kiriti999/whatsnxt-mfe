import express from "express";
const router = express.Router();
// @ts-ignore - Controller may not exist
import * as courseAccountController from "../../../controllers/courseAccountController";
import authMiddleware from "../../../../common/middlewares/auth-middleware";

router.get("/", authMiddleware, (courseAccountController as any).getAccount);

export default router;
