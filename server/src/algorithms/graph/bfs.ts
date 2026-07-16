import { Graph, GraphNode } from './graph';
import { Queue } from '../queue/queue';

export function bfs(
  graph: Graph,
  startId: string,
  endId: string,
  isEdgeAllowed?: (from: GraphNode, to: GraphNode) => boolean
): boolean {
  if (!graph.getNode(startId) || !graph.getNode(endId)) return false;
  if (startId === endId) return true;

  const visited: Set<string> = new Set();
  const queue = new Queue<string>();

  queue.enqueue(startId);
  visited.add(startId);

  while (!queue.isEmpty()) {
    const currentId = queue.dequeue();
    if (!currentId) break;

    if (currentId === endId) return true;

    const currentNode = graph.getNode(currentId)!;
    const edges = graph.getEdges(currentId);

    for (const edge of edges) {
      if (visited.has(edge.to)) continue;

      const neighborNode = graph.getNode(edge.to)!;
      if (isEdgeAllowed && !isEdgeAllowed(currentNode, neighborNode)) {
        continue;
      }

      visited.add(edge.to);
      queue.enqueue(edge.to);
    }
  }

  return false;
}
