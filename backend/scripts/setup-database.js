const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../backend/models/User');
const Clothing = require('../backend/models/Clothing');
const Rental = require('../backend/models/Rental');
const Review = require('../backend/models/Review');
const Wishlist = require('../backend/models/Wishlist');

const setupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothing-rental', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create collections and indexes
    console.log('Setting up database collections and indexes...');

    // Drop existing collections (for fresh setup)
    const collections = ['users', 'clothing', 'rentals', 'reviews', 'wishlists'];
    
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

    // User indexes
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    // Clothing indexes
    await mongoose.connection.db.collection('clothing').createIndex({ owner: 1 });
    await mongoose.connection.db.collection('clothing').createIndex({ category: 1 });
    await mongoose.connection.db.collection('clothing').createIndex({ size: 1 });
    await mongoose.connection.db.collection('clothing').createIndex({ color: 1 });
    await mongoose.connection.db.collection('clothing').createIndex({ dailyPrice: 1 });
    await mongoose.connection.db.collection('clothing').createIndex({ averageRating: -1 });
    await mongoose.connection.db.collection('clothing').createIndex({ views: -1 });
    await mongoose.connection.db.collection('clothing').createIndex({ 
      title: 'text', 
      description: 'text', 
      brand: 'text', 
      tags: 'text' 
    });
    await mongoose.connection.db.collection('clothing').createIndex({ location: '2dsphere' });
    
    // Rental indexes
    await mongoose.connection.db.collection('rentals').createIndex({ renter: 1 });
    await mongoose.connection.db.collection('rentals').createIndex({ owner: 1 });
    await mongoose.connection.db.collection('rentals').createIndex({ clothing: 1 });
    await mongoose.connection.db.collection('rentals').createIndex({ status: 1 });
    await mongoose.connection.db.collection('rentals').createIndex({ startDate: 1 });
    await mongoose.connection.db.collection('rentals').createIndex({ endDate: 1 });
    
    // Review indexes
    await mongoose.connection.db.collection('reviews').createIndex({ rental: 1, reviewer: 1 }, { unique: true });
    await mongoose.connection.db.collection('reviews').createIndex({ clothing: 1 });
    await mongoose.connection.db.collection('reviews').createIndex({ reviewer: 1 });
    await mongoose.connection.db.collection('reviews').createIndex({ reviewee: 1 });
    await mongoose.connection.db.collection('reviews').createIndex({ rating: -1 });
    
    // Wishlist indexes
    await mongoose.connection.db.collection('wishlists').createIndex({ user: 1, clothing: 1 }, { unique: true });
    await mongoose.connection.db.collection('wishlists').createIndex({ user: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

// Run the setup
setupDatabase();
