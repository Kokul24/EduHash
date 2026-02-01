/**
 * Auditor Routes
 * Handles auditor-specific analytics
 */

const express = require('express');
const router = express.Router();
const { auditorController } = require('../controllers');
const { authenticateToken, authorizeRoles } = require('../middleware');

// Auditor dashboard stats (auditor only)
router.get('/stats',
    authenticateToken,
    authorizeRoles('auditor'),
    auditorController.getStats
);

module.exports = router;
