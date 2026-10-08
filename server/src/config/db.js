const mongoose = require('mongoose');

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('MongoDB: MONGODB_URI is not set, so History is turned off.');
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
  } catch (err) {
    console.warn(`MongoDB unavailable, History is turned off: ${err.message}`);
  }
}

const isDbConnected = () => mongoose.connection.readyState === 1;

module.exports = { connectDb, isDbConnected };
