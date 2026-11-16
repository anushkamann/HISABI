'use strict';

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hisabi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});


async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅  MySQL connected → database: "${process.env.DB_NAME || 'hisabi'}"`);
    connection.release();
  } catch (error) {
    console.error('❌  MySQL connection failed:', error.message);
    console.error('    Check your .env file (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).');
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
