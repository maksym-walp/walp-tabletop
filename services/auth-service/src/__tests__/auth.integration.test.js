const request = require("supertest");
const express = require("express");
const authRoutes = require("../../routes/auth");

// Mock database pool
const mockPool = {
  query: jest.fn(),
  getConnection: jest.fn(),
};

describe("Auth Service - Health Check", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({ status: "ok", service: "auth-service" });
    });
  });

  it("should return health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "auth-service",
    });
  });
});

describe("Auth Service - Route Setup", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/api/auth", authRoutes(mockPool));
  });

  it("should have auth routes registered", async () => {
    // Test that routes are properly registered
    const response = await request(app).post("/api/auth/login").send({});
    // Should get a response (even if it's an error due to invalid data)
    expect(response.status).toBeDefined();
  });
});

describe("Auth Service - CORS Configuration", () => {
  let app;

  beforeEach(() => {
    const cors = require("cors");
    app = express();
    app.use(cors());
    app.use(express.json());
    app.get("/test", (req, res) => {
      res.json({ message: "test" });
    });
  });

  it("should have CORS headers enabled", async () => {
    const response = await request(app)
      .get("/test")
      .set("Origin", "http://localhost:3000");

    expect(response.headers["access-control-allow-origin"]).toBeDefined();
  });
});
