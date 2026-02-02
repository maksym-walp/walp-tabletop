# Архітектура системи

> Детальний опис мікросервісної архітектури Walpapur Tabletop

---

## Загальна схема

```
┌──────────────────────────────────────────────────────────┐
│                        Browser                           │
│                   (User Interface)                       │
└─────────────────────┬────────────────────────────────────┘
                      │ HTTP
                      ▼
┌──────────────────────────────────────────────────────────┐
│                     Web Service                          │
│               React SPA + NGINX                          │
│                    Port: 80/443                          │
└─────────────────────┬────────────────────────────────────┘
                      │ HTTP/HTTPS
                      ▼
┌──────────────────────────────────────────────────────────┐
│                   API Gateway                            │
│           NGINX Reverse Proxy + JWT Verification         │
│                     Port: 3000                           │
└─────────┬─────────────────────────┬──────────────────────┘
          │                         │
          │ HTTP                    │ HTTP
          ▼                         ▼
┌─────────────────────┐   ┌──────────────────────┐
│   Auth Service      │   │   Spell Service      │
│   Authentication    │   │   Spell Management   │
│   Port: 3001        │   │   Port: 3002         │
└────────┬────────────┘   └──────────┬───────────┘
         │                           │
         │ MySQL Protocol            │ MySQL Protocol
         └────────────┬──────────────┘
                      ▼
          ┌──────────────────────┐
          │    MySQL Database    │
          │      Port: 3306      │
          │  ┌────────────────┐  │
          │  │   auth_db      │  │
          │  │   spells_db    │  │
          │  └────────────────┘  │
          └──────────────────────┘
```

---

## Компоненти системи

### 1. Web Service (Frontend)

**Технології:** React 19, React Router, CSS
**Port:** 80 (HTTP), 443 (HTTPS)
**Контейнер:** `walpapur-web`

**Відповідальність:**
- Відображення інтерфейсу користувача
- Client-side routing
- Взаємодія з API Gateway
- Збереження JWT токенів

**Основні компоненти:**
- `SpellList` - список заклинань
- `SpellDetail` - деталі заклинання
- `SpellForm` - створення/редагування
- `Traditions` - традиції магії
- `Auth` - форми логіну/реєстрації

### 2. API Gateway

**Технології:** Node.js, Express, NGINX
**Port:** 3000
**Контейнер:** `walpapur-gateway`

**Відповідальність:**
- Reverse proxy для всіх backend сервісів
- JWT верифікація та авторизація
- Rate limiting
- Request/Response logging
- CORS configuration

**Routes:**
```
/api/auth/*    → auth-service:3001
/api/spells/*  → spell-service:3002
```

**Middleware:**
- `verifyToken` - перевірка JWT
- `cors` - CORS policy
- `requestLogger` - логування запитів

### 3. Auth Service

**Технології:** Node.js, Express, JWT, bcrypt
**Port:** 3001 (internal)
**Контейнер:** `walpapur-auth`
**Database:** `auth_db`

**Відповідальність:**
- Реєстрація користувачів
- Аутентифікація (login)
- Генерація JWT токенів
- Хешування паролів (bcrypt)
- Управління користувачами

**API Endpoints:**
```
POST   /register      # Реєстрація
POST   /login         # Логін
GET    /users         # Список користувачів (auth required)
GET    /users/:id     # Деталі користувача
PUT    /users/:id     # Оновлення профілю
DELETE /users/:id     # Видалення користувача
```

**Database Schema:**
```sql
users
├── id (INT, PRIMARY KEY, AUTO_INCREMENT)
├── username (VARCHAR, UNIQUE)
├── email (VARCHAR, UNIQUE)
├── password_hash (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### 4. Spell Service

**Технології:** Node.js, Express
**Port:** 3002 (internal)
**Контейнер:** `walpapur-spells`
**Database:** `spells_db`

**Відповідальність:**
- CRUD операції для заклинань
- Пошук та фільтрація
- Організація за традиціями
- Управління характеристиками заклинань

**API Endpoints:**
```
GET    /spells           # Список заклинань (з фільтрами)
GET    /spells/:id       # Деталі заклинання
POST   /spells           # Створити заклинання (auth required)
PUT    /spells/:id       # Оновити заклинання (auth required)
DELETE /spells/:id       # Видалити заклинання (auth required)
GET    /traditions       # Список традицій
```

**Database Schema:**
```sql
spells
├── id (INT, PRIMARY KEY, AUTO_INCREMENT)
├── name (VARCHAR)
├── level (INT)
├── school (VARCHAR)
├── casting_time (VARCHAR)
├── range (VARCHAR)
├── components (VARCHAR)
├── duration (VARCHAR)
├── description (TEXT)
├── tradition (VARCHAR)
├── created_by (INT, FOREIGN KEY → users.id)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### 5. MySQL Database

**Технології:** MySQL 8.0
**Port:** 3306
**Контейнер:** `walpapur-db`

**Databases:**
- `auth_db` - користувачі та аутентифікація
- `spells_db` - заклинання та пов'язані дані

**Характеристики:**
- UTF-8 encoding (utf8mb4)
- Healthcheck для перевірки готовності
- Persistent volume для збереження даних

---

## Потоки даних

### Реєстрація користувача

```
1. Browser → Web: Заповнення форми реєстрації
2. Web → Gateway: POST /api/auth/register { username, email, password }
3. Gateway → Auth Service: Перенаправлення запиту
4. Auth Service:
   - Валідація даних
   - Хешування паролю (bcrypt)
   - Збереження в auth_db
5. Auth Service → Gateway: JWT токен
6. Gateway → Web: JWT токен
7. Web: Збереження токену в localStorage
```

### Створення заклинання

```
1. Browser → Web: Заповнення форми заклинання
2. Web → Gateway: POST /api/spells { spell data } + JWT header
3. Gateway:
   - Верифікація JWT
   - Витягування user_id з токену
4. Gateway → Spell Service: Запит + user_id
5. Spell Service:
   - Створення заклинання
   - created_by = user_id
6. Spell Service → Gateway: Створене заклинання
7. Gateway → Web: Відповідь
8. Web: Оновлення UI
```

### Перегляд списку заклинань

```
1. Browser → Web: Відкриття сторінки заклинань
2. Web → Gateway: GET /api/spells?tradition=fire&level=3
3. Gateway → Spell Service: Запит з параметрами
4. Spell Service:
   - Query до spells_db з фільтрами
   - Повернення результатів
5. Spell Service → Gateway: Список заклинань
6. Gateway → Web: JSON response
7. Web: Рендеринг списку
```

---

## Взаємодія між сервісами

### Аутентифікація

```
┌────────┐           ┌─────────┐         ┌──────────┐
│  Web   │──────────▶│ Gateway │────────▶│   Auth   │
└────────┘  Request  └─────────┘ Forward └──────────┘
     ▲                                          │
     │                JWT Token                 │
     └──────────────────────────────────────────┘
```

**Процес:**
1. Web надсилає credentials → Gateway
2. Gateway перенаправляє → Auth Service
3. Auth Service генерує JWT → Gateway → Web
4. Web зберігає JWT для подальших запитів

### Авторизовані запити

```
┌────────┐          ┌─────────┐           ┌──────────┐
│  Web   │─────────▶│ Gateway │──────────▶│  Spell   │
└────────┘ JWT      └─────────┘  user_id  └──────────┘
           Header      Verify
                       Extract
```

**Процес:**
1. Web надсилає запит + JWT в header
2. Gateway верифікує JWT
3. Gateway витягує user_id з токену
4. Gateway додає user_id до запиту → Spell Service
5. Spell Service використовує user_id для авторизації

---

## Безпека

### JWT Authentication

**Структура токену:**
```javascript
{
  header: { alg: "HS256", typ: "JWT" },
  payload: {
    userId: 123,
    username: "user@example.com",
    iat: 1234567890,
    exp: 1234671490  // 1 година
  },
  signature: "..."
}
```

**Верифікація:**
- Gateway перевіряє підпис токену
- Перевіряє термін дії (exp)
- Витягує userId для авторизації

### CORS Policy

```javascript
// Gateway CORS configuration
{
  origin: ['http://localhost', 'https://tabletop.walpapur.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

### Database Security

- Окремі бази даних для різних сервісів
- Окремі користувачі БД з обмеженими правами
- Паролі зберігаються як bcrypt hash (не plaintext!)

---

**Оновлено:** 2026-02-01
