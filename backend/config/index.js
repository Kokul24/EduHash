/**
 * Config Index
 * Central export point for all configuration modules
 */

const { transporter } = require('./email');
const { connectDB } = require('./database');
const cryptoConfig = require('./crypto');

module.exports = {
    transporter,
    connectDB,
    ...cryptoConfig
};
