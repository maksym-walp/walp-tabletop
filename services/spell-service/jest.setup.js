// Load test environment variables
require("dotenv").config({ path: ".env.test" });

// Global test setup
beforeAll(() => {
  console.log("Test environment loaded");
});

// Global cleanup
afterAll(() => {
  console.log("Tests completed");
});
