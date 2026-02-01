/**
 * Payment Routes
 * Handles payment processing and receipt verification
 */

const express = require('express');
const router = express.Router();
const { paymentController } = require('../controllers');
const { authenticateToken, authorizeRoles } = require('../middleware');

// Payment routes (student only)
router.post('/initiate',
    authenticateToken,
    authorizeRoles('student'),
    paymentController.initiatePayment
);

router.post('/verify',
    authenticateToken,
    authorizeRoles('student'),
    paymentController.verifyPayment
);

module.exports = router;
