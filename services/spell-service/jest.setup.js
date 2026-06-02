const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load test environment variables (prefer local .env.test, fall back to the committed example)
const envPath = path.join(__dirname, ".env.test");
const exampleEnvPath = path.join(__dirname, ".env.test.example");
dotenv.config({ path: fs.existsSync(envPath) ? envPath : exampleEnvPath });

// Allow timeout to be configured via the env file
jest.setTimeout(Number(process.env.JEST_TIMEOUT) || 10000);

// Global test setup
beforeAll(() => {
  console.log("Test environment loaded");
});

// Global cleanup
afterAll(() => {
  console.log("Tests completed");
});
