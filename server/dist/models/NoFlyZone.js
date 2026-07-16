"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoFlyZone = void 0;
const mongoose_1 = require("mongoose");
const noFlyZoneSchema = new mongoose_1.Schema({
    zoneName: { type: String, required: true, unique: true },
    polygonCoordinates: { type: [[Number]], required: true },
    restrictionLevel: { type: String, required: true, enum: ['Restricted', 'Warning'], default: 'Restricted' },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
});
exports.NoFlyZone = (0, mongoose_1.model)('NoFlyZone', noFlyZoneSchema);
