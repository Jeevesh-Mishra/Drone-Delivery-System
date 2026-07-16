"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Destination = void 0;
const mongoose_1 = require("mongoose");
const destinationSchema = new mongoose_1.Schema({
    destinationId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    priority: { type: String, required: true, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    address: { type: String, required: true },
});
exports.Destination = (0, mongoose_1.model)('Destination', destinationSchema);
