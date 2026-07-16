"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const mongoose_1 = require("mongoose");
const reportSchema = new mongoose_1.Schema({
    reportId: { type: String, required: true, unique: true },
    reportName: { type: String, required: true },
    generatedBy: { type: String, required: true },
    generatedAt: { type: Date, required: true, default: Date.now },
    filtersApplied: {
        startDate: { type: String },
        endDate: { type: String },
        warehouseId: { type: String },
        droneId: { type: String },
    },
    data: {
        totalDeliveries: { type: Number, required: true },
        successRate: { type: Number, required: true },
        avgDeliveryTime: { type: Number, required: true },
        totalDistance: { type: Number, required: true },
        fleetUtilization: { type: Number, required: true },
    },
});
exports.Report = (0, mongoose_1.model)('Report', reportSchema);
