/**
 * Middleware Index
 * Central export point for all middleware
 */

const { authenticateToken, authorizeRoles } = require('./auth');
const { requestLogger } = require('./logger');

module.exports = {
    authenticateToken,
    authorizeRoles,
    requestLogger
};
