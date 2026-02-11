const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        statusCode = 409;
        message = 'Resource already exists';
        break;
      case '23503': // foreign_key_violation
        statusCode = 400;
        message = 'Invalid reference to related resource';
        break;
      case '23502': // not_null_violation
        statusCode = 400;
        message = 'Required field is missing';
        break;
      case '22P02': // invalid_text_representation
        statusCode = 400;
        message = 'Invalid data format';
        break;
      default:
        message = 'Database error occurred';
    }
  }

  // SOAP errors
  if (err.message && err.message.includes('SOAP')) {
    statusCode = 502;
    message = 'External service error';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
