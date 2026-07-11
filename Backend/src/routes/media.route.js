import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadMedia, getAllMedia, deleteMedia, hasCloudinary } from '../controller/mediaController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer Setup
const uploadsDir = path.join(__dirname, '../../uploads');

const storage = hasCloudinary 
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    });

const upload = multer({ storage });

// @route   POST /api/media/upload
router.post('/upload', upload.single('file'), uploadMedia);

// @route   GET /api/media
router.get('/', getAllMedia);

// @route   DELETE /api/media/:id
router.delete('/:id', deleteMedia);

export default router;
