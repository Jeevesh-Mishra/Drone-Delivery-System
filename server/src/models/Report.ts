import { Schema, model } from 'mongoose';

export interface IReport {
  reportId: string;
  reportName: string;
  generatedBy: string;
  generatedAt: Date;
  filtersApplied: {
    startDate?: string;
    endDate?: string;
    warehouseId?: string;
    droneId?: string;
  };
  data: {
    totalDeliveries: number;
    successRate: number;
    avgDeliveryTime: number;
    totalDistance: number;
    fleetUtilization: number;
  };
}

const reportSchema = new Schema<IReport>({
  reportId: { type: String, required: true, unique: true },
  reportName: { type: String, required: true },
  generatedBy: { type: String, required: true },
  generatedAt: { type: Date, required: true, default: Date.now },
  filtersApplied: {
    startDate: { type: String },
    endDate: { type: String },
    warehouseId: { type: String },
    droneId: { type: String },
  },
  data: {
    totalDeliveries: { type: Number, required: true },
    successRate: { type: Number, required: true },
    avgDeliveryTime: { type: Number, required: true },
    totalDistance: { type: Number, required: true },
    fleetUtilization: { type: Number, required: true },
  },
});

export const Report = model<IReport>('Report', reportSchema);
