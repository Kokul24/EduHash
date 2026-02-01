/**
 * Admin Controller
 * Handles admin-specific operations like creating auditors
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { transporter } = require('../config/email');

/**
 * Generate NIST 800-63B compliant password (12 characters minimum)
 * Uses cryptographically secure random bytes
 * @returns {string} A 12+ character password with mixed case, numbers, and symbols
 */
const generateNISTCompliantPassword = () => {
    // Generate 9 random bytes = 18 hex chars, ensuring we exceed 12 char minimum
    const randomPart = crypto.randomBytes(9).toString('hex'); // 18 chars

    // Add complexity characters to ensure password policy compliance
    // Final length: 18 + 4 = 22 characters (well above NIST 12 char minimum)
    const complexityChars = '!Aa1';

    return randomPart + complexityChars;
};

/**
 * Create a new auditor account
 * - Generates NIST-compliant password (12+ characters)
 * - Hashes with bcrypt
 * - Emails credentials to auditor (optimized: async send)
 */
const createAuditor = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Validate input
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Check for existing user
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Generate NIST 800-63B compliant password (12+ characters)
        const generatedPassword = generateNISTCompliantPassword();

        console.log(`[ADMIN] Generated ${generatedPassword.length}-character NIST-compliant password for auditor`);

        // Hash password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(generatedPassword, salt);

        // Create auditor account
        const newAuditor = new User({
            name,
            email,
            password: hashedPassword,
            role: 'auditor'
        });
        await newAuditor.save();

        // Email credentials to auditor
        // OPTIMIZATION: Send email asynchronously to fix latency
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'EduHash Auditor Access Credentials',
            text: `Welcome to EduHash Audit Team.\n\nYour account has been created by the Administrator.\n\nLogin Credentials:\nEmail: ${email}\nPassword: ${generatedPassword}\n\nThis password is ${generatedPassword.length} characters long, meeting NIST 800-63B guidelines.\n\nPlease login and change your password immediately.`
        };

        // Don't await the email to reduce latency for the admin UI
        transporter.sendMail(mailOptions)
            .then(() => console.log(`[EMAIL] Credentials sent to auditor: ${email}`))
            .catch(err => console.error(`[EMAIL ERROR] Failed to send auditor creds to ${email}:`, err));

        console.log(`[ADMIN] Created Auditor: ${email} | Credentials queued for email`);

        res.status(201).json({
            message: `Auditor ${name} created successfully. Credentials are being sent to ${email}.`,
            passwordLength: generatedPassword.length // For verification (don't include actual password)
        });

    } catch (error) {
        console.error('[ADMIN ERROR] Create Auditor failed:', error.message);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Create a new Student (Admin only)
 * - Replaces public registration
 * - Generates random password
 * - Emails credentials
 */
const createStudent = async (req, res) => {
    try {
        const { name, email, studentId } = req.body;

        if (!name || !email || !studentId) {
            return res.status(400).json({ message: 'Name, Email, and Student ID are required' });
        }

        // Check if user exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Generate random secure password (14 chars)
        const generatedPassword = crypto.randomBytes(7).toString('hex');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(generatedPassword, salt);

        // Create student account
        const newStudent = new User({
            name,
            email,
            password: hashedPassword,
            role: 'student',
            studentId,
            is2FAEnabled: true
        });
        await newStudent.save();

        // Email credentials
        // OPTIMIZATION: Send email asynchronously
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'EduHash Student Portal Access',
            text: `Welcome to EduHash Student Portal.\n\nYour account has been created by the Administrator.\n\nLogin Credentials:\nEmail: ${email}\nPassword: ${generatedPassword}\n\nPlease login to view and pay your fees.`
        };

        transporter.sendMail(mailOptions)
            .then(() => console.log(`[EMAIL] Credentials sent to student: ${email}`))
            .catch(err => console.error(`[EMAIL ERROR] Failed to send student creds to ${email}:`, err));

        console.log(`[ADMIN] Created Student: ${email} | Credentials queued for email`);

        res.status(201).json({
            message: `Student created successfully. Credentials are being sent to ${email}.`,
            user: { id: newStudent._id, name: newStudent.name, email: newStudent.email, studentId: newStudent.studentId }
        });

    } catch (error) {
        console.error('[ADMIN ERROR] Create student failed:', error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createAuditor,
    createStudent,
    generateNISTCompliantPassword
};
