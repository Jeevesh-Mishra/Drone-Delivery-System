/**
 * Delivery Auto-Progression Scheduler
 * Automatically advances each booked delivery through all status stages:
 *   Pending → Assigned → In Transit → Out for Delivery → Delivered
 *
 * Timing (relative to delivery createdAt):
 *   0–45s     : Pending      (Package Packed)
 *   45s–90s   : Assigned     (Drone Assigned — auto-picks first available drone)
 *   90s–3min  : In Transit   (Drone airborne)
 *   3min–4min : Out for Delivery
 *   4min+     : Delivered    (Mission complete, drone released)
 */

import { Delivery } from '../models/Delivery';
import { Drone } from '../models/Drone';
import { Route } from '../models/Route';
import { Warehouse } from '../models/Warehouse';
import { Destination } from '../models/Destination';
import { DeliveryHistory } from '../models/DeliveryHistory';

// Stage durations in milliseconds
const STAGE_MS = {
  ASSIGN:    45_000,   // 45 seconds  → move Pending → Assigned
  TRANSIT:   90_000,   // 90 seconds  → move Assigned → In Transit
  OUT:       180_000,  // 3 minutes   → move In Transit → Out for Delivery
  DELIVERED: 240_000,  // 4 minutes   → move Out for Delivery → Delivered
};

async function getOrCreateRoute(warehouseId: string, destinationId: string): Promise<any> {
  let route = await Route.findOne({ warehouseId, destinationIds: destinationId });
  if (!route) {
    const wh = await Warehouse.findOne({ warehouseId });
    const dest = await Destination.findOne({ destinationId });
    if (wh && dest) {
      route = await Route.create({
        routeId: `R-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
        warehouseId,
        destinationIds: [destinationId],
        distance: 4.2,
        estimatedTime: 12,
        batteryUsage: 14,
        optimizationScore: 88,
        algorithmUsed: 'Dijkstra',
        pathCoordinates: [
          [wh.longitude, wh.latitude],
          [dest.longitude, dest.latitude],
        ],
      });
    }
  }
  return route;
}

async function tick() {
  try {
    const now = Date.now();

    // 1. Pending → Assigned
    const pendingDeliveries = await Delivery.find({ status: 'Pending' });
    for (const delivery of pendingDeliveries) {
      const age = now - new Date(delivery.createdAt!).getTime();
      if (age >= STAGE_MS.ASSIGN) {
        // Pick a free drone
        const drone = await Drone.findOne({ status: 'Available' });
        if (!drone) continue; // No drone available yet, wait

        const route = await getOrCreateRoute(delivery.warehouseId, delivery.destinationId);
        if (!route) continue;

        delivery.assignedDrone = drone.droneId;
        delivery.assignedRoute = route.routeId;
        delivery.status = 'Assigned';
        delivery.estimatedArrival = new Date(now + (STAGE_MS.DELIVERED - STAGE_MS.ASSIGN));
        await delivery.save();

        drone.status = 'Busy';
        await drone.save();

        await DeliveryHistory.create({
          deliveryId: delivery.deliveryId,
          status: 'Assigned',
          updatedBy: 'Auto-Scheduler',
          remarks: `Auto-assigned Drone ${drone.droneId} via route ${route.routeId}. Preparing for takeoff.`,
        });
      }
    }

    // 2. Assigned → In Transit
    const assignedDeliveries = await Delivery.find({ status: 'Assigned' });
    for (const delivery of assignedDeliveries) {
      const age = now - new Date(delivery.createdAt!).getTime();
      if (age >= STAGE_MS.TRANSIT) {
        delivery.status = 'In Transit';
        await delivery.save();
        await DeliveryHistory.create({
          deliveryId: delivery.deliveryId,
          status: 'In Transit',
          updatedBy: 'Auto-Scheduler',
          remarks: 'Drone cleared for takeoff. Flight path vectors active, en route to customer.',
        });
      }
    }

    // 3. In Transit → Out for Delivery
    const inTransitDeliveries = await Delivery.find({ status: 'In Transit' });
    for (const delivery of inTransitDeliveries) {
      const age = now - new Date(delivery.createdAt!).getTime();
      if (age >= STAGE_MS.OUT) {
        delivery.status = 'Out for Delivery';
        await delivery.save();
        await DeliveryHistory.create({
          deliveryId: delivery.deliveryId,
          status: 'Out for Delivery',
          updatedBy: 'Auto-Scheduler',
          remarks: 'Drone approaching delivery zone. Final descent initiated.',
        });
      }
    }

    // 4. Out for Delivery → Delivered
    const outDeliveries = await Delivery.find({ status: 'Out for Delivery' });
    for (const delivery of outDeliveries) {
      const age = now - new Date(delivery.createdAt!).getTime();
      if (age >= STAGE_MS.DELIVERED) {
        delivery.status = 'Delivered';
        await delivery.save();

        // Release drone
        if (delivery.assignedDrone) {
          const drone = await Drone.findOne({ droneId: delivery.assignedDrone });
          if (drone) {
            drone.status = 'Available';
            drone.batteryLevel = Math.max(20, drone.batteryLevel - 15);
            await drone.save();
          }
        }

        await DeliveryHistory.create({
          deliveryId: delivery.deliveryId,
          status: 'Delivered',
          updatedBy: 'Auto-Scheduler',
          remarks: 'Package dropped safely at target coordinates. Mission complete. Drone returning to hangar.',
        });
      }
    }
  } catch (err) {
    console.error('[Scheduler] Error during tick:', err);
  }
}

let schedulerInterval: NodeJS.Timeout | null = null;

export function startDeliveryScheduler() {
  if (schedulerInterval) return; // Already running
  console.log('[Scheduler] Delivery auto-progression scheduler started (tick every 15s).');
  schedulerInterval = setInterval(tick, 15_000); // Check every 15 seconds
  // Also run immediately on start
  tick();
}

export function stopDeliveryScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Scheduler] Delivery scheduler stopped.');
  }
}
