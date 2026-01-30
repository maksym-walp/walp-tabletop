const jwt = require('jsonwebtoken');

// Middleware для перевірки JWT токену
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Токен не надано' });
  }

  const token = authHeader.substring(7); // Видаляємо "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Додаємо інформацію про користувача в headers для сервісів
    req.headers['x-user-id'] = decoded.userId;
    req.headers['x-username'] = decoded.username;
    req.headers['x-user-role'] = decoded.role || 'user';

    // Також зберігаємо в req для використання в gateway
    req.user = decoded;

    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(401).json({ message: 'Невірний або прострочений токен' });
  }
};

// Опціональна перевірка токену (не блокує якщо токену немає)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.headers['x-user-id'] = decoded.userId;
      req.headers['x-username'] = decoded.username;
      req.headers['x-user-role'] = decoded.role || 'user';
      req.user = decoded;
    } catch (err) {
      // Ігноруємо помилку для опціональної авторизації
    }
  }

  next();
};

module.exports = { verifyToken, optionalAuth };
