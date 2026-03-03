const express = require('express');
const Wishlist = require('../models/Wishlist');
const Clothing = require('../models/Clothing');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Add item to wishlist
router.post('/', auth, async (req, res) => {
  try {
    const { clothingId } = req.body;

    // Check if clothing exists
    const clothing = await Clothing.findById(clothingId);
    if (!clothing) {
      return res.status(404).json({ message: 'Clothing item not found' });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      user: req.userId,
      clothing: clothingId
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    // Add to wishlist
    const wishlistItem = new Wishlist({
      user: req.userId,
      clothing: clothingId
    });

    await wishlistItem.save();

    res.status(201).json({
      message: 'Item added to wishlist',
      wishlistItem
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from wishlist
router.delete('/:clothingId', auth, async (req, res) => {
  try {
    const result = await Wishlist.findOneAndDelete({
      user: req.userId,
      clothing: req.params.clothingId
    });

    if (!result) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const wishlistItems = await Wishlist.find({ user: req.userId })
      .populate({
        path: 'clothing',
        populate: {
          path: 'owner',
          select: 'firstName lastName profilePicture averageRating'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Wishlist.countDocuments({ user: req.userId });

    res.json({
      wishlistItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if item is in wishlist
router.get('/check/:clothingId', auth, async (req, res) => {
  try {
    const item = await Wishlist.findOne({
      user: req.userId,
      clothing: req.params.clothingId
    });

    res.json({ isInWishlist: !!item });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
