import express from 'express';
import crypto from 'crypto';
import db from '../config/db.js';

const router = express.Router();

// Utility function to hash password with SHA-256
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ========================================
// AUTO-CREATE TABLES ON STARTUP
// ========================================

// Admins table
db.query(`CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB`, [], (err) => {
  if (err) console.error('[AuthInit] Failed to create admins table:', err.message);
});

// Reporters table
db.query(`CREATE TABLE IF NOT EXISTS reporters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB`, [], (err) => {
  if (err) console.error('[AuthInit] Failed to create reporters table:', err.message);
});

// Users table
db.query(`CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB`, [], (err) => {
  if (err) console.error('[AuthInit] Failed to create users table:', err.message);
});

// Bookmarks table
db.query(`CREATE TABLE IF NOT EXISTS bookmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  article_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_bookmark (user_id, article_id)
) ENGINE=InnoDB`, [], (err) => {
  if (err) console.error('[AuthInit] Failed to create bookmarks table:', err.message);
});


// Helper to check for username/email duplication in a specific table
function checkTableDuplication(table, username, email, callback) {
  db.query(`SELECT * FROM ${table} WHERE username = ? OR email = ?`, [username, email], (err, rows) => {
    if (err && err.code !== 'ER_NO_SUCH_TABLE') return callback(err, null);
    if (rows && rows.length > 0) return callback(null, true);
    callback(null, false);
  });
}

// @route   POST /api/auth/register/admin
// @desc    Register a new admin account
router.post('/register/admin', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const hashedPassword = hashPassword(password);

  checkTableDuplication('admins', username, email, (err, exists) => {
    if (err) {
      return res.status(500).json({ message: 'Database query failure.', error: err.message });
    }
    if (exists) {
      return res.status(400).json({ message: 'Username or email already exists in Admins.' });
    }

    db.query(
      'INSERT INTO admins (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      (insertErr, result) => {
        if (insertErr) {
          return res.status(500).json({ message: 'Registration failed.', error: insertErr.message });
        }

        res.status(201).json({
          user: {
            id: result.insertId,
            username,
            email,
            role: 'admin',
            status: 'active'
          },
          message: 'Admin account successfully created!'
        });
      }
    );
  });
});

// @route   POST /api/auth/register/reporter
// @desc    Register a new reporter account
router.post('/register/reporter', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const hashedPassword = hashPassword(password);

  checkTableDuplication('reporters', username, email, (err, exists) => {
    if (err) {
      return res.status(500).json({ message: 'Database query failure.', error: err.message });
    }
    if (exists) {
      return res.status(400).json({ message: 'Username or email already exists in Reporters.' });
    }

    // Insert new reporter
    db.query(
      'INSERT INTO reporters (username, email, password, status) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'active'],
      (insertErr, result) => {
        if (insertErr) {
          return res.status(500).json({ message: 'Registration failed.', error: insertErr.message });
        }

        res.status(201).json({
          user: {
            id: result.insertId,
            username,
            email,
            role: 'reporter',
            status: 'active'
          },
          message: 'Reporter account successfully created!'
        });
      }
    );
  });
});

// @route   POST /api/auth/register/user
// @desc    Register a new general user account (Reader)
router.post('/register/user', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const hashedPassword = hashPassword(password);

  checkTableDuplication('users', username, email, (err, exists) => {
    if (err) {
      return res.status(500).json({ message: 'Database query failure.', error: err.message });
    }
    if (exists) {
      return res.status(400).json({ message: 'Username or email already exists in Readers.' });
    }

    // Insert new general user
    db.query(
      'INSERT INTO users (username, email, password, status) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'active'],
      (insertErr, result) => {
        if (insertErr) {
          return res.status(500).json({ message: 'Registration failed.', error: insertErr.message });
        }

        res.status(201).json({
          user: {
            id: result.insertId,
            username,
            email,
            role: 'user',
            status: 'active'
          },
          message: 'User account successfully created!'
        });
      }
    );
  });
});

// @route   POST /api/auth/login
// @desc    Authenticate user (Reporter, Admin, or General User)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const hashedPassword = hashPassword(password);

  // 1. Try matching against admins
  db.query('SELECT * FROM admins WHERE email = ?', [email], (err, adminRows) => {
    if (err && err.code !== 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ message: 'Database query failure.', error: err.message });
    }

    const admin = adminRows && adminRows.length > 0 ? adminRows[0] : null;
    if (admin) {
      if (admin.password !== hashedPassword) {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }
      return res.json({
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: 'admin',
          status: 'active'
        },
        message: 'Admin login successful!'
      });
    }

    // 2. Try matching against reporters
    db.query('SELECT * FROM reporters WHERE email = ?', [email], (repErr, reporterRows) => {
      if (repErr && repErr.code !== 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({ message: 'Database query failure.', error: repErr.message });
      }

      const reporter = reporterRows && reporterRows.length > 0 ? reporterRows[0] : null;
      if (reporter) {
        if (reporter.password !== hashedPassword) {
          return res.status(400).json({ message: 'Invalid email or password.' });
        }
        if (reporter.status === 'blocked') {
          return res.status(403).json({ message: 'Access denied. Account is blocked.' });
        }
        return res.json({
          user: {
            id: reporter.id,
            username: reporter.username,
            email: reporter.email,
            role: 'reporter',
            status: reporter.status
          },
          message: 'Reporter login successful!'
        });
      }

      // 3. Try matching against general users (Readers)
      db.query('SELECT * FROM users WHERE email = ?', [email], (userErr, userRows) => {
        if (userErr && userErr.code !== 'ER_NO_SUCH_TABLE') {
          return res.status(500).json({ message: 'Database query failure.', error: userErr.message });
        }

        const user = userRows && userRows.length > 0 ? userRows[0] : null;
        if (!user || user.password !== hashedPassword) {
          return res.status(400).json({ message: 'Invalid email or password.' });
        }

        if (user.status === 'blocked') {
          return res.status(403).json({ message: 'Access denied. Account is blocked.' });
        }

        res.json({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: 'user',
            status: user.status
          },
          message: 'User login successful!'
        });
      });
    });
  });
});

export default router;
