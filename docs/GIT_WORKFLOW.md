# Git Workflow

> Правила роботи з Git репозиторієм для команди Walpapur Tabletop

---

## Структура гілок

### Main Branch

**`main`** - production-ready код

- ✅ Завжди готова до деплою
- ✅ Всі зміни через Pull Requests
- ✅ Захищена від прямих push
- ✅ Automatic deployment після merge

### Feature Branches

**Формат:** `feature/опис-фічі`

```bash
feature/auth-oauth2
feature/spell-filters
feature/character-creation
feature/web-dark-mode
```

### Bugfix Branches

**Формат:** `fix/опис-бага`

```bash
fix/auth-jwt-expiration
fix/spell-search-crash
fix/web-mobile-layout
```

### Hotfix Branches

**Формат:** `hotfix/критична-проблема`

- Для термінових виправлень на production
- Створюються з `main`
- Мержаться назад в `main` після фіксу

---

## Робочий процес

### 1. Початок роботи

```bash
# Оновити main
git checkout main
git pull origin main

# Створити feature branch
git checkout -b feature/your-feature-name
```

### 2. Робота над фічею

```bash
# Регулярно комітити зміни
git add .
git commit -m "feat(scope): описание изменений"

# Sync з main (якщо main оновився)
git fetch origin main
git rebase origin/main
```

### 3. Завершення роботи

```bash
# Push branch
git push origin feature/your-feature-name

# Створити Pull Request на GitHub
# Додати reviewers
# Дочекатись approval
```

### 4. Після merge

```bash
# Оновити локальний main
git checkout main
git pull origin main

# Видалити feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## Commit Messages

### Conventional Commits

Використовуємо [Conventional Commits](https://www.conventionalcommits.org/) стандарт:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type       | Використання                               |
|------------|--------------------------------------------|
| `feat`     | Нова функціональність                      |
| `fix`      | Виправлення бага                           |
| `docs`     | Зміни в документації                       |
| `style`    | Форматування (не змінює логіку)           |
| `refactor` | Рефакторинг коду                           |
| `test`     | Додавання/оновлення тестів                 |
| `chore`    | Технічні зміни (build, CI, dependencies)   |
| `perf`     | Покращення performance                     |

### Scopes

| Scope    | Опис                |
|----------|---------------------|
| `auth`   | Auth Service        |
| `spell`  | Spell Service       |
| `gateway`| API Gateway         |
| `web`    | Frontend            |
| `db`     | Database            |
| `infra`  | Infrastructure      |
| `ci`     | CI/CD               |

### Приклади

#### ✅ ДОБРЕ

```bash
feat(auth): add OAuth2 Google provider
fix(spell): correct spell level validation
docs(api): update authentication endpoints
refactor(gateway): improve error handling middleware
test(web): add integration tests for spell creation
chore(deps): upgrade express to 4.18.2
```

#### ❌ ПОГАНО

```bash
update stuff                    # Не зрозуміло що змінилось
fix bug                         # Який баг?
WIP                             # Не комітьте незавершений код
Fixed everything                # Занадто загально
auth service changes            # Немає type
```

### Довгі описи

Для складних змін додавайте body:

```bash
git commit -m "feat(spell): add advanced filtering system

- Added filters by level, school, tradition
- Implemented query builder for complex filters
- Updated API documentation

Closes #42"
```

---

## Pull Requests

### Створення PR

1. **Назва PR** - така ж як commit message:
   ```
   feat(auth): add OAuth2 support
   ```

2. **Опис PR** - використовуйте template:
   ```markdown
   ## Що змінилось
   - Додано OAuth2 Google authentication
   - Оновлено auth middleware
   - Додано тести

   ## Тип змін
   - [x] New feature
   - [ ] Bug fix
   - [ ] Breaking change
   - [ ] Documentation update

   ## Checklist
   - [x] Код відповідає code style
   - [x] Додані/оновлені тести
   - [x] Тести проходять
   - [x] Оновлена документація
   - [x] Немає breaking changes
   ```

3. **Reviewers** - додайте хоча б 1 reviewer

4. **Labels** - додаються автоматично (через labeler.yml)

### Code Review

#### Для автора PR

- ✅ Self-review перед створенням PR
- ✅ Всі CI checks мають бути зелені
- ✅ Відповідайте на коментарі швидко
- ✅ Робіть requested changes

#### Для reviewer

- ✅ Перевіряйте логіку, не тільки синтаксис
- ✅ Тестуйте локально якщо потрібно
- ✅ Залишайте конструктивні коментарі
- ✅ Approve тільки якщо впевнені

### Merge Strategy

**Squash and Merge** (рекомендовано)
- Всі коміти в PR стають одним комітом
- Чиста історія в main
- Легше rollback

```
feature/auth-oauth2 (10 commits) → main (1 commit)
```

---

## Конфлікти

### Як уникнути

```bash
# Регулярно sync з main
git fetch origin main
git rebase origin/main
```

### Як вирішити

```bash
# 1. Fetch latest main
git fetch origin main

# 2. Rebase
git rebase origin/main

# 3. Вирішити конфлікти у файлах
# Відредагуйте файли, видаліть markers (<<<<, ====, >>>>)

# 4. Mark as resolved
git add .
git rebase --continue

# 5. Force push (тільки для feature branches!)
git push --force-with-lease origin feature/your-branch
```

---

## Заборонені дії

### ❌ НЕ РОБИТИ

```bash
# НЕ push прямо в main
git push origin main  # ❌

# НЕ force push в main
git push --force origin main  # ❌

# НЕ комітити secrets
git add .env  # ❌

# НЕ комітити великі бінарні файли
git add huge-file.zip  # ❌

# НЕ rebase public branches
git rebase main  # ❌ (якщо main вже є remote)
```

### ✅ РОБИТИ

```bash
# Pull Request workflow
git checkout -b feature/my-feature
git commit -m "feat(scope): changes"
git push origin feature/my-feature
# Створити PR на GitHub

# Update feature branch
git fetch origin main
git rebase origin/main
git push --force-with-lease origin feature/my-feature
```

---

## Git Hooks

### Pre-commit (автоматично)

- Linting коду
- Форматування
- Перевірка commit message

### Pre-push

- Запуск тестів
- Перевірка build

---

## Корисні команди

### Перегляд історії

```bash
# Логи з графом
git log --oneline --graph --all

# Коміти за автором
git log --author="username"

# Зміни у файлі
git log --follow -- path/to/file

# Останні 10 комітів
git log -10 --oneline
```

### Відміна змін

```bash
# Відмінити uncommitted changes
git checkout -- filename

# Відмінити останній commit (зберегти зміни)
git reset --soft HEAD~1

# Відмінити останній commit (видалити зміни)
git reset --hard HEAD~1

# Revert commit (створює новий commit)
git revert <commit-hash>
```

### Stash

```bash
# Сховати зміни
git stash

# Подивитись stash list
git stash list

# Застосувати stash
git stash apply

# Видалити stash
git stash drop
```

### Пошук

```bash
# Знайти в коді
git grep "searchTerm"

# Знайти commit з певним повідомленням
git log --grep="fix"
```

---

## Troubleshooting

### "Diverged branches"

```bash
git fetch origin main
git rebase origin/main
# Вирішити конфлікти
git push --force-with-lease origin feature/your-branch
```

### "Detached HEAD"

```bash
git checkout main
git branch
```

### Видалити локальні branches

```bash
# Видалити merged branches
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d

# Видалити конкретний branch
git branch -D branch-name
```

---

## Найкращі практики

### ✅ DO

- Комітити часто, невеликими порціями
- Писати зрозумілі commit messages
- Синхронізуватись з main регулярно
- Робити self-review перед PR
- Відповідати на code review швидко

### ❌ DON'T

- Комітити в main напряму
- Комітити .env файли
- Force push в public branches
- Комітити незавершений код
- Ігнорувати CI failures

---

## Приклад повного workflow

```bash
# 1. Почати нову фічу
git checkout main
git pull origin main
git checkout -b feature/spell-export

# 2. Робити зміни
# ... редагувати файли ...
git add services/spell-service/export.js
git commit -m "feat(spell): add export to PDF functionality"

# 3. Більше змін
# ... редагувати файли ...
git add services/spell-service/export.test.js
git commit -m "test(spell): add tests for export feature"

# 4. Sync з main (якщо оновився)
git fetch origin main
git rebase origin/main

# 5. Push
git push origin feature/spell-export

# 6. Створити PR на GitHub
# - Title: "feat(spell): add export to PDF"
# - Reviewers: @teammate
# - Labels: (автоматично)

# 7. Code review → Changes requested
# ... робимо зміни ...
git add .
git commit -m "fix(spell): address review comments"
git push origin feature/spell-export

# 8. Approval → Merge (Squash and Merge)

# 9. Cleanup
git checkout main
git pull origin main
git branch -d feature/spell-export
git push origin --delete feature/spell-export
```

---

**Питання?** Створіть Issue або запитайте в команді!

**Оновлено:** 2026-02-01
