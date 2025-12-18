import { Request, Response, NextFunction } from "express";
import { getLogger } from "../../config/logger";
import { Exception, InternalServerError } from "@whatsnxt/errors";

const logger = getLogger("errorHandler");

/**
 * Global error handling middleware for Express
 * Handles @tsed/exceptions and converts other errors to InternalServerError
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Log the error with full details
  logger.error("Error caught by errorHandler:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Determine if it's a @tsed exception or an unexpected error
  let error: any;
  if (err instanceof Exception) {
    error = err;
  } else {
    // Wrap unknown errors in InternalServerError
    error = new InternalServerError("An unexpected error occurred.", err);
  }

  // @tsed exceptions use 'status' property
  const statusCode = error.status || 500;
  const errorName = error.name || "Error";
  const errorMessage = error.message || "An error occurred";

  // Build response
  const response: any = {
    name: errorName,
    message: errorMessage,
    status: statusCode,
  };

  // Include stack trace and additional details in development
  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
    response.origin = error.origin; // @tsed exceptions may have origin
  }

  res.status(statusCode).json(response);
};

// Re-export for backward compatibility
export { Exception as BaseError, InternalServerError } from "@whatsnxt/errors";
