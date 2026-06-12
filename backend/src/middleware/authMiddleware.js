const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check Authorization header for Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check cookies for token if header is not present
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token exists, reject request
  if (!token || token === 'none') {
    return next(new AppError(401, 'Access denied. Authentication token is missing.'));
  }

  try {
    // Verify token signature
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Fetch user and check if account exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError(401, 'User account not found. Please log in again.'));
    }

    // Check if account is still active
    if (!user.isActive) {
      return next(new AppError(403, 'Account is inactive. Access forbidden.'));
    }

    // Attach active user object to request
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError(401, 'Invalid or expired authentication token. Please log in again.'));
  }
});

module.exports = {
  protect
};
