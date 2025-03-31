module.exports=class Queue {
    constructor(map) {
        this.items = Array.from(map.keys());
    }
    dequeue() {
        if (this.isEmpty()) {
            return "Queue is empty";
        }
        return this.items.shift();
    }
    isEmpty() {
        return this.items.length === 0;
    }
    remove(item) {
        const index = this.items.indexOf(item);
        if (index !== -1) 
            this.items.splice(index, 1);
    }

}