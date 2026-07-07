import mysql from 'mysql2';
import config from './config.js'; // Ensures Backend/.env variables are initialized

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME || 'haldwani_times',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Establish callback-based connection pool to distribute queries
const pool = mysql.createPool(dbConfig);

export default pool;
