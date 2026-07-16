"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = exports.deleteDrone = exports.updateDrone = exports.createDrone = exports.getDroneById = exports.getDrones = void 0;
const Drone_1 = require("../models/Drone");
const searching_1 = require("../algorithms/searching/searching");
const sorting_1 = require("../algorithms/sorting/sorting");
// Helper to determine sorting keys
const getSortKeyExtractor = (sortBy) => {
    switch (sortBy) {
        case 'batteryLevel':
            return (d) => d.batteryLevel;
        case 'speed':
            return (d) => d.speed;
        case 'maxPayload':
            return (d) => d.maxPayload;
        case 'droneId':
            return (d) => d.droneId;
        default:
            return (d) => d.droneId;
    }
};
const getDrones = async (req, res, next) => {
    try {
        const { q, sortBy, order, status } = req.query;
        let dbDrones = await Drone_1.Drone.find({});
        // Filter by status if specified in request
        if (status && status !== 'All') {
            dbDrones = dbDrones.filter(d => d.status === status);
        }
        // Apply linearSearch filtering if search query 'q' is present
        let resultDrones = dbDrones;
        if (q) {
            const searchStr = String(q).toLowerCase();
            resultDrones = dbDrones.filter(d => d.droneId.toLowerCase().includes(searchStr) ||
                d.name.toLowerCase().includes(searchStr) ||
                d.model.toLowerCase().includes(searchStr));
        }
        // Apply custom Quick Sort algorithm if 'sortBy' query parameter is present
        if (sortBy) {
            const sortKey = String(sortBy);
            const isAscending = order === 'asc';
            resultDrones = (0, sorting_1.quickSort)(resultDrones, getSortKeyExtractor(sortKey), isAscending);
        }
        // Statistics aggregations for KPIs
        const totalDrones = dbDrones.length;
        const flyingDrones = dbDrones.filter(d => d.status === 'Busy').length;
        const chargingDrones = dbDrones.filter(d => d.status === 'Charging').length;
        const maintenanceDrones = dbDrones.filter(d => d.status === 'Maintenance').length;
        const availableDrones = dbDrones.filter(d => d.status === 'Available').length;
        const sumBattery = dbDrones.reduce((sum, d) => sum + d.batteryLevel, 0);
        const avgBattery = totalDrones > 0 ? Math.round(sumBattery / totalDrones) : 100;
        res.status(200).json({
            success: true,
            message: 'Drones retrieved successfully.',
            data: resultDrones,
            stats: {
                totalDrones,
                flyingDrones,
                chargingDrones,
                maintenanceDrones,
                availableDrones,
                avgBattery
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDrones = getDrones;
const getDroneById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const dbDrones = await Drone_1.Drone.find({});
        // Retrieve specific drone using linearSearch algorithm
        const drone = (0, searching_1.linearSearch)(dbDrones, d => d.droneId === id);
        if (!drone) {
            return res.status(404).json({ success: false, message: `Drone with ID ${id} not found.` });
        }
        res.status(200).json({
            success: true,
            message: 'Drone details retrieved successfully.',
            data: drone
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDroneById = getDroneById;
const createDrone = async (req, res, next) => {
    try {
        const { droneId, name, model, maxPayload, speed, latitude, longitude, batteryLevel, status } = req.body;
        if (!droneId || !name || !model || maxPayload === undefined || speed === undefined || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ success: false, message: 'Please provide all required drone specifications.' });
        }
        const existing = await Drone_1.Drone.findOne({ droneId });
        if (existing) {
            return res.status(400).json({ success: false, message: `A drone with ID ${droneId} already exists in the hangar.` });
        }
        const newDrone = await Drone_1.Drone.create({
            droneId,
            name,
            model,
            maxPayload,
            speed,
            latitude,
            longitude,
            batteryLevel: batteryLevel !== undefined ? batteryLevel : 100,
            status: status || 'Available'
        });
        res.status(201).json({
            success: true,
            message: 'Drone registered successfully in the hangar.',
            data: newDrone
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createDrone = createDrone;
const updateDrone = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const drone = await Drone_1.Drone.findOneAndUpdate({ droneId: id }, updates, { new: true, runValidators: true });
        if (!drone) {
            return res.status(404).json({ success: false, message: `Drone with ID ${id} not found.` });
        }
        res.status(200).json({
            success: true,
            message: 'Drone specifications updated successfully.',
            data: drone
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDrone = updateDrone;
const deleteDrone = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await Drone_1.Drone.findOneAndDelete({ droneId: id });
        if (!result) {
            return res.status(404).json({ success: false, message: `Drone with ID ${id} not found.` });
        }
        res.status(200).json({
            success: true,
            message: 'Drone decommissioned and deleted from the hangar successfully.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDrone = deleteDrone;
const executeCommand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { command } = req.body; // 'recharge' | 'return-home' | 'emergency-stop'
        const drone = await Drone_1.Drone.findOne({ droneId: id });
        if (!drone) {
            return res.status(404).json({ success: false, message: `Drone ${id} not found.` });
        }
        let message = '';
        if (command === 'recharge') {
            drone.batteryLevel = 100;
            drone.status = 'Charging';
            message = `Drone ${id} connection established at charging dock. Recharging power grid cells.`;
        }
        else if (command === 'return-home') {
            // Set to WH-A coordinates (Central Hub)
            drone.latitude = 37.7749;
            drone.longitude = -122.4194;
            drone.status = 'Available';
            message = `Drone ${id} command vector locked: returning home to central hub depot WH-A.`;
        }
        else if (command === 'emergency-stop') {
            drone.status = 'Available';
            message = `Drone ${id} safety override executed: aborted active route patterns. Hovering state active.`;
        }
        else {
            return res.status(400).json({ success: false, message: 'Invalid command type specified.' });
        }
        await drone.save();
        res.status(200).json({
            success: true,
            message,
            data: drone
        });
    }
    catch (error) {
        next(error);
    }
};
exports.executeCommand = executeCommand;
