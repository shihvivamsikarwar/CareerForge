/**
 * errorHandler
 * ────────────
 * Centralised Express error-handling middleware.
 * Must be registered AFTER all routes (4 arguments signals this to Express).
 *
 * Usage inside a route/controller:
 *   next(new Error('Something went wrong'))
 *   — or —
 *   const err = new Error('Not found'); err.statusCode = 404; next(err);
 */
const errorHandler = (err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  // Default status
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // ── Mongoose-specific errors ────────────────────────────────────────────

  // Cast error — e.g. invalid ObjectId in URL param
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Validation error — schema-level validators failed
  if (err.name === "ValidationError") {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(". ");
  }

  // Duplicate key (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    statusCode = 409;
    message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } is already in use.`;
  }

  // ── JWT errors ─────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please log in again.";
  }

  // Log unexpected server errors
  if (statusCode >= 500) {
    console.error(`❌ [${new Date().toISOString()}] ${err.stack || err}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only expose stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * notFound
 * ────────
 * Catches any request that didn't match a route and forwards a 404 error
 * to the errorHandler above.
 */
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

module.exports = { errorHandler, notFound };
