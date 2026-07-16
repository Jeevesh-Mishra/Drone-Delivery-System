"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bfs = bfs;
const queue_1 = require("../queue/queue");
function bfs(graph, startId, endId, isEdgeAllowed) {
    if (!graph.getNode(startId) || !graph.getNode(endId))
        return false;
    if (startId === endId)
        return true;
    const visited = new Set();
    const queue = new queue_1.Queue();
    queue.enqueue(startId);
    visited.add(startId);
    while (!queue.isEmpty()) {
        const currentId = queue.dequeue();
        if (!currentId)
            break;
        if (currentId === endId)
            return true;
        const currentNode = graph.getNode(currentId);
        const edges = graph.getEdges(currentId);
        for (const edge of edges) {
            if (visited.has(edge.to))
                continue;
            const neighborNode = graph.getNode(edge.to);
            if (isEdgeAllowed && !isEdgeAllowed(currentNode, neighborNode)) {
                continue;
            }
            visited.add(edge.to);
            queue.enqueue(edge.to);
        }
    }
    return false;
}
