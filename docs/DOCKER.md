# Docker Guide

## Швидкий старт

```bash
# Запуск (використовує кешовані images)
npm run dev

# Запуск з rebuild усіх images
npm run dev:build

# Зупинка
npm run dev:down
```

## Контейнери

| Контейнер | Порт | Опис |
|-----------|------|------|
| walpapur-db | 3306 | MySQL 8.0 |
| walpapur-auth | 3001 (internal) | Auth Service |
| walpapur-spells | 3002 (internal) | Spell Service |
| walpapur-gateway | 3000 | API Gateway |
| walpapur-web | 80 | Frontend (nginx) |

## Команди

### Основні

```bash
npm run dev              # Запуск
npm run dev:build        # Rebuild + запуск
npm run dev:down         # Зупинка
npm run prod             # Production
npm run prod:build       # Production rebuild
```

### Логи

```bash
npm run logs:auth        # Auth Service
npm run logs:spells      # Spell Service
npm run logs:gateway     # Gateway
npm run logs:web         # Frontend

# Або напряму
docker logs walpapur-auth -f
docker logs walpapur-gateway --tail 100
```

### База даних

```bash
npm run db:shell         # MySQL CLI
npm run migrate          # Запуск міграцій
npm run migrate:status   # Статус міграцій
```

### Статус

```bash
docker ps                # Активні контейнери
docker ps -a             # Усі контейнери
docker compose ps        # Статус сервісів
```

## Перевірка здоров'я

```bash
# API Gateway
curl http://localhost:3000/health

# Frontend
curl http://localhost:80
```

## Rebuild окремого сервісу

```bash
docker compose up -d --build auth-service
docker compose up -d --build spell-service
docker compose up -d --build gateway
docker compose up -d --build web
```

## Очищення

```bash
# Видалити зупинені контейнери
docker container prune

# Видалити невикористані images
docker image prune

# Повне очищення (обережно!)
docker system prune -a
```

## Troubleshooting

### Контейнер unhealthy

```bash
# Перевірити логи
docker logs walpapur-auth

# Перезапустити сервіс
docker compose restart auth-service
```

### Порт зайнятий

```bash
# Знайти процес
lsof -i :3000

# Зупинити старі контейнери
docker compose down
```

### Проблеми з базою даних

```bash
# Перевірити підключення
docker exec walpapur-db mysqladmin ping -h localhost

# Скинути volume (втрата даних!)
docker compose down -v
npm run dev:build
```
