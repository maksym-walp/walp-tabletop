# Testing Guide - Walpapur Tabletop

This guide describes the testing infrastructure for the Walpapur Tabletop monorepo.

## Overview

The project includes:

- **Unit Tests**: Test individual functions, utilities, and components in isolation
- **Integration Tests**: Test interactions between components and with external services
- **CI/CD Pipeline**: Automated testing on every push and pull request using GitHub Actions

## Test Structure

```
services/
├── auth-service/
│   ├── src/
│   │   └── __tests__/
│   │       ├── auth.unit.test.js           # Unit tests
│   │       └── auth.integration.test.js    # Integration tests
│   ├── jest.config.js                      # Jest configuration
│   └── jest.setup.js                       # Test setup
├── spell-service/
│   ├── src/
│   │   └── __tests__/
│   │       ├── spell.unit.test.js          # Unit tests
│   │       ├── spell.integration.test.js   # Integration tests
│   │       └── example.test.js             # Example test
│   ├── jest.config.js
│   └── jest.setup.js
└── ...
gateway/
├── src/
│   └── __tests__/
│       ├── gateway.unit.test.js            # Unit tests
│       └── gateway.integration.test.js     # Integration tests
├── jest.config.js
└── jest.setup.js
```

## Running Tests Locally

### Prerequisites

- Node.js >= 18
- npm >= 9
- MySQL 8.0 (for integration tests)

### Install Dependencies

```bash
# Root directory
npm ci
```

### Run All Tests

```bash
# Run all tests for all services
npm test

# Or use the shell script
./scripts/test-all.sh
```

### Run Tests for Specific Service

```bash
# Auth Service
npm run test:auth

# Spell Service
npm run test:spell

# Gateway Service
npm run test:gateway

# Watch mode (auto-rerun on changes)
cd services/auth-service
npm run test:watch

# Coverage report
npm run test:coverage
```

### Run Tests with Coverage

```bash
# All services
npm run test:coverage

# Specific service
cd services/auth-service
npm run test:coverage
```

## Test Files

### Auth Service

#### `auth.unit.test.js`

- Password hashing with bcryptjs
- JWT token creation and verification
- Input validation (email, password, username)

#### `auth.integration.test.js`

- Health check endpoint
- Route setup and configuration
- CORS configuration

### Spell Service

#### `spell.unit.test.js`

- Spell validation
- Duration parsing
- Component validation

#### `spell.integration.test.js`

- Health check endpoint
- Spell data processing
- CORS configuration
- Invalid JSON handling

### Gateway Service

#### `gateway.unit.test.js`

- Token utilities and management
- URL routing for services
- Error handling
- Request validation

#### `gateway.integration.test.js`

- Health check endpoint
- JWT middleware
- Token verification
- CORS configuration
- Request routing

## GitHub Actions CI/CD Pipeline

The project includes a comprehensive CI/CD pipeline defined in `.github/workflows/ci-cd.yml`.

### Pipeline Stages

1. **Test**: Run tests for all services (Node.js 18.x and 20.x)
2. **Lint**: Check code style
3. **Build**: Build all services
4. **Integration Test**: Run full integration tests
5. **Docker Build**: Build Docker images (main branch only)

### Workflow Details

- Runs on: `push` to main/develop, `pull_request` to main/develop
- Database: MySQL 8.0 service provided
- Coverage: Collected and uploaded as artifacts
- Build artifacts: Stored for deployment

### View Pipeline Status

- Go to: https://github.com/maksym-walp/walp-tabletop/actions
- Check status of recent runs
- View logs for failed tests

## Writing Tests

### Unit Test Template

```javascript
describe("Module - Feature", () => {
  let moduleInstance;

  beforeEach(() => {
    // Setup before each test
    moduleInstance = new Module();
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it("should do something", () => {
    // Arrange
    const input = "test";

    // Act
    const result = moduleInstance.method(input);

    // Assert
    expect(result).toBe("expected");
  });
});
```

### Integration Test Template

```javascript
const request = require("supertest");
const express = require("express");

describe("API - Endpoint", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Setup routes
  });

  it("should return 200 on GET /endpoint", async () => {
    const response = await request(app).get("/endpoint");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
  });
});
```

## Best Practices

1. **Name tests descriptively**: Use clear, specific test names
2. **One assertion per test**: Each test should verify one thing
3. **Use beforeEach/afterEach**: For setup and cleanup
4. **Mock external dependencies**: Don't test databases in unit tests
5. **Test happy path and edge cases**: Both success and error scenarios
6. **Keep tests fast**: Avoid long timeouts unless necessary

## Troubleshooting

### Tests Timeout

- Check if database is running: `npm run db:up`
- Increase timeout in jest.config.js: `testTimeout: 20000`

### Module Not Found

- Run `npm ci` in the service directory
- Check imports and paths

### Database Connection Issues

- Verify MySQL is running
- Check environment variables in jest.setup.js
- Run migrations: `npm run migrate`

### Coverage Reports

- Coverage reports are generated in `coverage/` directory
- View HTML report: Open `coverage/index.html` in browser

## Environment Variables

### Test Environment Variables

Tests automatically load environment variables from:

1. `.env.test` (if exists)
2. `.env.test.example` (fallback)

Key variables for testing:

- `NODE_ENV=test`
- `JWT_SECRET` - Secret for JWT signing
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `SPELLS_DB_*` - Spell database configuration
- `JEST_TIMEOUT` - Test timeout (default: 10000ms)

## CI/CD Environment

### GitHub Actions Environment

The CI/CD pipeline runs in GitHub Actions with:

- Ubuntu latest
- Node.js 18.x and 20.x (matrix)
- MySQL 8.0 service
- Pre-configured environment variables

### Viewing Pipeline Results

1. Push to GitHub
2. Go to Actions tab
3. Click on workflow run
4. View test results and logs
5. Download coverage artifacts

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Testing Best Practices](https://jestjs.io/docs/testing-techniques)

## Contributing

When contributing tests:

1. Write both unit and integration tests
2. Ensure all tests pass locally
3. Maintain or improve code coverage
4. Follow naming conventions
5. Update this README if adding new test patterns

## Contact

For questions about testing, contact the development team.
