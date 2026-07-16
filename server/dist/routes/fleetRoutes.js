"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fleetController_1 = require("../controllers/fleetController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Protect all fleet paths with JWT authentication
router.use(auth_1.authenticateToken);
// CRUD routes
router.get('/', fleetController_1.getDrones);
router.get('/:id', fleetController_1.getDroneById);
router.post('/', fleetController_1.createDrone);
router.put('/:id', fleetController_1.updateDrone);
router.delete('/:id', fleetController_1.deleteDrone);
// Drone control command overrides (recharge, abort, return home)
router.post('/:id/command', fleetController_1.executeCommand);
exports.default = router;
