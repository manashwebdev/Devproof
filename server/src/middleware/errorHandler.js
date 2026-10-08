const multer = require('multer');

const notFound = (req, res) => res.status(404).json({ error: 'Route not found.' });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'That PDF is larger than 5 MB.' : err.message;
    return res.status(400).json({ error: message });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 && !err.status ? 'Something went wrong on the server.' : err.message });
};

module.exports = { notFound, errorHandler };
