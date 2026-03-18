import multer from 'multer';

// Store file in memory as buffer (we encrypt before saving to disk)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow all file types — you can restrict here if needed
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

export default upload;