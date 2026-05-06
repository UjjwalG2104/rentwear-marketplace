const mongoose = require('mongoose');

let hasConnectedOnce = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clothes-rental';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      autoIndex: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    if (!hasConnectedOnce) {
      hasConnectedOnce = true;
      await syncIndexes();
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Server will continue without database for development mode.');
  }
};

const syncIndexes = async () => {
  try {
    if (!mongoose.connection.readyState) {
      console.log('Skipping index sync - no database connection');
      return;
    }

    // Ensure models are loaded before syncing indexes
    require('../models/User');
    require('../models/Clothing');
    require('../models/Rental');
    require('../models/Review');
    require('../models/Wishlist');

    const models = mongoose.modelNames();
    for (const modelName of models) {
      await mongoose.model(modelName).syncIndexes();
    }

    console.log('Database indexes synced successfully');
  } catch (error) {
    console.error('Error syncing indexes:', error.message);
  }
};

module.exports = connectDB;
