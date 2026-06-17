// Simple in-memory mock database for local development
// This is a lightweight alternative when MongoDB Atlas is unreachable

const mockDatabase = {
  collections: {
    users: [
      {
        _id: '1',
        username: 'admin',
        password: '$2a$10$YourHashedPasswordHere', // bcrypt hash of 'admin123'
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    students: [],
    fees: [],
    areas: [],
    reports: []
  },

  connect: async function() {
    console.log('✅ Using mock in-memory database (no external connection needed)');
    return this;
  },

  disconnect: async function() {
    console.log('📴 Mock database disconnected');
  },

  collection: function(name) {
    return new MockCollection(this.collections[name] || []);
  }
};

class MockCollection {
  constructor(data = []) {
    this.data = data;
  }

  async find(query = {}) {
    return {
      toArray: async () => this.data.filter(item => this.matchesQuery(item, query)),
      limit: (n) => ({ toArray: async () => this.data.filter(item => this.matchesQuery(item, query)).slice(0, n) })
    };
  }

  async findOne(query = {}) {
    return this.data.find(item => this.matchesQuery(item, query)) || null;
  }

  async insertOne(doc) {
    doc._id = String(Date.now());
    this.data.push(doc);
    return { insertedId: doc._id };
  }

  async updateOne(query, update) {
    const item = this.data.find(item => this.matchesQuery(item, query));
    if (item) Object.assign(item, update.$set || update);
    return { modifiedCount: item ? 1 : 0 };
  }

  async deleteOne(query) {
    const index = this.data.findIndex(item => this.matchesQuery(item, query));
    if (index >= 0) this.data.splice(index, 1);
    return { deletedCount: index >= 0 ? 1 : 0 };
  }

  matchesQuery(item, query) {
    return Object.entries(query).every(([key, value]) => item[key] === value);
  }
}

module.exports = mockDatabase;
