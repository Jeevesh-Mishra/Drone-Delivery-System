"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityQueue = void 0;
class PriorityQueue {
    heap = [];
    size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    peekHighest() {
        if (this.isEmpty())
            return null;
        return this.heap[0];
    }
    insert(item, priorityValue) {
        const element = { priorityValue, item };
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }
    removeHighest() {
        if (this.isEmpty())
            return null;
        const highest = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0 && end !== undefined) {
            this.heap[0] = end;
            this.sinkDown(0);
        }
        return highest;
    }
    updatePriority(matchFn, newPriorityValue) {
        const index = this.heap.findIndex(el => matchFn(el.item));
        if (index === -1)
            return false;
        const oldPriority = this.heap[index].priorityValue;
        this.heap[index].priorityValue = newPriorityValue;
        if (newPriorityValue < oldPriority) {
            this.bubbleUp(index);
        }
        else {
            this.sinkDown(index);
        }
        return true;
    }
    toArray() {
        // Returns a copy of the underlying heap array
        return [...this.heap];
    }
    bubbleUp(index) {
        const element = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            if (element.priorityValue >= parent.priorityValue)
                break;
            this.heap[index] = parent;
            index = parentIndex;
        }
        this.heap[index] = element;
    }
    sinkDown(index) {
        const length = this.heap.length;
        const element = this.heap[index];
        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let leftChild = null;
            let rightChild = null;
            let swapIndex = -1;
            if (leftChildIndex < length) {
                leftChild = this.heap[leftChildIndex];
                if (leftChild.priorityValue < element.priorityValue) {
                    swapIndex = leftChildIndex;
                }
            }
            if (rightChildIndex < length) {
                rightChild = this.heap[rightChildIndex];
                if ((swapIndex === -1 && rightChild.priorityValue < element.priorityValue) ||
                    (swapIndex !== -1 && leftChild && rightChild.priorityValue < leftChild.priorityValue)) {
                    swapIndex = rightChildIndex;
                }
            }
            if (swapIndex === -1)
                break;
            this.heap[index] = this.heap[swapIndex];
            index = swapIndex;
        }
        this.heap[index] = element;
    }
}
exports.PriorityQueue = PriorityQueue;
