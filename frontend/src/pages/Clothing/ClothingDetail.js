import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Star, Heart, MapPin, User, Calendar, Package,
  ChevronLeft, ChevronRight, Truck, ShoppingBag,
  Shield, Clock, Tag, Check
} from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import PaymentModal from '../../components/UI/PaymentModal';
import PaymentSuccess from '../../components/UI/PaymentSuccess';

const ClothingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [currentImage, setCurrentImage] = useState(0);
  const [rentalDaysInput, setRentalDaysInput] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paidMethod, setPaidMethod] = useState(null);

  const { data: item, isLoading, error } = useQuery(
    ['clothing', id],
    async () => {
      const res = await axios.get(`/api/clothing/${id}`);
      return res.data;
    }
  );

  const getRentalDays = () => {
    const parsedDays = parseInt(rentalDaysInput, 10);
    if (Number.isNaN(parsedDays) || parsedDays < 1) return 0;
    return parsedDays;
  };

  const getTotalPrice = () => {
    if (!item) return 0;
    const days = getRentalDays();
    if (days >= 30 && item.monthlyPrice) return item.monthlyPrice * Math.ceil(days / 30);
    if (days >= 7 && item.weeklyPrice) return item.weeklyPrice * Math.ceil(days / 7);
    return item.dailyPrice * days;
  };

  const handleRentRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to rent this item');
      navigate('/login');
      return;
    }

    const days = getRentalDays();
    if (days < 1) {
      toast.error('Please enter number of rental days');
      return;
    }
    if (days < item.rentalPeriod?.minDays) {
      toast.error(`Minimum rental is ${item.rentalPeriod.minDays} day(s)`);
      return;
    }
    if (days > item.rentalPeriod?.maxDays) {
      toast.error(`Maximum rental is ${item.rentalPeriod.maxDays} day(s)`);
      return;
    }
    // Open payment modal instead of directly submitting
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async ({ paymentMethod }) => {
    setShowPaymentModal(false);
    setIsSubmitting(true);
    try {
      const days = getRentalDays();
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + days);

      await axios.post('/api/rentals', {
        clothing: id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        deliveryMethod,
        notes,
        paymentMethod,
      });
      setPaidMethod(paymentMethod);
      setShowSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit rental request';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900">Item not found</h2>
        <Link to="/clothing" className="text-primary-600 hover:underline">Browse all items</Link>
      </div>
    );
  }

  const isOwner = user && item.owner && user.id === item.owner._id;
  const days = getRentalDays();
  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/clothing" className="hover:text-primary-600 flex items-center">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Browse</span>
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={item.images[currentImage]?.url || `https://placehold.co/800x600?text=${encodeURIComponent(item.title)}`}
                  alt={item.title}
                  className="w-full h-80 object-cover"
                  onError={(e) => { e.target.src = `https://placehold.co/800x600?text=${encodeURIComponent(item.title)}`; }}
                />
                {item.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage(i => Math.max(0, i - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImage(i => Math.min(item.images.length - 1, i + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                <div className="absolute top-3 left-3">
                      <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ₹{item.dailyPrice}/day
                  </span>
                </div>
              </div>
              {item.images.length > 1 && (
                <div className="flex space-x-2 p-4 overflow-x-auto">
                  {item.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImage === i ? 'border-primary-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-16 h-16 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{item.averageRating?.toFixed(1) || '0.0'}</span>
                      <span className="text-sm text-gray-500">({item.totalReviews || 0} reviews)</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm text-gray-500 capitalize">{item.category}</span>
                  </div>
                </div>
                <button className="p-2 border border-gray-200 rounded-full hover:bg-red-50 hover:border-red-200 transition-colors">
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                </button>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">{item.description}</p>

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Size', value: item.size },
                  { label: 'Color', value: item.color },
                  { label: 'Condition', value: item.condition },
                  { label: 'Brand', value: item.brand || 'N/A' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
                    <p className="font-medium text-gray-900 capitalize mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {item.tags.map(t => (
                    <span key={t} className="inline-flex items-center space-x-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                      <Tag className="w-3 h-3" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Pricing */}
              <div className="border border-gray-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-primary-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Daily</p>
                    <p className="text-xl font-bold text-primary-700">₹{item.dailyPrice}</p>
                  </div>
                  {item.weeklyPrice && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Weekly</p>
                      <p className="text-xl font-bold text-green-700">₹{item.weeklyPrice}</p>
                    </div>
                  )}
                  {item.monthlyPrice && (
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Monthly</p>
                      <p className="text-xl font-bold text-purple-700">₹{item.monthlyPrice}</p>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center space-x-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Security deposit: <strong className="text-gray-900">₹{item.deposit}</strong> (refundable)</span>
                </div>
              </div>
            </div>

            {/* Owner */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">About the Owner</h3>
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xl font-bold">
                  {item.owner?.firstName?.[0]}{item.owner?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.owner?.firstName} {item.owner?.lastName}</p>
                  <div className="flex items-center space-x-1 text-sm text-gray-500 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    <span>{item.owner?.averageRating?.toFixed(1) || '0.0'} rating</span>
                  </div>
                  {item.location?.address && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{item.location.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Rent Request Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {isOwner ? (
                <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-primary-100">
                  <h3 className="font-semibold text-gray-900 mb-4">This is your listing</h3>
                  <div className="space-y-3">
                    <Link
                      to="/my-listings"
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      <Package className="w-4 h-4" />
                      <span>Manage Listings</span>
                    </Link>
                    <Link
                      to="/rental-requests"
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>View Requests</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-5">
                    <p className="text-white text-sm font-medium opacity-90">Starting from</p>
                    <p className="text-white text-3xl font-bold">₹{item.dailyPrice}<span className="text-lg font-normal opacity-75">/day</span></p>
                  </div>

                  <form onSubmit={handleRentRequest} className="p-5 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Rental Duration</span>
                      </label>
                      <input
                        type="text"
                        value={rentalDaysInput}
                        onChange={(e) => setRentalDaysInput(e.target.value.replace(/[^\d]/g, ''))}
                        placeholder="Enter number of rental days (e.g. 5)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {days > 0 && (
                        <p className="text-xs text-primary-600 mt-1.5 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{days} day{days !== 1 ? 's' : ''} selected</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Method</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('pickup')}
                          className={`flex flex-col items-center p-3 border-2 rounded-lg transition-colors text-sm font-medium ${
                            deliveryMethod === 'pickup'
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <User className="w-5 h-5 mb-1" />
                          Pickup
                          {deliveryMethod === 'pickup' && <Check className="w-3.5 h-3.5 absolute top-1 right-1 text-primary-600" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('delivery')}
                          className={`flex flex-col items-center p-3 border-2 rounded-lg transition-colors text-sm font-medium ${
                            deliveryMethod === 'delivery'
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <Truck className="w-5 h-5 mb-1" />
                          Delivery
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Message to Owner <span className="text-gray-400 font-normal">(optional)</span></label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Any special requests or messages..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    {/* Price Summary */}
                    {days > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">₹{item.dailyPrice} × {days} days</span>
                          <span className="text-gray-900">₹{(item.dailyPrice * days).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Security deposit</span>
                          <span className="text-gray-900">₹{item.deposit}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-primary-700">₹{(totalPrice + item.deposit).toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {item.isAvailable ? (
                        <button
                          type="submit"
                          disabled={isSubmitting || days < 1}
                          className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              <span>Confirming…</span>
                            </div>
                          ) : (
                            <span className="flex items-center justify-center space-x-2">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                              <span>Proceed to Pay</span>
                            </span>
                          )}
                        </button>
                      ) : (
                        <div className="w-full py-3 bg-gray-200 text-gray-500 rounded-lg text-center font-medium">
                          Currently Unavailable
                        </div>
                      )}
                      {!isAuthenticated && (
                        <p className="text-xs text-center text-gray-500">
                          <Link to="/login" className="text-primary-600 hover:underline font-medium">Log in</Link> to send a rental request
                        </p>
                      )}
                    </div>

                    <div className="flex items-start space-x-2 text-xs text-gray-500 bg-blue-50 rounded-lg p-3">
                      <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>Your deposit is fully refundable when you return the item in good condition.</span>
                    </div>
                  </form>
                </div>
              )}

              {/* Rental Period Info */}
              <div className="mt-4 bg-white rounded-xl shadow-sm p-5">
                <h4 className="font-medium text-gray-900 mb-3 text-sm">Rental Policy</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Min: {item.rentalPeriod?.minDays || 1} day — Max: {item.rentalPeriod?.maxDays || 30} days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{item.isAvailable ? 'Available for rent' : 'Currently rented out'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        item={item}
        totalPrice={totalPrice}
        deposit={item?.deposit || 0}
        rentalDays={days}
      />

      {/* Payment Success Popup */}
      <PaymentSuccess
        isOpen={showSuccess}
        paymentMethod={paidMethod}
        item={item}
        totalPrice={totalPrice}
        deposit={item?.deposit || 0}
        rentalDays={days}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default ClothingDetail;
