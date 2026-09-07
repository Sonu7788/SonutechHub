import multer from 'multer';

// Use memory storage so we can read the file buffer directly with xlsx
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.mimetype === 'text/csv' ||
    file.originalname.endsWith('.xlsx') ||
    file.originalname.endsWith('.xls') ||
    file.originalname.endsWith('.csv')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});
