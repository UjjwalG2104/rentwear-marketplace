const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  clothing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clothing',
    required: true
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  deposit: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'partial_refund'],
    default: 'pending'
  },
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  trackingNumber: String,
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  cancellationReason: String,
  disputeReason: String,
  actualReturnDate: Date,
  lateFees: {
    type: Number,
    default: 0,
    min: 0
  },
  damageFees: {
    type: Number,
    default: 0,
    min: 0
  },
  cleaningFees: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Validation for dates
rentalSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

// Calculate total price based on rental duration
rentalSchema.methods.calculateTotalPrice = function(dailyPrice, weeklyPrice, monthlyPrice) {
  const days = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  let price = 0;
  
  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    price = (months * monthlyPrice) + (remainingDays * dailyPrice);
  } else if (days >= 7) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    price = (weeks * weeklyPrice) + (remainingDays * dailyPrice);
  } else {
    price = days * dailyPrice;
  }
  
  this.totalPrice = price;
  return price;
};

// Check if rental dates overlap
rentalSchema.statics.checkAvailability = async function(clothingId, startDate, endDate, excludeRentalId = null) {
  const query = {
    clothing: clothingId,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      {
        startDate: { $lte: startDate },
        endDate: { $gte: startDate }
      },
      {
        startDate: { $lte: endDate },
        endDate: { $gte: endDate }
      },
      {
        startDate: { $gte: startDate },
        endDate: { $lte: endDate }
      }
    ]
  };
  
  if (excludeRentalId) {
    query._id = { $ne: excludeRentalId };
  }
  
  const overlappingRentals = await this.find(query);
  return overlappingRentals.length === 0;
};

module.exports = mongoose.model('Rental', rentalSchema);
