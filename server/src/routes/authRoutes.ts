import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);

// Protected profile endpoint
router.get('/me', authenticateToken, getProfile);

export default router;
