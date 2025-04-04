// Set longer timeout for all tests
jest.setTimeout(15000); // 15 seconds

// This file runs before each test file
beforeAll(() => {
  console.log('Starting test suite...');
  
  // Set timezone to ensure consistent date handling
  process.env.TZ = 'UTC';
  
  // Mock Date.now globally for predictable timestamps in tests
  const originalDateNow = Date.now;
  global.Date.now = jest.fn(() => 1672531200000); // 2023-01-01T00:00:00Z
  global._originalDateNow = originalDateNow;
});

afterAll(() => {
  console.log('Test suite finished');
  
  // Restore original Date.now
  if (global._originalDateNow) {
    global.Date.now = global._originalDateNow;
    delete global._originalDateNow;
  }
}); 