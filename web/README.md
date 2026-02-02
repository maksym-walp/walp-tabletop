# Web (Frontend)

> React SPA для Walpapur Tabletop

**Port:** 80 (HTTP), 443 (HTTPS)
**Технології:** React 19, React Router, CSS

---

## Компоненти

### Заклинання

- `SpellList` - список заклинань з фільтрами
- `SpellCard` - картка заклинання у списку
- `SpellDetail` - сторінка детального перегляду
- `SpellForm` - створення/редагування
- `Traditions` - сторінка про традиції

### Аутентифікація

- `Login` - форма логіну
- `Register` - форма реєстрації
- Auth context для управління станом

---

## Структура

```
web/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/        # React компоненти
│   ├── assets/            # Зображення, стилі
│   ├── config/            # Конфігурація
│   ├── App.js            # Головний компонент
│   └── index.js          # Entry point
└── package.json
```

---

## Environment Variables

```env
REACT_APP_API_URL=http://localhost:3000
```

---

## Розробка

```bash
cd web

# Install
npm install

# Development server (port 3000)
npm start

# Build for production
npm run build

# Tests
npm test
```

---

## API Integration

```javascript
// Приклад запиту до API
const response = await fetch(`${process.env.REACT_APP_API_URL}/api/spells`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

**Назад**: [Головна документація](../README.md)
