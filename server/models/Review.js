const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  clothing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clothing',
    required: true
  },
  rental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  cleanliness: {
    type: Number,
    min: 1,
    max: 5
  },
  accuracy: {
    type: Number,
    min: 1,
    max: 5
  },
  communication: {
    type: Number,
    min: 1,
    max: 5
  },
  wouldRentAgain: {
    type: Boolean,
    required: true
  },
  images: [{
    url: String,
    publicId: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  response: {
    text: String,
    date: Date,
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Ensure one review per rental per reviewer
reviewSchema.index({ rental: 1, reviewer: 1 }, { unique: true });

// Update clothing and user ratings after review is saved
reviewSchema.post('save', async function() {
  try {
    const Clothing = mongoose.model('Clothing');
    const User = mongoose.model('User');
    
    // Update clothing rating
    await Clothing.findByIdAndUpdate(this.clothing, { $inc: { totalReviews: 1 } });
    const clothing = await Clothing.findById(this.clothing);
    await clothing.updateRating();
    
    // Update user rating
    await User.findByIdAndUpdate(this.reviewee, { $inc: { totalReviews: 1 } });
    const user = await User.findById(this.reviewee);
    await user.updateRating();
  } catch (error) {
    console.error('Error updating ratings:', error);
  }
});

// Update ratings when review is removed
reviewSchema.post('remove', async function() {
  try {
    const Clothing = mongoose.model('Clothing');
    const User = mongoose.model('User');
    
    // Update clothing rating
    await Clothing.findByIdAndUpdate(this.clothing, { $inc: { totalReviews: -1 } });
    const clothing = await Clothing.findById(this.clothing);
    await clothing.updateRating();
    
    // Update user rating
    await User.findByIdAndUpdate(this.reviewee, { $inc: { totalReviews: -1 } });
    const user = await User.findById(this.reviewee);
    await user.updateRating();
  } catch (error) {
    console.error('Error updating ratings:', error);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
