"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deliveryController_1 = require("../controllers/deliveryController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Secure delivery management endpoints
router.use(auth_1.authenticateToken);
router.get('/', deliveryController_1.getDeliveries);
router.post('/', deliveryController_1.createDelivery);
router.post('/dispatch', deliveryController_1.dispatchQueue); // Priority Queue Heap automatic scheduler dispatch
router.get('/queue', deliveryController_1.getQueueState); // FIFO & PQ visualizer data query
router.post('/:deliveryId/assign', deliveryController_1.assignMission);
router.patch('/:deliveryId/status', deliveryController_1.updateStatus);
exports.default = router;
