# Code Style Guide

> Стандарти написання коду для Walpapur Tabletop

---

## Загальні принципи

### 1. Читабельність понад усе
Код пишеться один раз, читається багато разів.

### 2. Consistency over perfection
Краще консистентний код, ніж "ідеальний" в одному місці.

### 3. KISS (Keep It Simple, Stupid)
Простота > складність

### 4. DRY (Don't Repeat Yourself)
Уникайте дублювання коду

---

## JavaScript / Node.js

### Naming Conventions

#### Variables & Functions

```javascript
// ✅ ДОБРЕ - camelCase
const userName = 'John';
const getUserById = (id) => { };
let isAuthenticated = false;

// ❌ ПОГАНО
const user_name = 'John';        // snake_case
const GetUserById = (id) => { }; // PascalCase для функції
let IsAuth = false;              // PascalCase для змінної
```

#### Constants

```javascript
// ✅ ДОБРЕ - UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET;

// ❌ ПОГАНО
const maxRetryAttempts = 3;  // camelCase
const ApiBaseUrl = '...';    // PascalCase
```

#### Classes & Components

```javascript
// ✅ ДОБРЕ - PascalCase
class UserService { }
class SpellController { }

// React Components
function SpellCard({ spell }) { }
const SpellList = () => { };

// ❌ ПОГАНО
class userService { }        // camelCase
function spellCard() { }     // camelCase
```

#### Files

```javascript
// ✅ ДОБРЕ
userService.js
spellController.js
SpellCard.jsx
authMiddleware.js

// ❌ ПОГАНО
UserService.js         // PascalCase для utilities
spell_controller.js    // snake_case
spellcard.jsx         // без роздільника
```

### Functions

#### Назви функцій

```javascript
// ✅ ДОБРЕ - дієслово + іменник
getUserById()
createSpell()
updateUserProfile()
deleteSpell()
isAuthenticated()
hasPermission()

// ❌ ПОГАНО
user()              // Не зрозуміло що робить
spell()
data()
auth()              // Занадто загально
```

#### Стрілкові функції vs function

```javascript
// ✅ Використовуйте стрілкові для коротких функцій
const double = (x) => x * 2;
const isEven = (x) => x % 2 === 0;

// ✅ function для methods та складної логіки
function calculateSpellDamage(spell, level) {
  const baseDamage = spell.damage;
  const modifier = level * 1.5;
  return baseDamage + modifier;
}

// ✅ async/await замість then/catch
async function fetchSpells() {
  try {
    const response = await fetch('/api/spells');
    return await response.json();
  } catch (error) {
    console.error('Error fetching spells:', error);
  }
}
```

### Variables

#### const vs let vs var

```javascript
// ✅ ЗАВЖДИ використовуйте const для незмінних
const API_URL = 'http://localhost:3000';
const user = { name: 'John' };  // Об'єкт можна міняти, але не переприсвоювати

// ✅ let для змінних
let count = 0;
let isLoading = true;

// ❌ НІКОЛИ не використовуйте var
var oldStyle = 'bad';  // ❌
```

#### Destructuring

```javascript
// ✅ ДОБРЕ - використовуйте destructuring
const { name, level, school } = spell;
const [firstName, lastName] = fullName.split(' ');

// ❌ ПОГАНО
const name = spell.name;
const level = spell.level;
const school = spell.school;
```

### Objects & Arrays

```javascript
// ✅ ДОБРЕ - spread operator
const newSpell = { ...oldSpell, level: 5 };
const allSpells = [...fireSpells, ...iceSpells];

// ✅ Короткий синтаксис
const user = {
  name,           // замість name: name
  email,
  getProfile() {  // замість getProfile: function()
    return this.name;
  }
};

// ✅ Template literals
const message = `User ${userName} created spell "${spellName}"`;

// ❌ ПОГАНО
const message = 'User ' + userName + ' created spell "' + spellName + '"';
```

---

## React

### Components

```javascript
// ✅ ДОБРЕ - функціональні компоненти
function SpellCard({ spell, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="spell-card">
      <h3>{spell.name}</h3>
      <p>Level: {spell.level}</p>
    </div>
  );
}

// ✅ Props destructuring
function UserProfile({ user, onUpdate }) {
  // ...
}

// ❌ ПОГАНО
function UserProfile(props) {
  const user = props.user;  // Не використовуйте props.x
  // ...
}
```

### Hooks

```javascript
// ✅ ДОБРЕ - порядок hooks
function SpellList() {
  // 1. State hooks
  const [spells, setSpells] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Effect hooks
  useEffect(() => {
    fetchSpells();
  }, []);

  // 3. Custom hooks
  const user = useAuth();

  // 4. Handlers
  const handleCreate = () => { };

  // 5. Render
  return <div>...</div>;
}

// ✅ Custom hooks - use prefix
function useAuth() { }
function useFetch(url) { }
function useLocalStorage(key) { }
```

### Event Handlers

```javascript
// ✅ ДОБРЕ - handleEvent naming
const handleClick = () => { };
const handleSubmit = (e) => {
  e.preventDefault();
};
const handleChange = (e) => {
  setvalue(e.target.value);
};

// ❌ ПОГАНО
const onClick = () => { };     // Схоже на prop
const submitForm = () => { };  // Не зрозуміло що handler
```

---

## CSS

### Class Names

```css
/* ✅ ДОБРЕ - kebab-case, BEM methodology */
.spell-card { }
.spell-card__header { }
.spell-card__title { }
.spell-card--highlighted { }
.spell-list { }

/* ❌ ПОГАНО */
.spellCard { }       /* camelCase */
.spell_card { }      /* snake_case */
.SpellCard { }       /* PascalCase */
```

### Organization

```css
/* ✅ ДОБРЕ - групуйте за типом */
.spell-card {
  /* Positioning */
  position: relative;
  top: 0;

  /* Box model */
  display: flex;
  width: 100%;
  padding: 1rem;
  margin: 0.5rem;

  /* Typography */
  font-size: 1rem;
  color: #333;

  /* Visual */
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;

  /* Misc */
  cursor: pointer;
  transition: all 0.3s;
}
```

---

## Comments

### JSDoc для функцій

```javascript
/**
 * Створює нове заклинання в базі даних
 * @param {Object} spellData - Дані заклинання
 * @param {string} spellData.name - Назва заклинання
 * @param {number} spellData.level - Рівень (1-9)
 * @param {number} userId - ID користувача-створювача
 * @returns {Promise<Object>} Створене заклинання
 * @throws {ValidationError} Якщо дані невалідні
 */
async function createSpell(spellData, userId) {
  // implementation
}
```

### Inline коментарі

```javascript
// ✅ ДОБРЕ - пояснюють "чому", а не "що"

// Потрібен timeout для уникнення race condition з базою даних
await sleep(100);

// Використовуємо bcrypt з cost factor 10 для балансу безпеки/швидкості
const hash = await bcrypt.hash(password, 10);

// ❌ ПОГАНО - описують очевидне

// Встановити значення в 5
const value = 5;

// Повернути результат
return result;
```

### TODO коментарі

```javascript
// ✅ ДОБРЕ
// TODO: Add pagination (max 100 items per page)
// TODO: @maksym - Optimize query performance
// FIXME: This breaks when level > 9
// NOTE: API v2 will use different endpoint

// ❌ ПОГАНО
// TODO: fix this
// FIXME: broken
```

---

## Error Handling

```javascript
// ✅ ДОБРЕ - специфічні помилки
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

// ✅ Конкретні catch блоки
try {
  await createSpell(data);
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Spell already exists' });
  }
  // Загальна помилка
  console.error('Unexpected error:', error);
  return res.status(500).json({ error: 'Internal server error' });
}

// ❌ ПОГАНО - ігнорування помилок
try {
  await doSomething();
} catch (e) {
  // empty catch - ніколи не робіть так!
}
```

---

## Imports / Exports

```javascript
// ✅ ДОБРЕ - групуйте imports
// 1. Node built-ins
const fs = require('fs');
const path = require('path');

// 2. External dependencies
const express = require('express');
const bcrypt = require('bcrypt');

// 3. Internal modules
const userService = require('./services/userService');
const authMiddleware = require('./middleware/auth');

// ✅ Named exports для utilities
// utils/validators.js
exports.isEmail = (str) => { };
exports.isStrongPassword = (str) => { };

// ✅ Default export для classes/components
// SpellCard.jsx
export default function SpellCard() { }

// ❌ ПОГАНО - mixing import styles
const express = require('express');
import bcrypt from 'bcrypt';  // Не мішайте require та import
```

---

## Database Queries

### SQL

```sql
-- ✅ ДОБРЕ - keywords в UPPER CASE
SELECT id, name, level
FROM spells
WHERE tradition = 'fire'
  AND level >= 3
ORDER BY level DESC
LIMIT 10;

-- ❌ ПОГАНО
select * from spells where tradition='fire';  -- Нечитабельно
```

### Query параметри

```javascript
// ✅ ДОБРЕ - використовуйте placeholders
const query = 'SELECT * FROM spells WHERE id = ?';
db.query(query, [spellId]);

// ❌ ПОГАНО - SQL injection!
const query = `SELECT * FROM spells WHERE id = ${spellId}`;  // ❌
```

---

## Environment Variables

```javascript
// ✅ ДОБРЕ
const JWT_SECRET = process.env.JWT_SECRET;
const DB_HOST = process.env.DB_HOST || 'localhost';
const PORT = parseInt(process.env.PORT || '3000', 10);

// ✅ Валідація
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

// ❌ ПОГАНО - hardcoded values
const JWT_SECRET = 'my-secret-key';  // ❌ Ніколи!
const DB_PASSWORD = '12345';         // ❌ Ніколи!
```

---

## Відступи та форматування

### Відступи

- **2 spaces** (не tabs!)
- Консистентність важливіша за кількість

```javascript
// ✅ ДОБРЕ - 2 spaces
function example() {
  if (condition) {
    doSomething();
  }
}

// ❌ ПОГАНО - 4 spaces (несумісно з проектом)
function example() {
    if (condition) {
        doSomething();
    }
}
```

### Довжина рядка

- **Максимум 100 символів**
- Використовуйте переноси для довгих виразів

```javascript
// ✅ ДОБРЕ
const user = await db.query(
  'SELECT id, name, email FROM users WHERE id = ?',
  [userId]
);

// ❌ ПОГАНО - занадто довгий рядок
const user = await db.query('SELECT id, name, email FROM users WHERE id = ?', [userId]);
```

### Пусті рядки

```javascript
// ✅ ДОБРЕ - логічне групування
function processUser(user) {
  // Validate
  if (!user.email) {
    throw new Error('Email required');
  }

  // Transform
  const normalizedEmail = user.email.toLowerCase();
  const hashedPassword = hashPassword(user.password);

  // Save
  return db.save({ ...user, email: normalizedEmail, password: hashedPassword });
}

// ❌ ПОГАНО - все разом
function processUser(user) {
  if (!user.email) {
    throw new Error('Email required');
  }
  const normalizedEmail = user.email.toLowerCase();
  const hashedPassword = hashPassword(user.password);
  return db.save({ ...user, email: normalizedEmail, password: hashedPassword });
}
```

---

## Заборонені практики

### ❌ НЕ РОБИТИ

```javascript
// ❌ console.log в production коді
console.log('Debug:', data);  // Використовуйте logger

// ❌ Порожні catch блоки
try { } catch (e) { }

// ❌ var
var x = 5;

// ❌ == замість ===
if (x == 5) { }  // Використовуйте ===

// ❌ Глобальні змінні
window.myGlobalVar = 'bad';

// ❌ Мутація props (React)
props.user.name = 'New Name';

// ❌ Hardcoded credentials
const password = '12345';
```

---

## Linting

### ESLint

Використовуємо ESLint для автоматичної перевірки:

```bash
# Запуск linter
npm run lint

# Auto-fix
npm run lint:fix
```

### Prettier

Автоматичне форматування:

```bash
# Format all files
npm run format
```

---

## Checklist перед commit

- [ ] Код відповідає naming conventions
- [ ] Немає console.log
- [ ] Немає закоментованого коду
- [ ] Додані JSDoc коментарі для public функцій
- [ ] ESLint проходить без помилок
- [ ] Prettier застосований
- [ ] Тести написані та проходять

---

## Приклади

### Повний приклад: User Service

```javascript
/**
 * User Service
 * Handles user-related operations
 */

const bcrypt = require('bcrypt');
const db = require('../config/database');
const { ValidationError } = require('../utils/errors');

const BCRYPT_ROUNDS = 10;

class UserService {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Plain text password
   * @returns {Promise<Object>} Created user (without password)
   */
  async createUser(userData) {
    const { username, email, password } = userData;

    // Validate
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Save to database
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(query, [username, email, passwordHash]);

    // Return user without password
    return this.getUserById(result.insertId);
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} User or null if not found
   */
  async getUserById(userId) {
    const query = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
    const [rows] = await db.query(query, [userId]);
    return rows[0] || null;
  }
}

module.exports = new UserService();
```

---

**Питання?** Створіть Issue або запитайте в команді!

**Оновлено:** 2026-02-01
