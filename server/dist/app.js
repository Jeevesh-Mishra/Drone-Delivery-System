"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
// Import routes (will be created shortly)
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const fleetRoutes_1 = __importDefault(require("./routes/fleetRoutes"));
const routeRoutes_1 = __importDefault(require("./routes/routeRoutes"));
const deliveryRoutes_1 = __importDefault(require("./routes/deliveryRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Drone Delivery Navigation System API is online and healthy.',
        timestamp: new Date()
    });
});
// Routes API routing
app.use('/api/auth', authRoutes_1.default);
app.use('/api/fleet', fleetRoutes_1.default);
app.use('/api/routes', routeRoutes_1.default);
app.use('/api/deliveries', deliveryRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
