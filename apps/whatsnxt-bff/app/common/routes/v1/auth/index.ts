import express from "express";
const router = express.Router();
import authController from "../../../controllers/authController";
import accountController from "../../../controllers/accountController";

router.post("/login", authController.login);
router.post("/send-otp", authController.createOtp);
router.post("/createAccount", accountController.createAccount);
router.post("/logout", authController.logout);

export default router;
