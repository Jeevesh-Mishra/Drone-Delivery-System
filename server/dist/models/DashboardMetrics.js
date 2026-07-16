"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardMetrics = void 0;
const mongoose_1 = require("mongoose");
const dashboardMetricsSchema = new mongoose_1.Schema({
    fleetMetrics: {
        totalDrones: { type: Number, required: true },
        flyingDrones: { type: Number, required: true },
        chargingDrones: { type: Number, required: true },
        maintenanceDrones: { type: Number, required: true },
        avgBattery: { type: Number, required: true },
    },
    deliveryMetrics: {
        totalDeliveries: { type: Number, required: true },
        activeDeliveries: { type: Number, required: true },
        completedToday: { type: Number, required: true },
        delayedDeliveries: { type: Number, required: true },
        successRate: { type: Number, required: true },
    },
    routeMetrics: {
        activeWarehouses: { type: Number, required: true },
        availableDestinations: { type: Number, required: true },
        routesGenerated: { type: Number, required: true },
        avgEfficiency: { type: Number, required: true },
    },
    trendMetrics: [
        {
            date: { type: String, required: true },
            deliveriesCount: { type: Number, required: true },
            successRate: { type: Number, required: true },
            utilization: { type: Number, required: true },
            avgDeliveryTime: { type: Number, required: true },
        },
    ],
    lastUpdated: { type: Date, required: true, default: Date.now },
});
exports.DashboardMetrics = (0, mongoose_1.model)('DashboardMetrics', dashboardMetricsSchema);
