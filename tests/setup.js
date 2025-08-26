const mongoose = require('mongoose');

// Use a simple test database approach
beforeAll(async () => {
  // Connect to a test database (you can use your existing MongoDB)
  const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/survey-app-test';
  
  try {
    await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to test database');
  } catch (error) {
    console.warn('Could not connect to test database:', error.message);
    console.warn('Skipping database tests - make sure MongoDB is running for full test coverage');
  }
}, 60000);

// Clean up after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}, 30000);

// Clear database between tests (only if connected)
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    } catch (error) {
      console.warn('Could not clear collections:', error.message);
    }
  }
});