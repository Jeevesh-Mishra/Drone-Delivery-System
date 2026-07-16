import { Request, Response, NextFunction } from 'express';
import { Drone } from '../models/Drone';
import { linearSearch } from '../algorithms/searching/searching';
import { quickSort } from '../algorithms/sorting/sorting';

// Helper to determine sorting keys
const getSortKeyExtractor = (sortBy: string) => {
  switch (sortBy) {
    case 'batteryLevel':
      return (d: any) => d.batteryLevel;
    case 'speed':
      return (d: any) => d.speed;
    case 'maxPayload':
      return (d: any) => d.maxPayload;
    case 'droneId':
      return (d: any) => d.droneId;
    default:
      return (d: any) => d.droneId;
  }
};

export const getDrones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, sortBy, order, status } = req.query;

    let dbDrones = await Drone.find({});

    // Filter by status if specified in request
    if (status && status !== 'All') {
      dbDrones = dbDrones.filter(d => d.status === status);
    }

    // Apply linearSearch filtering if search query 'q' is present
    let resultDrones = dbDrones;
    if (q) {
      const searchStr = String(q).toLowerCase();
      resultDrones = dbDrones.filter(d => 
        d.droneId.toLowerCase().includes(searchStr) || 
        d.name.toLowerCase().includes(searchStr) || 
        d.model.toLowerCase().includes(searchStr)
      );
    }

    // Apply custom Quick Sort algorithm if 'sortBy' query parameter is present
    if (sortBy) {
      const sortKey = String(sortBy);
      const isAscending = order === 'asc';
      resultDrones = quickSort(resultDrones, getSortKeyExtractor(sortKey), isAscending);
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
  } catch (error) {
    next(error);
  }
};

export const getDroneById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const dbDrones = await Drone.find({});

    // Retrieve specific drone using linearSearch algorithm
    const drone = linearSearch(dbDrones, d => d.droneId === id);

    if (!drone) {
      return res.status(404).json({ success: false, message: `Drone with ID ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: 'Drone details retrieved successfully.',
      data: drone
    });
  } catch (error) {
    next(error);
  }
};

export const createDrone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { droneId, name, model, maxPayload, speed, latitude, longitude, batteryLevel, status } = req.body;

    if (!droneId) {
      return res.status(400).json({ success: false, message: 'Drone ID is required.' });
    }

    const existing = await Drone.findOne({ droneId });
    if (existing) {
      return res.status(400).json({ success: false, message: `A drone with ID ${droneId} already exists in the hangar.` });
    }

    // Auto-fill defaults for optional fields not provided by the registration form
    const newDrone = await Drone.create({
      droneId,
      name: name || `${droneId} ${model || 'Falcon X1'}`,
      model: model || 'Falcon X1',
      maxPayload: maxPayload !== undefined ? parseFloat(maxPayload) : 5,
      speed: speed !== undefined ? parseFloat(speed) : 60,
      latitude: latitude !== undefined ? latitude : 37.7749,
      longitude: longitude !== undefined ? longitude : -122.4194,
      batteryLevel: batteryLevel !== undefined ? batteryLevel : 100,
      status: status || 'Available',
    });

    res.status(201).json({
      success: true,
      message: 'Drone registered successfully in the hangar.',
      data: newDrone,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDrone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const drone = await Drone.findOneAndUpdate({ droneId: id }, updates, { new: true, runValidators: true });
    if (!drone) {
      return res.status(404).json({ success: false, message: `Drone with ID ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: 'Drone specifications updated successfully.',
      data: drone
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDrone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await Drone.findOneAndDelete({ droneId: id });
    if (!result) {
      return res.status(404).json({ success: false, message: `Drone with ID ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: 'Drone decommissioned and deleted from the hangar successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const executeCommand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { command } = req.body;

    const drone = await Drone.findOne({ droneId: id });
    if (!drone) {
      return res.status(404).json({ success: false, message: `Drone ${id} not found.` });
    }

    let message = '';
    // Accept both frontend and backend command name formats
    if (command === 'recharge' || command === 'charge') {
      drone.batteryLevel = 100;
      drone.status = 'Charging';
      message = `Drone ${id} is now charging at the dock.`;
    } else if (command === 'return_home' || command === 'return-home') {
      drone.latitude = 37.7749;
      drone.longitude = -122.4194;
      drone.status = 'Available';
      message = `Drone ${id} is returning to home base WH-A.`;
    } else if (command === 'emergency_stop' || command === 'emergency-stop') {
      drone.status = 'Available';
      message = `Drone ${id} emergency stop executed. Now hovering safely.`;
    } else if (command === 'assign_mission') {
      drone.status = 'Busy';
      message = `Drone ${id} has been assigned a new mission.`;
    } else {
      return res.status(400).json({ success: false, message: `Invalid command: "${command}".` });
    }

    await drone.save();

    res.status(200).json({
      success: true,
      message,
      data: drone,
    });
  } catch (error) {
    next(error);
  }
};
