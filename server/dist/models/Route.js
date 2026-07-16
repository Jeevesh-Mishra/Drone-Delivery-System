"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const mongoose_1 = require("mongoose");
const routeSchema = new mongoose_1.Schema({
    routeId: { type: String, required: true, unique: true },
    warehouseId: { type: String, required: true },
    destinationIds: [{ type: String, required: true }],
    distance: { type: Number, required: true },
    estimatedTime: { type: Number, required: true },
    batteryUsage: { type: Number, required: true },
    optimizationScore: { type: Number, required: true, default: 100 },
    algorithmUsed: { type: String, required: true, enum: ['Dijkstra', 'BFS'], default: 'Dijkstra' },
    pathCoordinates: { type: [[Number]], required: true }, // Array of coordinates
}, { timestamps: true });
exports.Route = (0, mongoose_1.model)('Route', routeSchema);
