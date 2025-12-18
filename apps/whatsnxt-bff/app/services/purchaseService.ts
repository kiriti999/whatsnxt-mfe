import mongoose from "mongoose";
import Lab from "../models/lab/Lab";
import LabPurchase from "../models/LabPurchase";
import Transaction from "../models/Transaction";
import { HttpException, HttpStatus } from "../utils/dbHelper";
import paymentGatewayService from "./paymentGatewayService";
import accessControlService from "./accessControlService";

class PurchaseService {
  /**
   * Initiate purchase process for a lab
   */
  async initiatePurchase(
    studentId: string,
    labId: string
  ): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    key: string;
    labTitle: string;
  }> {
    try {
      // Check if lab exists and is paid
      const lab: any = await Lab.findOne({ id: labId }).select("title pricing").lean();
      if (!lab) {
        throw new HttpException("Lab not found", HttpStatus.NOT_FOUND);
      }

      if (!(lab as any).pricing || (lab as any).pricing.purchaseType !== "paid") {
        throw new HttpException(
          "This lab is not available for purchase",
          HttpStatus.BAD_REQUEST
        );
      }

      // Check if student already purchased
      const existingPurchase = await LabPurchase.findOne({
        studentId: new mongoose.Types.ObjectId(studentId),
        labId: labId, // UUID string
        status: "completed",
      }).lean();

      if (existingPurchase) {
        throw new HttpException(
          "You have already purchased this lab",
          HttpStatus.BAD_REQUEST
        );
      }

      // Create Razorpay order
      const order = await paymentGatewayService.createOrder(
        lab.pricing.price!,
        labId,
        studentId
      );

      // Create transaction record
      await this.createTransaction({
        studentId,
        labId,
        type: "purchase_attempt",
        amount: lab.pricing.price!,
        status: "pending",
        gatewayResponse: {
          orderId: order.id,
          raw: order,
        },
      });

      return {
        orderId: order.id,
        amount: lab.pricing.price!,
        currency: "INR",
        key: process.env.RAZOR_PAY_KEY || "",
        labTitle: lab.title,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to initiate purchase: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verify payment and create purchase record
   */
  async verifyPurchase(
    studentId: string,
    labId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<any> {
    try {
      // Verify signature
      const isValid = paymentGatewayService.verifySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        // Create failed transaction
        await this.createTransaction({
          studentId,
          labId,
          type: "purchase_failed",
          amount: 0,
          status: "failed",
          gatewayResponse: {
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            errorDescription: "Invalid signature",
            raw: {},
          },
        });

        throw new HttpException(
          "Payment verification failed",
          HttpStatus.BAD_REQUEST
        );
      }

      // Get payment details
      const paymentDetails = await paymentGatewayService.getPaymentDetails(
        razorpayPaymentId
      );

      // Check if payment was successful
      if (paymentDetails.status !== "captured") {
        await this.createTransaction({
          studentId,
          labId,
          type: "purchase_failed",
          amount: paymentDetails.amount / 100,
          status: "failed",
          gatewayResponse: {
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            errorDescription: `Payment status: ${paymentDetails.status}`,
            raw: paymentDetails,
          },
        });

        throw new HttpException(
          "Payment was not completed successfully",
          HttpStatus.BAD_REQUEST
        );
      }

      // Create purchase record (idempotent)
      const purchase = await this.createPurchaseRecord({
        studentId,
        labId,
        transactionId: razorpayPaymentId,
        amountPaid: paymentDetails.amount / 100, // Convert from paise
        metadata: {
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        },
      });

      // Create success transaction
      await this.createTransaction({
        studentId,
        labId,
        type: "purchase_success",
        amount: paymentDetails.amount / 100,
        status: "success",
        gatewayResponse: {
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          raw: paymentDetails,
        },
      });

      // Invalidate access cache
      accessControlService.invalidateCache(studentId, labId);

      return {
        success: true,
        message: "Purchase completed successfully",
        purchase,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to verify purchase: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create purchase record (idempotent based on transactionId)
   */
  async createPurchaseRecord(data: {
    studentId: string;
    labId: string;
    transactionId: string;
    amountPaid: number;
    metadata: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    };
  }): Promise<any> {
    try {
      // Check if purchase already exists (idempotency)
      const existing = await LabPurchase.findOne({
        transactionId: data.transactionId,
      }).lean();

      if (existing) {
        return existing;
      }

      // Create new purchase
      const purchase = new LabPurchase({
        studentId: new mongoose.Types.ObjectId(data.studentId),
        labId: data.labId, // UUID string
        purchaseDate: new Date(),
        transactionId: data.transactionId,
        amountPaid: data.amountPaid,
        currency: "INR",
        status: "completed",
        metadata: data.metadata,
      });

      await purchase.save();
      return purchase;
    } catch (error: any) {
      // Handle duplicate key error (race condition)
      if (error.code === 11000) {
        const existing = await LabPurchase.findOne({
          transactionId: data.transactionId,
        }).lean();
        return existing;
      }
      throw error;
    }
  }

  /**
   * Create transaction record
   */
  async createTransaction(data: {
    studentId: string;
    labId: string;
    type: "purchase_attempt" | "purchase_success" | "purchase_failed";
    amount: number;
    status: "pending" | "success" | "failed" | "cancelled";
    gatewayResponse: {
      orderId?: string;
      paymentId?: string;
      errorCode?: string;
      errorDescription?: string;
      raw: any;
    };
  }): Promise<any> {
    try {
      const transaction = new Transaction({
        studentId: new mongoose.Types.ObjectId(data.studentId),
        labId: data.labId, // UUID string
        timestamp: new Date(),
        type: data.type,
        amount: data.amount,
        currency: "INR",
        status: data.status,
        gatewayResponse: data.gatewayResponse,
      });

      await transaction.save();
      return transaction;
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      // Don't throw - transaction logging is not critical
      return null;
    }
  }
}

export default new PurchaseService();
