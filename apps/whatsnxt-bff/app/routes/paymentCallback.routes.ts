import { Router, Request, Response } from "express";
import paymentGatewayService from "../services/paymentGatewayService";
import purchaseService from "../services/purchaseService";
import { HttpStatus } from "../utils/dbHelper";

const router = Router();

/**
 * POST /api/v1/webhooks/razorpay
 * Handle Razorpay webhook events
 */
router.post("/razorpay", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    const isValid = paymentGatewayService.verifyWebhookSignature(
      payload,
      signature
    );

    if (!isValid) {
      console.error("Invalid webhook signature");
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Process webhook event
    const event = req.body;
    console.log("Received webhook event:", event.event);

    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount / 100; // Convert from paise

      // Extract metadata from order notes
      const notes = payment.notes || {};
      const labId = notes.labId;
      const studentId = notes.studentId;

      if (labId && studentId) {
        // Create transaction record
        await purchaseService.createTransaction({
          studentId,
          labId,
          type: "purchase_success",
          amount,
          status: "success",
          gatewayResponse: {
            orderId,
            paymentId,
            raw: payment,
          },
        });

        console.log(
          `Webhook: Payment captured for lab ${labId}, student ${studentId}`
        );
      }
    }

    // Handle payment.failed event
    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount / 100;
      const errorCode = payment.error_code;
      const errorDescription = payment.error_description;

      const notes = payment.notes || {};
      const labId = notes.labId;
      const studentId = notes.studentId;

      if (labId && studentId) {
        // Create failed transaction record
        await purchaseService.createTransaction({
          studentId,
          labId,
          type: "purchase_failed",
          amount,
          status: "failed",
          gatewayResponse: {
            orderId,
            paymentId,
            errorCode,
            errorDescription,
            raw: payment,
          },
        });

        console.log(
          `Webhook: Payment failed for lab ${labId}, student ${studentId}`
        );
      }
    }

    // Acknowledge receipt
    res.status(HttpStatus.OK).json({ success: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    // Always return 200 to prevent Razorpay retries on application errors
    res.status(HttpStatus.OK).json({ success: false });
  }
});

export default router;
