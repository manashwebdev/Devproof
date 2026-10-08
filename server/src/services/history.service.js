const mongoose = require('mongoose');
const Analysis = require('../models/Analysis');
const { isDbConnected } = require('../config/db');
const HttpError = require('../utils/HttpError');

async function saveAnalysis({ type, title, score, result }) {
  if (!isDbConnected()) return null;
  try {
    return await Analysis.create({ type, title, score, result });
  } catch (err) {
    console.warn('Could not save analysis:', err.message);
    return null;
  }
}

const listAnalyses = () =>
  isDbConnected() ? Analysis.find().sort({ createdAt: -1 }).limit(50).select('type title score createdAt').lean() : [];

async function deleteAnalysis(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid history id.');
  await Analysis.findByIdAndDelete(id);
}

module.exports = { saveAnalysis, listAnalyses, deleteAnalysis };
