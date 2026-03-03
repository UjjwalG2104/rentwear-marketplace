const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Clothing = require('../models/Clothing');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload images to Cloudinary
const uploadImages = async (files) => {
  const uploadPromises = files.map(file => 
    new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          resource_type: 'image',
          folder: 'clothing-rental',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      ).end(file.buffer);
    })
  );

  return await Promise.all(uploadPromises);
};

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
      sortOrder = 'desc',
      lat,
      lng,
      maxDistance = 50
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

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Geospatial query
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: maxDistance * 1000 // Convert to meters
        }
      };
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

// Create new clothing listing
router.post('/', auth, upload.array('images', 5), [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('category').isIn(['dress', 'suit', 'casual', 'formal', 'accessories', 'shoes', 'outerwear', 'sportswear']),
  body('size').isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'custom']),
  body('color').trim().notEmpty().withMessage('Color is required'),
  body('condition').isIn(['excellent', 'good', 'fair', 'like-new']),
  body('dailyPrice').isNumeric().withMessage('Daily price must be a number'),
  body('deposit').isNumeric().withMessage('Deposit must be a number'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates are required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Upload images
    const images = await uploadImages(req.files);

    const clothingData = {
      ...req.body,
      owner: req.userId,
      images,
      location: {
        type: 'Point',
        coordinates: req.body.location.coordinates,
        address: req.body.location.address
      }
    };

    const clothing = new Clothing(clothingData);
    await clothing.save();

    const populatedClothing = await Clothing.findById(clothing._id)
      .populate('owner', 'firstName lastName profilePicture');

    res.status(201).json({
      message: 'Clothing item listed successfully',
      clothing: populatedClothing
    });
  } catch (error) {
    console.error('Create clothing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update clothing item
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);

    if (!clothing) {
      return res.status(404).json({ message: 'Clothing item not found' });
    }

    if (clothing.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const updateData = { ...req.body };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const image of clothing.images) {
        await cloudinary.uploader.destroy(image.publicId);
      }

      // Upload new images
      updateData.images = await uploadImages(req.files);
    }

    // Update location if provided
    if (req.body.location) {
      updateData.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates,
        address: req.body.location.address
      };
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

    if (clothing.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    // Delete images from Cloudinary
    for (const image of clothing.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await Clothing.findByIdAndDelete(req.params.id);

    res.json({ message: 'Clothing item deleted successfully' });
  } catch (error) {
    console.error('Delete clothing error:', error);
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
