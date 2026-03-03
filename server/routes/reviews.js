const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Rental = require('../models/Rental');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', auth, [
  body('rental').isMongoId().withMessage('Valid rental ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 10, max: 500 }).withMessage('Comment must be 10-500 characters'),
  body('cleanliness').optional().isInt({ min: 1, max: 5 }),
  body('accuracy').optional().isInt({ min: 1, max: 5 }),
  body('communication').optional().isInt({ min: 1, max: 5 }),
  body('wouldRentAgain').isBoolean().withMessage('Would rent again must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rental, rating, comment, cleanliness, accuracy, communication, wouldRentAgain } = req.body;

    // Get rental details
    const rentalDetails = await Rental.findById(rental)
      .populate('clothing')
      .populate('renter')
      .populate('owner');

    if (!rentalDetails) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Check if user is part of this rental
    if (rentalDetails.renter._id.toString() !== req.userId && rentalDetails.owner._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to review this rental' });
    }

    // Check if rental is completed
    if (rentalDetails.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed rentals' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ rental, reviewer: req.userId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this rental' });
    }

    // Determine who is being reviewed
    const reviewee = rentalDetails.renter._id.toString() === req.userId 
      ? rentalDetails.owner._id 
      : rentalDetails.renter._id;

    // Create review
    const review = new Review({
      clothing: rentalDetails.clothing._id,
      rental,
      reviewer: req.userId,
      reviewee,
      rating,
      comment,
      cleanliness,
      accuracy,
      communication,
      wouldRentAgain
    });

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('clothing', 'title images')
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('reviewee', 'firstName lastName profilePicture');

    res.status(201).json({
      message: 'Review created successfully',
      review: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews for clothing item
router.get('/clothing/:clothingId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ clothing: req.params.clothingId })
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('reviewee', 'firstName lastName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ clothing: req.params.clothingId });

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get clothing reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews for user
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('clothing', 'title images')
      .populate('reviewer', 'firstName lastName profilePicture')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ reviewee: req.params.userId });

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single review
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('clothing', 'title images')
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('reviewee', 'firstName lastName profilePicture')
      .populate('rental', 'startDate endDate');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update review
router.put('/:id', auth, [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ min: 10, max: 500 }),
  body('cleanliness').optional().isInt({ min: 1, max: 5 }),
  body('accuracy').optional().isInt({ min: 1, max: 5 }),
  body('communication').optional().isInt({ min: 1, max: 5 }),
  body('wouldRentAgain').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const updateData = {};
    const allowedFields = ['rating', 'comment', 'cleanliness', 'accuracy', 'communication', 'wouldRentAgain'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('clothing', 'title images')
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('reviewee', 'firstName lastName profilePicture');

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add response to review
router.post('/:id/response', auth, [
  body('text').trim().isLength({ min: 10, max: 500 }).withMessage('Response must be 10-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewee.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to respond to this review' });
    }

    review.response = {
      text,
      date: new Date(),
      responder: req.userId
    };

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('clothing', 'title images')
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('reviewee', 'firstName lastName profilePicture')
      .populate('response.responder', 'firstName lastName profilePicture');

    res.json({
      message: 'Response added successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
