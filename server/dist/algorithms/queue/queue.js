"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    items = [];
    enqueue(item) {
        this.items.push(item);
    }
    dequeue() {
        if (this.isEmpty())
            return null;
        return this.items.shift() || null;
    }
    peek() {
        if (this.isEmpty())
            return null;
        return this.items[0];
    }
    isEmpty() {
        return this.items.length === 0;
    }
    size() {
        return this.items.length;
    }
    toArray() {
        return [...this.items];
    }
}
exports.Queue = Queue;
