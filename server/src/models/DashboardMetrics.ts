import { Schema, model } from 'mongoose';

export interface IDashboardMetrics {
  fleetMetrics: {
    totalDrones: number;
    flyingDrones: number;
    chargingDrones: number;
    maintenanceDrones: number;
    avgBattery: number;
  };
  deliveryMetrics: {
    totalDeliveries: number;
    activeDeliveries: number;
    completedToday: number;
    delayedDeliveries: number;
    successRate: number;
  };
  routeMetrics: {
    activeWarehouses: number;
    availableDestinations: number;
    routesGenerated: number;
    avgEfficiency: number;
  };
  trendMetrics: Array<{
    date: string;
    deliveriesCount: number;
    successRate: number;
    utilization: number;
    avgDeliveryTime: number;
  }>;
  lastUpdated: Date;
}

const dashboardMetricsSchema = new Schema<IDashboardMetrics>({
  fleetMetrics: {
    totalDrones: { type: Number, required: true },
    flyingDrones: { type: Number, required: true },
    chargingDrones: { type: Number, required: true },
    maintenanceDrones: { type: Number, required: true },
    avgBattery: { type: Number, required: true },
  },
  deliveryMetrics: {
    totalDeliveries: { type: Number, required: true },
    activeDeliveries: { type: Number, required: true },
    completedToday: { type: Number, required: true },
    delayedDeliveries: { type: Number, required: true },
    successRate: { type: Number, required: true },
  },
  routeMetrics: {
    activeWarehouses: { type: Number, required: true },
    availableDestinations: { type: Number, required: true },
    routesGenerated: { type: Number, required: true },
    avgEfficiency: { type: Number, required: true },
  },
  trendMetrics: [
    {
      date: { type: String, required: true },
      deliveriesCount: { type: Number, required: true },
      successRate: { type: Number, required: true },
      utilization: { type: Number, required: true },
      avgDeliveryTime: { type: Number, required: true },
    },
  ],
  lastUpdated: { type: Date, required: true, default: Date.now },
});

export const DashboardMetrics = model<IDashboardMetrics>('DashboardMetrics', dashboardMetricsSchema);
