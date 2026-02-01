/**
 * Admin Routes
 * Handles admin-specific operations
 */

const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers');
const { authenticateToken, authorizeRoles } = require('../middleware');

// Protected admin routes
router.post('/create-auditor',
    authenticateToken,
    authorizeRoles('admin'),
    adminController.createAuditor
);

router.post('/create-student',
    authenticateToken,
    authorizeRoles('admin'),
    adminController.createStudent
);

module.exports = router;
