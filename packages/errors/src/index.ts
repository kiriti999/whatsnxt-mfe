/**
 * Error Classes for WhatsnXT Platform
 *
 * Custom implementation matching @tsed/exceptions API for CommonJS compatibility
 * @tsed/exceptions is ESM-only and cannot be used with require()
 */

import { StatusCodes, ReasonPhrases, getReasonPhrase, getStatusCode } from 'http-status-codes';

/**
 * Base Exception class matching @tsed/exceptions API
 */
export class Exception extends Error {
  public status: number;
  public origin?: Error;
  public context?: Record<string, any>;

  constructor(status: number, message: string, origin?: Error | string | Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;

    if (origin instanceof Error) {
      this.origin = origin;
      this.stack = origin.stack;
    } else if (typeof origin === 'string') {
      this.message = origin;
    } else if (typeof origin === 'object' && origin !== null) {
      this.context = origin;
    }

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// 4xx Client Errors
export class BadRequest extends Exception {
  constructor(message: string = 'Bad Request', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.BAD_REQUEST, message, origin);
  }
}

export class Unauthorized extends Exception {
  constructor(message: string = 'Unauthorized', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.UNAUTHORIZED, message, origin);
  }
}

export class PaymentRequired extends Exception {
  constructor(message: string = 'Payment Required', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.PAYMENT_REQUIRED, message, origin);
  }
}

export class Forbidden extends Exception {
  constructor(message: string = 'Forbidden', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.FORBIDDEN, message, origin);
  }
}

export class NotFound extends Exception {
  constructor(message: string = 'Not Found', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.NOT_FOUND, message, origin);
  }
}

export class MethodNotAllowed extends Exception {
  constructor(message: string = 'Method Not Allowed', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.METHOD_NOT_ALLOWED, message, origin);
  }
}

export class NotAcceptable extends Exception {
  constructor(message: string = 'Not Acceptable', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.NOT_ACCEPTABLE, message, origin);
  }
}

export class ProxyAuthentificationRequired extends Exception {
  constructor(message: string = 'Proxy Authentication Required', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.PROXY_AUTHENTICATION_REQUIRED, message, origin);
  }
}

export class RequestTimeout extends Exception {
  constructor(message: string = 'Request Timeout', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.REQUEST_TIMEOUT, message, origin);
  }
}

export class Conflict extends Exception {
  constructor(message: string = 'Conflict', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.CONFLICT, message, origin);
  }
}

export class Gone extends Exception {
  constructor(message: string = 'Gone', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.GONE, message, origin);
  }
}

export class LengthRequired extends Exception {
  constructor(message: string = 'Length Required', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.LENGTH_REQUIRED, message, origin);
  }
}

export class PreconditionFailed extends Exception {
  constructor(message: string = 'Precondition Failed', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.PRECONDITION_FAILED, message, origin);
  }
}

export class RequestEntityTooLarge extends Exception {
  constructor(message: string = 'Request Entity Too Large', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.REQUEST_TOO_LONG, message, origin);
  }
}

export class RequestURITooLong extends Exception {
  constructor(message: string = 'Request-URI Too Long', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.REQUEST_URI_TOO_LONG, message, origin);
  }
}

export class UnsupportedMediaType extends Exception {
  constructor(message: string = 'Unsupported Media Type', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.UNSUPPORTED_MEDIA_TYPE, message, origin);
  }
}

export class RequestRangeUnsatisfiable extends Exception {
  constructor(message: string = 'Requested Range Not Satisfiable', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.REQUESTED_RANGE_NOT_SATISFIABLE, message, origin);
  }
}

export class ExpectationFailed extends Exception {
  constructor(message: string = 'Expectation Failed', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.EXPECTATION_FAILED, message, origin);
  }
}

export class ImATeapot extends Exception {
  constructor(message: string = "I'm a teapot", origin?: Error | string | Record<string, any>) {
    super(StatusCodes.IM_A_TEAPOT, message, origin);
  }
}

export class UnprocessableEntity extends Exception {
  constructor(message: string = 'Unprocessable Entity', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, message, origin);
  }
}

export class UpgradeRequired extends Exception {
  constructor(message: string = 'Upgrade Required', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.UPGRADE_REQUIRED, message, origin);
  }
}

export class PreconditionRequired extends Exception {
  constructor(message: string = 'Precondition Required', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.PRECONDITION_REQUIRED, message, origin);
  }
}

export class TooManyRequests extends Exception {
  constructor(message: string = 'Too Many Requests', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.TOO_MANY_REQUESTS, message, origin);
  }
}

export class RequestHeaderFieldsTooLarge extends Exception {
  constructor(message: string = 'Request Header Fields Too Large', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE, message, origin);
  }
}

export class UnavailableForLegalReasons extends Exception {
  constructor(message: string = 'Unavailable For Legal Reasons', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.UNAVAILABLE_FOR_LEGAL_REASONS, message, origin);
  }
}

// 5xx Server Errors
export class InternalServerError extends Exception {
  constructor(message: string = 'Internal Server Error', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message, origin);
  }
}

export class NotImplemented extends Exception {
  constructor(message: string = 'Not Implemented', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.NOT_IMPLEMENTED, message, origin);
  }
}

export class BadGateway extends Exception {
  constructor(message: string = 'Bad Gateway', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.BAD_GATEWAY, message, origin);
  }
}

export class ServiceUnavailable extends Exception {
  constructor(message: string = 'Service Unavailable', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.SERVICE_UNAVAILABLE, message, origin);
  }
}

export class GatewayTimeout extends Exception {
  constructor(message: string = 'Gateway Timeout', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.GATEWAY_TIMEOUT, message, origin);
  }
}

export class VariantAlsoNegotiates extends Exception {
  constructor(message: string = 'Variant Also Negotiates', origin?: Error | string | Record<string, any>) {
    super(506, message, origin);
  }
}

export class NotExtended extends Exception {
  constructor(message: string = 'Not Extended', origin?: Error | string | Record<string, any>) {
    super(510, message, origin);
  }
}

export class NetworkAuthenticationRequired extends Exception {
  constructor(message: string = 'Network Authentication Required', origin?: Error | string | Record<string, any>) {
    super(StatusCodes.NETWORK_AUTHENTICATION_REQUIRED, message, origin);
  }
}

// Re-export HTTP status codes
export { StatusCodes, ReasonPhrases, getReasonPhrase, getStatusCode } from 'http-status-codes';

// Type aliases for backward compatibility
export { BadRequest as ValidationError };
export { BadRequest as BadRequestError };
export { NotFound as NotFoundError };
export { Unauthorized as UnauthorizedError };
export { Forbidden as ForbiddenError };
export { Conflict as ConflictError };
export { Exception as BaseError };

/**
 * Helper function to determine if an error is operational
 */
export function isOperationalError(error: Error): boolean {
  return error instanceof Exception && 'status' in error;
}
