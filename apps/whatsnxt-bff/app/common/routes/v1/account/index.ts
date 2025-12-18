import express from "express";
const router = express.Router();
import accountController from "../../../controllers/accountController";
import authMiddleware from "../../../middlewares/auth-middleware";

router.post("/new", authMiddleware, accountController.createAccount);
router.put("/update", authMiddleware, accountController.updateAccount);

export default router;
