import { Request, Response, NextFunction } from 'express';
import { Drone } from '../models/Drone';
import { Delivery } from '../models/Delivery';
import { Route } from '../models/Route';
import { Warehouse } from '../models/Warehouse';
import { Destination } from '../models/Destination';
import { AnalyticsSnapshot } from '../models/AnalyticsSnapshot';
import { DashboardMetrics } from '../models/DashboardMetrics';
import { Report } from '../models/Report';

export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Fetch current live variables
    const drones = await Drone.find({}).lean();
    const deliveries = await Delivery.find({}).lean();
    const routes = await Route.find({}).lean();
    const warehouses = await Warehouse.find({}).lean();
    const destinations = await Destination.find({}).lean();

    // 2. Compute Fleet Metrics
    const totalDrones = drones.length;
    const flyingDrones = drones.filter(d => d.status === 'Busy').length;
    const chargingDrones = drones.filter(d => d.status === 'Charging').length;
    const maintenanceDrones = drones.filter(d => d.status === 'Maintenance').length;
    const sumBattery = drones.reduce((sum, d) => sum + d.batteryLevel, 0);
    const avgBattery = totalDrones > 0 ? Math.round(sumBattery / totalDrones) : 100;

    // 3. Compute Delivery Metrics
    const totalDeliveries = deliveries.length;
    const activeDeliveries = deliveries.filter(d => d.status === 'In Transit' || d.status === 'Assigned').length;
    const completedToday = deliveries.filter(d => d.status === 'Delivered').length;
    const delayedDeliveries = deliveries.filter(d => d.status === 'Assigned' && d.estimatedArrival && new Date(d.estimatedArrival) < new Date()).length;
    
    // Success rate formula: (delivered / (delivered + cancelled)) * 100
    const deliveredCount = deliveries.filter(d => d.status === 'Delivered').length;
    const cancelledCount = deliveries.filter(d => d.status === 'Cancelled').length;
    const closedCount = deliveredCount + cancelledCount;
    const successRate = closedCount > 0 ? Math.round((deliveredCount / closedCount) * 100) : 100;

    // 4. Compute Route Metrics
    const activeWarehouses = warehouses.length;
    const availableDestinations = destinations.length;
    const routesGenerated = routes.length;
    const avgEfficiency = routes.length > 0
      ? Math.round(routes.reduce((sum, r) => sum + r.optimizationScore, 0) / routes.length)
      : 92; // default

    // 5. Gather trend snapshots
    const snapshots = await AnalyticsSnapshot.find({}).sort({ snapshotDate: 1 }).lean();
    const trendMetrics = snapshots.map(s => {
      const d = new Date(s.snapshotDate);
      return {
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        deliveriesCount: 15 + Math.floor(Math.random() * 20), // mock count for graph
        successRate: s.deliverySuccessRate,
        utilization: s.fleetUtilization,
        avgDeliveryTime: s.averageDeliveryTime,
      };
    });

    const metricsData = {
      fleetMetrics: {
        totalDrones,
        flyingDrones,
        chargingDrones,
        maintenanceDrones,
        avgBattery,
      },
      deliveryMetrics: {
        totalDeliveries,
        activeDeliveries,
        completedToday,
        delayedDeliveries,
        successRate,
      },
      routeMetrics: {
        activeWarehouses,
        availableDestinations,
        routesGenerated,
        avgEfficiency,
      },
      trendMetrics: trendMetrics.length > 0 ? trendMetrics : [
        { date: '5/15', deliveriesCount: 12, successRate: 98, utilization: 87, avgDeliveryTime: 18 },
        { date: '5/16', deliveriesCount: 18, successRate: 97, utilization: 89, avgDeliveryTime: 19 },
        { date: '5/17', deliveriesCount: 15, successRate: 96, utilization: 88, avgDeliveryTime: 20 },
        { date: '5/18', deliveriesCount: 22, successRate: 98, utilization: 91, avgDeliveryTime: 17 },
        { date: '5/19', deliveriesCount: 19, successRate: 99, utilization: 92, avgDeliveryTime: 18 },
        { date: '5/20', deliveriesCount: 24, successRate: 98, utilization: 91, avgDeliveryTime: 18 },
        { date: '5/21', deliveriesCount: 27, successRate: 98, utilization: 91, avgDeliveryTime: 18 },
      ],
      lastUpdated: new Date()
    };

    // Cache metrics in DB
    await DashboardMetrics.findOneAndUpdate({}, metricsData, { upsert: true, new: true });

    res.status(200).json({
      success: true,
      message: 'Dashboard metrics calculated successfully.',
      data: metricsData
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsSnapshots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await AnalyticsSnapshot.find({}).sort({ snapshotDate: -1 });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const exportReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { format } = req.query; // 'csv' | 'json'

    const snapshots = await AnalyticsSnapshot.find({}).sort({ snapshotDate: -1 }).lean();
    const drones = await Drone.find({}).lean();
    const deliveries = await Delivery.find({}).lean();

    const totalDeliveries = deliveries.length;
    const delivered = deliveries.filter(d => d.status === 'Delivered').length;
    const cancelled = deliveries.filter(d => d.status === 'Cancelled').length;
    const successRate = (delivered + cancelled) > 0 ? Math.round((delivered / (delivered + cancelled)) * 100) : 100;

    const data = {
      totalDeliveries,
      successRate,
      avgDeliveryTime: snapshots.length > 0 ? parseFloat((snapshots.reduce((sum, s) => sum + s.averageDeliveryTime, 0) / snapshots.length).toFixed(1)) : 18.0,
      totalDistance: snapshots.length > 0 ? snapshots.length * 12.4 : 1240.0, // mock distance
      fleetUtilization: snapshots.length > 0 ? Math.round(snapshots.reduce((sum, s) => sum + s.fleetUtilization, 0) / snapshots.length) : 91
    };

    // Save report generation history record
    const reportId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
    const reportName = `System Performance Report - ${new Date().toLocaleDateString()}`;
    await Report.create({
      reportId,
      reportName,
      generatedBy: 'Captain Arjun Verma',
      generatedAt: new Date(),
      filtersApplied: { startDate: '2025-05-15', endDate: '2025-05-21' },
      data
    });

    if (format === 'csv') {
      // Build functional CSV text
      let csvContent = 'Performance Metric,Value\r\n';
      csvContent += `Report ID,${reportId}\r\n`;
      csvContent += `Report Name,${reportName}\r\n`;
      csvContent += `Generated By,Captain Arjun Verma\r\n`;
      csvContent += `Generated At,${new Date().toISOString()}\r\n\r\n`;
      csvContent += `Total Deliveries Scheduled,${data.totalDeliveries}\r\n`;
      csvContent += `Delivery Success Rate (%),${data.successRate}%\r\n`;
      csvContent += `Average Transit Time (min),${data.avgDeliveryTime} minutes\r\n`;
      csvContent += `Total Flight Distance (km),${data.totalDistance} km\r\n`;
      csvContent += `Average Fleet Utilization (%),${data.fleetUtilization}%\r\n\r\n`;
      csvContent += `Historical Trends Data\r\n`;
      csvContent += `Date,Fleet Utilization (%),Success Rate (%),Avg Flight Time (min)\r\n`;
      
      snapshots.forEach(s => {
        const d = new Date(s.snapshotDate);
        csvContent += `${d.toLocaleDateString()},${s.fleetUtilization}%,${s.deliverySuccessRate}%,${s.averageDeliveryTime} mins\r\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=performance_report_${reportId}.csv`);
      return res.status(200).send(csvContent);
    }

    // Default to JSON response
    res.status(200).json({
      success: true,
      message: 'Report exported successfully.',
      reportId,
      reportName,
      data
    });
  } catch (error) {
    next(error);
  }
};
