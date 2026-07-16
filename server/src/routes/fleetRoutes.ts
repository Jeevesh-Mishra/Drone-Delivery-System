import { Router } from 'express';
import {
  getDrones,
  getDroneById,
  createDrone,
  updateDrone,
  deleteDrone,
  executeCommand,
} from '../controllers/fleetController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect all fleet paths with JWT authentication
router.use(authenticateToken);

// CRUD routes
router.get('/', getDrones);
router.get('/:id', getDroneById);
router.post('/', createDrone);
router.put('/:id', updateDrone);
router.delete('/:id', deleteDrone);

// Drone control command overrides (recharge, abort, return home)
router.post('/:id/command', executeCommand);

export default router;
