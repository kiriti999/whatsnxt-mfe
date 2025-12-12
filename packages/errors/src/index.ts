/**
 * Custom Error Classes for WhatsnXT Platform
 *
 * These error classes provide structured error handling across the application.
 * All custom errors extend BaseError which includes additional context information.
 */

export class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * ValidationError - Thrown when input validation fails
 * HTTP Status: 400 Bad Request
 */
export class ValidationError extends BaseError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 400, true, context);
  }
}

/**
 * NotFoundError - Thrown when a requested resource is not found
 * HTTP Status: 404 Not Found
 */
export class NotFoundError extends BaseError {
  constructor(message: string = 'Resource not found', context?: Record<string, any>) {
    super(message, 404, true, context);
  }
}

/**
 * UnauthorizedError - Thrown when authentication is required but not provided
 * HTTP Status: 401 Unauthorized
 */
export class UnauthorizedError extends BaseError {
  constructor(message: string = 'Authentication required', context?: Record<string, any>) {
    super(message, 401, true, context);
  }
}

/**
 * ForbiddenError - Thrown when user is authenticated but lacks permissions
 * HTTP Status: 403 Forbidden
 */
export class ForbiddenError extends BaseError {
  constructor(message: string = 'Access forbidden', context?: Record<string, any>) {
    super(message, 403, true, context);
  }
}

/**
 * ConflictError - Thrown when a request conflicts with current state
 * HTTP Status: 409 Conflict
 */
export class ConflictError extends BaseError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 409, true, context);
  }
}

/**
 * InternalServerError - Thrown for unexpected server errors
 * HTTP Status: 500 Internal Server Error
 */
export class InternalServerError extends BaseError {
  constructor(message: string = 'Internal server error', context?: Record<string, any>) {
    super(message, 500, false, context);
  }
}

/**
 * BadRequestError - Thrown for malformed requests
 * HTTP Status: 400 Bad Request
 */
export class BadRequestError extends BaseError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 400, true, context);
  }
}

/**
 * Helper function to determine if an error is operational
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof BaseError) {
    return error.isOperational;
  }
  return false;
}
