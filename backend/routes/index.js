/**
 * Routes Index
 * Central export point for all route modules
 */

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const feeRoutes = require('./feeRoutes');
const paymentRoutes = require('./paymentRoutes');
const auditorRoutes = require('./auditorRoutes');

module.exports = {
    authRoutes,
    adminRoutes,
    feeRoutes,
    paymentRoutes,
    auditorRoutes
};
