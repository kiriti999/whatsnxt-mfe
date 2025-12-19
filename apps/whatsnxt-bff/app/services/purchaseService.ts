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

  /**
   * Get user's lab purchases for purchase history
   * @param studentId - User ID
   * @param page - Page number (1-indexed)
   * @param pageSize - Number of items per page
   */
  async getUserLabPurchases(
    studentId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    data: any[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * pageSize;

      // Get total count
      const totalCount = await LabPurchase.countDocuments({
        studentId: new mongoose.Types.ObjectId(studentId),
        status: "completed",
      });

      // Get purchases with lab details
      const purchases = await LabPurchase.aggregate([
        {
          $match: {
            studentId: new mongoose.Types.ObjectId(studentId),
            status: "completed",
          },
        },
        {
          $sort: { purchaseDate: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
        {
          $lookup: {
            from: "labs",
            localField: "labId",
            foreignField: "id",
            as: "labInfo",
          },
        },
        {
          $unwind: {
            path: "$labInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            labId: 1,
            purchaseDate: 1,
            amountPaid: 1,
            currency: 1,
            transactionId: 1,
            status: 1,
            "metadata.razorpayOrderId": 1,
            "metadata.razorpayPaymentId": 1,
            labTitle: { $ifNull: ["$labInfo.name", "Unknown Lab"] },
            labType: "$labInfo.labType",
            architectureType: "$labInfo.architectureType",
          },
        },
      ]);

      return {
        data: purchases,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    } catch (error: any) {
      throw new HttpException(
        `Failed to get lab purchases: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Process refund for a lab purchase
   * Only eligible within 24 hours of purchase
   */
  async processRefund(
    studentId: string,
    labId: string,
    refundData: {
      reasons: string[];
      message?: string;
      refundId: string;
      refundAmount: number;
      refundStatus: string;
    }
  ): Promise<any> {
    try {
      // Find the purchase
      const purchase = await LabPurchase.findOne({
        studentId: new mongoose.Types.ObjectId(studentId),
        labId: labId,
        status: "completed",
      });

      if (!purchase) {
        throw new HttpException(
          "Purchase not found or already refunded",
          HttpStatus.NOT_FOUND
        );
      }

      // Check 24-hour eligibility
      const purchaseTime = new Date(purchase.purchaseDate).getTime();
      const currentTime = new Date().getTime();
      const hoursSincePurchase = (currentTime - purchaseTime) / (1000 * 3600);
      const refundWindowHours = 24;

      if (hoursSincePurchase > refundWindowHours) {
        throw new HttpException(
          `Refund window expired. Labs can only be refunded within ${refundWindowHours} hours of purchase.`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Update the purchase status
      purchase.status = "refunded";
      (purchase as any).refund = {
        refundId: refundData.refundId,
        refundAmount: refundData.refundAmount,
        refundStatus: refundData.refundStatus,
        reasons: refundData.reasons,
        message: refundData.message || "",
        refundedAt: new Date(),
      };

      await purchase.save();

      // Create transaction record for refund
      await this.createTransaction({
        studentId,
        labId,
        type: "purchase_failed", // Using existing type, represents refund
        amount: refundData.refundAmount / 100, // Convert from paise
        status: "success",
        gatewayResponse: {
          paymentId: refundData.refundId,
          raw: refundData,
        },
      });

      // Invalidate access cache
      accessControlService.invalidateCache(studentId, labId);

      return {
        success: true,
        message: "Refund processed successfully",
        refundId: refundData.refundId,
        refundAmount: refundData.refundAmount,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to process refund: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default new PurchaseService();
