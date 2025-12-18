import { Router, Request, Response, NextFunction } from "express";
import { LabPageService } from "../services/lab";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "@whatsnxt/errors";
import { SUCCESS_MESSAGES, HTTP_STATUS } from "@whatsnxt/constants";
import { getLogger } from "../../config/logger";

const router = Router();
const logger = getLogger("LabPageRoutes");

/**
 * Lab Page Routes for Lab Diagram Tests Feature
 *
 * Handles all HTTP endpoints for lab page management.
 * Routes:
 * - POST /api/v1/labs/:labId/pages - Create new page
 * - GET /api/v1/labs/:labId/pages - Get all pages for a lab
 * - GET /api/v1/labs/:labId/pages/:pageId - Get specific page
 * - PUT /api/v1/labs/:labId/pages/:pageId - Update page
 * - DELETE /api/v1/labs/:labId/pages/:pageId - Delete page
 * - POST /api/v1/labs/:labId/pages/:pageId/question - Save question
 * - POST /api/v1/labs/:labId/pages/:pageId/diagram-test - Save diagram test
 * - DELETE /api/v1/labs/:labId/pages/:pageId/question - Delete question
 * - DELETE /api/v1/labs/:labId/pages/:pageId/diagram-test - Delete diagram test
 */

/**
 * POST /api/v1/labs/:labId/pages
 * Create a new lab page
 */
router.post(
  "/:labId/pages",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { labId } = req.params;
      const { pageNumber, hasQuestion, hasDiagramTest } = req.body;

      const page = await LabPageService.createLabPage({
        labId,
        pageNumber:
          pageNumber || (await LabPageService.getNextPageNumber(labId)),
        hasQuestion: hasQuestion || false,
        hasDiagramTest: hasDiagramTest || false,
      });

      logger.info(`Lab page created: ${page.id}`);
      res.status(HTTP_STATUS.CREATED).json({
        message: SUCCESS_MESSAGES.PAGE_SAVED,
        data: page,
      });
    } catch (error) {
      logger.error("Error creating lab page:", error);
      next(error);
    }
  },
);

/**
 * GET /api/v1/labs/:labId/pages
 * Get all pages for a lab
 */
router.get(
  "/:labId/pages",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { labId } = req.params;

      const pages = await LabPageService.getPagesByLabId(labId);

      res.status(HTTP_STATUS.OK).json({ data: pages });
    } catch (error) {
      logger.error("Error getting lab pages:", error);
      next(error);
    }
  },
);

/**
 * GET /api/v1/labs/:labId/pages/:pageId
 * Get a specific lab page with populated question and diagram test
 */
router.get(
  "/:labId/pages/:pageId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pageId } = req.params;

      const page = await LabPageService.getLabPageWithTests(pageId);

      res.status(HTTP_STATUS.OK).json({ data: page });
    } catch (error) {
      logger.error("Error getting lab page:", error);
      next(error);
    }
  },
);

/**
 * PUT /api/v1/labs/:labId/pages/:pageId
 * Update a lab page (only for draft labs)
 */
router.put(
  "/:labId/pages/:pageId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pageId } = req.params;
      const { hasQuestion, hasDiagramTest } = req.body;

      const updatedPage = await LabPageService.updateLabPage(pageId, {
        hasQuestion,
        hasDiagramTest,
      });

      logger.info(`Lab page updated: ${pageId}`);
      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.PAGE_SAVED,
        data: updatedPage,
      });
    } catch (error) {
      logger.error("Error updating lab page:", error);
      next(error);
    }
  },
);

/**
 * DELETE /api/v1/labs/:labId/pages/:pageId
 * Delete a lab page (only for draft labs)
 * Also deletes associated question and diagram test
 */
router.delete(
  "/:labId/pages/:pageId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pageId } = req.params;

      await LabPageService.deleteLabPage(pageId);

      logger.info(`Lab page deleted: ${pageId}`);
      res.status(HTTP_STATUS.OK).json({
        message: "Lab page deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting lab page:", error);
      next(error);
    }
  },
);

/**
 * POST /api/v1/labs/:labId/pages/:pageId/question
 * Create or update a question for a lab page
 */
router.post(
  "/:labId/pages/:pageId/question",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pageId } = req.params;
      const { type, questionText, options, correctAnswer, questionId } =
        req.body;

      logger.info(
        `Saving question for page: ${pageId}, questionId: ${questionId || "NEW"}`,
      );
      logger.info(
        `Question data: type=${type}, textLength=${questionText?.length}, optionsCount=${options?.length}`,
      );

      const question = await LabPageService.saveQuestion({
        labPageId: pageId,
        type,
        questionText,
        options,
        correctAnswer,
        questionId,
      });

      logger.info(
        `Question saved successfully for page: ${pageId}, questionId: ${question.id}`,
      );
      res.status(HTTP_STATUS.OK).json({
        message: "Question saved successfully",
        data: question,
      });
    } catch (error) {
      logger.error("Error saving question:", error);
      logger.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      next(error);
    }
  },
);

/**
 * POST /api/v1/labs/:labId/pages/:pageId/diagram-test
 * Create or update a diagram test for a lab page
 */
router.post(
  "/:labId/pages/:pageId/diagram-test",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pageId } = req.params;
      const { prompt, expectedDiagramState, architectureType } = req.body;

      const diagramTest = await LabPageService.saveDiagramTest({
        labPageId: pageId,
        prompt,
        expectedDiagramState,
        architectureType,
      });

      logger.info(`Diagram test saved for page: ${pageId}`);
      res.status(HTTP_STATUS.OK).json({
        message: "Diagram test saved successfully",
        data: diagramTest,
      });
    } catch (error) {
      logger.error("Error saving diagram test:", error);
      next(error);
    }
  },
);

/**
 * DELETE /api/v1/labs/:labId/pages/:pageId/question/:questionId
 * Delete a specific question from a lab page
 */
router.delete(
  "/:labId/pages/:pageId/question/:questionId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pageId, questionId } = req.params;

      await LabPageService.deleteQuestion(pageId, questionId);

      logger.info(`Question deleted for page: ${pageId}`);
      res.status(HTTP_STATUS.OK).json({
        message: "Question deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting question:", error);
      next(error);
    }
  },
);

/**
 * DELETE /api/v1/labs/:labId/pages/:pageId/question
 * Delete all questions from a lab page
 */
router.delete(
  "/:labId/pages/:pageId/question",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pageId } = req.params;

      await LabPageService.deleteQuestion(pageId);

      logger.info(`All questions deleted for page: ${pageId}`);
      res.status(HTTP_STATUS.OK).json({
        message: "All questions deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting questions:", error);
      next(error);
    }
  },
);

/**
 * DELETE /api/v1/labs/:labId/pages/:pageId/diagram-test
 * Delete a diagram test from a lab page
 */
router.delete(
  "/:labId/pages/:pageId/diagram-test",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pageId } = req.params;

      await LabPageService.deleteDiagramTest(pageId);

      logger.info(`Diagram test deleted for page: ${pageId}`);
      res.status(HTTP_STATUS.OK).json({
        message: "Diagram test deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting diagram test:", error);
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

export default router;
