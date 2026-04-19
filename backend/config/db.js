const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL pool connection error:", err);
    } else {
        console.log("MySQL connected");
        connection.release();
    }
});

module.exports = pool;