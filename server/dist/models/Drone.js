"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Drone = void 0;
const mongoose_1 = require("mongoose");
const droneSchema = new mongoose_1.Schema({
    droneId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    model: { type: String, required: true },
    batteryLevel: { type: Number, required: true, min: 0, max: 100, default: 100 },
    status: {
        type: String,
        required: true,
        enum: ['Available', 'Busy', 'Charging', 'Maintenance'],
        default: 'Available',
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    maxPayload: { type: Number, required: true },
    speed: { type: Number, required: true, default: 60 },
}, { timestamps: true });
exports.Drone = (0, mongoose_1.model)('Drone', droneSchema);
