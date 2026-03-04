const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clothing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clothing',
    required: true
  }
}, {
  timestamps: true
});

// Ensure unique combination of user and clothing
wishlistSchema.index({ user: 1, clothing: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
