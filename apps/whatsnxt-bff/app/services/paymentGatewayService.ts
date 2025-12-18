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
      console.error("Razorpay credentials missing!", { keyId: !!keyId, keySecret: !!keySecret });
      throw new Error("Razorpay credentials not configured");
    }

    console.log("Initializing Razorpay with key:", keyId.substring(0, 10) + "...");
    
    this.keySecret = keySecret;
    try {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      console.log("Razorpay initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Razorpay:", error);
      throw error;
    }
  }

  /**
   * Create Razorpay order for lab purchase
   */
  async createOrder(amount: number, labId: string, studentId: string): Promise<any> {
    try {
      // Razorpay receipt max length is 40 characters
      // Create a short unique receipt ID
      const timestamp = Date.now().toString(36); // Convert to base36 for shorter string
      const labIdShort = labId.substring(0, 8); // First 8 chars of UUID
      const studentIdShort = studentId.substring(studentId.length - 8); // Last 8 chars
      const receipt = `lab_${labIdShort}_${studentIdShort}_${timestamp}`.substring(0, 40);
      
      const options = {
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: receipt,
        notes: {
          labId,
          studentId,
          type: "lab_purchase",
        },
      };

      console.log(`Creating Razorpay order: amount=${amount}, receipt=${receipt} (length: ${receipt.length})`);
      const order = await this.razorpay.orders.create(options);
      console.log(`Razorpay order created successfully: ${order.id}`);
      return order;
    } catch (error: any) {
      console.error("Razorpay order creation error:", error);
      const errorMessage = error?.error?.description || error?.message || error?.description || JSON.stringify(error);
      throw new HttpException(
        `Failed to create payment order: ${errorMessage}`,
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
