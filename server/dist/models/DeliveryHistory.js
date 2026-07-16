"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryHistory = void 0;
const mongoose_1 = require("mongoose");
const deliveryHistorySchema = new mongoose_1.Schema({
    deliveryId: { type: String, required: true },
    status: { type: String, required: true, enum: ['Pending', 'Assigned', 'In Transit', 'Delivered', 'Cancelled'] },
    updatedBy: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    remarks: { type: String, required: true },
});
exports.DeliveryHistory = (0, mongoose_1.model)('DeliveryHistory', deliveryHistorySchema);
