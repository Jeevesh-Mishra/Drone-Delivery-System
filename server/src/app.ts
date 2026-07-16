import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

// Import routes (will be created shortly)
import authRoutes from './routes/authRoutes';
import fleetRoutes from './routes/fleetRoutes';
import routeRoutes from './routes/routeRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Drone Delivery Navigation System API is online and healthy.',
    timestamp: new Date()
  });
});

// Routes API routing
app.use('/api/auth', authRoutes);
app.use('/api/fleet/drones', fleetRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
