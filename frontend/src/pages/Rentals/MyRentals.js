import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Package, Calendar, Check, X, ChevronRight,
  ShoppingBag
} from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const STATUS_STYLES = {
  pending:   { bg: 'bg-yellow-100',  text: 'text-yellow-700',  label: 'Pending' },
  confirmed: { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Confirmed' },
  active:    { bg: 'bg-green-100',   text: 'text-green-700',   label: 'Active' },
  completed: { bg: 'bg-gray-100',    text: 'text-gray-700',    label: 'Completed' },
  cancelled: { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Cancelled' },
  disputed:  { bg: 'bg-purple-100',  text: 'text-purple-700',  label: 'Disputed' },
};

const RentalCard = ({ rental, onComplete, onCancel, completingId, cancellingId }) => {
  const status = STATUS_STYLES[rental.status] || STATUS_STYLES.pending;
  const item = rental.clothing;
  const owner = rental.owner;

  const startDate = new Date(rental.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const endDate   = new Date(rental.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        <img
          src={item?.images?.[0]?.url}
          alt={item?.title}
          className="w-28 h-28 object-cover flex-shrink-0"
          onError={(e) => { e.target.src = `https://placehold.co/200x200?text=${encodeURIComponent(item?.title || 'Item')}`; }}
        />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 truncate">{item?.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Owner: {owner?.firstName} {owner?.lastName}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>

          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{startDate} → {endDate}</span>
            </div>
            <div className="font-medium text-primary-700">
              ₹{rental.totalPrice?.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-3">
            <Link
              to={`/clothing/${item?._id}`}
              className="flex items-center space-x-1 text-xs text-primary-600 hover:underline"
            >
              <span>View Item</span>
              <ChevronRight className="w-3 h-3" />
            </Link>

            {rental.status === 'active' && (
              <button
                onClick={() => onComplete(rental._id)}
                disabled={completingId === rental._id}
                className="ml-auto flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {completingId === rental._id ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                ) : (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Mark Completed</span>
                  </>
                )}
              </button>
            )}

            {(rental.status === 'pending' || rental.status === 'confirmed') && (
              <button
                onClick={() => onCancel(rental._id)}
                disabled={cancellingId === rental._id}
                className="ml-auto flex items-center space-x-1 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {cancellingId === rental._id ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500" />
                ) : (
                  <>
                    <X className="w-3 h-3" />
                    <span>Cancel</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MyRentals = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [completingId, setCompletingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const statusFilter = activeTab === 'all' ? '' : activeTab;
  const { data, isLoading, error } = useQuery(
    ['my-rentals', statusFilter],
    async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      const res = await axios.get(`/api/rentals/my-rentals?${params}`);
      return res.data;
    }
  );

  const rentals = data?.rentals || [];

  const handleComplete = async (id) => {
    setCompletingId(id);
    try {
      await axios.put(`/api/rentals/${id}/status`, { status: 'completed' });
      toast.success('Rental marked as completed!');
      queryClient.invalidateQueries('my-rentals');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update rental');
    } finally {
      setCompletingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this rental request?')) return;
    setCancellingId(id);
    try {
      await axios.put(`/api/rentals/${id}/status`, { status: 'cancelled' });
      toast.success('Rental cancelled');
      queryClient.invalidateQueries('my-rentals');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel rental');
    } finally {
      setCancellingId(null);
    }
  };

  const TABS = [
    { key: 'all',       label: 'All' },
    { key: 'pending',   label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'active',    label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Rentals</h1>
          <p className="text-gray-500 mt-1">Items you've requested to rent</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6">
            Failed to load rentals. Please refresh.
          </div>
        )}

        {rentals.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'all' ? 'No rentals yet' : `No ${activeTab} rentals`}
            </h3>
            <p className="text-gray-500 mb-6">Browse our collection and request to rent something</p>
            <Link
              to="/clothing"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Clothing</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map(rental => (
              <RentalCard
                key={rental._id}
                rental={rental}
                onComplete={handleComplete}
                onCancel={handleCancel}
                completingId={completingId}
                cancellingId={cancellingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRentals;
