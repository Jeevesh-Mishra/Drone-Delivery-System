export interface GraphNode {
  id: string; // e.g. WH-A, C-14
  name: string;
  latitude: number;
  longitude: number;
  type: 'warehouse' | 'destination';
}

export interface GraphEdge {
  to: string; // Target node ID
  weight: number; // Distance in km (default edge weight)
}

export class Graph {
  private nodes: Map<string, GraphNode> = new Map();
  private adjacencyList: Map<string, GraphEdge[]> = new Map();

  public addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  public addEdge(from: string, to: string, weight: number): void {
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

  public getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  public getEdges(id: string): GraphEdge[] {
    return this.adjacencyList.get(id) || [];
  }

  public getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public size(): number {
    return this.nodes.size;
  }

  public clear(): void {
    this.nodes.clear();
    this.adjacencyList.clear();
  }
}
