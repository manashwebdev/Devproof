const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { analyzeRepo } = require('../services/health.service');
const { saveAnalysis } = require('../services/history.service');

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const result = await analyzeRepo(req.body.repo);
    await saveAnalysis({ type: 'health', title: result.repo, score: result.score, result });
    res.json(result);
  })
);

module.exports = router;
