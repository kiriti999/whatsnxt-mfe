import { Router, Request, Response } from "express";
import labPricingService from "../services/labPricingService";
import { HttpException, HttpStatus } from "../utils/dbHelper";
import authMiddleware from "../common/middlewares/auth-middleware";

const router = Router();

/**
 * PUT /api/v1/labs/:labId/pricing
 * Set or update pricing for a lab
 */
router.put("/:labId/pricing", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const { purchaseType, price } = req.body;
    const instructorId = (req as any).userId?.toString() || (req as any).userId;

    if (!instructorId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!purchaseType || !["free", "paid"].includes(purchaseType)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid purchase type. Must be 'free' or 'paid'",
      });
    }

    const lab = await labPricingService.setPricing(
      labId,
      purchaseType,
      price,
      instructorId
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Pricing updated successfully",
      data: {
        labId: lab._id,
        pricing: lab.pricing,
      },
    });
  } catch (error: any) {
    if (error instanceof HttpException) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Error setting pricing:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * GET /api/v1/labs/:labId/pricing
 * Get pricing information for a lab
 */
router.get("/:labId/pricing", async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;

    const pricing = await labPricingService.getPricing(labId);

    res.status(HttpStatus.OK).json({
      success: true,
      data: pricing,
    });
  } catch (error: any) {
    if (error instanceof HttpException) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Error getting pricing:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
