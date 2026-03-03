const express = require('express');
const { body, validationResult } = require('express-validator');
const Rental = require('../models/Rental');
const Clothing = require('../models/Clothing');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create rental request
router.post('/', auth, [
  body('clothing').isMongoId().withMessage('Valid clothing ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('deliveryMethod').isIn(['pickup', 'delivery']).withMessage('Valid delivery method is required'),
  body('deliveryAddress').optional().isObject().withMessage('Delivery address must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { clothing, startDate, endDate, deliveryMethod, deliveryAddress, notes } = req.body;

    // Get clothing item
    const clothingItem = await Clothing.findById(clothing);
    if (!clothingItem) {
      return res.status(404).json({ message: 'Clothing item not found' });
    }

    if (clothingItem.owner.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot rent your own item' });
    }

    if (!clothingItem.isAvailable) {
      return res.status(400).json({ message: 'Item is not available for rent' });
    }

    // Check availability
    const isAvailable = await Rental.checkAvailability(clothing, new Date(startDate), new Date(endDate));
    if (!isAvailable) {
      return res.status(400).json({ message: 'Item is not available for the selected dates' });
    }

    // Validate rental period
    const rentalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    if (rentalDays < clothingItem.rentalPeriod.minDays || rentalDays > clothingItem.rentalPeriod.maxDays) {
      return res.status(400).json({ 
        message: `Rental period must be between ${clothingItem.rentalPeriod.minDays} and ${clothingItem.rentalPeriod.maxDays} days` 
      });
    }

    // Calculate total price
    const rental = new Rental({
      clothing,
      renter: req.userId,
      owner: clothingItem.owner,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      deliveryMethod,
      deliveryAddress,
      notes,
      deposit: clothingItem.deposit
    });

    rental.calculateTotalPrice(
      clothingItem.dailyPrice,
      clothingItem.weeklyPrice,
      clothingItem.monthlyPrice
    );

    await rental.save();

    const populatedRental = await Rental.findById(rental._id)
      .populate('clothing', 'title images dailyPrice')
      .populate('renter', 'firstName lastName email phone')
      .populate('owner', 'firstName lastName email phone');

    res.status(201).json({
      message: 'Rental request created successfully',
      rental: populatedRental
    });
  } catch (error) {
    console.error('Create rental error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's rentals (as renter)
router.get('/my-rentals', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { renter: req.userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const rentals = await Rental.find(query)
      .populate('clothing', 'title images dailyPrice owner')
      .populate('owner', 'firstName lastName profilePicture averageRating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rental.countDocuments(query);

    res.json({
      rentals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get my rentals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get rentals for user's items (as owner)
router.get('/my-items-rentals', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { owner: req.userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const rentals = await Rental.find(query)
      .populate('clothing', 'title images dailyPrice')
      .populate('renter', 'firstName lastName profilePicture averageRating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rental.countDocuments(query);

    res.json({
      rentals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get my items rentals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single rental
router.get('/:id', auth, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('clothing')
      .populate('renter', 'firstName lastName email phone profilePicture')
      .populate('owner', 'firstName lastName email phone profilePicture');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Check if user is authorized to view this rental
    if (rental.renter._id.toString() !== req.userId && rental.owner._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view this rental' });
    }

    res.json(rental);
  } catch (error) {
    console.error('Get rental error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update rental status (confirm, cancel, etc.)
router.put('/:id/status', auth, [
  body('status').isIn(['confirmed', 'cancelled', 'active', 'completed', 'disputed']).withMessage('Valid status is required'),
  body('reason').optional().isString().withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, reason } = req.body;

    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Check authorization based on status change
    if (status === 'confirmed' && rental.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can confirm rental' });
    }

    if (status === 'cancelled' && rental.renter.toString() !== req.userId && rental.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this rental' });
    }

    if (status === 'active' && rental.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can activate rental' });
    }

    if (status === 'completed' && rental.renter.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only renter can complete rental' });
    }

    // Update rental
    rental.status = status;
    if (reason) {
      rental.cancellationReason = reason;
    }

    await rental.save();

    const updatedRental = await Rental.findById(rental._id)
      .populate('clothing', 'title images')
      .populate('renter', 'firstName lastName')
      .populate('owner', 'firstName lastName');

    res.json({
      message: `Rental ${status} successfully`,
      rental: updatedRental
    });
  } catch (error) {
    console.error('Update rental status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check availability for clothing item
router.get('/check-availability/:clothingId', async (req, res) => {
  try {
    const { clothingId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const isAvailable = await Rental.checkAvailability(
      clothingId,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({ isAvailable });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
