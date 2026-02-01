# Spell Service

> Сервіс управління заклинаннями

**Port:** 3002 (internal)
**Database:** `spells_db`

---

## Відповідальність

- CRUD операції для заклинань
- Пошук та фільтрація
- Організація за традиціями магії

---

## API Endpoints

```http
GET /spells?tradition=fire&level=3
Response: [{ id, name, level, school, ... }]

GET /spells/:id
Response: { id, name, level, description, ... }

POST /spells (auth required)
{ name, level, school, tradition, description, ... }

PUT /spells/:id (auth required)
{ name, level, ... }

DELETE /spells/:id (auth required)
```

---

## Database Schema

```sql
CREATE TABLE spells (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  level INT NOT NULL,
  school VARCHAR(50),
  casting_time VARCHAR(50),
  range VARCHAR(50),
  components VARCHAR(100),
  duration VARCHAR(50),
  description TEXT,
  tradition VARCHAR(50),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Розробка

```bash
cd services/spell-service
npm install
npm run dev
npm test
```

---

**Назад**: [Головна документація](../../README.md)
