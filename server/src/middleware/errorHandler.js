const { AppError } = require("../utils/errors");
const config = require("../config");

/**
 * Handle Mongoose CastError (invalid ObjectId)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose Duplicate Key Error
 */
const handleDuplicateError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `Duplicate value for field: ${field}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose Validation Error
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => e.message);
  const message = `Validation failed: ${errors.join(", ")}`;
  return new AppError(message, 400);
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming error: don't leak details
    console.error("ERROR 💥:", err);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Something went wrong",
    });
  }
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (config.nodeEnv === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === "CastError") error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateError(err);
    if (err.name === "ValidationError") error = handleValidationError(err);

    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
