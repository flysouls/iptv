const SIZE = 10;

export class PromiseQueue {
    constructor() {}
    queue = [];
    size = 0;

    isEmpty() {
        return this.queue.length === 0;
    }

    enqueue(item) {
        this.queue.push(item);
    }

    dequeue() {
        return this.queue.shift();
    }

    async runItem() {
        if (this.size >= SIZE) {
            return ;
        }
        if (!this.isEmpty()) {
            this.size ++;
        }
    }

    async run() {
        while(!this.isEmpty()) {
            await this.dequeue()();
        }
    }
}