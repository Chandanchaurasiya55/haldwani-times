import express from 'express';
import crypto from 'crypto';
import db from '../config/db.js';

const router = express.Router();

// Utility function to hash password with SHA-256
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper to check for username/email duplication across all tables
function checkDuplication(username, email, callback) {
  // Check in admins
  db.query('SELECT * FROM admins WHERE username = ? OR email = ?', [username, email], (err, adminRows) => {
    if (err) return callback(err, null);
    if (adminRows && adminRows.length > 0) return callback(null, 'admin');

    // Check in reporters
    db.query('SELECT * FROM reporters WHERE username = ? OR email = ?', [username, email], (repErr, reporterRows) => {
      if (repErr) return callback(repErr, null);
      if (reporterRows && reporterRows.length > 0) return callback(null, 'reporter');

      // Check in general users
      db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (userErr, userRows) => {
        if (userErr) return callback(userErr, null);
        if (userRows && userRows.length > 0) return callback(null, 'user');
        
        callback(null, false); // No duplication
      });
    });
  });
}

// @route   POST /api/auth/register/reporter
// @desc    Register a new reporter account
router.post('/register/reporter', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const hashedPassword = hashPassword(password);

  checkDuplication(username, email, (err, conflictRole) => {
    if (err) {
      return res.status(500).json({ message: 'Database query failure.', error: err.message });
    }
    if (conflictRole) {
      return res.status(400).json({ message: 'Username or email already exists.' });
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

  checkDuplication(username, email, (err, conflictRole) => {
    if (err) {
      return res.status(500).json({ message: 'Database query failure.', error: err.message });
    }
    if (conflictRole) {
      return res.status(400).json({ message: 'Username or email already exists.' });
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
    if (err) {
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
      if (repErr) {
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
        if (userErr) {
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
