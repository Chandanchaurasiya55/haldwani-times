import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables (Backend/.env is two folders up from Backend/src/schema/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '3306', 10),
};

const dbName = process.env.DB_NAME || 'haldwani_times';

// Sequence of modular schema files inside this directory to execute in dependency order
const schemaFiles = [
  'admin.sql',
  'reporter.sql',
  'user.sql',
  'ad.sql',
  'article.sql',
  'bookmark.sql'
];

console.log('Connecting to MySQL host for database pre-creation...');
const tempConn = mysql.createConnection(dbConfig);

// Drop database to reset tables
tempConn.query(`DROP DATABASE IF EXISTS \`${dbName}\``, (dropErr) => {
  if (dropErr) {
    console.error('Failed to drop old MySQL database:', dropErr.message);
  } else {
    console.log(`Old database '${dbName}' dropped cleanly.`);
  }

  tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, (dbErr) => {
    if (dbErr) {
      console.error('Failed to create/verify MySQL Database:', dbErr.message);
      process.exit(1);
    }

    console.log(`Database '${dbName}' verified/created.`);
    tempConn.end();

    // Dynamically import db.js (one level up to src/ and down to config/db.js)
    import('../config/db.js').then(({ default: pool }) => {
      pool.getConnection((poolErr, connection) => {
        if (poolErr) {
          console.error('Failed to get connection from pool:', poolErr.message);
          pool.end();
          process.exit(1);
        }

        console.log('Successfully connected to MySQL database pool.');

        // Load SQL statements from all modular schema files in sequence
        const statements = [];
        for (const file of schemaFiles) {
          const filePath = path.resolve(__dirname, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const fileStatements = content
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
          statements.push(...fileStatements);
        }

        // Run all SQL statements sequentially
        let index = 0;
        const executeNext = () => {
          if (index < statements.length) {
            const sql = statements[index];
            connection.query(sql, (execErr) => {
              if (execErr) {
                console.error(`Error executing statement:\n${sql}`);
                console.error('Details:', execErr.message);
                connection.release();
                pool.end();
                process.exit(1);
              }
              index++;
              executeNext();
            });
          } else {
            console.log('All modular database tables successfully created with zero hardcoded mock articles.');
            connection.release();
            pool.end();
            console.log('MySQL Database Initialization completed successfully!');
          }
        };

        executeNext();
      });
    });
  });
});
