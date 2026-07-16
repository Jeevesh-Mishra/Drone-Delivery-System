"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReport = exports.getAnalyticsSnapshots = exports.getDashboardMetrics = void 0;
const Drone_1 = require("../models/Drone");
const Delivery_1 = require("../models/Delivery");
const Route_1 = require("../models/Route");
const Warehouse_1 = require("../models/Warehouse");
const Destination_1 = require("../models/Destination");
const AnalyticsSnapshot_1 = require("../models/AnalyticsSnapshot");
const DashboardMetrics_1 = require("../models/DashboardMetrics");
const Report_1 = require("../models/Report");
const getDashboardMetrics = async (req, res, next) => {
    try {
        // 1. Fetch current live variables
        const drones = await Drone_1.Drone.find({}).lean();
        const deliveries = await Delivery_1.Delivery.find({}).lean();
        const routes = await Route_1.Route.find({}).lean();
        const warehouses = await Warehouse_1.Warehouse.find({}).lean();
        const destinations = await Destination_1.Destination.find({}).lean();
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
        const snapshots = await AnalyticsSnapshot_1.AnalyticsSnapshot.find({}).sort({ snapshotDate: 1 }).lean();
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
        await DashboardMetrics_1.DashboardMetrics.findOneAndUpdate({}, metricsData, { upsert: true, new: true });
        res.status(200).json({
            success: true,
            message: 'Dashboard metrics calculated successfully.',
            data: metricsData
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardMetrics = getDashboardMetrics;
const getAnalyticsSnapshots = async (req, res, next) => {
    try {
        const list = await AnalyticsSnapshot_1.AnalyticsSnapshot.find({}).sort({ snapshotDate: -1 });
        res.status(200).json({ success: true, data: list });
    }
    catch (error) {
        next(error);
    }
};
exports.getAnalyticsSnapshots = getAnalyticsSnapshots;
const exportReport = async (req, res, next) => {
    try {
        const { format } = req.query; // 'csv' | 'json'
        const snapshots = await AnalyticsSnapshot_1.AnalyticsSnapshot.find({}).sort({ snapshotDate: -1 }).lean();
        const drones = await Drone_1.Drone.find({}).lean();
        const deliveries = await Delivery_1.Delivery.find({}).lean();
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
        await Report_1.Report.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.exportReport = exportReport;
