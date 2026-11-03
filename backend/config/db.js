const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes('<') || !/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new Error('Set MONGO_URI in backend/.env to a valid MongoDB connection string.');
  }

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully.');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected.');
  });

  mongoose.connection.on('error', () => {
    console.error('MongoDB connection error. Check database availability and credentials.');
  });

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  } catch {
    // Avoid logging connection details that might contain credentials.
    await mongoose.disconnect();
    throw new Error('Unable to connect to MongoDB. Check MONGO_URI, database availability, and network access.');
  }
}

module.exports = connectDB;
