// Mock in-memory database - works with or without Mongoose
const bcrypt = require('bcryptjs');

const mockData = {
  users: [
    {
      _id: '1',
      username: 'admin',
      password: '$2a$10$8qDXvKnqLuH8eVMPiCtvbemVyeR9qXnrRjH2lPx3vEg6mq7hD1U7S', // bcrypt of 'admin123'
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  students: [],
  fees: [],
  areas: []
};

// Mock user class that mimics Mongoose model behavior
class MockUser {
  constructor(data) {
    Object.assign(this, data);
  }
  
  async compare(pwd) {
    return bcrypt.compare(pwd, this.password);
  }
  
  static async findOne(query = {}) {
    const user = mockData.users.find(u => 
      Object.entries(query).every(([k, v]) => u[k] === v)
    );
    if (!user) return null;
    return new MockUser(user);
  }
  
  static async find(query = {}) {
    return mockData.users
      .filter(u => Object.entries(query).every(([k, v]) => u[k] === v))
      .map(u => new MockUser(u));
  }
  
  static async create(data) {
    // Hash password if provided
    if (data.password && !data.password.startsWith('$2')) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = new MockUser({
      _id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    });
    mockData.users.push(user);
    return user;
  }
  
  static async deleteMany() {
    mockData.users.length = 0;
  }
}

// Export mock database
const mockDb = {
  connect: async () => {
    console.log('✅ Using mock in-memory database');
    return mockDb;
  },
  
  disconnect: async () => {
    console.log('📴 Mock database disconnected');
  },
  
  User: MockUser,
  
  // Seed initial data
  seed: async () => {
    mockData.users = [
      {
        _id: '1',
        username: 'admin',
        password: '$2a$10$8qDXvKnqLuH8eVMPiCtvbemVyeR9qXnrRjH2lPx3vEg6mq7hD1U7S',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }
};

module.exports = mockDb;
