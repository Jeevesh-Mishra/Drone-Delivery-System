import { Router } from 'express';
import {
  getDeliveries,
  createDelivery,
  assignMission,
  updateStatus,
  getQueueState,
  dispatchQueue,
} from '../controllers/deliveryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Secure delivery management endpoints
router.use(authenticateToken);

router.get('/', getDeliveries);
router.post('/', createDelivery);
router.post('/dispatch', dispatchQueue); // Priority Queue Heap automatic scheduler dispatch
router.get('/queue', getQueueState); // FIFO & PQ visualizer data query
router.post('/:deliveryId/assign', assignMission);
router.patch('/:deliveryId/status', updateStatus);

export default router;
