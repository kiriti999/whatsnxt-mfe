import { Application, Request, Response, NextFunction } from "express";
// @ts-ignore
import { printAvailableRoutes } from "../app/utils/routeHelper";
import { getLogger } from "./logger";
import { errorHandler } from "../app/errors/errorHandler";
import diagramShapeRoutes from "../app/routes/diagramshape.routes";
import labRoutes from "../app/routes/lab.routes";
import labPageRoutes from "../app/routes/labpage.routes";
import labPricingRoutes from "../app/routes/labPricing.routes";
import labPurchaseRoutes from "../app/routes/labPurchase.routes";
import paymentCallbackRoutes from "../app/routes/paymentCallback.routes";

const logger = getLogger("routes");

// Legacy routes import
import commonRouter from "../app/common/routes/v1";
import courseRouter from "../app/routes/course/v1";
import articleRouter from "../app/routes/article/v1";
import googleRouter from "../app/routes/google/v1";

export function setupRoutes(app: Application): void {
  logger.info("");
  logger.info(" setupRoutes :: setup routes...");
  logger.info("");

  app.use("/health", (req: Request, res: Response) => {
    res.status(200).json({
      status: "OK",
      service: "Whatsnxt API Gateway",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API routes
  app.use("/api/v1/article", articleRouter);
  app.use("/api/v1/common", commonRouter);
  app.use("/api/v1/social", googleRouter);
  app.use("/api/v1/course", courseRouter);

  // New TypeScript routes
  app.use("/api/v1/labs", labRoutes); // Lab management
  app.use("/api/v1/labs", labPageRoutes); // Lab page management (nested under labs)
  app.use("/api/v1/labs", labPricingRoutes); // Lab pricing management
  app.use("/api/v1/labs", labPurchaseRoutes); // Lab purchase management
  app.use("/api/v1/diagram-shapes", diagramShapeRoutes);
  app.use("/api/v1/webhooks", paymentCallbackRoutes); // Payment webhooks

  // 404 handler - must come before error handler
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
      error: "Not Found",
      message: `Route ${req.originalUrl} not found`,
    });
  });

  // Error handling middleware - must be last
  app.use(errorHandler);

  // printAvailableRoutes(app);
}
