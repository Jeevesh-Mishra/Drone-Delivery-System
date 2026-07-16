import { Schema, model } from 'mongoose';

export interface IDrone {
  droneId: string;
  name: string;
  model: string;
  batteryLevel: number;
  status: 'Available' | 'Busy' | 'Charging' | 'Maintenance';
  latitude: number;
  longitude: number;
  maxPayload: number; // in kg
  speed: number; // in km/h
  createdAt?: Date;
  updatedAt?: Date;
}

const droneSchema = new Schema<IDrone>(
  {
    droneId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, default: 'Unnamed Drone' },
    model: { type: String, required: true, default: 'Falcon X1' },
    batteryLevel: { type: Number, required: true, min: 0, max: 100, default: 100 },
    status: {
      type: String,
      required: true,
      enum: ['Available', 'Busy', 'Charging', 'Maintenance'],
      default: 'Available',
    },
    latitude: { type: Number, required: true, default: 37.7749 },
    longitude: { type: Number, required: true, default: -122.4194 },
    maxPayload: { type: Number, required: true, default: 5 },
    speed: { type: Number, required: true, default: 60 },
  },
  { timestamps: true }
);

export const Drone = model<IDrone>('Drone', droneSchema);
