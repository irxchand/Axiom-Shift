// Canonical error envelope shape. Every error response, everywhere, uses this.
export interface ErrorEnvelope {
  requestId: string;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "IDEMPOTENCY_KEY_REQUIRED"
  | "IDEMPOTENCY_KEY_REUSED"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  IDEMPOTENCY_KEY_REQUIRED: 400,
  IDEMPOTENCY_KEY_REUSED: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: unknown[];

  constructor(code: ErrorCode, message: string, details?: unknown[]) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = STATUS_BY_CODE[code];
    this.details = details;
  }

  static validation(message: string, details?: unknown[]) {
    return new AppError("VALIDATION_ERROR", message, details);
  }
  static unauthorized(message = "Authentication is required.") {
    return new AppError("UNAUTHORIZED", message);
  }
  static forbidden(message = "You do not have access to this resource.") {
    return new AppError("FORBIDDEN", message);
  }
  static notFound(message = "Resource not found.") {
    return new AppError("NOT_FOUND", message);
  }
  static conflict(message: string, details?: unknown[]) {
    return new AppError("CONFLICT", message, details);
  }
}
