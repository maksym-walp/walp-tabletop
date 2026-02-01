## 🏗️ Структура проекту

### Поточна структура (Оптимізована)
```
Tabletop/
├── services/                    # Всі backend мікросервіси
│   ├── auth-service/           # Аутентифікація
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── README.md
│   ├── spell-service/          # Управління заклинаннями
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── README.md
│   └── gateway/                # API Gateway
│       ├── src/
│       ├── tests/
│       ├── Dockerfile
│       ├── package.json
│       └── README.md
├── apps/
│   └── web/                    # Frontend React додаток
│       ├── src/
│       ├── public/
│       ├── tests/
│       ├── Dockerfile
│       ├── package.json
│       └── README.md
├── packages/                   # Спільний код (опціонально)
│   ├── shared-types/          # Спільні TypeScript типи
│   │   ├── src/
│   │   └── package.json
│   ├── shared-utils/          # Спільні утиліти
│   │   ├── src/
│   │   └── package.json
│   └── api-contracts/         # API контракти/схеми
│       ├── openapi/
│       └── package.json
├── infrastructure/
│   ├── db/                    # Database міграції та схеми
│   │   ├── init.sql
│   │   └── migrations/
│   ├── docker/                # Docker конфігурації
│   │   ├── nginx/
│   │   └── ssl/
│   └── k8s/                   # Kubernetes manifests (майбутнє)
├── .github/
│   ├── workflows/             # GitHub Actions
│   │   ├── ci.yml            # Continuous Integration
│   │   ├── deploy.yml        # Deployment
│   │   └── pr-checks.yml     # PR validations
│   └── CODEOWNERS            # Code ownership
├── scripts/                   # Утилітні скрипти
│   ├── build-all.sh
│   ├── test-all.sh
│   └── detect-changes.sh
├── docs/                      # Документація
│   ├── architecture/
│   ├── api/
│   └── deployment/
├── docker-compose.yml         # Розробка
├── docker-compose.prod.yml    # Production
├── .gitignore
├── README.md
└── package.json               # Root package для скриптів
```

---

## 🔄 Git Workflow

### Стратегія гілок

**Main branch**: `main`
- Завжди готова до деплою
- Всі зміни через Pull Requests
- Захищена від прямих push

**Feature branches**: `feature/назва-фічі`
```bash
# Приклад
feature/auth-oauth2
feature/spell-filters
feature/web-dark-mode
```

**Bugfix branches**: `fix/опис-бага`
```bash
# Приклад
fix/auth-jwt-expiration
fix/spell-search-crash
```

**Hotfix branches**: `hotfix/критична-проблема`
- Для термінових виправлень на production

### Commit Convention

Використовуємо [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Формат
<type>(<scope>): <short description>

# Приклади
feat(auth): add OAuth2 Google provider
fix(spell): correct spell filtering logic
docs(readme): update deployment instructions
chore(deps): update express to 4.18.2
refactor(gateway): improve error handling
test(auth): add integration tests for login

# Scope = назва сервісу або компоненту
# auth, spell, gateway, web, db, infra
```

### Commit best practices

```bash
# ✅ ДОБРЕ - специфічні зміни
feat(auth): add password reset endpoint
fix(spell): prevent duplicate spell names
docs(api): document spell search parameters

# ❌ ПОГАНО - занадто загальні
fix: bug fix
update: changes
wip: work in progress
```

---

## 🚀 CI/CD Strategy

### 1. Selective Building (Build тільки змінених сервісів)

**Принцип**: Якщо змінився тільки auth-service, не потрібно перебудовувати spell-service та web.

**Реалізація**: Використання GitHub Actions з path filtering

**Переваги**:
- ⚡ Швидші build
- 💰 Економія CI/CD хвилин
- 🎯 Менше помилок через ізольовані зміни

### 2. Testing Strategy

**Unit Tests**:
```bash
# Запуск всіх тестів
npm run test

# Тести окремого сервісу
npm run test:auth
npm run test:spell
npm run test:web
```

**Integration Tests**:
```bash
# Тести між сервісами
npm run test:integration
```

**E2E Tests**:
```bash
# Повний user flow
npm run test:e2e
```

### 3. Deployment Strategy

**Staging**: Автоматичний деплой з `main`
```
main branch → CI tests → Build → Deploy to Staging
```

**Production**: Manual trigger через GitHub Actions
```
Staging tested → Manual approval → Deploy to Production
```

### 4. Environment Variables

**Структура**:
```
.env.example           # Приклад для розробників
.env.development       # Локальна розробка
.env.staging          # Staging середовище
.env.production       # Production (в GitHub Secrets)
```

**Секрети в GitHub**:
- `DB_PASSWORD`
- `JWT_SECRET`
- `SSH_KEY`
- `HOST`

---

## 📦 Dependency Management

### Package.json hierarchy

**Root package.json**: Скрипти для всього проекту
```json
{
  "name": "spellbook-monorepo",
  "private": true,
  "scripts": {
    "build": "npm run build:auth && npm run build:spell && npm run build:web",
    "build:auth": "cd services/auth-service && npm run build",
    "build:spell": "cd services/spell-service && npm run build",
    "build:gateway": "cd services/gateway && npm run build",
    "build:web": "cd apps/web && npm run build",
    "test": "npm run test:auth && npm run test:spell && npm run test:web",
    "dev": "docker-compose up",
    "prod": "docker-compose -f docker-compose.prod.yml up -d"
  }
}
```

**Service package.json**: Індивідуальні залежності кожного сервісу

### Спільні залежності (опціонально)

Якщо багато сервісів використовують одні й ті ж пакети:

**Варіант 1: npm workspaces** (рекомендовано для Node.js)
```json
{
  "name": "spellbook-monorepo",
  "workspaces": [
    "services/*",
    "apps/*",
    "packages/*"
  ]
}
```

**Варіант 2: Yarn workspaces**

**Варіант 3: pnpm workspaces** (найшвидший)

---

## 🏷️ Versioning

### Semantic Versioning

Кожен сервіс має свою версію в `package.json`:

```json
{
  "name": "@spellbook/auth-service",
  "version": "1.2.3"
}
```

**Major.Minor.Patch**:
- **Major (1.x.x)**: Breaking changes в API
- **Minor (x.2.x)**: Нові фічі (backwards compatible)
- **Patch (x.x.3)**: Bug fixes

### Changelog

Кожен сервіс має свій `CHANGELOG.md`:

```markdown
# Changelog - Auth Service

## [1.2.3] - 2024-01-15
### Fixed
- JWT token expiration bug

## [1.2.0] - 2024-01-10
### Added
- OAuth2 Google provider
- Password reset endpoint

## [1.1.0] - 2024-01-05
### Added
- Email verification
```

### Git Tags

Теги для релізів:
```bash
# Формат: <service>/<version>
git tag auth-service/v1.2.3
git tag spell-service/v2.0.0
git tag web/v1.5.0

# Push tags
git push origin --tags
```

---

## 👥 Code Ownership

### CODEOWNERS файл

Створюємо `.github/CODEOWNERS`:

```
# Global owners
* @maksym-walp

# Auth service
/services/auth-service/ @maksym-walp @auth-team

# Spell service
/services/spell-service/ @maksym-walp @spell-team

# Gateway
/services/gateway/ @maksym-walp @platform-team

# Frontend
/apps/web/ @maksym-walp @frontend-team

# Infrastructure
/infrastructure/ @maksym-walp @devops-team
/docker-compose*.yml @maksym-walp @devops-team
/.github/workflows/ @maksym-walp @devops-team

# Database
/infrastructure/db/ @maksym-walp @database-team

# Documentation
/docs/ @maksym-walp
README.md @maksym-walp
```

### PR Reviews

**Правила**:
- Мінімум 1 approval від CODEOWNER
- Всі CI перевірки пройдені
- Немає конфліктів з main
- Додана документація (якщо потрібно)

---

## 🧪 Testing Strategy

### Test Coverage

**Мінімальні вимоги**:
- Unit tests: 80% coverage
- Integration tests: критичні шляхи
- E2E tests: основні user flows

### Test Organization

```
services/auth-service/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── auth.controller.test.js  ← Unit test поруч з кодом
│   └── services/
│       ├── jwt.service.js
│       └── jwt.service.test.js
└── tests/
    ├── integration/                  ← Integration tests
    │   └── auth.integration.test.js
    └── e2e/                          ← E2E tests
        └── login-flow.e2e.test.js
```

---

## 🔍 Monitoring та Logging

### Централізований Logging

**Структура логів**:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "auth-service",
  "level": "error",
  "message": "Failed to authenticate user",
  "userId": "123",
  "ip": "192.168.1.1",
  "trace_id": "abc-123-def"
}
```

### Distributed Tracing

Для trace між сервісами:
- Додати `trace_id` до всіх логів
- Передавати trace_id через HTTP headers
- Використовувати для debugging flow між сервісами

---

## 📊 Performance та Scaling

### Docker Optimization

**Multi-stage builds**:
```dockerfile
# Builder stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Runtime stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "src/index.js"]
```

### Caching Strategy

**Docker layer caching**:
- `package.json` копіюється першим
- `npm install` виконується до копіювання коду
- Зміни в коді не інвалідують npm dependencies

---

## 🔐 Security Best Practices

### Secrets Management

**❌ НІКОЛИ**:
- Не commit `.env` файлів
- Не hardcode паролів/токенів
- Не логувати чутливі дані

**✅ ЗАВЖДИ**:
- Використовувати GitHub Secrets
- Валідувати input
- Використовувати HTTPS
- Регулярно оновлювати залежності

### Security Scanning

```yaml
# В CI pipeline
- name: Security audit
  run: npm audit

- name: Dependency check
  uses: snyk/actions/node@master
```

---

## 📚 Documentation

### README Structure

**Root README.md**: Загальний огляд
**Service README.md**: Специфічні для сервісу

```markdown
# Auth Service

## Опис
Сервіс аутентифікації та авторізації

## API Endpoints
- POST /register
- POST /login
- POST /logout

## Environment Variables
- JWT_SECRET
- AUTH_DB_HOST

## Розробка
npm run dev

## Тести
npm test

## Deployment
docker build -t auth-service .
```

---

## 🎯 Migration Checklist

- [x] Розділено монолітну апку на мікросервіси
- [x] Створено docker-compose для локальної розробки
- [x] Налаштовано GitHub Actions для deploy
- [ ] Додати selective CI/CD
- [ ] Створити CODEOWNERS
- [ ] Додати integration tests
- [ ] Налаштувати monitoring
- [ ] Додати API documentation (Swagger/OpenAPI)
- [ ] Створити staging environment
- [ ] Налаштувати automated database migrations
- [ ] Додати rate limiting
- [ ] Налаштувати CORS properly
- [ ] Додати health checks для всіх сервісів

---

## 🚦 Traffic Light System

### 🟢 GREEN (Готово до Production)
- Всі тести проходять
- Code review approved
- Документація оновлена
- Security scan пройшов
- Performance тести OK

### 🟡 YELLOW (Потрібна увага)
- Деякі тести fail
- Очікує review
- Потребує додаткового тестування

### 🔴 RED (Блокує deployment)
- Критичні тести fail
- Security vulnerabilities
- Breaking changes без migration path

---

## 📞 Troubleshooting

### Проблема: Сервіс не може з'єднатися з БД
```bash
# Перевірити чи запущена БД
docker-compose ps db

# Перевірити логи
docker-compose logs db

# Перевірити healthcheck
docker inspect spellbook-db | grep Health
```

### Проблема: Gateway не може знайти сервіс
```bash
# Перевірити Docker network
docker network inspect spellbook-network

# Перевірити DNS resolution
docker exec gateway ping auth-service
```

---

## 🔮 Майбутні покращення

### Short-term (1-2 місяці)
- [ ] Додати Redis для caching
- [ ] Налаштувати ELK stack для логів
- [ ] Додати Prometheus + Grafana для metrics

### Mid-term (3-6 місяців)
- [ ] Character Service
- [ ] Monster Service
- [ ] WebSocket для real-time features
- [ ] GraphQL Gateway (замість REST)

### Long-term (6-12 місяців)
- [ ] Міграція на Kubernetes
- [ ] Service Mesh (Istio)
- [ ] Event-driven architecture (RabbitMQ/Kafka)
- [ ] CQRS pattern для складних queries

---

## 📖 Корисні ресурси

### Monorepo Tools
- [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Yarn workspaces](https://yarnpkg.com/features/workspaces)
- [pnpm workspaces](https://pnpm.io/workspaces)
- [Nx](https://nx.dev/) - Advanced monorepo tooling
- [Turborepo](https://turbo.build/) - High-performance build system

### Microservices
- [12 Factor App](https://12factor.net/)
- [Microservices.io](https://microservices.io/)
- [NGINX Microservices](https://www.nginx.com/blog/introduction-to-microservices/)

### CI/CD
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Автор**: Maksym
**Дата створення**: 2024-01-15
**Остання оновлення**: 2024-01-15
