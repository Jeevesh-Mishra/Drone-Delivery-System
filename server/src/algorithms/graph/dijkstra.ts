import { Graph, GraphNode } from './graph';
import { PriorityQueue } from '../queue/priorityQueue';

export interface ShortestPathResult {
  path: string[]; // List of node IDs forming the shortest path
  distance: number; // Total distance in km
}

export function dijkstra(
  graph: Graph,
  startId: string,
  endId: string,
  isEdgeAllowed?: (from: GraphNode, to: GraphNode) => boolean
): ShortestPathResult | null {
  const startNode = graph.getNode(startId);
  const endNode = graph.getNode(endId);
  if (!startNode || !endNode) return null;

  const distances: Map<string, number> = new Map();
  const previous: Map<string, string | null> = new Map();
  const visited: Set<string> = new Set(); // Fix: track visited nodes
  const pq = new PriorityQueue<string>();

  // Initialize graph node distances
  for (const node of graph.getAllNodes()) {
    distances.set(node.id, node.id === startId ? 0 : Infinity);
    previous.set(node.id, null);
  }

  pq.insert(startId, 0);

  while (!pq.isEmpty()) {
    const currentEl = pq.removeHighest();
    if (!currentEl) break;
    const currentId = currentEl.item;

    // Skip already-finalized nodes (stale heap entries)
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    // Destination reached
    if (currentId === endId) {
      const path: string[] = [];
      let temp: string | null = endId;
      while (temp !== null) {
        path.unshift(temp);
        const prev = previous.get(temp);
        temp = prev !== undefined ? prev : null;
      }
      return {
        path,
        distance: parseFloat((distances.get(endId) || 0).toFixed(2)),
      };
    }

    const currentDist = distances.get(currentId) ?? Infinity;
    if (currentDist === Infinity) continue;

    const currentNode = graph.getNode(currentId)!;
    const edges = graph.getEdges(currentId);

    for (const edge of edges) {
      if (visited.has(edge.to)) continue; // Skip visited neighbors

      const neighborNode = graph.getNode(edge.to)!;

      // Filter out edges (flight corridors) that cross no-fly zones
      if (isEdgeAllowed && !isEdgeAllowed(currentNode, neighborNode)) {
        continue;
      }

      const alt = currentDist + edge.weight;
      const neighborDist = distances.get(edge.to) ?? Infinity;

      if (alt < neighborDist) {
        distances.set(edge.to, alt);
        previous.set(edge.to, currentId);
        pq.insert(edge.to, alt);
      }
    }
  }

  return null; // Path is disconnected / not reachable
}
