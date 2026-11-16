'use strict';

const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Access denied. No token provided.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, name }
    next();
  } catch (err) {
    next(err); // forwarded to errorHandler (handles JWT errors)
  }
};

module.exports = auth;
