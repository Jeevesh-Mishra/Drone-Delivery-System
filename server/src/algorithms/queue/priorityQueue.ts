export interface PriorityQueueElement<T> {
  priorityValue: number; // 1 = High, 2 = Medium, 3 = Low
  item: T;
}

export class PriorityQueue<T> {
  private heap: PriorityQueueElement<T>[] = [];

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public peekHighest(): PriorityQueueElement<T> | null {
    if (this.isEmpty()) return null;
    return this.heap[0];
  }

  public insert(item: T, priorityValue: number): void {
    const element: PriorityQueueElement<T> = { priorityValue, item };
    this.heap.push(element);
    this.bubbleUp(this.heap.length - 1);
  }

  public removeHighest(): PriorityQueueElement<T> | null {
    if (this.isEmpty()) return null;
    const highest = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0 && end !== undefined) {
      this.heap[0] = end;
      this.sinkDown(0);
    }
    return highest;
  }

  public updatePriority(matchFn: (element: T) => boolean, newPriorityValue: number): boolean {
    const index = this.heap.findIndex(el => matchFn(el.item));
    if (index === -1) return false;

    const oldPriority = this.heap[index].priorityValue;
    this.heap[index].priorityValue = newPriorityValue;

    if (newPriorityValue < oldPriority) {
      this.bubbleUp(index);
    } else {
      this.sinkDown(index);
    }
    return true;
  }

  public toArray(): PriorityQueueElement<T>[] {
    // Returns a copy of the underlying heap array
    return [...this.heap];
  }

  private bubbleUp(index: number): void {
    const element = this.heap[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];
      if (element.priorityValue >= parent.priorityValue) break;
      this.heap[index] = parent;
      index = parentIndex;
    }
    this.heap[index] = element;
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    const element = this.heap[index];

    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let leftChild: PriorityQueueElement<T> | null = null;
      let rightChild: PriorityQueueElement<T> | null = null;
      let swapIndex = -1;

      if (leftChildIndex < length) {
        leftChild = this.heap[leftChildIndex];
        if (leftChild.priorityValue < element.priorityValue) {
          swapIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        rightChild = this.heap[rightChildIndex];
        if (
          (swapIndex === -1 && rightChild.priorityValue < element.priorityValue) ||
          (swapIndex !== -1 && leftChild && rightChild.priorityValue < leftChild.priorityValue)
        ) {
          swapIndex = rightChildIndex;
        }
      }

      if (swapIndex === -1) break;
      this.heap[index] = this.heap[swapIndex];
      index = swapIndex;
    }
    this.heap[index] = element;
  }
}
