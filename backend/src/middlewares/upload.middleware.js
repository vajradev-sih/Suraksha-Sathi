import multer from 'multer';
import path from 'path';
import fs from 'fs';

const imagesDir = path.join(process.cwd(), 'src', 'media', 'images');
const videosDir = path.join(process.cwd(), 'src', 'media', 'videos');
const audioDir = path.join(process.cwd(), 'src', 'media', 'audio');

// Ensure directories exist
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('[UPLOAD MIDDLEWARE] Processing file:', file.originalname);
    const mimeType = file.mimetype;
    if (mimeType.startsWith('image/')) {
      cb(null, imagesDir);
    } else if (mimeType.startsWith('video/')) {
      cb(null, videosDir);
    } else if (mimeType.startsWith('audio/')) {
      cb(null, audioDir);
    } else {
      console.log('[UPLOAD MIDDLEWARE] Unsupported file type:', mimeType);
      cb(new Error('Unsupported file type'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('[UPLOAD MIDDLEWARE] Saving as:', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('[UPLOAD MIDDLEWARE] Filtering file type:', file.mimetype);
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/avi', 'video/mov', 'video/webm',
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    console.log('[UPLOAD MIDDLEWARE] File type accepted');
    cb(null, true);
  } else {
    console.log('[UPLOAD MIDDLEWARE] File type rejected');
    cb(new Error('Unsupported file type'), false);
  }
};

const limits = { fileSize: 50 * 1024 * 1024 }; // up to 50 MB

export default multer({ storage, fileFilter, limits });
