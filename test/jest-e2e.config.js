module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/../src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/test-setup.js'],
  globalSetup: '<rootDir>/global-setup.js',
  globalTeardown: '<rootDir>/global-teardown.js',
  testTimeout: 30000, // 30 seconds
  maxWorkers: 1, // Run tests sequentially
  collectCoverage: false
}; 