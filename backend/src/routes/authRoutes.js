const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimiter = require('../middleware/rateLimiter');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
// Rate‑limited endpoint for initiating password reset
router.post('/forgot-password', rateLimiter, forgotPassword);
// Endpoint for completing password reset using token
router.post('/reset-password', resetPassword);

module.exports = router;
