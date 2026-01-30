# Walpapur Tabletop - Microservices Architecture

## Архітектура

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ http://localhost:80
       ▼
┌─────────────┐      /api/*       ┌──────────────┐
│  Frontend   ├──────────────────►│  API Gateway │
│   (Nginx)   │                   │  (Port 3000) │
└─────────────┘                   └──────┬───────┘
                                         │
                    ┌────────────────────┼─────────────────┐
                    ▼                    ▼                 ▼
              ┌─────────┐          ┌──────────┐     ┌──────────┐
              │  Auth   │          │  Spell   │     │  Future  │
              │ Service │          │ Service  │     │ Services │
              │(Port    │          │(Port     │     │          │
              │ 3001)   │          │ 3002)    │     │          │
              └────┬────┘          └────┬─────┘     └──────────┘
                   │                    │
                   └────────┬───────────┘
                            ▼
                      ┌──────────┐
                      │  MySQL   │
                      │ (Port    │
                      │  3306)   │
                      └──────────┘
                      auth_db | spells_db
```

## Сервіси

1. **MySQL Database** - Окремі бази: `auth_db`, `spells_db`
2. **Auth Service** (3001) - Реєстрація, логін, JWT токени
3. **Spell Service** (3002) - CRUD операції з заклинаннями
4. **API Gateway** (3000) - JWT верифікація, роутинг
5. **Frontend** (80) - React SPA з Nginx

## Швидкий старт

### 1. Налаштування

```bash
# Копіюємо .env.example в .env
cp .env.example .env

# Редагуємо .env і встановлюємо:
# - DB_ROOT_PASSWORD
# - JWT_SECRET
```

### 2. Запуск

```bash
# Збираємо і запускаємо всі сервіси
docker-compose up --build

# Або в фоновому режимі
docker-compose up -d --build
```

### 3. Перевірка

```bash
# Перевірка здоров'я сервісів
curl http://localhost:3000/health  # Gateway
curl http://localhost:3001/health  # Auth (якщо expose port)
curl http://localhost:3002/health  # Spell (якщо expose port)

# Відкрийте браузер
open http://localhost
```

## API Endpoints

### Auth Service (через Gateway)

```bash
# Реєстрація
POST http://localhost:3000/api/auth/register
{
  "username": "user",
  "email": "user@example.com",
  "password": "password123"
}

# Логін
POST http://localhost:3000/api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Spell Service (через Gateway)

```bash
# Отримати всі заклинання
GET http://localhost:3000/api/spells

# Отримати заклинання по ID
GET http://localhost:3000/api/spells/:id

# Створити заклинання (потребує JWT)
POST http://localhost:3000/api/spells
Authorization: Bearer <token>
```

## Розробка

### Логи окремого сервісу

```bash
docker-compose logs -f auth-service
docker-compose logs -f spell-service
docker-compose logs -f gateway
```

### Перезапуск окремого сервісу

```bash
docker-compose restart auth-service
docker-compose up -d --build auth-service
```

### Доступ до MySQL

```bash
docker exec -it walpapur-db mysql -uroot -p
# Введіть DB_ROOT_PASSWORD

# Перевірка користувачів
SELECT user, host FROM mysql.user;

# Перевірка прав
SHOW GRANTS FOR 'auth_user'@'%';
SHOW GRANTS FOR 'spells_user'@'%';
```

## Database Structure

### auth_db
- `users` - Користувачі з hashed passwords

### spells_db
- `spells` - Заклинання
- `traditions` - Традиції магії
- `spell_traditions` - Many-to-many зв'язок
- `spellbooks` - Колекції користувачів
- `spellbook_spells` - Many-to-many зв'язок

## Troubleshooting

### Помилка "Cannot connect to database"

```bash
# Перевірте чи запущений MySQL
docker-compose ps

# Перевірте логи
docker-compose logs db

# Перевірте healthcheck
docker inspect walpapur-db | grep -A 10 Health
```

### Gateway не може з'єднатися з сервісами

```bash
# Перевірте чи всі сервіси в одній мережі
docker network inspect walpapur-tabletop_walpapur-network

# Перевірте DNS resolution
docker exec walpapur-gateway ping auth-service
```

### Frontend не може з'єднатися з API

Перевірте nginx конфігурацію:
```bash
docker exec walpapur-web cat /etc/nginx/conf.d/default.conf
```

## Наступні кроки

- [ ] Character Service
- [ ] Monster Service
- [ ] Map Service
- [ ] WebSocket для real-time
- [ ] Redis для кешування
- [ ] Production docker-compose.prod.yml
