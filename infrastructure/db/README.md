# Database Migrations

Система міграцій для управління схемою бази даних.

## Швидкий старт

```bash
# Застосувати всі міграції
npm run migrate

# Подивитись статус міграцій
npm run migrate:status

# Створити нову міграцію
npm run migrate:create add_user_avatar
```

## Як це працює

### Структура

```
infrastructure/db/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_add_user_avatar.sql
│   └── ...
├── migrate.sh           # Скрипт для запуску міграцій
└── init.sql            # Застарілий файл (замінений міграціями)
```

### Міграції

Кожна міграція - це SQL файл з номером та описовим ім'ям:
- `001_initial_schema.sql` - початкова схема
- `002_add_user_avatar.sql` - додавання avatar колонки
- `003_create_posts_table.sql` - створення таблиці posts

### Відстеження міграцій

Система створює окрему базу `migration_tracker` з таблицею `schema_migrations`,
яка зберігає інформацію про застосовані міграції.

## Команди

### Застосувати міграції

```bash
npm run migrate
```

### Статус міграцій

```bash
npm run migrate:status
```

### Створити нову міграцію

```bash
npm run migrate:create add_user_role
```

## Приклади міграцій

### Додавання колонки

```sql
-- Migration: 002_add_user_avatar
-- Description: Add avatar URL to users table
-- Date: 2026-02-01

USE auth_db;

ALTER TABLE users 
ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL
AFTER email;
```

### Створення табліці

```sql
-- Migration: 003_create_posts_table
-- Description: Create posts table for blog
-- Date: 2026-02-01

USE spells_db;

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## Best Practices

1. **Не редагуйте застосовані міграції** - створюйте нові
2. **Одна міграція = одна зміна** - не змішуйте різні зміни
3. **Тестуйте міграції локально** перед деплоєм
4. **Пишіть описові назви** - `add_user_avatar` краще за `update_users`
5. **Додавайте коментарі** що і чому змінюється
