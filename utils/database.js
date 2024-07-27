const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT, // specify the port if not default
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports.connectMySQL = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('Connected to MySQL database');
    return conn;
  } catch (error) {
    console.error('Error connecting to MySQL database:', error.message);
    throw error;
  }
};
