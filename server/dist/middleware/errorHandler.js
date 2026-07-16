"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    const status = err.status || 500;
    const message = err.message || 'An unexpected error occurred on the server.';
    res.status(status).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err : {},
    });
};
exports.errorHandler = errorHandler;
