import { Schema, model } from 'mongoose';

export interface IRoute {
  routeId: string;
  warehouseId: string;
  destinationIds: string[];
  distance: number; // in km
  estimatedTime: number; // in minutes
  batteryUsage: number; // in percentage
  optimizationScore: number; // 0 to 100
  algorithmUsed: 'Dijkstra' | 'BFS';
  pathCoordinates: [number, number][]; // [[lng, lat], [lng, lat], ...] for map drawing
  createdAt?: Date;
  updatedAt?: Date;
}

const routeSchema = new Schema<IRoute>(
  {
    routeId: { type: String, required: true, unique: true },
    warehouseId: { type: String, required: true },
    destinationIds: [{ type: String, required: true }],
    distance: { type: Number, required: true },
    estimatedTime: { type: Number, required: true },
    batteryUsage: { type: Number, required: true },
    optimizationScore: { type: Number, required: true, default: 100 },
    algorithmUsed: { type: String, required: true, enum: ['Dijkstra', 'BFS'], default: 'Dijkstra' },
    pathCoordinates: { type: [[Number]], required: true }, // Array of coordinates
  },
  { timestamps: true }
);

export const Route = model<IRoute>('Route', routeSchema);
