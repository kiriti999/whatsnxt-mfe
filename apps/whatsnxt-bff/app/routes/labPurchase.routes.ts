import { Router, Request, Response } from "express";
import purchaseService from "../services/purchaseService";
import accessControlService from "../services/accessControlService";
import { HttpException, HttpStatus } from "../utils/dbHelper";
import authMiddleware from "../common/middlewares/auth-middleware";

const router = Router();

/**
 * POST /api/v1/labs/:labId/purchase/initiate
 * Initiate purchase process for a lab
 */
router.post("/:labId/purchase/initiate", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const studentId = (req as any).userId?.toString() || (req as any).userId;

    if (!studentId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
    }

    const orderData = await purchaseService.initiatePurchase(studentId, labId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Purchase initiated successfully",
      data: orderData,
    });
  } catch (error: any) {
    if (error instanceof HttpException) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Error initiating purchase:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * POST /api/v1/labs/:labId/purchase/verify
 * Verify payment and complete purchase
 */
router.post("/:labId/purchase/verify", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const studentId = (req as any).userId?.toString() || (req as any).userId;

    if (!studentId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Missing required payment verification data",
      });
    }

    const result = await purchaseService.verifyPurchase(
      studentId,
      labId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    res.status(HttpStatus.OK).json(result);
  } catch (error: any) {
    if (error instanceof HttpException) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Error verifying purchase:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * GET /api/v1/labs/:labId/access
 * Check if student has access to a lab
 */
router.get("/:labId/access", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const studentId = (req as any).userId?.toString() || (req as any).userId;

    if (!studentId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
    }

    const accessResult = await accessControlService.canAccessLab(studentId, labId);

    res.status(HttpStatus.OK).json({
      success: true,
      data: accessResult,
    });
  } catch (error: any) {
    console.error("Error checking access:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * GET /api/v1/labs/purchases/user/:userId
 * Get user's lab purchase history for purchase history page
 */
router.get("/purchases/user/:userId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const requestingUserId = (req as any).userId?.toString() || (req as any).userId;

    // Only allow users to view their own purchases (or admin)
    if (!requestingUserId || requestingUserId !== userId) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: "You can only view your own purchase history",
      });
    }

    const result = await purchaseService.getUserLabPurchases(userId, page, pageSize);

    res.status(HttpStatus.OK).json({
      success: true,
      data: result.data,
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  } catch (error: any) {
    if (error instanceof HttpException) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Error fetching lab purchases:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * POST /api/v1/labs/:labId/refund
 * Request refund for a lab purchase (within 24 hours)
 */
router.post("/:labId/refund", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const { reasons, message, refundId, refundAmount, refundStatus } = req.body;
    const studentId = (req as any).userId?.toString() || (req as any).userId;

    if (!studentId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!reasons || reasons.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "At least one refund reason is required",
      });
    }

    const result = await purchaseService.processRefund(
      studentId,
      labId,
      {
        reasons,
        message,
        refundId,
        refundAmount,
        refundStatus,
      }
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Refund processed successfully",
      data: result,
    });
  } catch (error: any) {
    if (error instanceof HttpException) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Error processing refund:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
