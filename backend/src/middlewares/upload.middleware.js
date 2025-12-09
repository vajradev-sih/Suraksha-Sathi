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

const upload = multer({ storage, fileFilter, limits });

// Wrap multer to add error logging
const uploadWithLogging = {
  single: (fieldName) => {
    return (req, res, next) => {
      console.log('[UPLOAD] Multer started, expecting field:', fieldName);
      console.log('[UPLOAD] Content-Type:', req.get('content-type'));
      
      const multerSingle = upload.single(fieldName);
      multerSingle(req, res, (err) => {
        if (err) {
          console.error('[UPLOAD] Multer error:', err.message);
          console.error('[UPLOAD] Error code:', err.code);
          return next(err);
        }
        
        console.log('[UPLOAD] Multer complete');
        console.log('[UPLOAD] File received:', req.file ? 'YES' : 'NO');
        if (req.file) {
          console.log('[UPLOAD] File details:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
          });
        }
        next();
      });
    };
  }
};

export default uploadWithLogging;
