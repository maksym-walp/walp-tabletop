const jwt = require("jsonwebtoken");

describe("Gateway Service - Token Utilities", () => {
  const secret = process.env.JWT_SECRET || "test_secret_key_12345";

  let tokenManager;

  beforeEach(() => {
    tokenManager = {
      generateToken: (payload, expiresIn = "1h") => {
        return jwt.sign(payload, secret, { expiresIn });
      },
      verifyToken: (token) => {
        return jwt.verify(token, secret);
      },
      decodeToken: (token) => {
        return jwt.decode(token);
      },
      isTokenExpired: (token) => {
        try {
          const decoded = jwt.verify(token, secret);
          return false;
        } catch (err) {
          return err.name === "TokenExpiredError";
        }
      },
    };
  });

  it("should generate valid token", () => {
    const payload = { userId: 1, username: "testuser" };
    const token = tokenManager.generateToken(payload);

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("should verify valid token", () => {
    const payload = { userId: 1, username: "testuser" };
    const token = tokenManager.generateToken(payload);
    const verified = tokenManager.verifyToken(token);

    expect(verified).toHaveProperty("userId", 1);
    expect(verified).toHaveProperty("username", "testuser");
  });

  it("should decode token without verification", () => {
    const payload = { userId: 1, username: "testuser" };
    const token = tokenManager.generateToken(payload);
    const decoded = tokenManager.decodeToken(token);

    expect(decoded).toHaveProperty("userId", 1);
    expect(decoded).toHaveProperty("username", "testuser");
  });

  it("should detect expired token", async () => {
    const payload = { userId: 1 };
    const token = tokenManager.generateToken(payload, "0s");

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(tokenManager.isTokenExpired(token)).toBe(true);
  });

  it("should not detect valid token as expired", () => {
    const payload = { userId: 1 };
    const token = tokenManager.generateToken(payload, "1h");

    expect(tokenManager.isTokenExpired(token)).toBe(false);
  });
});

describe("Gateway Service - URL Routing", () => {
  let router;

  beforeEach(() => {
    router = {
      getServiceUrl: (path) => {
        if (path.startsWith("/api/auth")) {
          return "http://localhost:3001";
        }
        if (path.startsWith("/api/spells")) {
          return "http://localhost:3002";
        }
        return null;
      },
      getServicePath: (path) => {
        if (path.startsWith("/api/auth")) {
          return path.replace("/api/auth", "");
        }
        if (path.startsWith("/api/spells")) {
          return path.replace("/api/spells", "");
        }
        return path;
      },
    };
  });

  it("should route auth endpoints to auth service", () => {
    const url = router.getServiceUrl("/api/auth/login");

    expect(url).toBe("http://localhost:3001");
  });

  it("should route spell endpoints to spell service", () => {
    const url = router.getServiceUrl("/api/spells");

    expect(url).toBe("http://localhost:3002");
  });

  it("should extract service path for auth", () => {
    const path = router.getServicePath("/api/auth/login");

    expect(path).toBe("/login");
  });

  it("should extract service path for spells", () => {
    const path = router.getServicePath("/api/spells/1");

    expect(path).toBe("/1");
  });

  it("should return null for unknown route", () => {
    const url = router.getServiceUrl("/api/unknown");

    expect(url).toBeNull();
  });
});

describe("Gateway Service - Error Handling", () => {
  let errorHandler;

  beforeEach(() => {
    errorHandler = {
      formatError: (statusCode, message) => {
        return {
          status: "error",
          statusCode,
          message,
          timestamp: new Date().toISOString(),
        };
      },
      isClientError: (statusCode) => {
        return statusCode >= 400 && statusCode < 500;
      },
      isServerError: (statusCode) => {
        return statusCode >= 500;
      },
    };
  });

  it("should format error response", () => {
    const error = errorHandler.formatError(401, "Unauthorized");

    expect(error).toHaveProperty("status", "error");
    expect(error).toHaveProperty("statusCode", 401);
    expect(error).toHaveProperty("message", "Unauthorized");
    expect(error).toHaveProperty("timestamp");
  });

  it("should identify client errors", () => {
    expect(errorHandler.isClientError(400)).toBe(true);
    expect(errorHandler.isClientError(401)).toBe(true);
    expect(errorHandler.isClientError(404)).toBe(true);
    expect(errorHandler.isClientError(500)).toBe(false);
  });

  it("should identify server errors", () => {
    expect(errorHandler.isServerError(500)).toBe(true);
    expect(errorHandler.isServerError(502)).toBe(true);
    expect(errorHandler.isServerError(503)).toBe(true);
    expect(errorHandler.isServerError(400)).toBe(false);
  });
});

describe("Gateway Service - Request Validation", () => {
  let validator;

  beforeEach(() => {
    validator = {
      validateAuthHeader: (header) => {
        if (!header)
          return { valid: false, error: "Authorization header missing" };
        if (!header.startsWith("Bearer "))
          return { valid: false, error: "Invalid authorization format" };
        const token = header.replace("Bearer ", "");
        if (!token) return { valid: false, error: "Token missing" };
        return { valid: true, token };
      },
      validateContentType: (contentType) => {
        return contentType && contentType.includes("application/json");
      },
      sanitizePath: (path) => {
        return path.replace(/\.\./g, "").replace(/\/+/g, "/");
      },
    };
  });

  it("should validate correct auth header", () => {
    const result = validator.validateAuthHeader("Bearer token123");

    expect(result.valid).toBe(true);
    expect(result.token).toBe("token123");
  });

  it("should reject missing auth header", () => {
    const result = validator.validateAuthHeader(null);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Authorization header missing");
  });

  it("should reject invalid auth format", () => {
    const result = validator.validateAuthHeader("InvalidFormat token123");

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid authorization format");
  });

  it("should validate JSON content type", () => {
    expect(validator.validateContentType("application/json")).toBe(true);
    expect(
      validator.validateContentType("application/json; charset=utf-8"),
    ).toBe(true);
    expect(validator.validateContentType("text/html")).toBe(false);
  });

  it("should sanitize file paths", () => {
    expect(validator.sanitizePath("../../../etc/passwd")).toBe("/etc/passwd");
    expect(validator.sanitizePath("/api//spells///1")).toBe("/api/spells/1");
  });
});
