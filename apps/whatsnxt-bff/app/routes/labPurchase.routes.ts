import { Router, Request, Response } from "express";
import purchaseService from "../services/purchaseService";
import accessControlService from "../services/accessControlService";
import { HttpException, HttpStatus } from "../utils/dbHelper";

const router = Router();

/**
 * POST /api/v1/labs/:labId/purchase/initiate
 * Initiate purchase process for a lab
 */
router.post("/:labId/purchase/initiate", async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const studentId = (req as any).user?.id || (req as any).userId;

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
router.post("/:labId/purchase/verify", async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const studentId = (req as any).user?.id || (req as any).userId;

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
router.get("/:labId/access", async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const studentId = (req as any).user?.id || (req as any).userId;

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

export default router;
