import db from '../config/db.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// ==========================================
// RAZORPAY INSTANCE
// ==========================================
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
let razorpayInstance = null;
if (razorpayKeyId && razorpayKeySecret) {
  razorpayInstance = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
  console.log('[Razorpay] Initialized with provided credentials.');
} else {
  console.warn('[Razorpay] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set in .env — payment verification will be skipped (test mode).');
}

// ==========================================
// DB INITIALIZATION (Ads + Ad Bids tables)
// ==========================================

// Ensure ads table exists and has default entries
db.query(
  `CREATE TABLE IF NOT EXISTS ads (
    slot_id VARCHAR(50) PRIMARY KEY,
    image_url TEXT,
    target_url TEXT,
    title VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`,
  [],
  (err) => {
    if (err) {
      console.error('[AdsInit] Failed to verify/create ads table:', err.message);
    } else {
      // Dynamic migration for existing DB
      db.query("SHOW COLUMNS FROM ads LIKE 'title'", (colErr, rows) => {
        if (!colErr && rows.length === 0) {
          db.query("ALTER TABLE ads ADD COLUMN title VARCHAR(255) DEFAULT NULL, ADD COLUMN description TEXT DEFAULT NULL", (alterErr) => {
            if (alterErr) console.error("[AdsMigration] Failed to add title/description columns:", alterErr.message);
            else console.log("[AdsMigration] Successfully added title/description columns to ads table.");
          });
        }
      });

      const slots = [
        { slot: 'AD 1' }, { slot: 'AD 2' }, { slot: 'AD 3' }, { slot: 'AD 4' }, { slot: 'AD 5' }, { slot: 'AD 6' }, { slot: 'AD 7' }, { slot: 'AD_DETAIL' },
        {
          slot: 'SLIDER 1',
          url: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=1200&h=300&q=80',
          title: 'Kumaon Luxury Retreats',
          desc: 'Experience pure tranquility in the lap of nature. Book your premium cottage stay today.'
        },
        {
          slot: 'SLIDER 2',
          url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&h=300&q=80',
          title: 'Haldwani Premium Residency',
          desc: 'Delivering dream homes at unbeatable rates. RERA-approved luxury villas open for booking.'
        },
        {
          slot: 'SLIDER 3',
          url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&h=300&q=80',
          title: 'Nainital Adventure Club',
          desc: 'Unleash the thrill with paragliding, boating, and trekking campaigns. Group discounts active.'
        }
      ];

      slots.forEach(item => {
        db.query(
          `INSERT IGNORE INTO ads (slot_id, image_url, target_url, title, description) VALUES (?, ?, '', ?, ?)`,
          [item.slot, item.url || '', item.title || null, item.desc || null]
        );
      });
    }
  }
);

// Ensure ad_bids table exists
db.query(
  `CREATE TABLE IF NOT EXISTS ad_bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    ad_title VARCHAR(255) NOT NULL,
    ad_description TEXT,
    ad_image_url TEXT NOT NULL,
    ad_target_url TEXT,
    slot_preference VARCHAR(50) DEFAULT 'Any',
    bid_amount DECIMAL(10, 2) NOT NULL,
    duration_days INT DEFAULT 7,
    status ENUM('pending', 'active', 'expired', 'rejected') DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`,
  [],
  (err) => {
    if (err) {
      console.error('[AdBidsInit] Failed to create ad_bids table:', err.message);
    } else {
      // Migration: add payment columns if missing
      db.query("SHOW COLUMNS FROM ad_bids LIKE 'razorpay_order_id'", (colErr, rows) => {
        if (!colErr && rows.length === 0) {
          db.query(
            `ALTER TABLE ad_bids
             ADD COLUMN razorpay_order_id VARCHAR(255) DEFAULT NULL,
             ADD COLUMN razorpay_payment_id VARCHAR(255) DEFAULT NULL,
             ADD COLUMN payment_status VARCHAR(50) DEFAULT 'unpaid'`,
            (alterErr) => {
              if (alterErr) console.error('[AdBidsMigration] Failed to add payment columns:', alterErr.message);
              else console.log('[AdBidsMigration] Successfully added razorpay payment columns to ad_bids table.');
            }
          );
        }
      });
    }
  }
);

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// @desc    Get all approved articles (public feed)
export const getPublicArticles = (req, res) => {
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
};

// ==========================================
// REPORTER ENDPOINTS
// ==========================================

// @desc    Submit a new article for review
export const createArticle = (req, res) => {
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
};

// @desc    Get all articles submitted by a specific reporter
export const getMySubmissions = (req, res) => {
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
};

// @desc    Publish a new blog post directly (admin desk)
export const createBlogPost = (req, res) => {
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
};

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

// @desc    Get all pending articles awaiting review
export const getPendingArticles = (req, res) => {
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
};

// @desc    Update article status (approve/reject)
export const updateArticleStatus = (req, res) => {
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
};

// @desc    Get list of all registered reporters
export const getReporters = (req, res) => {
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
};

// @desc    Update reporter status (active/blocked)
export const updateReporterStatus = (req, res) => {
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
};

// ==========================================
// BOOKMARKS ENDPOINTS (GENERAL READERS)
// ==========================================

// @desc    Add a bookmark for a user
export const addBookmark = (req, res) => {
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
};

// @desc    Remove a bookmark for a user
export const removeBookmark = (req, res) => {
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
};

// @desc    Get all bookmarked articles for a specific user
export const getUserBookmarks = (req, res) => {
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
};

// ==========================================
// ADS MANAGEMENT ENDPOINTS
// ==========================================

// @desc    Get all current ads
export const getAds = (req, res) => {
  db.query('SELECT * FROM ads', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch ads.', error: err.message });
    }
    res.json(rows);
  });
};

// @desc    Update a specific ad slot (admin-only)
export const updateAd = (req, res) => {
  const { slot_id, image_url, target_url, title, description } = req.body;

  if (!slot_id) {
    return res.status(400).json({ message: 'Slot ID is required.' });
  }

  db.query(
    'UPDATE ads SET image_url = ?, target_url = ?, title = ?, description = ? WHERE slot_id = ?',
    [image_url || '', target_url || '', title || null, description || null, slot_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to update ad.', error: err.message });
      }
      res.json({ message: `Ad slot ${slot_id} updated successfully.` });
    }
  );
};

// ==========================================
// AD BIDDING SYSTEM
// ==========================================

// @desc    Create a Razorpay order for the bid amount
export const createPaymentOrder = async (req, res) => {
  const { amount } = req.body;
  if (!amount || parseFloat(amount) < 50) {
    return res.status(400).json({ message: 'Minimum bid amount is ₹50.' });
  }

  // Calculate 18% GST on the base amount
  const baseAmount = parseFloat(amount);
  const totalWithGst = baseAmount * 1.18;

  if (!razorpayInstance) {
    // Test mode: return a fake order ID so the frontend flow still works
    return res.json({ id: 'order_TEST_' + Date.now(), amount: Math.round(totalWithGst * 100), currency: 'INR', test_mode: true });
  }

  try {
    const order = await razorpayInstance.orders.create({
      amount: Math.round(totalWithGst * 100), // amount in paise including 18% GST
      currency: 'INR',
      receipt: 'ad_bid_' + Date.now(),
    });
    res.json({ ...order, key_id: razorpayKeyId });
  } catch (err) {
    console.error('[Razorpay] Order creation failed:', err);
    res.status(500).json({ message: 'Failed to create payment order.', error: err.message });
  }
};

// @desc    User submits a new ad bid after successful payment
export const submitAdBid = (req, res) => {
  const { user_id, business_name, contact_email, contact_phone, ad_title, ad_description, ad_image_url, ad_target_url, slot_preference, bid_amount, duration_days, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!user_id || !business_name || !contact_email || !ad_title || !ad_image_url || !bid_amount) {
    return res.status(400).json({ message: 'Business name, contact email, ad title, ad image, and bid amount are required.' });
  }

  if (parseFloat(bid_amount) < 50) {
    return res.status(400).json({ message: 'Minimum bid amount is ₹50.' });
  }

  // Verify Razorpay signature if credentials are configured
  let paymentStatus = 'unpaid';
  if (razorpayKeySecret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }
    paymentStatus = 'paid';
  } else if (razorpay_order_id && razorpay_order_id.startsWith('order_TEST_')) {
    // Test mode — mark as paid for dev convenience
    paymentStatus = 'paid';
  }

  db.query(
    `INSERT INTO ad_bids (user_id, business_name, contact_email, contact_phone, ad_title, ad_description, ad_image_url, ad_target_url, slot_preference, bid_amount, duration_days, razorpay_order_id, razorpay_payment_id, payment_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, business_name, contact_email, contact_phone || '', ad_title, ad_description || '', ad_image_url, ad_target_url || '', slot_preference || 'Any', bid_amount, duration_days || 7, razorpay_order_id || null, razorpay_payment_id || null, paymentStatus],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to submit ad bid.', error: err.message });
      res.status(201).json({ message: 'Ad bid submitted successfully! Payment verified. Our team will review it.', id: result.insertId, payment_status: paymentStatus });
    }
  );
};

// @desc    Get all bids by a specific user
export const getUserBids = (req, res) => {
  db.query(
    'SELECT * FROM ad_bids WHERE user_id = ? ORDER BY created_at DESC',
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Failed to fetch user bids.', error: err.message });
      res.json(rows);
    }
  );
};

// @desc    Get all ad bids (admin view), ordered by highest bid first
export const getAllBids = (req, res) => {
  db.query(
    `SELECT b.*, u.username as bidder_name 
     FROM ad_bids b 
     LEFT JOIN users u ON b.user_id = u.id 
     ORDER BY b.bid_amount DESC, b.created_at DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Failed to fetch bids.', error: err.message });
      res.json(rows);
    }
  );
};

// @desc    Admin approve/reject a bid
export const updateBidStatus = (req, res) => {
  const { status, admin_notes } = req.body;
  const validStatuses = ['pending', 'active', 'expired', 'rejected'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  db.query(
    'UPDATE ad_bids SET status = ?, admin_notes = ? WHERE id = ?',
    [status, admin_notes || '', req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Failed to update bid status.', error: err.message });
      res.json({ message: `Bid #${req.params.id} status updated to ${status}.` });
    }
  );
};
