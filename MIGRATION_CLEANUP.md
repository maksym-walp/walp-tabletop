# Очищення після міграції на мікросервіси

## 🎯 Мета
Після успішної міграції на мікросервісну архітектуру потрібно видалити старі файли монолітного додатку, щоб уникнути плутанини.

## ⚠️ ВАЖЛИВО
**НЕ ВИДАЛЯЙТЕ ЦІ ФАЙЛИ, ПОКИ НЕ ВПЕВНЕНІ, ЩО МІКРОСЕРВІСИ ПРАЦЮЮТЬ КОРЕКТНО!**

Спочатку переконайтеся:
1. Всі мікросервіси запускаються без помилок
2. Frontend підключається до API Gateway
3. API Gateway може з'єднатися з Auth та Spell сервісами
4. База даних працює коректно
5. Всі основні функції працюють

## 📦 Файли для видалення (після перевірки)

### Старі монолітні файли

```bash
# 1. Старий backend сервер
server/
  ├── server.js
  ├── Dockerfile
  └── package.json

# 2. Старі React файли в root (якщо вони дублюються в web/)
src/           # Тільки якщо є копія в web/src/
public/        # Тільки якщо є копія в web/public/

# 3. Старий package.json (замінити на новий monorepo версію)
package.json   # Замінити на package.json.new
```

### Команди для очищення

```bash
# КРОК 1: Backup перед видаленням
git checkout -b backup-before-cleanup
git add .
git commit -m "backup: before cleanup of old monolith files"
git push origin backup-before-cleanup

# КРОК 2: Видалення старих файлів (на main branch)
git checkout main

# Видаляємо старий server
rm -rf server/

# Видаляємо старі src/public якщо вони дублюються
# УВАГА: Перевірте спочатку чи все є в web/
# ls web/src/ web/public/
# Якщо все на місці:
rm -rf src/ public/

# Замінюємо package.json
mv package.json package.json.old
mv package.json.new package.json

# Видаляємо старі залежності
rm -rf node_modules/
npm install

# КРОК 3: Оновлюємо .gitignore
cat >> .gitignore << EOF

# Backup files
*.old
*.backup
EOF

# КРОК 4: Commit
git add .
git commit -m "chore(cleanup): remove old monolith files after microservices migration

- Removed old server/ directory
- Removed duplicate src/ and public/ (moved to web/)
- Updated package.json to monorepo version with workspaces
- Added npm scripts for monorepo management

Refs: #migration-to-microservices"

git push origin main
```

## 🔍 Перевірка перед видаленням

### Checklist

- [ ] Мікросервіси працюють локально (docker-compose up)
- [ ] Можна зареєструвати користувача
- [ ] Можна залогінитися
- [ ] Можна створити spell
- [ ] Можна отримати список spells
- [ ] Frontend правильно відображається
- [ ] Немає помилок в логах сервісів
- [ ] Production деплой працює коректно
- [ ] Створено backup branch

### Команди для перевірки

```bash
# Перевірка що всі сервіси запущені
docker-compose ps

# Перевірка логів
docker-compose logs auth-service
docker-compose logs spell-service
docker-compose logs gateway
docker-compose logs web

# Тестові запити
# Реєстрація
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Логін
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Отримати spells
curl http://localhost:3000/api/spells
```

## 📊 Порівняння структури

### До (Монолітна)
```
SpellBook/
├── server/          ← Видалити
│   └── server.js    ← Видалити
├── src/             ← Видалити (якщо дублюється в web/)
├── public/          ← Видалити (якщо дублюється в web/)
├── package.json     ← Замінити на monorepo версію
└── node_modules/    ← Видалити та reinstall
```

### Після (Мікросервіси)
```
SpellBook/
├── services/
│   ├── auth-service/
│   └── spell-api/
├── gateway/
├── web/              ← Весь frontend тут
│   ├── src/
│   └── public/
├── scripts/          ← Нові utility scripts
├── package.json      ← Monorepo версія
└── infrastructure/
```

## 🔄 Rollback план

Якщо щось пішло не так:

```bash
# Повернутися до backup
git checkout backup-before-cleanup

# Або відновити окремі файли з backup
git checkout backup-before-cleanup -- server/
git checkout backup-before-cleanup -- src/
git checkout backup-before-cleanup -- package.json
```

## 📝 Після очищення

1. Оновіть README.md з новою структурою
2. Оновіть документацію в docs/
3. Видаліть цей файл (MIGRATION_CLEANUP.md) - він більше не потрібен
4. Видаліть backup branch через місяць якщо все працює:
   ```bash
   git branch -d backup-before-cleanup
   git push origin --delete backup-before-cleanup
   ```

## 💡 Рекомендації

- **Робіть cleanup тільки після того, як production працює стабільно мінімум тиждень**
- **Тримайте backup branch мінімум місяць**
- **Не видаляйте файли під час активної розробки**
- **Зробіть повний бекап перед cleanup**

---

**Створено**: 2024-01-15
**Автор**: Claude & Maksym
