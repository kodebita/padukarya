const multer  = require('multer');
const path = require('path');
const fs = require('fs');

// List of allowed extensions
const allowedExt = ['.jpg', '.jpeg', '.pdf', '.xlsx', '.docx', '.png', '.pptx', '.xls', '.doc', '.ppt'];

// Max file size in bytes (15MB)
const MAX_SIZE = 15 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'default';
    const uploadPath = path.join(__dirname, '../public/uploads', folder);

    // Make sure folder exists
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExt.includes(ext)) {
    return cb(new Error('Hanya file .jpg, .jpeg, .pdf, .xlsx, .docx yang diperbolehkan'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

module.exports = upload;