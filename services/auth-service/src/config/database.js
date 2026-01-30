const mysql = require('mysql2/promise');

const poolConfig = {
    host: process.env.AUTH_DB_HOST || 'localhost',
    port: parseInt(process.env.AUTH_DB_PORT) || 3306,
    user: process.env.AUTH_DB_USER,
    password: process.env.AUTH_DB_PASSWORD,
    database: process.env.AUTH_DB_NAME || 'auth_db',

    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 5,

    idleTimeout: 30000,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    maxIdle: 2,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
};

const pool = mysql.createPool(poolConfig);

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

module.exports = pool;
