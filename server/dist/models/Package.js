"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Package = void 0;
const mongoose_1 = require("mongoose");
const packageSchema = new mongoose_1.Schema({
    packageId: { type: String, required: true, unique: true },
    deliveryId: { type: String, required: true },
    weight: { type: Number, required: true },
    type: { type: String, required: true },
    fragile: { type: Boolean, required: true, default: false },
});
exports.Package = (0, mongoose_1.model)('Package', packageSchema);
