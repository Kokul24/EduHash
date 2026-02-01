/**
 * EduHash Backend Server
 * 
 * A secure fee payment system with:
 * - NIST 800-63B compliant password policies
 * - AES-256 encryption for sensitive data
 * - RSA digital signatures for receipts
 * - 2FA via email OTP
 * - Role-based access control (RBAC)
 * 
 * Directory Structure:
 * - /config      - Configuration modules (DB, Email, Crypto)
 * - /controllers - Business logic handlers
 * - /middleware  - Authentication & authorization
 * - /models      - MongoDB schemas
 * - /routes      - API endpoint definitions
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import configurations
const { connectDB } = require('./config/database');
require('./config/crypto'); // Initialize crypto keys

// Import middleware
const { requestLogger } = require('./middleware');

// Import routes
const {
    authRoutes,
    adminRoutes,
    feeRoutes,
    paymentRoutes,
    auditorRoutes
} = require('./routes');

// Import controllers for public route
const { paymentController } = require('./controllers');

// Initialize Express app
const app = express();

// --- Core Middleware ---
app.use(express.json());
app.use(cors());
app.use(requestLogger);

// --- API Routes ---
// Authentication routes (public)
app.use('/api/auth', authRoutes);

// Admin routes (protected - admin only)
app.use('/api/admin', adminRoutes);

// Fee routes (protected - authenticated users)
app.use('/api/fees', feeRoutes);

// Payment routes (protected - students)
app.use('/api/pay', paymentRoutes);

// Auditor routes (protected - auditors)
app.use('/api/auditor', auditorRoutes);

// Public verification route (no auth required)
app.post('/api/verify-receipt', paymentController.verifyReceipt);

// --- Health Check ---
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    const dbConnected = await connectDB();

    if (dbConnected) {
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════╗
║       🎓 EduHash Server v2.0 - Organized          ║
╠═══════════════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}                   ║
║  📁 Structure: config | controllers | middleware  ║
║  🔐 NIST 800-63B Password Policy: 12+ chars       ║
║  🔒 AES-256 Card Encryption                       ║
║  ✍️  RSA Digital Signatures                        ║
║  📧 2FA Email OTP                                 ║
╚═══════════════════════════════════════════════════╝
            `);
        });
    } else {
        console.error('Failed to start server due to database connection issues.');
        process.exit(1);
    }
};

startServer();
