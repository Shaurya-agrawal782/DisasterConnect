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

  // Only allow valid roles
  if (role && !['admin', 'responder', 'citizen'].includes(role)) {
    return next(new AppError(400, 'Invalid user role. Allowed roles are: admin, responder, citizen.'));
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
    role: role || 'citizen',
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
    return next(new AppError(403, 'Account has been deactivated. Please contact support.'));
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
  const cookieOptions = {
    expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour (matches JWT expiration default)
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('token', token, cookieOptions);

  // Return user without password or token
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json(
    new ApiResponse(200, { user: userResponse }, 'Login successful')
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
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true
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
