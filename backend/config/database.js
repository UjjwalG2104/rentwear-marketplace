const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try MongoDB first, fallback to in-memory if not available
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothes-rental', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);
      
      // Create indexes for better performance
      await createIndexes();
    } catch (mongoError) {
      console.warn('MongoDB not available, using in-memory database for development');
      console.log('To use MongoDB, install it locally or update MONGODB_URI in .env');
      
      // Continue without MongoDB for development
      return;
    }
    
  } catch (error) {
    console.error('Database connection error:', error);
    console.log('Continuing without database for development...');
  }
};

const createIndexes = async () => {
  try {
    if (!mongoose.connection.readyState) {
      console.log('Skipping index creation - no database connection');
      return;
    }
    
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

module.exports = connectDB;
