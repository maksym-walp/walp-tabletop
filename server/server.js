require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 5000;
const host = process.env.HOST || '127.0.0.1';

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const processSpellRow = (row) => {
  // 1. Обробка традицій (залишається без змін)
  const traditions = row.traditions ? row.traditions.split(',') : [];

  // 2. Створюємо базовий об'єкт
  const spell = { ...row, traditions };

  // 3. ВИПРАВЛЕННЯ: БЕЗ JSON.parse. Просто призначаємо або дефолт.
  // mysql2 вже повернув нам об'єкт/масив або NULL.
  spell.components = row.components || []; 
  
  // 4. ВИПРАВЛЕННЯ: Призначаємо `higherLevels` (camelCase) з `higher_levels` (snake_case)
  // У вашій БД колонка називається `higher_levels`, але фронтенд (SpellDetail.js)
  // очікує `higherLevels`.
  spell.higherLevels = row.higher_levels || {}; // Призначаємо camelCase
  delete spell.higher_levels; // Видаляємо старе snake_case поле

  // 5. Обробка duration (залишається без змін)
  spell.duration = {
    value: spell.duration_value,
    unit: spell.duration_unit,
    customUnit: spell.duration_custom_unit
  };

  // 6. Видаляємо старі поля, які ми об'єднали
  delete spell.duration_value;
  delete spell.duration_unit;
  delete spell.duration_custom_unit;

  return spell;
};
// API routes
app.get('/api/spells', async (req, res) => {
  try {
    // Цей складний запит робить одну потужну річ:
    // 1. s.* - Обирає всі поля з таблиці `spells`
    // 2. GROUP_CONCAT(t.name) - Збирає всі імена традицій для одного заклинання
    //    в один рядок, наприклад: "Медус,Обскурус"
    // 3. Ми робимо `LEFT JOIN`, щоб заклинання без традицій (як "Дотик стійкості")
    //    також потрапили у вибірку.
    const sqlQuery = `
      SELECT 
        s.*,
        GROUP_CONCAT(t.name) AS traditions
      FROM spells AS s
      LEFT JOIN spell_traditions AS st ON s.id = st.spell_id
      LEFT JOIN traditions AS t ON st.tradition_id = t.id
      GROUP BY s.id;
    `;
    
    const [rows] = await pool.query(sqlQuery);
    
    // Обробляємо кожен рядок, щоб привести його до формату,
    // який очікує фронтенд (напр. App.js та SpellList.js)
    const spells = rows.map(processSpellRow);

    res.json(spells);

  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка читання з бази даних');
  }
});

app.get('/api/spells/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Запит такий самий, але з `WHERE s.id = ?`
    // Використання `?` - це "prepared statement" ("підготовлений запит").
    // Це **критично важливо** для безпеки, щоб запобігти SQL-ін'єкціям.
    const sqlQuery = `
      SELECT 
        s.*,
        GROUP_CONCAT(t.name) AS traditions
      FROM spells AS s
      LEFT JOIN spell_traditions AS st ON s.id = st.spell_id
      LEFT JOIN traditions AS t ON st.tradition_id = t.id
      WHERE s.id = ?
      GROUP BY s.id;
    `;

    const [rows] = await pool.query(sqlQuery, [id]);

    if (rows.length === 0) {
      return res.status(404).send('Заклинання не знайдено');
    }

    // Обробляємо один рядок
    const spell = processSpellRow(rows[0]);
    res.json(spell);

  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка читання з бази даних');
  }
});

app.post('/api/spells', async (req, res) => {
  let connection; // Оголошуємо з'єднання тут, щоб мати до нього доступ у catch/finally
  
  try {
    // Отримуємо дані з тіла запиту, як у SpellForm.js
    const spellData = req.body;

    // 1. Отримуємо одне з'єднання з пулу
    connection = await pool.getConnection();
    
    // 2. Починаємо транзакцію
    await connection.beginTransaction();

    // 3. Готуємо дані для основної таблиці `spells`
    const spellToInsert = {
      name: spellData.name,
      level: spellData.level,
      actions: spellData.actions,
      spell_range: spellData.range, // Пам'ятаємо про перейменування
      concentration: spellData.concentration,
      ritual: spellData.ritual,
      duration_value: spellData.duration.value,
      duration_unit: spellData.duration.unit,
      duration_custom_unit: spellData.duration.customUnit,
      narrative_description: spellData.narrativeDescription,
      mechanical_description: spellData.mechanicalDescription,
      has_higher_levels: spellData.hasHigherLevels,
      
      // Перетворюємо об'єкти/масиви на JSON-рядки для збереження в БД
      components: JSON.stringify(spellData.components || []),
      higher_levels: JSON.stringify(spellData.higherLevels || {})
    };

    // 4. Вставляємо дані в `spells`
    const [insertResult] = await connection.query(
      'INSERT INTO spells SET ?', 
      [spellToInsert]
    );
    
    const newSpellId = insertResult.insertId;

    // 5. Вставляємо дані в `spell_traditions`, якщо вони є
    if (spellData.traditions && spellData.traditions.length > 0) {
      // Це складний, але дуже ефективний запит.
      // Він вставляє нові рядки в `spell_traditions`,
      // обираючи `tradition_id` з таблиці `traditions`
      // на основі *імен*, які надіслав фронтенд.
      const traditionsQuery = `
        INSERT INTO spell_traditions (spell_id, tradition_id)
        SELECT ?, t.id
        FROM traditions AS t
        WHERE t.name IN (?);
      `;
      
      await connection.query(traditionsQuery, [newSpellId, spellData.traditions]);
    }

    // 6. Якщо все пройшло добре, "комітимо" зміни
    await connection.commit();

    // 7. Повертаємо нове заклинання у тому ж форматі,
    // в якому його очікує фронтенд
    const newSpell = {
      id: newSpellId,
      ...spellData
    };
    res.status(201).json(newSpell);

  } catch (err) {
    // 8. Якщо сталася помилка, "відкочуємо" всі зміни
    if (connection) {
      await connection.rollback();
    }
    console.error('Помилка транзакції:', err);
    res.status(500).send('Помилка запису в базу даних');
  
  } finally {
    // 9. В будь-якому випадку повертаємо з'єднання назад у пул
    if (connection) {
      connection.release();
    }
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../build', 'index.html'));
// });

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
