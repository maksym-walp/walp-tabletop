const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

module.exports = (db) => {

  // РЕЄСТРАЦІЯ
  router.post('/register',
    [
      body('username').trim().isLength({ min: 3 }),
      body('email').isEmail().normalizeEmail(),
      body('password').isLength({ min: 6 })
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      try {
        const [existing] = await db.query(
          'SELECT id FROM users WHERE email = ? OR username = ?',
          [email, username]
        );
        if (existing.length > 0) {
          return res.status(409).json({ message: 'Користувач вже існує' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const [result] = await db.query(
          'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
          [username, email, passwordHash]
        );

        res.status(201).json({ message: 'Користувач створений', userId: result.insertId });

      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка сервера' });
      }
    }
  );

  // ЛОГІН
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(401).json({ message: 'Невірний email або пароль' });
      }
      const user = users[0];

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Невірний email або пароль' });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token, userId: user.id, username: user.username });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Помилка сервера' });
    }
  });

  return router;
};
