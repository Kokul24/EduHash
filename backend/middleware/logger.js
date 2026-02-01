/**
 * Request Logger Middleware
 * Logs all HTTP requests with timing information
 */

const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusEmoji = res.statusCode >= 400 ? '❌' : '✓';
        console.log(`${statusEmoji} ${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`);
    });

    next();
};

module.exports = {
    requestLogger
};
