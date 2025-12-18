import express from "express";
const router = express.Router();
import * as contactedPaymentController from "../../../../controllers/course/trainerContactedPayment";

// Route to create an trainer contacted payment
router.post("/", contactedPaymentController.createContactedPayment);
router.patch("/:orderId", contactedPaymentController.updatePayment);
router.get("/:orderId", contactedPaymentController.getPaymentById);
router.get("/user/:userId", contactedPaymentController.getUserPayments);
router.get(
  "/user/:trainerId/:userId",
  contactedPaymentController.getUserPayment,
);
router.get(
  "/user-already-purchased/:trainerId/:userId",
  contactedPaymentController.userAlreadyPurchased,
);
router.post("/:orderId/verify", contactedPaymentController.verify);

export default router;
