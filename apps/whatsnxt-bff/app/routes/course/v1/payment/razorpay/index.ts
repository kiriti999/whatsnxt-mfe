import express from "express";
const router = express.Router();
import razorpayController from "../../../../../controllers/course/razorpayController";

router.get("/:paymentId", razorpayController.getPaymentDetailsById);
router.post("/:paymentId/refund", razorpayController.refundPayment);
router.post("/:paymentId/capture", razorpayController.capturePayment);

export default router;
