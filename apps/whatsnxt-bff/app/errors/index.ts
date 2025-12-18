/**
 * Custom Error Classes
 *
 * Legacy error classes for backward compatibility.
 * New code should use @whatsnxt/errors package.
 */

export class ValidationError extends Error {
  public readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;

    // Capture stack trace (V8 specific)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

export class UploadError extends Error {
  public readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = "UploadError";
    this.statusCode = 500;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UploadError);
    }
  }
}
