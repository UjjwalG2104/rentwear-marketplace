const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothes-rental', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      connectTimeoutMS: 10000, // Timeout after 10s
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Server will continue without database for development...');
    // Don't exit the process, continue without database
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
