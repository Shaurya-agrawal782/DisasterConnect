const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;

  // Determine the final user role
  let finalRole = 'citizen';
  if (env.ALLOW_PUBLIC_ROLE_REGISTRATION && env.NODE_ENV === 'development') {
    if (role) {
      if (!['admin', 'responder', 'citizen'].includes(role)) {
        return next(new AppError(400, 'Invalid user role. Allowed roles are: admin, responder, citizen.'));
      }
      finalRole = role;
    }
  }

  // Prevent duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError(400, 'An account with this email address already exists.'));
  }

  // Create and save user
  const user = await User.create({
    name,
    email,
    password,
    role: finalRole,
    phone
  });

  // Exclude password from the returned document
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json(
    new ApiResponse(201, { user: userResponse }, 'User registered successfully')
  );
});

// @desc    Login user & get token (via cookie)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError(400, 'Please provide both email and password.'));
  }

  // Find user and explicitly select password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError(401, 'Invalid email or password.'));
  }

  // Reject inactive users
  if (!user.isActive) {
    return next(new AppError(403, 'This account has been deactivated. Please contact the command admin.'));
  }

  // Verify candidate password match
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError(401, 'Invalid email or password.'));
  }

  // Generate JWT token
  const token = generateToken(user._id, user.role);

  // Record login timestamp
  user.lastLogin = new Date();
  await user.save();

  // Set HTTP-only Cookie
  const isProd = env.NODE_ENV === 'production';
  const cookieOptions = {
    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  // Return user without password. Also return token so frontend can use
  // it as a Bearer fallback in cross-origin deployments (e.g. Vercel + Render)
  // where third-party HttpOnly cookies may be blocked by the browser.
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json(
    new ApiResponse(200, { user: userResponse, token }, 'Login successful')
  );
});

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  // req.user is set by authMiddleware
  res.status(200).json(
    new ApiResponse(200, { user: req.user }, 'Current user profile retrieved successfully')
  );
});

// @desc    Log user out (clears authentication cookie)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res, next) => {
  // Clear the cookie from client browser
  const isProd = env.NODE_ENV === 'production';
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Logged out successfully')
  );
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser
};
