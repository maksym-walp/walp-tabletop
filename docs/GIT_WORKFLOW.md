# Git Workflow

> Правила роботи з Git репозиторієм

---

## Структура гілок

| Гілка | Формат | Призначення |
|-------|--------|-------------|
| `main` | - | Production-ready код, захищена |
| `feature/*` | `feature/spell-filters` | Нова функціональність |
| `fix/*` | `fix/auth-jwt-expiration` | Виправлення багів |

---

## Робочий процес

```bash
# 1. Почати роботу
git checkout main
git pull origin main
git checkout -b feature/your-feature

# 2. Зміни + коміти
git add .
git commit -m "feat(scope): опис змін"

# 3. Sync з main (регулярно!)
git fetch origin main
git rebase origin/main

# 4. Push + PR
git push origin feature/your-feature
# Створити Pull Request на GitHub

# 5. Після merge - cleanup
git checkout main
git pull origin main
git branch -d feature/your-feature
```

---

## Commit Messages

**Формат:** `<type>(<scope>): <опис>`

### Types

| Type | Коли використовувати |
|------|----------------------|
| `feat` | Нова функціональність |
| `fix` | Виправлення бага |
| `docs` | Документація |
| `refactor` | Рефакторинг |
| `test` | Тести |
| `chore` | CI, dependencies, configs |

### Scopes

`auth`, `spell`, `gateway`, `web`, `db`, `infra`, `ci`

### Приклади

```bash
# Добре
feat(auth): add OAuth2 Google provider
fix(spell): correct spell level validation
docs(api): update authentication endpoints
chore(deps): upgrade express to 4.18.2

# Погано
update stuff          # Не зрозуміло що
fix bug               # Який?
WIP                   # Не комітити незавершене
```

---

## Pull Requests

1. **Squash and Merge** - рекомендований метод
2. Всі CI checks мають бути зелені
3. Мінімум 1 reviewer approval

---

## Заборонено

```bash
git push origin main              # Прямий push в main
git push --force origin main      # Force push в main
git add .env                      # Комітити secrets
```

---

## Troubleshooting

### Diverged branches
```bash
git fetch origin main
git rebase origin/main
# Вирішити конфлікти
git push --force-with-lease origin feature/your-branch
```

### Detached HEAD
```bash
git checkout main
```

### Відмінити commit
```bash
git reset --soft HEAD~1   # Зберегти зміни
git reset --hard HEAD~1   # Видалити зміни
git revert <hash>         # Revert (створює новий commit)
```

### Stash
```bash
git stash           # Сховати
git stash apply     # Застосувати
git stash drop      # Видалити
```

---

## Корисні посилання

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Branching](https://learngitbranching.js.org/) - інтерактивний туторіал

---

**Оновлено:** 2026-02-02
