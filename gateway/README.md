# API Gateway

> Reverse proxy та JWT верифікація

**Port:** 3000
**Технології:** Node.js, Express, NGINX

---

## Відповідальність

- Reverse proxy для backend сервісів
- JWT верифікація та авторизація
- CORS configuration
- Request/Response logging
- Rate limiting (майбутнє)

---

## Routes

```
/api/auth/*    → auth-service:3001
/api/spells/*  → spell-service:3002
```

---

## Middleware

**verifyToken** - Перевірка JWT токену
```javascript
req.headers.authorization = "Bearer <jwt>"
→ req.userId = decoded.userId
```

**cors** - CORS policy для frontend

**requestLogger** - Логування запитів

---

## Environment Variables

```env
PORT=3000
JWT_SECRET=your-secret-key
AUTH_SERVICE_URL=http://auth-service:3001
SPELL_SERVICE_URL=http://spell-service:3002
```

---

## Розробка

```bash
cd gateway
npm install
npm run dev
```

---

**Назад**: [Головна документація](../README.md)
