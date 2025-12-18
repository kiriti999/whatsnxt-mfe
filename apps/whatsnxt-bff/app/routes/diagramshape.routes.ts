import { Router, Request, Response, NextFunction } from "express";
import { DiagramShapeService } from "../services/diagramshape.service";
import { getLogger } from "../../config/logger";

const router = Router();
const diagramShapeService = new DiagramShapeService();
const logger = getLogger("DiagramShapeRoutes");

// GET /api/v1/diagram-shapes - Get available diagram shapes
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { architectureType } = req.query;
    const shapes = await diagramShapeService.getAllDiagramShapes(
      architectureType as string,
    );
    res.status(200).json(shapes);
  } catch (error) {
    logger.error("Error getting diagram shapes:", error);
    next(error);
  }
});

export default router;
