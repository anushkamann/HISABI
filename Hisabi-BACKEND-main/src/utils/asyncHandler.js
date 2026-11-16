'use strict';

/**
 * Wraps an async route handler and forwards any thrown error
 * to Express's next() so the centralized errorHandler picks it up.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
