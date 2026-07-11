import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js';

// Define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// AUTO-CREATE MEDIA TABLE
// ========================================
db.query(`CREATE TABLE IF NOT EXISTS media_library (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  cloudinary_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB`, [], (err) => {
  if (err) console.error('[MediaInit] Failed to create media_library table:', err.message);
});

// Configure local uploads directory fallback
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Clean and parse Cloudinary variables
let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
if (cloudName && cloudName.startsWith('cloudinary://')) {
  const parts = cloudName.split('@');
  if (parts.length > 1) {
    cloudName = parts[parts.length - 1];
  }
}

// Check Cloudinary credentials
export const hasCloudinary = process.env.CLOUDINARY_URL || 
                      (cloudName && 
                       process.env.CLOUDINARY_API_KEY && 
                       process.env.CLOUDINARY_API_SECRET);

if (hasCloudinary) {
  console.log('[Media] Cloudinary credentials found. Using Cloudinary storage.');
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
      secure: true
    });
  } else {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
  }
} else {
  console.log('[Media] Cloudinary credentials missing or incomplete. Using Local storage fallback.');
}

// @desc    Upload an image (Cloudinary or Local fallback)
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    let url = '';
    let cloudinaryId = null;

    if (hasCloudinary) {
      try {
        // Cloudinary stream upload
        const uploadStream = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'haldwani_times' },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            stream.end(req.file.buffer);
          });
        };

        const result = await uploadStream();
        url = result.secure_url;
        cloudinaryId = result.public_id;
      } catch (cloudErr) {
        console.warn('[CloudinaryUploadError] Cloudinary failed, falling back to local file storage:', cloudErr.message);
        // Fallback to local storage manually by writing buffer
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + path.extname(req.file.originalname);
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);
        url = `http://localhost:5000/uploads/${filename}`;
      }
    } else {
      // Local URL fallback
      const filename = req.file.filename;
      url = `http://localhost:5000/uploads/${filename}`;
    }

    // Save to database
    db.query(
      'INSERT INTO media_library (filename, url, cloudinary_id) VALUES (?, ?, ?)',
      [req.file.originalname, url, cloudinaryId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to save media metadata.', error: err.message });
        }

        res.status(201).json({
          id: result.insertId,
          filename: req.file.originalname,
          url,
          created_at: new Date()
        });
      }
    );

  } catch (error) {
    console.error('[UploadError]:', error);
    res.status(500).json({ message: 'Image upload failed.', error: error.message });
  }
};

// @desc    Get all uploaded media items
export const getAllMedia = (req, res) => {
  db.query('SELECT * FROM media_library ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve media library.', error: err.message });
    }
    res.json(rows);
  });
};

// @desc    Delete media item
export const deleteMedia = async (req, res) => {
  const mediaId = req.params.id;

  db.query('SELECT * FROM media_library WHERE id = ?', [mediaId], async (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(404).json({ message: 'Media item not found.' });
    }

    const item = rows[0];

    // If Cloudinary, delete from Cloudinary
    if (item.cloudinary_id && hasCloudinary) {
      try {
        await cloudinary.uploader.destroy(item.cloudinary_id);
      } catch (cloudErr) {
        console.error('[CloudinaryDeleteError]:', cloudErr);
      }
    } else if (!item.cloudinary_id) {
      // Delete locally if it is a local file
      const filename = path.basename(item.url);
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (localErr) {
          console.error('[LocalDeleteError]:', localErr);
        }
      }
    }

    // Delete from database
    db.query('DELETE FROM media_library WHERE id = ?', [mediaId], (delErr) => {
      if (delErr) {
        return res.status(500).json({ message: 'Failed to delete media metadata.' });
      }
      res.json({ message: 'Media item deleted successfully.' });
    });
  });
};
