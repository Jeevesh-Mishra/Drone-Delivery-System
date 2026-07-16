import { Request, Response, NextFunction } from 'express';
import { Delivery } from '../models/Delivery';
import { Package } from '../models/Package';
import { Drone } from '../models/Drone';
import { Route } from '../models/Route';
import { Warehouse } from '../models/Warehouse';
import { Destination } from '../models/Destination';
import { DeliveryHistory } from '../models/DeliveryHistory';
import { PriorityQueue } from '../algorithms/queue/priorityQueue';
import { Queue } from '../algorithms/queue/queue';


// Map priority string to numeric values (Low value = High priority for our min-heap)
const getPriorityValue = (p: 'High' | 'Medium' | 'Low'): number => {
  switch (p) {
    case 'High':
      return 1;
    case 'Medium':
      return 2;
    case 'Low':
      return 3;
    default:
      return 3;
  }
};

export const getDeliveries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, priority, q } = req.query;

    const query: any = {};
    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;

    let list = await Delivery.find(query).sort({ createdAt: -1 }).lean();

    // Attach packages info to each delivery record
    const listWithPackages = await Promise.all(
      list.map(async d => {
        const pkg = await Package.findOne({ deliveryId: d.deliveryId }).lean();
        const history = await DeliveryHistory.find({ deliveryId: d.deliveryId })
          .sort({ timestamp: -1 })
          .lean();
        return {
          ...d,
          package: pkg,
          history,
        };
      })
    );

    let filteredList = listWithPackages;
    if (q) {
      const searchStr = String(q).toLowerCase();
      filteredList = listWithPackages.filter(
        d =>
          d.deliveryId.toLowerCase().includes(searchStr) ||
          d.customerName.toLowerCase().includes(searchStr) ||
          (d.assignedDrone && d.assignedDrone.toLowerCase().includes(searchStr))
      );
    }

    res.status(200).json({ success: true, data: filteredList });
  } catch (error) {
    next(error);
  }
};

export const createDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerName, warehouseId, destinationId, priority, packageWeight, packageType, fragile } = req.body;

    if (!customerName || !warehouseId || !destinationId || !priority || packageWeight === undefined || !packageType) {
      return res.status(400).json({ success: false, message: 'Please provide all delivery and package details.' });
    }

    const deliveryId = `PKG-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDelivery = await Delivery.create({
      deliveryId,
      customerName,
      warehouseId,
      destinationId,
      priority,
      status: 'Pending',
      assignedDrone: null,
      assignedRoute: null,
      estimatedArrival: null,
    });

    const newPackage = await Package.create({
      packageId: deliveryId,
      deliveryId,
      weight: packageWeight,
      type: packageType,
      fragile: fragile || false,
    });

    await DeliveryHistory.create({
      deliveryId,
      status: 'Pending',
      updatedBy: 'Operator Dispatch Console',
      remarks: 'Manifest booked and placed in dispatch queue.',
    });

    res.status(201).json({
      success: true,
      message: `Delivery manifest ${deliveryId} booked successfully.`,
      data: {
        ...newDelivery.toJSON(),
        package: newPackage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const assignMission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deliveryId } = req.params;
    const { droneId, routeId } = req.body;

    if (!droneId || !routeId) {
      return res.status(400).json({ success: false, message: 'Please specify both droneId and routeId.' });
    }

    const delivery = await Delivery.findOne({ deliveryId });
    if (!delivery) {
      return res.status(404).json({ success: false, message: `Delivery manifest ${deliveryId} not found.` });
    }

    const drone = await Drone.findOne({ droneId });
    if (!drone) {
      return res.status(404).json({ success: false, message: `Drone ${droneId} not found.` });
    }
    if (drone.status !== 'Available') {
      return res.status(400).json({ success: false, message: `Drone ${droneId} is not available (Status: ${drone.status}).` });
    }

    const route = await Route.findOne({ routeId });
    if (!route) {
      return res.status(404).json({ success: false, message: `Route path ${routeId} not found.` });
    }

    // Bind drone and route
    delivery.assignedDrone = droneId;
    delivery.assignedRoute = routeId;
    delivery.status = 'Assigned';
    // Calculate ETA
    const etaMs = route.estimatedTime * 60 * 1000;
    delivery.estimatedArrival = new Date(Date.now() + etaMs);
    await delivery.save();

    // Lock drone
    drone.status = 'Busy';
    await drone.save();

    await DeliveryHistory.create({
      deliveryId,
      status: 'Assigned',
      updatedBy: 'Operator Dispatch Console',
      remarks: `Drone ${droneId} and Route ${routeId} assigned to manifest. Flight checklist initialized.`,
    });

    res.status(200).json({
      success: true,
      message: `Drone ${droneId} assigned to delivery ${deliveryId} successfully.`,
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deliveryId } = req.params;
    const { status } = req.body; // 'In Transit' | 'Delivered' | 'Cancelled'

    const delivery = await Delivery.findOne({ deliveryId });
    if (!delivery) {
      return res.status(404).json({ success: false, message: `Delivery ${deliveryId} not found.` });
    }

    const oldStatus = delivery.status;
    delivery.status = status;
    await delivery.save();

    let remarks = '';

    if (status === 'In Transit') {
      remarks = 'Drone cleared for takeoff. Flight path vectors active, en route to customer.';
    } else if (status === 'Delivered') {
      remarks = 'Package dropped safely at target coordinates. Mission complete.';
      
      // Release drone back to hangar (and update its coordinates to destination lat/lng)
      if (delivery.assignedDrone) {
        const drone = await Drone.findOne({ droneId: delivery.assignedDrone });
        if (drone) {
          // Find route to get final coordinates
          const route = await Route.findOne({ routeId: delivery.assignedRoute });
          if (route && route.pathCoordinates.length > 0) {
            const finalCoords = route.pathCoordinates[route.pathCoordinates.length - 1];
            drone.longitude = finalCoords[0];
            drone.latitude = finalCoords[1];
          }
          drone.status = 'Available';
          drone.batteryLevel = Math.max(10, drone.batteryLevel - (route?.batteryUsage || 20)); // Reduce battery
          await drone.save();
        }
      }
    } else if (status === 'Cancelled') {
      remarks = 'Delivery cancelled by operations command center.';
      // Release drone
      if (delivery.assignedDrone) {
        const drone = await Drone.findOne({ droneId: delivery.assignedDrone });
        if (drone) {
          drone.status = 'Available';
          await drone.save();
        }
      }
    }

    await DeliveryHistory.create({
      deliveryId,
      status,
      updatedBy: 'Operations Commander',
      remarks,
    });

    res.status(200).json({
      success: true,
      message: `Delivery ${deliveryId} status updated to ${status}.`,
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

// Queue state retrieval endpoint (FIFO or Priority)
export const getQueueState = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pendingDeliveries = await Delivery.find({ status: 'Pending' }).lean();

    // 1. Build Standard FIFO Queue
    const fifoQueue = new Queue<any>();
    pendingDeliveries.forEach(d => fifoQueue.enqueue(d));

    // 2. Build Min-Binary Heap Priority Queue
    const priorityQueue = new PriorityQueue<any>();
    pendingDeliveries.forEach(d => {
      priorityQueue.insert(d, getPriorityValue(d.priority));
    });

    res.status(200).json({
      success: true,
      data: {
        fifoQueue: fifoQueue.toArray(),
        priorityQueue: priorityQueue.toArray().map(el => ({
          ...el.item,
          priorityValue: el.priorityValue
        })),
        count: pendingDeliveries.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Auto dispatch using Priority Queue Heap
export const dispatchQueue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Load pending manifests and available drones
    const pending = await Delivery.find({ status: 'Pending' }).lean();
    const availableDrones = await Drone.find({ status: 'Available' });

    if (pending.length === 0) {
      return res.status(400).json({ success: false, message: 'Dispatch queue is empty. No pending deliveries.' });
    }

    if (availableDrones.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All hangar drones are busy or charging. Dispatch queue halted.',
      });
    }

    // 2. Push all pending manifests into Priority Queue Binary Heap
    const pq = new PriorityQueue<any>();
    pending.forEach(d => {
      pq.insert(d, getPriorityValue(d.priority));
    });

    // 3. Dequeue highest-priority delivery
    const highestPriorityEl = pq.removeHighest();
    if (!highestPriorityEl) {
      return res.status(400).json({ success: false, message: 'Priority Queue failed to process elements.' });
    }
    const targetDelivery = highestPriorityEl.item;

    // 4. Select the first available drone
    const selectedDrone = availableDrones[0];

    // 5. Look for or generate a route
    // Find if a route between this warehouse and destination already exists, or calculate standard
    let route = await Route.findOne({
      warehouseId: targetDelivery.warehouseId,
      destinationIds: targetDelivery.destinationId,
    });

    if (!route) {
      // Create a default straight line route if none exists (fallback)
      const wh = await Warehouse.findOne({ warehouseId: targetDelivery.warehouseId });
      const dest = await Destination.findOne({ destinationId: targetDelivery.destinationId });

      if (wh && dest) {
        route = await Route.create({
          routeId: `R-${Math.floor(1000 + Math.random() * 9000)}`,
          warehouseId: targetDelivery.warehouseId,
          destinationIds: [targetDelivery.destinationId],
          distance: 4.8,
          estimatedTime: 12,
          batteryUsage: 15,
          optimizationScore: 90,
          algorithmUsed: 'Dijkstra',
          pathCoordinates: [
            [wh.longitude, wh.latitude],
            [dest.longitude, dest.latitude],
          ],
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Origin warehouse or destination coordinates not found to build corridor.',
        });
      }
    }

    // 6. Execute assignment transaction updates
    const deliveryDoc = await Delivery.findOne({ deliveryId: targetDelivery.deliveryId });
    if (deliveryDoc) {
      deliveryDoc.assignedDrone = selectedDrone.droneId;
      deliveryDoc.assignedRoute = route.routeId;
      deliveryDoc.status = 'Assigned';
      deliveryDoc.estimatedArrival = new Date(Date.now() + route.estimatedTime * 60 * 1000);
      await deliveryDoc.save();
    }

    selectedDrone.status = 'Busy';
    await selectedDrone.save();

    await DeliveryHistory.create({
      deliveryId: targetDelivery.deliveryId,
      status: 'Assigned',
      updatedBy: 'Priority Queue Scheduling Engine',
      remarks: `Priority Queue scheduled: Dispatched ${targetDelivery.deliveryId} (Priority: ${targetDelivery.priority}) to available Drone ${selectedDrone.droneId}.`,
    });

    res.status(200).json({
      success: true,
      message: `Priority Queue automatically scheduled and dispatched ${targetDelivery.deliveryId} to Drone ${selectedDrone.droneId}.`,
      data: {
        delivery: deliveryDoc,
        drone: selectedDrone,
        route,
      },
    });
  } catch (error) {
    next(error);
  }
};
