/**
 * Fee Routes
 * Handles fee-related operations
 */

const express = require('express');
const router = express.Router();
const { feeController } = require('../controllers');
const { authenticateToken, authorizeRoles } = require('../middleware');

// Get all fees (authenticated users)
router.get('/', authenticateToken, feeController.getAllFees);

// Create fee (admin only)
router.post('/',
    authenticateToken,
    authorizeRoles('admin'),
    feeController.createFee
);

module.exports = router;
