export class Queue<T> {
  private items: T[] = [];

  public enqueue(item: T): void {
    this.items.push(item);
  }

  public dequeue(): T | null {
    if (this.isEmpty()) return null;
    return this.items.shift() || null;
  }

  public peek(): T | null {
    if (this.isEmpty()) return null;
    return this.items[0];
  }

  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  public size(): number {
    return this.items.length;
  }

  public toArray(): T[] {
    return [...this.items];
  }
}
