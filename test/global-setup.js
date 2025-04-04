// This file runs once before all tests in the test suite

const { resolve } = require('path');
const dotenv = require('dotenv');

module.exports = async () => {
  console.log('Setting up global test environment...');
  
  // Load environment variables from .env.test if it exists, otherwise use .env
  const testEnvPath = resolve(process.cwd(), '.env.test');
  const envPath = resolve(process.cwd(), '.env');
  
  try {
    // Try to load test-specific env file first
    dotenv.config({ path: testEnvPath });
    console.log('Loaded test environment from .env.test');
  } catch (e) {
    // Fall back to regular .env
    dotenv.config({ path: envPath });
    console.log('Loaded environment from .env');
  }

  // Set testing specific environment variables
  process.env.NODE_ENV = 'test';
  process.env.JEST_WORKER_ID = process.env.JEST_WORKER_ID || '1';
  
  // You could setup mock external services here if needed
  
  console.log('Global test environment setup complete.');
}; 