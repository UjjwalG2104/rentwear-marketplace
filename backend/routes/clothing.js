const express = require('express');
const { body, validationResult } = require('express-validator');
const Clothing = require('../models/Clothing');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all clothing items with filters and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      size,
      color,
      minPrice,
      maxPrice,
      condition,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isAvailable: true };

    if (category) query.category = category;
    if (size) query.size = size;
    if (color) query.color = new RegExp(color, 'i');
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.dailyPrice = {};
      if (minPrice) query.dailyPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.dailyPrice.$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const clothing = await Clothing.find(query)
      .populate('owner', 'firstName lastName profilePicture averageRating')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Clothing.countDocuments(query);

    res.json({
      clothing,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get clothing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single clothing item
router.get('/:id', async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id)
      .populate('owner', 'firstName lastName profilePicture averageRating phone');

    if (!clothing) {
      return res.status(404).json({ message: 'Clothing item not found' });
    }

    // Increment views
    clothing.views += 1;
    await clothing.save();

    res.json(clothing);
  } catch (error) {
    console.error('Get clothing item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new clothing listing (accepts image URLs or base64 strings)
router.post('/', auth, [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('category').isIn(['dress', 'suit', 'casual', 'formal', 'accessories', 'shoes', 'outerwear', 'sportswear']).withMessage('Invalid category'),
  body('size').isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'custom']).withMessage('Invalid size'),
  body('color').trim().notEmpty().withMessage('Color is required'),
  body('condition').isIn(['excellent', 'good', 'fair', 'like-new']).withMessage('Invalid condition'),
  body('dailyPrice').isNumeric().withMessage('Daily price must be a number'),
  body('deposit').isNumeric().withMessage('Deposit must be a number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title, description, category, size, color, brand,
      condition, dailyPrice, weeklyPrice, monthlyPrice, deposit,
      tags, imageUrls, address, minDays, maxDays
    } = req.body;

    // Build images array from provided URLs
    const images = (imageUrls || []).map(url => ({ url, publicId: url }));
    if (images.length === 0) {
      images.push({
        url: `https://placehold.co/600x400?text=${encodeURIComponent(title)}`,
        publicId: 'placeholder'
      });
    }

    const clothing = new Clothing({
      title,
      description,
      category,
      size,
      color,
      brand: brand || '',
      condition,
      dailyPrice: parseFloat(dailyPrice),
      weeklyPrice: weeklyPrice ? parseFloat(weeklyPrice) : undefined,
      monthlyPrice: monthlyPrice ? parseFloat(monthlyPrice) : undefined,
      deposit: parseFloat(deposit),
      images,
      owner: req.userId,
      tags: tags || [],
      location: {
        type: 'Point',
        coordinates: [0, 0],
        address: address || ''
      },
      rentalPeriod: {
        minDays: minDays ? parseInt(minDays) : 1,
        maxDays: maxDays ? parseInt(maxDays) : 30
      }
    });

    await clothing.save();

    const populatedClothing = await Clothing.findById(clothing._id)
      .populate('owner', 'firstName lastName profilePicture');

    res.status(201).json({
      message: 'Clothing item listed successfully',
      clothing: populatedClothing
    });
  } catch (error) {
    console.error('Create clothing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update clothing item
router.put('/:id', auth, async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);

    if (!clothing) {
      return res.status(404).json({ message: 'Clothing item not found' });
    }

    if (clothing.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const updateData = { ...req.body };

    // Handle image URLs
    if (req.body.imageUrls && req.body.imageUrls.length > 0) {
      updateData.images = req.body.imageUrls.map(url => ({ url, publicId: url }));
    }

    const updatedClothing = await Clothing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName profilePicture');

    res.json({
      message: 'Clothing item updated successfully',
      clothing: updatedClothing
    });
  } catch (error) {
    console.error('Update clothing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete clothing item
router.delete('/:id', auth, async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);

    if (!clothing) {
      return res.status(404).json({ message: 'Clothing item not found' });
    }

    if (clothing.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Clothing.findByIdAndDelete(req.params.id);

    res.json({ message: 'Clothing item deleted successfully' });
  } catch (error) {
    console.error('Delete clothing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle availability
router.put('/:id/availability', auth, async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);

    if (!clothing) {
      return res.status(404).json({ message: 'Clothing item not found' });
    }

    if (clothing.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    clothing.isAvailable = !clothing.isAvailable;
    await clothing.save();

    res.json({ message: 'Availability updated', isAvailable: clothing.isAvailable });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's clothing listings
router.get('/user/listings', auth, async (req, res) => {
  try {
    const clothing = await Clothing.find({ owner: req.userId })
      .populate('owner', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });

    res.json(clothing);
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
