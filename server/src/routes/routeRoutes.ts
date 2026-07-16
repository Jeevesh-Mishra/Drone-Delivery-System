import { Router } from 'express';
import {
  getWarehouses,
  getDestinations,
  getNoFlyZones,
  optimizeRoute,
} from '../controllers/routeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect routing APIs with JWT authentication
router.use(authenticateToken);

router.get('/warehouses', getWarehouses);
router.get('/destinations', getDestinations);
router.get('/noflyzones', getNoFlyZones);

// Graph Dijkstra optimizer trigger endpoint
router.post('/optimize', optimizeRoute);

export default router;
