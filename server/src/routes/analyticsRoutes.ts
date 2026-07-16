import { Router } from 'express';
import {
  getDashboardMetrics,
  getAnalyticsSnapshots,
  exportReport,
} from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect routing APIs with JWT authentication
router.use(authenticateToken);

router.get('/metrics', getDashboardMetrics);
router.get('/snapshots', getAnalyticsSnapshots);
router.get('/export', exportReport); // CSV / JSON download route

export default router;
