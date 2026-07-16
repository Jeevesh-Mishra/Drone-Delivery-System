import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'Admin' | 'Fleet Manager' | 'Logistics Operator';
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // In development mode, ALWAYS bypass auth — even if a token is present.
  // This prevents stale/expired tokens in the browser from causing 403 errors.
  if (process.env.NODE_ENV === 'development') {
    req.user = { id: 'dev-admin', email: 'admin@dev.local', role: 'Admin' };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is required to access this resource.',
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'drone-delivery-secret-key-12345';
    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email: string;
      role: 'Admin' | 'Fleet Manager' | 'Logistics Operator';
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Your authentication token is invalid or has expired.',
    });
  }
};
