import Razorpay from "razorpay";
import crypto from "crypto";
import { HttpException, HttpStatus } from "../utils/dbHelper";

class PaymentGatewayService {
  private razorpay: Razorpay;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    const keyId = process.env.RAZOR_PAY_KEY;
    const keySecret = process.env.RAZOR_PAY_SECRET;
    this.webhookSecret = process.env.RAZOR_PAY_WEBHOOK_SECRET || "";

    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    this.keySecret = keySecret;
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  /**
   * Create Razorpay order for lab purchase
   */
  async createOrder(amount: number, labId: string, studentId: string): Promise<any> {
    try {
      const options = {
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: `lab_${labId}_${studentId}_${Date.now()}`,
        notes: {
          labId,
          studentId,
          type: "lab_purchase",
        },
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error: any) {
      throw new HttpException(
        `Failed to create payment order: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verify payment signature from Razorpay callback
   */
  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    try {
      const body = orderId + "|" + paymentId;
      const expectedSignature = crypto
        .createHmac("sha256", this.keySecret)
        .update(body.toString())
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(payload)
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch payment details from Razorpay
   */
  async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error: any) {
      throw new HttpException(
        `Failed to fetch payment details: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default new PaymentGatewayService();
