"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routeController_1 = require("../controllers/routeController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Protect routing APIs with JWT authentication
router.use(auth_1.authenticateToken);
router.get('/warehouses', routeController_1.getWarehouses);
router.get('/destinations', routeController_1.getDestinations);
router.get('/noflyzones', routeController_1.getNoFlyZones);
// Graph Dijkstra optimizer trigger endpoint
router.post('/optimize', routeController_1.optimizeRoute);
exports.default = router;
