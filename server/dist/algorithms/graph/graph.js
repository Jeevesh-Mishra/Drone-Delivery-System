"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Graph = void 0;
class Graph {
    nodes = new Map();
    adjacencyList = new Map();
    addNode(node) {
        this.nodes.set(node.id, node);
        if (!this.adjacencyList.has(node.id)) {
            this.adjacencyList.set(node.id, []);
        }
    }
    addEdge(from, to, weight) {
        if (!this.nodes.has(from) || !this.nodes.has(to)) {
            throw new Error(`Nodes must exist in the graph to add an edge. (${from} -> ${to})`);
        }
        const edges = this.adjacencyList.get(from) || [];
        // Prevent duplicate edges
        if (!edges.some(edge => edge.to === to)) {
            edges.push({ to, weight });
            this.adjacencyList.set(from, edges);
        }
    }
    getNode(id) {
        return this.nodes.get(id);
    }
    getEdges(id) {
        return this.adjacencyList.get(id) || [];
    }
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
    size() {
        return this.nodes.size;
    }
    clear() {
        this.nodes.clear();
        this.adjacencyList.clear();
    }
}
exports.Graph = Graph;
