const mongoose = require('mongoose');
require('dotenv').config();

// Import models
require('../models/User');
require('../models/Clothing');
require('../models/Rental');
require('../models/Review');
require('../models/Wishlist');

const setupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clothes-rental');

    console.log('Connected to MongoDB');

    // Create collections and indexes
    console.log('Setting up database collections and indexes...');

    // Drop existing collections (for fresh setup)
    const collections = ['users', 'clothings', 'rentals', 'reviews', 'wishlists'];
    
    for (const collectionName of collections) {
      try {
        await mongoose.connection.db.collection(collectionName).drop();
        console.log(`Dropped collection: ${collectionName}`);
      } catch (error) {
        if (error.code !== 26) { // Namespace not found error
          console.log(`Collection ${collectionName} does not exist or already dropped`);
        }
      }
    }

    // Create indexes
    await createIndexes();

    console.log('Database setup completed successfully!');
    console.log('\n🎉 Your RentWear database is ready!');
    console.log('\nNext steps:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Update your .env file with proper configuration');
    console.log('3. Run "npm run dev" to start the application');

    process.exit(0);
  } catch (error) {
    console.error('Database setup error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    console.log('Creating database indexes...');
    const models = mongoose.modelNames();
    for (const modelName of models) {
      await mongoose.model(modelName).syncIndexes();
    }
    console.log('Database indexes synced successfully');
  } catch (error) {
    console.error('Error creating indexes:', error.message);
  }
};

// Run the setup
setupDatabase();
