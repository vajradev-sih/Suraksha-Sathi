import multer from 'multer';
import path from 'path';
import fs from 'fs';

const imagesDir = path.join(process.cwd(), 'src', 'media', 'images');
const videosDir = path.join(process.cwd(), 'src', 'media', 'videos');

// Ensure directories exist
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mimeType = file.mimetype;
    if (mimeType.startsWith('image/')) {
      cb(null, imagesDir);
    } else if (mimeType.startsWith('video/')) {
      cb(null, videosDir);
    } else {
      cb(new Error('Unsupported file type'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov'];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Unsupported file type'), false);
};

const limits = { fileSize: 50 * 1024 * 1024 }; // up to 50 MB

export default multer({ storage, fileFilter, limits });
