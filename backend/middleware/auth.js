/**
 * Authentication & Authorization Middleware
 * Handles JWT verification and role-based access control
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT tokens
 * Extracts token from Authorization header and verifies it
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

/**
 * Middleware factory to authorize specific roles
 * @param {string[]} allowedRoles - Array of roles permitted to access the route
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access Denied: This resource requires one of the following roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};
