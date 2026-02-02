# Code Style Guide

> Стандарти написання коду для Walpapur Tabletop

---

### 1. Читабельність понад усе
Код пишеться один раз, читається багато разів. Залишайте коментарі, називайте змінні та функції так, щоб особа незнайома із кодом могла зрозуміти для чого вони потрібні.

### 2. Consistency over perfection
Краще робочий, але не ідеальний всюди, ніж "ідеальний" в одному місці і не робочий ніде більше.

### 3. KISS (Keep It Simple, Stupid)
Простота завжди має переважати над складністю. Краще декілька простих (дурних) дій послідовно, ніж намагання однією функцією реалізувати одразу всю логіку.

### 4. DRY (Don't Repeat Yourself)
Уникайте дублювання коду.

---

## JavaScript / Node.js

### Naming Conventions

#### Variables & Functions

Назви змінний та функцій пишемо починаючи з малої літери і всі наступні слова разом з великої - осьТак
```javascript
// camelCase
const userName = 'John';
const getUserById = (id) => { };
let isAuthenticated = false;

// snake_case (Це ж не пайтон)
const user_name = 'John';        // Погано
const GetUserById = (id) => { }; // PascalCase для функції - теж погано
```

#### Constants

Назви констант пишемо великими літерами та з нижніми підкресленнями - ОСЬ_ТАК

```javascript
// UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET;
```

#### Classes & Components

Назви класів та компонентів пишемо кожне слово з великої літери включаючи перше слово - ОсьТак.

```javascript
// PascalCase
class UserService { }
class SpellController { }

// React Components
function SpellCard({ spell }) { }
const SpellList = () => { };

// Погано
class userService { }        // camelCase
function spellCard() { }     // camelCase
```

#### Files

```javascript
// Добре
userService.js      // utilities - camelCase
SpellCard.jsx       // React components - PascalCase
authMiddleware.js

// Погано
spell_controller.js // snake_case
spellcard.jsx       // без роздільника
```

---

## Основні правила

### Functions
- Називайте `дієслово + іменник`: `getUserById()`, `createSpell()`, `isAuthenticated()`
- `const` для незмінних, `let` для змінних, **ніколи `var`**
- `async/await` замість `then/catch`
- Використовуйте destructuring: `const { name, level } = spell;`

### React
- Функціональні компоненти + hooks
- Props destructuring: `function Card({ spell, onEdit })`
- Handlers називаємо `handleClick`, `handleSubmit`
- Custom hooks з префіксом `use`: `useAuth()`, `useFetch()`

### CSS
- BEM methodology: `.spell-card`, `.spell-card__title`, `.spell-card--active`
- kebab-case для класів

### SQL
- Keywords в UPPER CASE: `SELECT`, `FROM`, `WHERE`
- **Завжди placeholders**: `WHERE id = ?` (ніколи не конкатенація!)

### Заборонено
- `console.log` в production
- Порожні `catch` блоки
- `==` замість `===`
- Hardcoded credentials
- Мутація props в React

---

## Форматування

- **2 spaces** для відступів
- **Max 100 символів** на рядок
- Пусті рядки для логічного групування

---

## Linting

```bash
npm run lint        # Перевірка
npm run lint:fix    # Auto-fix
```

---

## Checklist перед commit

- [ ] Naming conventions дотримані
- [ ] Немає console.log
- [ ] Немає закоментованого коду
- [ ] ESLint проходить

---

## Корисні ресурси

**JavaScript:**
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) - найпопулярніший style guide
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript) - принципи чистого коду

**React:**
- [React Official Docs](https://react.dev/) - офіційна документація
- [React Patterns](https://reactpatterns.com/) - best practices

**CSS:**
- [BEM Methodology](https://en.bem.info/methodology/) - офіційний сайт BEM

**General:**
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)

---

**Питання?** Створіть Issue або запитайте в команді!

**Оновлено:** 2026-02-02
