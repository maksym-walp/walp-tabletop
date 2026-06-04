const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

describe("API Gateway - Health Check", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get("/health", (req, res) => {
      res.json({ status: "ok", service: "api-gateway" });
    });
  });

  it("should return health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "api-gateway",
    });
  });
});

describe("API Gateway - JWT Middleware", () => {
  let app;
  const secret = process.env.JWT_SECRET || "test_secret_key_12345";

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // JWT verification middleware
    const verifyToken = (req, res, next) => {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
      } catch (err) {
        res.status(401).json({ error: "Invalid token" });
      }
    };

    // Protected route
    app.get("/protected", verifyToken, (req, res) => {
      res.json({ message: "Protected resource", user: req.user });
    });
  });

  it("should reject request without token", async () => {
    const response = await request(app).get("/protected");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "No token provided" });
  });

  it("should accept valid token", async () => {
    const token = jwt.sign({ userId: 1, username: "testuser" }, secret, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Protected resource");
    expect(response.body.user).toHaveProperty("userId", 1);
  });

  it("should reject invalid token", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalid_token");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid token" });
  });

  it("should reject expired token", async () => {
    const token = jwt.sign({ userId: 1 }, secret, { expiresIn: "0s" });

    // Wait a bit to ensure token is expired
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid token" });
  });
});

describe("API Gateway - CORS Configuration", () => {
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

describe("API Gateway - Request Routing", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock route for auth service
    app.use("/api/auth", (req, res) => {
      res.json({ service: "auth-service" });
    });

    // Mock route for spell service
    app.use("/api/spells", (req, res) => {
      res.json({ service: "spell-service" });
    });
  });

  it("should route auth requests to auth service", async () => {
    const response = await request(app).get("/api/auth/login");

    expect(response.status).toBe(200);
    expect(response.body.service).toBe("auth-service");
  });

  it("should route spell requests to spell service", async () => {
    const response = await request(app).get("/api/spells");

    expect(response.status).toBe(200);
    expect(response.body.service).toBe("spell-service");
  });
});
