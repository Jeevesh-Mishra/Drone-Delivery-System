"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delivery = void 0;
const mongoose_1 = require("mongoose");
const deliverySchema = new mongoose_1.Schema({
    deliveryId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    warehouseId: { type: String, required: true },
    destinationId: { type: String, required: true },
    assignedDrone: { type: String, default: null },
    assignedRoute: { type: String, default: null },
    priority: { type: String, required: true, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Assigned', 'In Transit', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    estimatedArrival: { type: Date, default: null },
}, { timestamps: true });
exports.Delivery = (0, mongoose_1.model)('Delivery', deliverySchema);
