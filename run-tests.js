const mongoose = require('mongoose');
const { spawn } = require('child_process');

async function checkDatabaseConnection() {
  const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/survey-app-test';
  
  try {
    await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Database connection successful');
    console.log(`📊 Connected to: ${testDbUri}`);
    console.log('🧪 Full test suite will run with database tests');
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log(`📊 Attempted to connect to: ${testDbUri}`);
    console.log('🧪 Tests will run without database operations');
    console.log('\n💡 To run full tests:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Set TEST_MONGODB_URI environment variable if needed');
    console.log(`   3. Current URI: ${testDbUri}`);
    
    return false;
  }
}

async function runTests() {
  console.log('🔍 Checking test environment...\n');
  
  await checkDatabaseConnection();
  
  console.log('\n🚀 Starting test suite...\n');
  
  const jest = spawn('npx', ['jest', '--verbose'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'test'
    }
  });
  
  jest.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ All tests completed successfully!');
    } else {
      console.log('\n❌ Some tests failed. Check output above for details.');
    }
    process.exit(code);
  });
}

runTests().catch(console.error);