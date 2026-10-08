const router = require('express').Router();
const upload = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');
const { extractText } = require('../services/pdf.service');
const { verifyClaims } = require('../services/verify.service');
const { saveAnalysis } = require('../services/history.service');

router.post(
  '/',
  upload.single('resume'),
  asyncHandler(async (req, res) => {
    const username = String(req.body.username || '').trim().replace(/^@/, '');
    const resumeText = req.file ? await extractText(req.file.buffer) : String(req.body.resumeText || '').trim();
    const result = await verifyClaims({ username, resumeText });
    await saveAnalysis({ type: 'verify', title: `@${username}`, score: result.trustScore, result });
    res.json(result);
  })
);

module.exports = router;
