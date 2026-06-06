const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

describe("Auth Utils - Password Hashing", () => {
  it("should hash passwords correctly", async () => {
    const password = "test_password_123";
    const hash = await bcryptjs.hash(password, 10);

    expect(hash).not.toBe(password);
    expect(hash).toBeDefined();
    expect(typeof hash).toBe("string");
  });

  it("should verify correct password", async () => {
    const password = "test_password_123";
    const hash = await bcryptjs.hash(password, 10);
    const isValid = await bcryptjs.compare(password, hash);

    expect(isValid).toBe(true);
  });

  it("should reject incorrect password", async () => {
    const password = "test_password_123";
    const hash = await bcryptjs.hash(password, 10);
    const isValid = await bcryptjs.compare("wrong_password", hash);

    expect(isValid).toBe(false);
  });

  it("should handle very long passwords", async () => {
    const longPassword = "a".repeat(100);
    const hash = await bcryptjs.hash(longPassword, 10);
    const isValid = await bcryptjs.compare(longPassword, hash);

    expect(isValid).toBe(true);
  });
});

describe("Auth Utils - JWT Token Management", () => {
  const secret = process.env.JWT_SECRET || "test_secret_key_12345";

  it("should create valid JWT token", () => {
    const payload = {
      userId: 1,
      username: "testuser",
      email: "test@example.com",
    };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("should decode valid token", () => {
    const payload = { userId: 1, username: "testuser" };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    const decoded = jwt.verify(token, secret);

    expect(decoded).toHaveProperty("userId", 1);
    expect(decoded).toHaveProperty("username", "testuser");
    expect(decoded).toHaveProperty("iat");
    expect(decoded).toHaveProperty("exp");
  });

  it("should reject invalid token", () => {
    const invalidToken = "invalid.token.here";

    expect(() => {
      jwt.verify(invalidToken, secret);
    }).toThrow();
  });

  it("should reject token signed with different secret", () => {
    const payload = { userId: 1 };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    expect(() => {
      jwt.verify(token, "different_secret");
    }).toThrow();
  });

  it("should include custom claims in token", () => {
    const payload = {
      userId: 1,
      username: "testuser",
      role: "admin",
      permissions: ["read", "write", "delete"],
    };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    const decoded = jwt.verify(token, secret);

    expect(decoded).toHaveProperty("role", "admin");
    expect(decoded.permissions).toContain("read");
    expect(decoded.permissions).toContain("write");
  });
});

describe("Auth Utils - Input Validation", () => {
  it("should validate email format", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    expect(emailRegex.test("valid@example.com")).toBe(true);
    expect(emailRegex.test("invalid.email")).toBe(false);
    expect(emailRegex.test("invalid@example")).toBe(false);
    expect(emailRegex.test("@example.com")).toBe(false);
  });

  it("should validate password strength", () => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    expect(passwordRegex.test("WeakPass1")).toBe(false);
    expect(passwordRegex.test("StrongPass123!")).toBe(true);
    expect(passwordRegex.test("strongpass123!")).toBe(false);
    expect(passwordRegex.test("STRONGPASS123!")).toBe(false);
  });

  it("should validate username format", () => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

    expect(usernameRegex.test("valid_user-123")).toBe(true);
    expect(usernameRegex.test("ab")).toBe(false);
    expect(usernameRegex.test("invalid user")).toBe(false);
    expect(usernameRegex.test("user@name")).toBe(false);
  });
});
