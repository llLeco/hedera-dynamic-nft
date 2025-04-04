// This file runs once after all tests in the test suite

module.exports = async () => {
  console.log('Tearing down global test environment...');
  
  // Any cleanup needed for the test environment
  
  // You could clean up mock services or test data here
  
  console.log('Global test environment teardown complete.');
}; 