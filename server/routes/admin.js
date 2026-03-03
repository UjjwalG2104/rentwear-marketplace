const express = require('express');
const User = require('../models/User');
const Clothing = require('../models/Clothing');
const Rental = require('../models/Rental');
const Review = require('../models/Review');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Apply admin authentication to all routes
router.use(auth, adminAuth);

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalClothing,
      totalRentals,
      totalReviews,
      activeRentals,
      pendingRentals,
      completedRentals,
      cancelledRentals
    ] = await Promise.all([
      User.countDocuments(),
      Clothing.countDocuments(),
      Rental.countDocuments(),
      Review.countDocuments(),
      Rental.countDocuments({ status: 'active' }),
      Rental.countDocuments({ status: 'pending' }),
      Rental.countDocuments({ status: 'completed' }),
      Rental.countDocuments({ status: 'cancelled' })
    ]);

    // Calculate revenue
    const completedRentalsData = await Rental.find({ status: 'completed' })
      .select('totalPrice');
    const totalRevenue = completedRentalsData.reduce((sum, rental) => sum + rental.totalPrice, 0);

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt');

    const recentRentals = await Rental.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('clothing', 'title')
      .populate('renter', 'firstName lastName')
      .populate('owner', 'firstName lastName');

    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('clothing', 'title')
      .populate('reviewer', 'firstName lastName')
      .populate('reviewee', 'firstName lastName');

    res.json({
      stats: {
        totalUsers,
        totalClothing,
        totalRentals,
        totalReviews,
        activeRentals,
        pendingRentals,
        completedRentals,
        cancelledRentals,
        totalRevenue
      },
      recentActivity: {
        users: recentUsers,
        rentals: recentRentals,
        reviews: recentReviews
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also delete user's clothing, rentals, and reviews
    await Promise.all([
      Clothing.deleteMany({ owner: req.params.userId }),
      Rental.deleteMany({ $or: [{ renter: req.params.userId }, { owner: req.params.userId }] }),
      Review.deleteMany({ $or: [{ reviewer: req.params.userId }, { reviewee: req.params.userId }] })
    ]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all clothing items with pagination
router.get('/clothing', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.isAvailable = status === 'available';
    }

    const clothing = await Clothing.find(query)
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 })
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

// Update clothing status
router.put('/clothing/:clothingId/status', async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const clothing = await Clothing.findByIdAndUpdate(
      req.params.clothingId,
      { isAvailable },
      { new: true, runValidators: true }
    );

    if (!clothing) {
      return res.status(404).json({ message: 'Clothing item not found' });
    }

    res.json({
      message: 'Clothing status updated successfully',
      clothing
    });
  } catch (error) {
    console.error('Update clothing status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete clothing item
router.delete('/clothing/:clothingId', async (req, res) => {
  try {
    const clothing = await Clothing.findByIdAndDelete(req.params.clothingId);
    
    if (!clothing) {
      return res.status(404).json({ message: 'Clothing item not found' });
    }

    // Also delete related rentals and reviews
    await Promise.all([
      Rental.deleteMany({ clothing: req.params.clothingId }),
      Review.deleteMany({ clothing: req.params.clothingId })
    ]);

    res.json({ message: 'Clothing item deleted successfully' });
  } catch (error) {
    console.error('Delete clothing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all rentals with pagination
router.get('/rentals', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { 'clothing.title': { $regex: search, $options: 'i' } },
        { 'renter.firstName': { $regex: search, $options: 'i' } },
        { 'owner.firstName': { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const rentals = await Rental.find(query)
      .populate('clothing', 'title images')
      .populate('renter', 'firstName lastName email')
      .populate('owner', 'firstName lastName email')
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
    console.error('Get rentals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update rental status
router.put('/rentals/:rentalId/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const rental = await Rental.findByIdAndUpdate(
      req.params.rentalId,
      { status },
      { new: true, runValidators: true }
    )
      .populate('clothing', 'title')
      .populate('renter', 'firstName lastName email')
      .populate('owner', 'firstName lastName email');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    res.json({
      message: 'Rental status updated successfully',
      rental
    });
  } catch (error) {
    console.error('Update rental status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // User registration trends
    const userTrends = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Rental trends
    const rentalTrends = await Rental.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Popular categories
    const popularCategories = await Clothing.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Top rated items
    const topRatedItems = await Clothing.find({ averageRating: { $gt: 0 } })
      .sort({ averageRating: -1 })
      .limit(10)
      .populate('owner', 'firstName lastName')
      .select('title averageRating totalReviews images');

    res.json({
      userTrends,
      rentalTrends,
      popularCategories,
      topRatedItems
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
