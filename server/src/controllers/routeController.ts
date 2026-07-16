import { Request, Response, NextFunction } from 'express';
import { Warehouse } from '../models/Warehouse';
import { Destination } from '../models/Destination';
import { NoFlyZone } from '../models/NoFlyZone';
import { Route } from '../models/Route';
import { Graph, GraphNode } from '../algorithms/graph/graph';
import { bfs } from '../algorithms/graph/bfs';
import { dijkstra } from '../algorithms/graph/dijkstra';
import { isSegmentIntersectingPolygon, Point } from '../utils/geometry';
import { STATIC_CONNECTIONS } from '../config/graphConfig';

// Haversine formula to compute great-circle distance between two GPS coordinates in kilometers
const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2)); // Round to 2 decimal places
};

// Fetch Warehouses
export const getWarehouses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await Warehouse.find({});
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

// Fetch Destinations
export const getDestinations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await Destination.find({});
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

// Fetch No-Fly Zones
export const getNoFlyZones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await NoFlyZone.find({});
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

// Graph Builder & Dijkstra Pathfinding Engine
export const optimizeRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { warehouseId, destinationId } = req.body;

    if (!warehouseId || !destinationId) {
      return res.status(400).json({
        success: false,
        message: 'Origin warehouseId and target destinationId are required.',
      });
    }

    // 1. Load active nodes and obstacles from database
    const startWH = await Warehouse.findOne({ warehouseId });
    const endDest = await Destination.findOne({ destinationId });

    if (!startWH) {
      return res.status(404).json({ success: false, message: `Warehouse ${warehouseId} not found.` });
    }
    if (!endDest) {
      return res.status(404).json({ success: false, message: `Destination ${destinationId} not found.` });
    }

    const allWarehouses = await Warehouse.find({});
    const allDestinations = await Destination.find({});
    const activeZones = await NoFlyZone.find({ status: 'Active' });

    // 2. Initialize in-memory Graph
    const graph = new Graph();

    // Map database elements to graph nodes
    const nodeMap: Map<string, GraphNode> = new Map();

    allWarehouses.forEach(wh => {
      const node: GraphNode = {
        id: wh.warehouseId,
        name: wh.name,
        latitude: wh.latitude,
        longitude: wh.longitude,
        type: 'warehouse',
      };
      graph.addNode(node);
      nodeMap.set(wh.warehouseId, node);
    });

    allDestinations.forEach(dest => {
      const node: GraphNode = {
        id: dest.destinationId,
        name: dest.name,
        latitude: dest.latitude,
        longitude: dest.longitude,
        type: 'destination',
      };
      graph.addNode(node);
      nodeMap.set(dest.destinationId, node);
    });

    // 3. Assemble flight corridor edges, filtering out those intersecting No-Fly Zones
    STATIC_CONNECTIONS.forEach(conn => {
      const fromNode = nodeMap.get(conn.from);
      const toNode = nodeMap.get(conn.to);

      if (fromNode && toNode) {
        // Map nodes to Point interfaces for geometry math
        const p1: Point = { x: fromNode.longitude, y: fromNode.latitude };
        const p2: Point = { x: toNode.longitude, y: toNode.latitude };

        // Check if corridor line segment crosses any polygon boundaries of active no-fly zones
        let isCorridorBlocked = false;
        for (const zone of activeZones) {
          const polygon: Point[] = zone.polygonCoordinates.map(coord => ({
            x: coord[0],
            y: coord[1],
          }));

          if (isSegmentIntersectingPolygon(p1, p2, polygon)) {
            isCorridorBlocked = true;
            break;
          }
        }

        // If path is clear, add bi-directional edges with real physical distance weights (Haversine)
        if (!isCorridorBlocked) {
          const distance = calculateHaversineDistance(
            fromNode.latitude,
            fromNode.longitude,
            toNode.latitude,
            toNode.longitude
          );
          graph.addEdge(fromNode.id, toNode.id, distance);
          graph.addEdge(toNode.id, fromNode.id, distance);
        }
      }
    });

    // 4. Validate connectivity using BFS
    const isReachable = bfs(graph, warehouseId, destinationId);
    if (!isReachable) {
      return res.status(422).json({
        success: false,
        message: 'Optimization interdicted: No safe flight corridors exist between origin and destination due to No-Fly Zone barriers.',
      });
    }

    // 5. Execute Dijkstra's shortest path optimization using Binary Heap
    const pathResult = dijkstra(graph, warehouseId, destinationId);

    if (!pathResult) {
      return res.status(422).json({
        success: false,
        message: 'Dijkstra optimizer failed to resolve a flight trajectory.',
      });
    }

    // 6. Format metrics and coordinate geometries for Mapbox visualization
    const pathCoordinates: [number, number][] = pathResult.path.map(nodeId => {
      const node = nodeMap.get(nodeId)!;
      return [node.longitude, node.latitude]; // [lng, lat] for GeoJSON
    });

    const averageDroneSpeed = 60; // 60 km/h
    const estimatedTime = parseFloat(((pathResult.distance / averageDroneSpeed) * 60).toFixed(1)); // in minutes
    
    // Estimate battery consumption (average 2.5% battery per kilometer of flight)
    const batteryUsage = parseFloat((pathResult.distance * 2.5).toFixed(1));
    const maxBatteryRating = 100;
    const optimizationScore = Math.max(
      30,
      Math.min(99, Math.round(100 - pathResult.distance * 1.5))
    ); // Arbitrary scale for demo display

    // Generate a unique route document ID
    const routeId = `R-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRoute = await Route.create({
      routeId,
      warehouseId,
      destinationIds: [destinationId],
      distance: pathResult.distance,
      estimatedTime,
      batteryUsage: batteryUsage > maxBatteryRating ? maxBatteryRating : batteryUsage,
      optimizationScore,
      algorithmUsed: 'Dijkstra',
      pathCoordinates,
    });

    res.status(200).json({
      success: true,
      message: 'Flight path optimized successfully.',
      data: newRoute,
    });
  } catch (error) {
    next(error);
  }
};
