"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Protect routing APIs with JWT authentication
router.use(auth_1.authenticateToken);
router.get('/metrics', analyticsController_1.getDashboardMetrics);
router.get('/snapshots', analyticsController_1.getAnalyticsSnapshots);
router.get('/export', analyticsController_1.exportReport); // CSV / JSON download route
exports.default = router;
