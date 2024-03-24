const SIZE = 50;

class PromiseQueue {
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
        if (this.isEmpty()) {
            if (this.size === 0) {
                this.cb && this.cb();
            }
            return ;
        }
        if (this.size <= SIZE) {
            this.size ++;
            await this.dequeue()();
            this.size --;
            process.nextTick(() => {
                this.runItem();
            })
        }
    }

    async run() {
        for (let i = 0; i < SIZE; i++) {
            this.runItem();
        }
    }

    done(cb) {
        this.cb = cb;
    }    
}

export default new PromiseQueue();
