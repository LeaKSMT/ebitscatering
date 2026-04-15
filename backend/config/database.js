const mysql = require('mysql2/promise');

// Database configuration with connection pooling
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ebits_catering_db',
  waitForConnections: true,
  connectionLimit: 10, // Maximum number of connections in pool
  queueLimit: 0, // Unlimited queue for waiting connections
  acquireTimeout: 60000, // 20 seconds
  timeout: 60000, // 20 seconds
  reconnect: true,
  charset: 'utf8mb4',
  timezone: '+08:00', // Philippines timezone
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Health check function
const healthCheck = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    console.log('Database connection pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

// Handle process termination
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

module.exports = {
  pool,
  healthCheck,
  closePool
};
