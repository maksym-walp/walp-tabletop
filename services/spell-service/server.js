require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3002;
const host = '0.0.0.0';

app.use(cors());
app.use(express.json());

// Database pool для spells_db
const pool = mysql.createPool({
  host: process.env.SPELLS_DB_HOST || 'localhost',
  port: parseInt(process.env.SPELLS_DB_PORT) || 3306,
  user: process.env.SPELLS_DB_USER,
  password: process.env.SPELLS_DB_PASSWORD,
  database: process.env.SPELLS_DB_NAME || 'spells_db',
  charset: 'utf8mb4',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 10,

  idleTimeout: 30000,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  maxIdle: 5,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'spell-service' });
});

const processSpellRow = (row) => {
  const traditions = row.traditions ? row.traditions.split(',') : [];

  // Парсимо JSON поля якщо вони є рядками
  let components = row.components || [];
  if (typeof components === 'string') {
    try {
      components = JSON.parse(components);
    } catch (e) {
      components = [];
    }
  }

  let higherLevels = row.higher_levels || {};
  if (typeof higherLevels === 'string') {
    try {
      higherLevels = JSON.parse(higherLevels);
    } catch (e) {
      higherLevels = {};
    }
  }

  const spell = {
    id: row.id,
    name: row.name,
    level: row.level,
    actions: row.actions,
    range: row.spell_range,
    concentration: row.concentration,
    ritual: row.ritual,
    traditions,
    components,
    narrativeDescription: row.narrative_description,
    mechanicalDescription: row.mechanical_description,
    hasHigherLevels: Boolean(row.has_higher_levels),
    higherLevels,
    duration: {
      value: row.duration_value,
      unit: row.duration_unit,
      customUnit: row.duration_custom_unit
    }
  };

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

    // Debug logging
    console.log(`[DEBUG] Spell ID: ${id}`);
    console.log(`[DEBUG] Raw row traditions:`, rows[0]?.traditions);

    if (rows.length === 0) {
      return res.status(404).send('Заклинання не знайдено');
    }

    // Обробляємо один рядок
    const spell = processSpellRow(rows[0]);
    console.log(`[DEBUG] Processed traditions:`, spell.traditions);
    res.json(spell);

  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка читання з бази даних');
  }
});

app.post('/api/spells', async (req, res) => {
  let connection;

  try {
    const spellData = req.body;

    // Debug: що приходить з форми
    console.log('[DEBUG] Received spell data:', JSON.stringify(spellData, null, 2));
    console.log('[DEBUG] Traditions received:', spellData.traditions);

    // 1. Одне з'єднання з пулу
    connection = await pool.getConnection();
    
    // 2. Початок транзакції
    await connection.beginTransaction();

    // 3. Підготовка даних для вставки
    const spellToInsert = {
      name: spellData.name,
      level: spellData.level,
      actions: spellData.actions,
      spell_range: spellData.range,
      concentration: spellData.concentration,
      ritual: spellData.ritual,
      duration_value: spellData.duration.value,
      duration_unit: spellData.duration.unit,
      duration_custom_unit: spellData.duration.customUnit,
      narrative_description: spellData.narrativeDescription,
      mechanical_description: spellData.mechanicalDescription,
      has_higher_levels: spellData.hasHigherLevels,
      
      // Перетворення об'єктів/масивів у JSON-рядки
      components: JSON.stringify(spellData.components || []),
      higher_levels: JSON.stringify(spellData.higherLevels || {})
    };

    // Вставка в таблицю spells
    const [insertResult] = await connection.query(
      'INSERT INTO spells SET ?', 
      [spellToInsert]
    );
    
    const newSpellId = insertResult.insertId;

    // Вставка в таблицю spell_traditions
    if (spellData.traditions && spellData.traditions.length > 0) {
      console.log('[DEBUG] Traditions to insert:', spellData.traditions);

      // Створюємо плейсхолдери для кожної традиції: (?, ?, ?)
      const placeholders = spellData.traditions.map(() => '?').join(', ');
      const traditionsQuery = `
        INSERT INTO spell_traditions (spell_id, tradition_id)
        SELECT ?, t.id
        FROM traditions AS t
        WHERE t.name IN (${placeholders});
      `;

      const queryParams = [newSpellId, ...spellData.traditions];
      console.log('[DEBUG] Query params:', queryParams);

      const [tradResult] = await connection.query(traditionsQuery, queryParams);
      console.log('[DEBUG] Traditions insert result:', tradResult);
    }

    // Коміт змін
    await connection.commit();

    // Відправка відповіді з новим заклинанням
    const newSpell = {
      id: newSpellId,
      ...spellData
    };
    res.status(201).json(newSpell);

  } catch (err) {
    // Ролбек у випадку помилки
    if (connection) {
      await connection.rollback();
    }
    console.error('Помилка транзакції:', err);
    res.status(500).send('Помилка запису в базу даних');
  
  } finally {
    // Звільнення з'єднання
    if (connection) {
      connection.release();
    }
  }
});

// Serve static files from the React app
// app.use(express.static(path.join(__dirname, '../build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../build/index.html'));
// });

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../build', 'index.html'));
// });

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connections...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database connections...');
  await pool.end();
  process.exit(0);
});

app.listen(port, host, () => {
  console.log(`Spell service running on http://${host}:${port}`);
});
