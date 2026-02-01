/**
 * Controllers Index
 * Central export point for all controllers
 */

const authController = require('./authController');
const adminController = require('./adminController');
const feeController = require('./feeController');
const paymentController = require('./paymentController');
const auditorController = require('./auditorController');

module.exports = {
    authController,
    adminController,
    feeController,
    paymentController,
    auditorController
};
