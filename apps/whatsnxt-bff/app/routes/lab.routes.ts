import { Router, Request, Response, NextFunction } from "express";
import { LabService } from "../services/lab";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "@whatsnxt/errors";
import { SUCCESS_MESSAGES, HTTP_STATUS } from "@whatsnxt/constants";
import { getLogger } from "../../config/logger";
import accessControlService from "../services/accessControlService";
import auth from '../common/middlewares/auth-middleware';

const router = Router();
const logger = getLogger("LabRoutes");

/**
 * Lab Routes for Lab Diagram Tests Feature
 *
 * Handles all HTTP endpoints for lab management.
 * Routes:
 * - POST /api/v1/labs - Create new lab
 * - GET /api/v1/labs - Get draft labs by instructor (paginated)
 * - GET /api/v1/labs/:labId - Get lab by ID
 * - PUT /api/v1/labs/:labId - Update draft lab
 * - DELETE /api/v1/labs/:labId - Delete draft lab
 * - POST /api/v1/labs/:labId/publish - Publish lab
 */

/**
 * POST /api/v1/labs
 * Create a new lab as a draft
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, labType, architectureType, instructorId, pricing } =
      req.body;

    const lab = await LabService.createLab({
      name,
      description,
      labType,
      architectureType,
      instructorId,
      pricing,
    });

    logger.info(`Lab created: ${lab.id} with pricing: ${pricing?.purchaseType || 'not set'}`);
    res.status(HTTP_STATUS.CREATED).json({
      message: SUCCESS_MESSAGES.LAB_CREATED,
      data: lab,
    });
  } catch (error) {
    logger.error("Error creating lab:", error);
    next(error);
  }
});

/**
 * GET /api/v1/labs
 * Get labs (drafts or published) with pagination
 * Query params:
 * - status: 'draft' or 'published' (optional, defaults to 'published')
 * - instructorId: required when status='draft'
 * - page: page number (optional)
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = (req.query.status as string) || "published";
    const instructorId = req.query.instructorId as string;
    const page = req.query.page
      ? parseInt(req.query.page as string, 10)
      : undefined;

    if (status === "draft") {
      if (!instructorId) {
        throw new ValidationError(
          "instructorId query parameter is required for draft labs",
        );
      }
      const result = await LabService.getDraftsByInstructor(instructorId, page);
      return res.status(HTTP_STATUS.OK).json(result);
    }

    // Get published labs (no instructorId required)
    const result = await LabService.getPublishedLabs(page);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    logger.error("Error getting labs:", error);
    next(error);
  }
});

/**
 * GET /api/v1/labs/:labId
 * Get a specific lab by ID with all pages populated
 * For students viewing published paid labs, access control is enforced
 */
router.get(
  "/:labId", auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { labId } = req.params;
      // extractUser middleware sets req.userId and req.userRole (not req.user)
      const userId = (req as any).userId;
      const userRole = (req as any).userRole;

      const lab = await LabService.getLabWithPages(labId);
      
      logger.info(`Lab access check: labId=${labId}, userRole=${userRole}, labStatus=${lab.status}, userId=${userId}, pricing=${JSON.stringify(lab.pricing)}`);

      // If it's a published lab and user is a student, check access
      if (lab.status === 'published' && userRole === 'student') {
        if (!userId) {
          logger.warn(`Student userId not found in request, denying access`);
          const sanitizedLab = {
            ...lab,
            pages: [],
          };
          return res.status(HTTP_STATUS.OK).json({ 
            data: sanitizedLab,
            requiresAccess: true,
            accessReason: 'user_id_missing',
          });
        }

        const accessResult = await accessControlService.canAccessLab(userId.toString(), labId);
        
        logger.info(`Access check result: hasAccess=${accessResult.hasAccess}, reason=${accessResult.reason}`);
        
        if (!accessResult.hasAccess) {
          // Return lab details but hide pages and sensitive content
          const sanitizedLab = {
            ...lab,
            pages: [], // Hide pages
          };
          return res.status(HTTP_STATUS.OK).json({ 
            data: sanitizedLab,
            requiresAccess: true,
            accessReason: accessResult.reason,
          });
        }
      }

      res.status(HTTP_STATUS.OK).json({ data: lab });
    } catch (error) {
      logger.error("Error getting lab by ID:", error);
      next(error);
    }
  },
);

/**
 * PUT /api/v1/labs/:labId
 * Update a draft lab (cannot update published labs)
 */
router.put(
  "/:labId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { labId } = req.params;
      const { name, description, labType, architectureType } = req.body;

      const updatedLab = await LabService.updateLab(labId, {
        name,
        description,
        labType,
        architectureType,
      });

      logger.info(`Lab updated: ${labId}`);
      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.LAB_UPDATED,
        data: updatedLab,
      });
    } catch (error) {
      logger.error("Error updating lab:", error);
      next(error);
    }
  },
);

/**
 * DELETE /api/v1/labs/:labId
 * Delete a draft lab (cannot delete published labs)
 * Also deletes all associated pages, questions, and diagram tests
 */
router.delete(
  "/:labId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { labId } = req.params;

      await LabService.deleteLab(labId);

      logger.info(`Lab deleted: ${labId}`);
      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.LAB_DELETED,
      });
    } catch (error) {
      logger.error("Error deleting lab:", error);
      next(error);
    }
  },
);

/**
 * POST /api/v1/labs/:labId/publish
 * Publish a lab
 * Validates that the lab has at least one valid test before publishing
 */
router.post(
  "/:labId/publish",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { labId } = req.params;

      const publishedLab = await LabService.publishLab(labId);

      logger.info(`Lab published: ${labId}`);
      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.LAB_PUBLISHED,
        data: publishedLab,
      });
    } catch (error) {
      logger.error("Error publishing lab:", error);
      next(error);
    }
  },
);

/**
 * Error handler middleware
 * Converts known error types to appropriate HTTP responses
 */
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ValidationError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: "Validation Error",
      message: err.message,
      context: err.context,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: "Not Found",
      message: err.message,
    });
  }

  if (err instanceof ConflictError) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      error: "Conflict",
      message: err.message,
    });
  }

  // Pass other errors to the global error handler
  next(err);
});

/**
 * POST /api/v1/lab/:labId/pages/:pageId/submit
 * Submit student test (questions and/or diagram)
 */
router.post(
  "/:labId/pages/:pageId/submit",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { labId, pageId } = req.params;
      const { studentId, questionAnswers, diagramAnswer, score, passed } =
        req.body;

      if (!studentId) {
        throw new ValidationError("studentId is required");
      }

      if (score === undefined || score === null) {
        throw new ValidationError("score is required");
      }

      if (passed === undefined || passed === null) {
        throw new ValidationError("passed is required");
      }

      const submission = await LabService.submitTest({
        studentId,
        labId,
        pageId,
        questionAnswers,
        diagramAnswer,
        score,
        passed,
      });

      logger.info(
        `Test submitted by student ${studentId} for lab ${labId}, page ${pageId}`,
      );
      res.status(HTTP_STATUS.CREATED).json({
        message: "Test submitted successfully",
        data: submission,
      });
    } catch (error) {
      logger.error("Error submitting test:", error);
      next(error);
    }
  },
);

/**
 * GET /api/v1/lab/:labId/pages/:pageId/submission
 * Get student's previous submission
 */
router.get(
  "/:labId/pages/:pageId/submission",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { labId, pageId } = req.params;
      const { studentId } = req.query;

      if (!studentId) {
        throw new ValidationError("studentId query parameter is required");
      }

      const submission = await LabService.getStudentSubmission(
        studentId as string,
        labId,
        pageId,
      );

      if (!submission) {
        throw new NotFoundError("No submission found for this student");
      }

      res.status(HTTP_STATUS.OK).json({
        message: "Submission retrieved successfully",
        data: submission,
      });
    } catch (error) {
      logger.error("Error fetching submission:", error);
      next(error);
    }
  },
);

/**
 * GET /api/v1/labs/:labId/progress
 * Get student's progress in a lab
 */
router.get(
  "/:labId/progress",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { labId } = req.params;
      const { studentId } = req.query;

      if (!studentId) {
        throw new ValidationError("studentId query parameter is required");
      }

      const progress = await LabService.getStudentProgress(
        studentId as string,
        labId,
      );

      res.status(HTTP_STATUS.OK).json({
        message: "Progress retrieved successfully",
        data: progress,
      });
    } catch (error) {
      logger.error("Error fetching student progress:", error);
      next(error);
    }
  },
);

export default router;
