import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// Ensure ads table exists and has default entries
db.query(
  `CREATE TABLE IF NOT EXISTS ads (
    slot_id VARCHAR(50) PRIMARY KEY,
    image_url TEXT,
    target_url TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`,
  [],
  (err) => {
    if (err) {
      console.error('[AdsInit] Failed to verify/create ads table:', err.message);
    } else {
      const slots = ['AD 1', 'AD 2', 'AD 3', 'AD 4', 'AD 5', 'AD 6', 'AD 7'];
      slots.forEach(slot => {
        db.query(
          `INSERT IGNORE INTO ads (slot_id, image_url, target_url) VALUES (?, '', '')`,
          [slot]
        );
      });
    }
  }
);

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// @route   GET /api/articles
// @desc    Get all approved articles (public feed)
router.get('/', (req, res) => {
  db.query(
    `SELECT a.*, r.username as author_name 
     FROM articles a 
     JOIN reporters r ON a.author_id = r.id 
     WHERE a.status = 'published' 
     ORDER BY a.priority DESC, a.created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to fetch public articles.', error: err.message });
      }
      res.json(rows);
    }
  );
});

// ==========================================
// REPORTER ENDPOINTS
// ==========================================

// @route   POST /api/articles
// @desc    Submit a new article for review
router.post('/', (req, res) => {
  const { title, content, category, type, image_url, author_id, priority } = req.body;

  if (!title || !content || !category || !type || !author_id) {
    return res.status(400).json({ message: 'Required fields missing.' });
  }

  db.query(
    `INSERT INTO articles (title, content, category, type, image_url, author_id, status, priority)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [title, content, category, type, image_url || null, author_id, priority || 0],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to submit article.', error: err.message });
      }
      res.status(201).json({
        id: result.insertId,
        title,
        content,
        category,
        type,
        image_url,
        author_id,
        status: 'pending',
        priority: priority || 0,
        message: 'Article submitted successfully! Awaiting administrator review.'
      });
    }
  );
});

// @route   GET /api/articles/my-submissions/:authorId
// @desc    Get all articles submitted by a specific reporter
router.get('/my-submissions/:authorId', (req, res) => {
  const { authorId } = req.params;

  db.query(
    'SELECT * FROM articles WHERE author_id = ? ORDER BY created_at DESC',
    [authorId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to fetch your submissions.', error: err.message });
      }
      res.json(rows);
    }
  );
});

// @route   POST /api/articles/blog
// @desc    Publish a new blog post directly (admin desk)
router.post('/blog', (req, res) => {
  const { title, content, image_url, priority } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  db.query(
    `INSERT INTO articles (title, content, category, type, image_url, author_id, status, priority)
     VALUES (?, ?, 'Blog', 'blog', ?, 1, 'published', ?)`,
    [title, content, image_url || null, priority || 0],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to publish blog.', error: err.message });
      }
      res.status(201).json({
        id: result.insertId,
        title,
        content,
        category: 'Blog',
        type: 'blog',
        image_url,
        status: 'published',
        message: 'Blog post published successfully!'
      });
    }
  );
});

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

// @route   GET /api/articles/pending
// @desc    Get all pending articles awaiting review
router.get('/pending', (req, res) => {
  db.query(
    `SELECT a.*, r.username as author_name, r.email as author_email
     FROM articles a
     JOIN reporters r ON a.author_id = r.id
     WHERE a.status = 'pending'
     ORDER BY a.created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to fetch pending reviews.', error: err.message });
      }
      res.json(rows);
    }
  );
});

// @route   PUT /api/articles/:id/status
// @desc    Update article status (approve/reject)
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'published' or 'rejected'

  if (!status || !['published', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status update.' });
  }

  db.query(
    'UPDATE articles SET status = ? WHERE id = ?',
    [status, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to update article status.', error: err.message });
      }
      res.json({ message: `Article status successfully updated to: ${status}.` });
    }
  );
});

// @route   GET /api/articles/admin/reporters
// @desc    Get list of all registered reporters
router.get('/admin/reporters', (req, res) => {
  db.query(
    "SELECT id, username, email, status, created_at FROM reporters ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to fetch reporters.', error: err.message });
      }
      res.json(rows);
    }
  );
});

// @route   PUT /api/articles/admin/reporters/:id/status
// @desc    Update reporter status (active/blocked)
router.put('/admin/reporters/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'active' or 'blocked'

  if (!status || !['active', 'blocked'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status update.' });
  }

  db.query(
    'UPDATE reporters SET status = ? WHERE id = ?',
    [status, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to update reporter status.', error: err.message });
      }
      res.json({ message: `Reporter status updated to: ${status}.` });
    }
  );
});

// ==========================================
// BOOKMARKS ENDPOINTS (GENERAL READERS)
// ==========================================

// @route   POST /api/articles/bookmark
// @desc    Add a bookmark for a user
router.post('/bookmark', (req, res) => {
  const { user_id, article_id } = req.body;

  if (!user_id || !article_id) {
    return res.status(400).json({ message: 'User ID and Article ID are required.' });
  }

  db.query(
    'INSERT IGNORE INTO bookmarks (user_id, article_id) VALUES (?, ?)',
    [user_id, article_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to add bookmark.', error: err.message });
      }
      res.status(201).json({ message: 'Article successfully bookmarked.' });
    }
  );
});

// @route   POST /api/articles/unbookmark
// @desc    Remove a bookmark for a user
router.post('/unbookmark', (req, res) => {
  const { user_id, article_id } = req.body;

  if (!user_id || !article_id) {
    return res.status(400).json({ message: 'User ID and Article ID are required.' });
  }

  db.query(
    'DELETE FROM bookmarks WHERE user_id = ? AND article_id = ?',
    [user_id, article_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to remove bookmark.', error: err.message });
      }
      res.json({ message: 'Bookmark successfully removed.' });
    }
  );
});

// @route   GET /api/articles/bookmarks/:userId
// @desc    Get all bookmarked articles for a specific user
router.get('/bookmarks/:userId', (req, res) => {
  const { userId } = req.params;

  db.query(
    `SELECT a.*, r.username as author_name 
     FROM bookmarks b
     JOIN articles a ON b.article_id = a.id
     JOIN reporters r ON a.author_id = r.id
     WHERE b.user_id = ? AND a.status = 'published'`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to fetch bookmarks.', error: err.message });
      }
      res.json(rows);
    }
  );
});

// ==========================================
// ADS MANAGEMENT ENDPOINTS
// ==========================================

// @route   GET /api/articles/ads
// @desc    Get all current ads
router.get('/ads', (req, res) => {
  db.query('SELECT * FROM ads', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch ads.', error: err.message });
    }
    res.json(rows);
  });
});

// @route   PUT /api/articles/ads
// @desc    Update a specific ad slot (admin-only)
router.put('/ads', (req, res) => {
  const { slot_id, image_url, target_url } = req.body;

  if (!slot_id) {
    return res.status(400).json({ message: 'Slot ID is required.' });
  }

  db.query(
    'UPDATE ads SET image_url = ?, target_url = ? WHERE slot_id = ?',
    [image_url || '', target_url || '', slot_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to update ad.', error: err.message });
      }
      res.json({ message: `Ad slot ${slot_id} updated successfully.` });
    }
  );
});

export default router;
