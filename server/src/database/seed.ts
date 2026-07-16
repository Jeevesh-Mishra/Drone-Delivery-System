import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Drone } from '../models/Drone';
import { Warehouse } from '../models/Warehouse';
import { Destination } from '../models/Destination';
import { NoFlyZone } from '../models/NoFlyZone';
import { Delivery } from '../models/Delivery';
import { Package } from '../models/Package';
import { DeliveryHistory } from '../models/DeliveryHistory';
import { AnalyticsSnapshot } from '../models/AnalyticsSnapshot';
import { DashboardMetrics } from '../models/DashboardMetrics';

dotenv.config();

export const seedDatabase = async (standalone = false) => {
  if (standalone) {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/drone-delivery';
    console.log('Connecting to database for standalone seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected.');
  }

  // Clear existing collections
  console.log('Clearing existing database records...');
  await User.deleteMany({});
  await Drone.deleteMany({});
  await Warehouse.deleteMany({});
  await Destination.deleteMany({});
  await NoFlyZone.deleteMany({});
  await Delivery.deleteMany({});
  await Package.deleteMany({});
  await DeliveryHistory.deleteMany({});
  await AnalyticsSnapshot.deleteMany({});
  await DashboardMetrics.deleteMany({});
  console.log('Collections cleared.');

  // 1. Seed Users
  console.log('Seeding pilot users...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const defaultUser = await User.create({
    name: 'Arjun Verma',
    email: 'captain@dronedelivery.com',
    passwordHash,
    role: 'Admin',
  });
  console.log(`Created user: ${defaultUser.name} (${defaultUser.email})`);

  // 2. Seed Warehouses (San Francisco center coordinates)
  console.log('Seeding warehouses...');
  const warehouses = await Warehouse.create([
    {
      warehouseId: 'WH-A',
      name: 'WH-A (Central Hub)',
      latitude: 37.7749, // Civic Center
      longitude: -122.4194,
      address: 'Polk St & McAllister St, San Francisco, CA 94102',
    },
    {
      warehouseId: 'WH-B',
      name: 'WH-B (North Depot)',
      latitude: 37.8044, // Fisherman's Wharf
      longitude: -122.4081,
      address: 'Jefferson St & Taylor St, San Francisco, CA 94133',
    },
  ]);
  console.log(`Seeded ${warehouses.length} warehouses.`);

  // 3. Seed Destinations
  console.log('Seeding destinations...');
  const destinations = await Destination.create([
    {
      destinationId: 'C-01',
      name: 'Sector 5, City Center (Union Square)',
      latitude: 37.7879,
      longitude: -122.4074,
      priority: 'Medium',
      address: '333 Post St, San Francisco, CA 94108',
    },
    {
      destinationId: 'C-02',
      name: 'Sector 12, Green Park (Mission District)',
      latitude: 37.7599,
      longitude: -122.4148,
      priority: 'High',
      address: '3200 21st St, San Francisco, CA 94110',
    },
    {
      destinationId: 'C-03',
      name: 'Sector 3 (Marina District)',
      latitude: 37.801,
      longitude: -122.4363,
      priority: 'Low',
      address: 'Marina Blvd, San Francisco, CA 94123',
    },
    {
      destinationId: 'C-04',
      name: 'Sector 9 (Presidio)',
      latitude: 37.7989,
      longitude: -122.4662,
      priority: 'Medium',
      address: 'Presidio Officer Club, San Francisco, CA 94129',
    },
    {
      destinationId: 'C-05',
      name: 'Sector 15 (Richmond District)',
      latitude: 37.7785,
      longitude: -122.4813,
      priority: 'Low',
      address: 'Geary Blvd & 25th Ave, San Francisco, CA 94121',
    },
    {
      destinationId: 'C-06',
      name: 'Sector 8 (Castro)',
      latitude: 37.7609,
      longitude: -122.435,
      priority: 'High',
      address: 'Castro St & 18th St, San Francisco, CA 94114',
    },
  ]);
  console.log(`Seeded ${destinations.length} destinations.`);

  // 4. Seed Drones (using coordinates near Civic Center / WH-A)
  console.log('Seeding drones...');
  const drones = await Drone.create([
    {
      droneId: 'D-07',
      name: 'D-07 Falcon Pro',
      model: 'Falcon X1',
      batteryLevel: 92,
      status: 'Busy',
      latitude: 37.7749 + 0.005,
      longitude: -122.4194 + 0.005,
      maxPayload: 5,
      speed: 64,
    },
    {
      droneId: 'D-12',
      name: 'D-12 SkyRunner X1',
      model: 'Falcon X1',
      batteryLevel: 68,
      status: 'Charging',
      latitude: 37.7749, // WH-A location
      longitude: -122.4194,
      maxPayload: 5,
      speed: 58,
    },
    {
      droneId: 'D-03',
      name: 'D-03 AeroMax 4K',
      model: 'Falcon X1',
      batteryLevel: 74,
      status: 'Available',
      latitude: 37.7749 - 0.002,
      longitude: -122.4194 + 0.004,
      maxPayload: 5,
      speed: 60,
    },
    {
      droneId: 'D-21',
      name: 'D-21 Falcon X1',
      model: 'Falcon X1',
      batteryLevel: 35,
      status: 'Maintenance',
      latitude: 37.7749 + 0.002,
      longitude: -122.4194 - 0.003,
      maxPayload: 5,
      speed: 60,
    },
    {
      droneId: 'D-16',
      name: 'D-16 Falcon Pro',
      model: 'Falcon X1',
      batteryLevel: 85,
      status: 'Busy',
      latitude: 37.7749 + 0.008,
      longitude: -122.4194 + 0.002,
      maxPayload: 5,
      speed: 60,
    },
    {
      droneId: 'D-09',
      name: 'D-09 Falcon X1',
      model: 'Falcon X1',
      batteryLevel: 91,
      status: 'Busy',
      latitude: 37.7749 + 0.004,
      longitude: -122.4194 - 0.006,
      maxPayload: 5,
      speed: 60,
    },
    {
      droneId: 'D-04',
      name: 'D-04 Falcon X1',
      model: 'Falcon X1',
      batteryLevel: 55,
      status: 'Charging',
      latitude: 37.7749,
      longitude: -122.4194,
      maxPayload: 5,
      speed: 60,
    },
    {
      droneId: 'D-18',
      name: 'D-18 Falcon Pro',
      model: 'Falcon X1',
      batteryLevel: 60,
      status: 'Available',
      latitude: 37.7749 + 0.001,
      longitude: -122.4194 + 0.001,
      maxPayload: 5,
      speed: 60,
    },
  ]);
  console.log(`Seeded ${drones.length} drones.`);

  // 5. Seed No-Fly Zones
  console.log('Seeding no-fly zones...');
  const noFlyZones = await NoFlyZone.create([
    {
      zoneName: 'Lafayette Park Zone',
      polygonCoordinates: [
        [-122.4310, 37.7935],
        [-122.4246, 37.7935],
        [-122.4246, 37.7895],
        [-122.4310, 37.7895],
        [-122.4310, 37.7935], // Close polygon
      ],
      restrictionLevel: 'Restricted',
      status: 'Active',
    },
    {
      zoneName: 'Presidio Airfield Zone',
      polygonCoordinates: [
        [-122.4820, 37.8080],
        [-122.4760, 37.8080],
        [-122.4760, 37.8010],
        [-122.4820, 37.8010],
        [-122.4820, 37.8080], // Close polygon
      ],
      restrictionLevel: 'Restricted',
      status: 'Active',
    },
  ]);
  console.log(`Seeded ${noFlyZones.length} no-fly zones.`);

  // 6. Seed Deliveries & Packages & History
  console.log('Seeding deliveries and packages...');
  const d1 = await Delivery.create({
    deliveryId: 'PKG-2031',
    customerName: 'Rahul Mehta',
    warehouseId: 'WH-A',
    destinationId: 'C-01',
    assignedDrone: 'D-07',
    assignedRoute: 'R-SEED-01',
    priority: 'High',
    status: 'In Transit',
    estimatedArrival: new Date(Date.now() + 12 * 60 * 1000), // ETA 12 mins
  });

  await Package.create({
    packageId: 'PKG-2031',
    deliveryId: d1.deliveryId,
    weight: 2.4,
    type: 'Electronics',
    fragile: true,
  });

  await DeliveryHistory.create({
    deliveryId: d1.deliveryId,
    status: 'In Transit',
    updatedBy: 'System Dispatcher',
    remarks: 'Drone D-07 carrying package #PKG-2031 departed WH-A. En route to C-01.',
  });

  const d2 = await Delivery.create({
    deliveryId: 'PKG-2032',
    customerName: 'Priye Sharma',
    warehouseId: 'WH-A',
    destinationId: 'C-02',
    assignedDrone: 'D-16',
    assignedRoute: 'R-SEED-02',
    priority: 'Medium',
    status: 'Assigned',
    estimatedArrival: new Date(Date.now() + 30 * 60 * 1000), // ETA 30 mins
  });

  await Package.create({
    packageId: 'PKG-2032',
    deliveryId: d2.deliveryId,
    weight: 1.5,
    type: 'Medical Supplies',
    fragile: false,
  });

  await DeliveryHistory.create({
    deliveryId: d2.deliveryId,
    status: 'Assigned',
    updatedBy: 'System Dispatcher',
    remarks: 'Drone D-16 assigned to package #PKG-2032. Preparing flight corridor.',
  });

  const d3 = await Delivery.create({
    deliveryId: 'PKG-2033',
    customerName: 'Amit Verma',
    warehouseId: 'WH-B',
    destinationId: 'C-03',
    assignedDrone: null,
    assignedRoute: null,
    priority: 'Low',
    status: 'Pending',
    estimatedArrival: null,
  });

  await Package.create({
    packageId: 'PKG-2033',
    deliveryId: d3.deliveryId,
    weight: 0.8,
    type: 'Documents',
    fragile: false,
  });

  await DeliveryHistory.create({
    deliveryId: d3.deliveryId,
    status: 'Pending',
    updatedBy: 'System Dispatcher',
    remarks: 'Package booked. Awaiting priority dispatch assignment.',
  });
  console.log('Seeded deliveries, packages and histories.');

  // 7. Seed Analytics Snapshots (last 7 days of performance history)
  console.log('Seeding analytics snapshots...');
  const today = new Date();
  const snapshots = [];
  for (let i = 6; i >= 0; i--) {
    const snapDate = new Date();
    snapDate.setDate(today.getDate() - i);
    snapshots.push({
      snapshotDate: snapDate,
      fleetUtilization: 80 + Math.floor(Math.random() * 15), // 80 - 95%
      deliverySuccessRate: 95 + Math.floor(Math.random() * 5), // 95 - 100%
      averageRouteEfficiency: 85 + Math.floor(Math.random() * 10), // 85 - 95%
      averageDeliveryTime: 15 + Math.floor(Math.random() * 10), // 15 - 25 mins
    });
  }
  await AnalyticsSnapshot.create(snapshots);
  console.log(`Seeded ${snapshots.length} analytics snapshots.`);

  // 8. Seed Dashboard Metrics
  console.log('Seeding dashboard metrics...');
  const trendMetrics = snapshots.map((s, idx) => {
    const d = new Date(s.snapshotDate);
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      deliveriesCount: 120 + idx * 10 + Math.floor(Math.random() * 15),
      successRate: s.deliverySuccessRate,
      utilization: s.fleetUtilization,
      avgDeliveryTime: s.averageDeliveryTime,
    };
  });

  await DashboardMetrics.create({
    fleetMetrics: {
      totalDrones: 24,
      flyingDrones: 16,
      chargingDrones: 5,
      maintenanceDrones: 3,
      avgBattery: 87,
    },
    deliveryMetrics: {
      totalDeliveries: 156,
      activeDeliveries: 42,
      completedToday: 98,
      delayedDeliveries: 7,
      successRate: 98,
    },
    routeMetrics: {
      activeWarehouses: 2,
      availableDestinations: 6,
      routesGenerated: 182,
      avgEfficiency: 92,
    },
    trendMetrics,
    lastUpdated: new Date(),
  });
  console.log('Seeded dashboard metrics.');

  if (standalone) {
    console.log('Seeding complete! Closing connection...');
    await mongoose.disconnect();
    console.log('Connection closed.');
  } else {
    console.log('In-process database seeding completed successfully.');
  }
};

// Check if run directly from command line (for ts-node execution)
if (require.main === module) {
  seedDatabase(true).catch(err => {
    console.error('Error running standalone seeding:', err);
    process.exit(1);
  });
}
