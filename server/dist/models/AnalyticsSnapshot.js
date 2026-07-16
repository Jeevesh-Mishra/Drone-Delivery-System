"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsSnapshot = void 0;
const mongoose_1 = require("mongoose");
const analyticsSnapshotSchema = new mongoose_1.Schema({
    snapshotDate: { type: Date, required: true, default: Date.now },
    fleetUtilization: { type: Number, required: true },
    deliverySuccessRate: { type: Number, required: true },
    averageRouteEfficiency: { type: Number, required: true },
    averageDeliveryTime: { type: Number, required: true },
});
exports.AnalyticsSnapshot = (0, mongoose_1.model)('AnalyticsSnapshot', analyticsSnapshotSchema);
