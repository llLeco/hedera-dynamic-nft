# Testing Guide for Hedera Dynamic NFT

This document provides an overview of the testing approach for the Hedera Dynamic NFT project and guidelines for running, writing, and maintaining tests.

## Testing Structure

The project employs a comprehensive testing strategy with different test types:

```
test/
├── collection/            # Controller tests for collection module
├── integration/           # Integration tests between services
├── nft/                   # Controller tests for NFT module
├── performance/           # Performance tests
├── snapshots/             # Snapshot tests for consistent output
├── hedera/                # Hedera service tests
├── ipfs/                  # IPFS service tests
├── app.e2e-spec.ts        # End-to-end API tests
├── collection.service.spec.ts  # Collection service unit tests
├── global-setup.js        # Global setup for test environment
├── global-teardown.js     # Global teardown for test environment
├── jest-e2e.config.js     # Configuration for e2e tests
├── nft.service.spec.ts    # NFT service unit tests
├── test-setup.js          # Setup file for general test configuration
└── test-utils.ts          # Test utilities and fixtures
```

## Types of Tests

1. **Unit Tests**: Test individual components in isolation with mocked dependencies.
2. **Integration Tests**: Test interactions between services (e.g., NFT and Hedera services).
3. **End-to-End Tests**: Test full API endpoints and request/response flows.
4. **Performance Tests**: Measure and verify performance metrics.
5. **Snapshot Tests**: Ensure output formats remain consistent between changes.

## Test Fixtures

We use standardized test fixtures (in `test-utils.ts`) to maintain consistent test data across all test files. This ensures tests are reliable and improves maintainability.

## Running Tests

The project includes several npm scripts for running different types of tests:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:performance

# Run snapshot tests
npm run test:snapshots

# Update snapshots after making intentional changes
npm run test:update-snapshots

# Clear Jest cache
npm run test:clear-cache

# Run tests with code coverage reporting
npm run test:cov

# Run tests in watch mode during development
npm run test:watch
```

## Writing Tests

### Unit Tests

Unit tests should:
- Focus on testing a single function or class in isolation
- Mock all external dependencies
- Test both success and failure paths
- Use descriptive test names that explain what is being tested

Example:
```typescript
describe('NFTService', () => {
  describe('createNFT', () => {
    it('should create an NFT successfully', () => {
      // Test implementation
    });
    
    it('should handle error when topic creation fails', () => {
      // Test implementation
    });
  });
});
```

### Integration Tests

Integration tests should:
- Focus on the interaction between services
- Verify correct call sequences and data transformations
- Be placed in the `integration/` directory with `.integration.spec.ts` suffix

### Performance Tests

Performance tests should:
- Measure execution time for key operations
- Include assertions on acceptable performance limits
- Be placed in the `performance/` directory with `.performance.spec.ts` suffix

### Snapshot Tests

Snapshot tests should:
- Ensure consistency in output formats
- Use fixed dates and predictable inputs
- Be placed in the `snapshots/` directory with `.snapshot.spec.ts` suffix

## Mocking

The project uses Jest's mocking capabilities. When mocking services:
- Use the provided mock factories in `test-utils.ts`
- Use `jest.spyOn()` for verifying method calls
- Reset mocks between tests using `jest.clearAllMocks()` in `afterEach`

## Test Environment

The test environment is configured in:
- `jest.config.js` for unit and non-e2e tests
- `test/jest-e2e.config.js` for E2E tests
- `test-setup.js` for general test setup
- `global-setup.js` and `global-teardown.js` for E2E test setup/teardown

## Best Practices

1. **Arrange-Act-Assert**: Structure tests with clear arrangement, action, and assertion phases
2. **Isolation**: Tests should not depend on each other
3. **Coverage**: Aim for high test coverage, especially for critical business logic
4. **Performance**: Keep tests fast to maintain a quick feedback loop
5. **Readability**: Write clear test descriptions that serve as documentation
6. **Maintainability**: Update tests when requirements change

## Continuous Integration

Tests are automatically run in the CI pipeline. Always ensure all tests pass before submitting a pull request. 