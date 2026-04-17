import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

/**
 * File Upload Middleware with Security Hardening
 * 
 * Security improvements:
 * - Explicit MIME type whitelist (only real images)
 * - File size limit enforced at multer level (5MB)
 * - Auto-resize on Cloudinary (500x500 max)
 */

// Allowed MIME types — only genuine image formats
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resictrl_students', // Cloudinary folder name
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

/**
 * File filter — rejects non-image uploads before they reach Cloudinary.
 * Prevents uploading disguised scripts, SVGs with embedded JS, etc.
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

export const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB Upload limit
  }
});
