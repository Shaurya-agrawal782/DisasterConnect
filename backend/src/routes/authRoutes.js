const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected auth routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logoutUser);

module.exports = router;
