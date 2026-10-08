const multer = require('multer');
const HttpError = require('../utils/HttpError');

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname);
    cb(isPdf ? null : new HttpError(400, 'Only PDF files are supported.'), isPdf);
  },
});
