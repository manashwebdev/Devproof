require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDb, isDbConnected } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 40, standardHeaders: true, legacyHeaders: false }));

app.get('/api/status', (req, res) =>
  res.json({ ok: true, db: isDbConnected(), github: Boolean(process.env.GITHUB_TOKEN) })
);
app.use('/api/verify', require('./routes/verify.routes'));
app.use('/api/diff', require('./routes/diff.routes'));
app.use('/api/health', require('./routes/health.routes'));
app.use('/api/history', require('./routes/history.routes'));

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '../../client/dist');
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

connectDb().finally(() => {
  app.listen(PORT, () => console.log(`DevProof API running on http://localhost:${PORT}`));
});
