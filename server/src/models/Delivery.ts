import { Schema, model } from 'mongoose';

export interface IDelivery {
  deliveryId: string; // e.g. PKG-2031
  customerName: string;
  warehouseId: string;
  destinationId: string;
  assignedDrone: string | null; // DroneId references
  assignedRoute: string | null; // RouteId references
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Assigned' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  estimatedArrival: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const deliverySchema = new Schema<IDelivery>(
  {
    deliveryId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    warehouseId: { type: String, required: true },
    destinationId: { type: String, required: true },
    assignedDrone: { type: String, default: null },
    assignedRoute: { type: String, default: null },
    priority: { type: String, required: true, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Assigned', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    estimatedArrival: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Delivery = model<IDelivery>('Delivery', deliverySchema);
