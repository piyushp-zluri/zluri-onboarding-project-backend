const {
  AppError,
  ValidationError,
  ExternalAPIError,
} = require("../errors/customErrors");

function errorHandler(error, req, res, next) {
  if (error instanceof AppError) {
    console.error(error.originalError.stack);
    return res.status(error.statusCode).json({
      errorCode: error.errorCode,
      message: error.message,
    });
  }

  if (error instanceof ValidationError) {
    return res.status(error.statusCode).json({
      errorCode: error.errorCode,
      message: error.message,
    });
  }

  if (error instanceof ExternalAPIError) {
    console.error(error.originalMessage.stack);
    return res.status(error.statusCode).json({
      errorCode: error.errorCode,
      message: error.message,
    });
  }

  console.error(error);
  return res.status(500).json({ error: "Something went wrong" });
}

module.exports = errorHandler;
