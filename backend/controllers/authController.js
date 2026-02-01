/**
 * Authentication Controller
 * Handles user registration, login, OTP verification, and key exchange
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { transporter } = require('../config/email');

/**
 * Register a new user
 * DEPRECATED: Registration is now handled by Admin via createStudent/createAuditor
 */
const register = async (req, res) => {
    return res.status(403).json({
        message: 'Public registration is disabled. Please contact the Administrator.'
    });
};

/**
 * Login with email/password - initiates 2FA
 * Optimized for low latency (async email sending)
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            // Credentials valid - Initiate 2FA
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Save OTP (expires in 5 minutes)
            user.otp = otp;
            user.otpExpires = Date.now() + 5 * 60 * 1000;
            await user.save();

            // Send OTP via email (Asynchronous / Non-blocking to fix latency)
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'EduHash Security Verification Code',
                text: `Your One-Time Password (OTP) for login is: ${otp}\n\nThis code expires in 5 minutes.\nIf you did not request this, please ignore.`
            };

            // Non-blocking send
            transporter.sendMail(mailOptions)
                .then(() => console.log(`[AUTH 2FA] OTP sent to: ${user.email}`))
                .catch(err => console.error(`[AUTH ERROR] Failed to send OTP to ${user.email}:`, err));

            console.log(`[AUTH] Login initiated for: ${user.email} | OTP queued`);

            res.json({
                requireOtp: true,
                message: 'Credentials valid. Verification code sent to your email.',
                email: user.email
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('[AUTH ERROR] Login failed:', error.message);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Verify OTP and issue JWT token
 */
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Validate OTP
        if (user.otp === otp && user.otpExpires > Date.now()) {
            // Clear OTP after successful verification
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();

            // Issue JWT token
            const token = jwt.sign({
                id: user._id,
                role: user.role,
                name: user.name,
                email: user.email,
                studentId: user.studentId
            }, process.env.JWT_SECRET);

            console.log(`[AUTH] Successful login: ${user.email} (${user.role})`);

            res.json({
                token,
                role: user.role,
                name: user.name,
                id: user._id,
                studentId: user.studentId
            });
        } else {
            res.status(400).json({ message: 'Invalid or Expired OTP' });
        }
    } catch (error) {
        console.error('[AUTH ERROR] OTP verification failed:', error.message);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get public key for signature verification
 * Key exchange endpoint for external verifiers
 */
const getPublicKey = (req, res) => {
    const { PUBLIC_KEY } = require('../config/crypto');
    res.json({
        algorithm: 'RSA',
        format: 'PEM',
        publicKey: PUBLIC_KEY
    });
};

module.exports = {
    register,
    login,
    verifyOtp,
    getPublicKey
};
