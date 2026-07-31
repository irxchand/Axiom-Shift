const STATUS_BY_CODE = {
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
    code;
    statusCode;
    details;
    constructor(code, message, details) {
        super(message);
        this.name = "AppError";
        this.code = code;
        this.statusCode = STATUS_BY_CODE[code];
        this.details = details;
    }
    static validation(message, details) {
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
    static conflict(message, details) {
        return new AppError("CONFLICT", message, details);
    }
}
//# sourceMappingURL=errors.js.map