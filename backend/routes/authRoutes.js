/**
 * Authentication Routes
 * Handles user registration, login, OTP verification, and key exchange
 */

const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.get('/public-key', authController.getPublicKey);

module.exports = router;
