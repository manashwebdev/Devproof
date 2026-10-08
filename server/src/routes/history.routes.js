const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { isDbConnected } = require('../config/db');
const { listAnalyses, deleteAnalysis } = require('../services/history.service');

router.get(
  '/',
  asyncHandler(async (req, res) => res.json({ enabled: isDbConnected(), items: await listAnalyses() }))
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteAnalysis(req.params.id);
    res.json({ ok: true });
  })
);

module.exports = router;
