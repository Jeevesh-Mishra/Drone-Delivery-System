"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Warehouse = void 0;
const mongoose_1 = require("mongoose");
const warehouseSchema = new mongoose_1.Schema({
    warehouseId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true },
});
exports.Warehouse = (0, mongoose_1.model)('Warehouse', warehouseSchema);
