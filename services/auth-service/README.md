# Auth Service

> Сервіс аутентифікації та авторизації користувачів

**Port:** 3001 (internal)
**Database:** `auth_db`

---

## Відповідальність

- Реєстрація користувачів
- Аутентифікація (login)
- Генерація JWT токенів
- Управління користувачами

---

## API Endpoints

### Public (без auth)

```http
POST /register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response: 201 Created
{
  "token": "eyJhbGciOiJI...",
  "user": { "id": 1, "username": "user123", "email": "user@example.com" }
}
```

```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJI...",
  "user": { "id": 1, "username": "user123" }
}
```

### Protected (потрібен JWT)

```http
GET /users
Authorization: Bearer <jwt-token>

Response: 200 OK
[
  { "id": 1, "username": "user123", "email": "user@example.com" },
  ...
]
```

```http
GET /users/:id
Authorization: Bearer <jwt-token>

Response: 200 OK
{
  "id": 1,
  "username": "user123",
  "email": "user@example.com",
  "created_at": "2026-01-01T00:00:00.000Z"
}
```

---

## Environment Variables

```env
PORT=3001
AUTH_DB_HOST=db
AUTH_DB_PORT=3306
AUTH_DB_USER=auth_user
AUTH_DB_PASSWORD=auth_password
AUTH_DB_NAME=auth_db
JWT_SECRET=your-secret-key-here
```

---

## Database Schema

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Розробка

```bash
cd services/auth-service

# Install
npm install

# Development
npm run dev

# Tests
npm test

# Build
npm run build
```

---

## JWT Token

**Structure:**
```json
{
  "userId": 1,
  "username": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Expiration:** 1 година

---

## Безпека

- Паролі хешуються з **bcrypt** (cost factor: 10)
- JWT підписується з **HS256**
- Мінімальна довжина пароля: 6 символів

---

**Назад**: [Головна документація](../../README.md)
