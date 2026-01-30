require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { verifyToken, optionalAuth } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Auth service - публічні endpoints (без JWT перевірки)
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  onError: (err, req, res) => {
    console.error('Auth service proxy error:', err.message);
    res.status(503).json({ message: 'Auth service unavailable' });
  }
}));

// Spells service - публічні endpoints (опціональна авторизація)
app.use('/api/spells', optionalAuth, createProxyMiddleware({
  target: process.env.SPELL_SERVICE_URL || 'http://spell-service:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/spells': '/api/spells'
  },
  onProxyReq: (proxyReq, req) => {
    // Передаємо user headers якщо є
    if (req.headers['x-user-id']) {
      proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
      proxyReq.setHeader('x-username', req.headers['x-username']);
      proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
    }
  },
  onError: (err, req, res) => {
    console.error('Spell service proxy error:', err.message);
    res.status(503).json({ message: 'Spell service unavailable' });
  }
}));

// Приклад захищеного endpoint (потребує JWT)
// app.use('/api/profile', verifyToken, createProxyMiddleware({
//   target: process.env.USER_SERVICE_URL || 'http://user-service:3003',
//   changeOrigin: true
// }));

app.listen(port, host, () => {
  console.log(`API Gateway running on http://${host}:${port}`);
});
