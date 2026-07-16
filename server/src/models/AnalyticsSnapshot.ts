import { Schema, model } from 'mongoose';

export interface IAnalyticsSnapshot {
  snapshotDate: Date;
  fleetUtilization: number; // in %
  deliverySuccessRate: number; // in %
  averageRouteEfficiency: number; // in %
  averageDeliveryTime: number; // in minutes
}

const analyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>({
  snapshotDate: { type: Date, required: true, default: Date.now },
  fleetUtilization: { type: Number, required: true },
  deliverySuccessRate: { type: Number, required: true },
  averageRouteEfficiency: { type: Number, required: true },
  averageDeliveryTime: { type: Number, required: true },
});

export const AnalyticsSnapshot = model<IAnalyticsSnapshot>('AnalyticsSnapshot', analyticsSnapshotSchema);
