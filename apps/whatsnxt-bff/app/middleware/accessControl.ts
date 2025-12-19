import { Request, Response, NextFunction } from "express";
import accessControlService from "../services/accessControlService";
import { HttpStatus } from "../utils/dbHelper";

/**
 * Middleware to check if user has access to a lab
 * Attaches hasAccess and accessReason to request object
 */
export const checkLabAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const labId = req.params.labId || req.params.id;
    const studentId = (req as any).user?.id || (req as any).userId;

    if (!studentId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!labId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Lab ID is required",
      });
    }

    const accessResult = await accessControlService.canAccessLab(
      studentId,
      labId
    );

    // Attach access info to request
    (req as any).labAccess = accessResult;

    if (!accessResult.hasAccess) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: "You do not have access to this lab",
        reason: accessResult.reason,
      });
    }

    next();
  } catch (error: any) {
    console.error("Error checking lab access:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error checking lab access",
    });
  }
};

/**
 * Middleware to check if user is an instructor
 */
export const checkInstructorRole = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRole = (req as any).user?.role;

  if (userRole !== "instructor") {
    return res.status(HttpStatus.FORBIDDEN).json({
      success: false,
      message: "Only instructors can perform this action",
    });
  }

  next();
};
