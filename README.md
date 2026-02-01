# Walpapur Tabletop

> Система управління заклинаннями, листами персонажів, картками монстрів і тд для настільних рольових ігор
> Мікросервісна архітектура | Monorepo | Docker

[![CI Status](https://img.shields.io/badge/CI-passing-brightgreen)](.github/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-required-blue)](https://www.docker.com/)

---

## 📋 Зміст

- [Про проект](#-про-проект)
- [Швидкий старт](#-швидкий-старт)
- [Архітектура](#️-архітектура)
- [Документація](#-документація)
- [Розробка](#-розробка)
- [Deployment](#-deployment)
- [Команда](#-команда)

---

## 🎯 Про проект

**Walpapur Tabletop** - це веб-застосунок для настільних рольових ігор (TTRPG). Побудований на мікросервісній архітектурі для забезпечення масштабованості та підтримуваності.

### Основні функції

- 🔐 Аутентифікація та авторизація користувачів
- 📖 Створення, перегляд та редагування заклинань, листів персонажівЮ карток монстрів
- 🔍 Пошук та фільтрація
- 📱 Responsive дизайн

### Технології

**Backend:** Node.js, Express.js, MySQL, JWT
**Frontend:** React 19, React Router
**Infrastructure:** Docker, NGINX, GitHub Actions

---

## 🚀 Швидкий старт

### Вимоги

- [Node.js](https://nodejs.org/) >= 18.0.0
- [Docker](https://www.docker.com/) та Docker Compose
- [Git](https://git-scm.com/)

### Встановлення

```bash
# 1. Клонувати репозиторій
git clone https://github.com/maksym-walp/SpellBook.git
cd walp-tabletop

# 2. Налаштувати environment variables
cp .env.example .env
# Відредагуйте .env та встановіть значення

# 3. Запустити всі сервіси
npm run dev
```

### Перевірка

- **Frontend**: http://localhost
- **API Gateway**: http://localhost:3000

---

## 🏗️ Архітектура

```
Browser → Web (React) → Gateway (NGINX) → Auth / Spell Services → MySQL
```

**Детальна схема**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 📚 Документація

### Загальна

- **[Архітектура](docs/ARCHITECTURE.md)** - схема мікросервісів та взаємодії
- **[Git Workflow](docs/GIT_WORKFLOW.md)** - правила роботи з Git
- **[Code Style](docs/CODE_STYLE.md)** - стандарти коду

### Сервіси

- **[Auth Service](services/auth-service/README.md)** - аутентифікація
- **[Spell Service](services/spell-service/README.md)** - заклинання
- **[Gateway](gateway/README.md)** - API Gateway
- **[Web](web/README.md)** - Frontend

---

## 💻 Розробка

### Структура

```
SpellBook/
├── services/          # Backend сервіси
├── gateway/           # API Gateway
├── web/               # Frontend
├── infrastructure/    # Database
├── scripts/           # Utilities
└── docs/              # Документація
```

### Команди

```bash
npm run dev           # Запустити
npm test              # Тести
npm run build         # Build
npm run db:shell      # MySQL shell
```

Більше команд: `npm run` (показує всі доступні)

---

## 🚢 Deployment

```bash
npm run prod:build    # Production build
```

CI/CD: GitHub Actions ([.github/workflows/](.github/workflows/))

---

## 👥 Команда

**Lead Developer:** Maksym ([@maksym-walp](https://github.com/maksym-walp))

### Для нових розробників

1. Прочитайте [Git Workflow](docs/GIT_WORKFLOW.md)
2. Ознайомтесь з [Code Style](docs/CODE_STYLE.md)
3. Вивчіть [Architecture](docs/ARCHITECTURE.md)

```bash
# Fork → Clone → Branch → Commit → PR
git checkout -b feature/your-feature
git commit -m "feat(scope): description"
git push origin feature/your-feature
```

---

## 📝 Ліцензія

MIT License

---

**Версія:** 1.0.0 | **Оновлено:** 2026-02-01
