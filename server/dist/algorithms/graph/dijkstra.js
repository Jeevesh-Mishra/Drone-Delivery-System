"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dijkstra = dijkstra;
const priorityQueue_1 = require("../queue/priorityQueue");
function dijkstra(graph, startId, endId, isEdgeAllowed) {
    const startNode = graph.getNode(startId);
    const endNode = graph.getNode(endId);
    if (!startNode || !endNode)
        return null;
    const distances = new Map();
    const previous = new Map();
    const pq = new priorityQueue_1.PriorityQueue();
    // Initialize graph node distances
    for (const node of graph.getAllNodes()) {
        distances.set(node.id, node.id === startId ? 0 : Infinity);
        previous.set(node.id, null);
    }
    pq.insert(startId, 0);
    while (!pq.isEmpty()) {
        const currentEl = pq.removeHighest();
        if (!currentEl)
            break;
        const currentId = currentEl.item;
        // Destination reached
        if (currentId === endId) {
            const path = [];
            let temp = endId;
            while (temp !== null) {
                path.unshift(temp);
                temp = previous.get(temp) || null;
            }
            return {
                path,
                distance: distances.get(endId) || 0,
            };
        }
        const currentDist = distances.get(currentId) || Infinity;
        if (currentDist === Infinity)
            continue;
        const currentNode = graph.getNode(currentId);
        const edges = graph.getEdges(currentId);
        for (const edge of edges) {
            const neighborNode = graph.getNode(edge.to);
            // Filter out edges (flight corridors) that cross no-fly zones
            if (isEdgeAllowed && !isEdgeAllowed(currentNode, neighborNode)) {
                continue;
            }
            const alt = currentDist + edge.weight;
            const neighborDist = distances.get(edge.to) || Infinity;
            if (alt < neighborDist) {
                distances.set(edge.to, alt);
                previous.set(edge.to, currentId);
                pq.insert(edge.to, alt);
            }
        }
    }
    return null; // Path is disconnected / not reachable
}
