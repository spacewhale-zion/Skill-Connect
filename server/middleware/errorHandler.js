/**
 * @desc    Handles requests to routes that do not exist (404 Not Found).
 * This should be placed after all other routes.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * @desc    A centralized error handler for the application.
 * Catches all errors passed by `next(error)` and sends a formatted JSON response.
 */
const errorHandler = (err, req, res, next) => {
  // Sometimes an error might come with a successful status code, so we adjust it
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    // Show the error stack trace only if we are not in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler };