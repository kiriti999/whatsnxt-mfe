import express from "express";
const router = express.Router();
import paymentController from "../../../../controllers/course/paymentController";

router.post("/save", paymentController.save);

export default router;
