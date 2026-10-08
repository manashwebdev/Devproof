const router = require('express').Router();
const upload = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const { extractText } = require('../services/pdf.service');
const { compareResumes } = require('../services/diff.service');
const { saveAnalysis } = require('../services/history.service');

const readSide = async (files, field, text) => {
  const file = files?.[field]?.[0];
  return file ? extractText(file.buffer) : String(text || '').trim();
};

router.post(
  '/',
  upload.fields([{ name: 'before', maxCount: 1 }, { name: 'after', maxCount: 1 }]),
  asyncHandler(async (req, res) => {
    const [before, after] = await Promise.all([
      readSide(req.files, 'before', req.body.beforeText),
      readSide(req.files, 'after', req.body.afterText),
    ]);
    if (before.length < 40 || after.length < 40) {
      throw new HttpError(400, 'Add both resume versions, as PDFs or pasted text.');
    }
    const result = compareResumes(before, after);
    await saveAnalysis({ type: 'diff', title: 'Resume comparison', score: result.afterStrength, result });
    res.json(result);
  })
);

module.exports = router;
