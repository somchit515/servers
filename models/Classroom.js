class Classroom {
    constructor(id, name, capacity) {
      this.id = id;
      this.name = name;
      this.capacity = capacity;
    }
  
    getInfo() {
      return `Classroom ID: ${this.id}, Name: ${this.name}, Capacity: ${this.capacity}`;
    }
  }
  
  module.exports = Classroom;
  