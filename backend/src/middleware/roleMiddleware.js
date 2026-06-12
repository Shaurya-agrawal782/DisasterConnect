const AppError = require('../utils/AppError');

// Middleware to authorize specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(505, 'Authentication user context not found.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          `User role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};

module.exports = {
  authorizeRoles
};
