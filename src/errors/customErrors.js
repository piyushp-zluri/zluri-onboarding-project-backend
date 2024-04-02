class AppError extends Error {
  constructor(errorCode, message, statusCode, originalError) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.originalError = originalError;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends Error {
  constructor(errorCode, message, statusCode) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
  }
}

class ExternalAPIError extends Error {
  constructor(errorCode, message, statusCode, originalMessage) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.originalMessage = originalMessage;
  }
}

module.exports = { AppError, ValidationError, ExternalAPIError };
