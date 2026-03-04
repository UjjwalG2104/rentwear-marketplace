const mongoose = require('mongoose');

const clothingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['dress', 'suit', 'casual', 'formal', 'accessories', 'shoes', 'outerwear', 'sportswear']
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'custom']
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand cannot exceed 50 characters']
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['excellent', 'good', 'fair', 'like-new']
  },
  dailyPrice: {
    type: Number,
    required: [true, 'Daily price is required'],
    min: [1, 'Price must be at least $1']
  },
  weeklyPrice: {
    type: Number,
    min: [1, 'Price must be at least $1']
  },
  monthlyPrice: {
    type: Number,
    min: [1, 'Price must be at least $1']
  },
  deposit: {
    type: Number,
    required: [true, 'Deposit is required'],
    min: [0, 'Deposit cannot be negative']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  rentalPeriod: {
    minDays: {
      type: Number,
      default: 1,
      min: 1
    },
    maxDays: {
      type: Number,
      default: 30,
      min: 1
    }
  },
  views: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create index for geospatial queries
clothingSchema.index({ location: '2dsphere' });

// Create text index for search
clothingSchema.index({ 
  title: 'text', 
  description: 'text', 
  brand: 'text', 
  tags: 'text' 
});

// Update average rating when reviews change
clothingSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { clothing: this._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  this.averageRating = stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
  this.totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;
  await this.save();
};

module.exports = mongoose.model('Clothing', clothingSchema);
