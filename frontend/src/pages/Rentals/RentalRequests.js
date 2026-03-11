import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Package, Calendar, Check, X, User,
  ShoppingBag, ChevronRight, Clock
} from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const STATUS_STYLES = {
  pending:   { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  confirmed: { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Confirmed' },
  active:    { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Active' },
  completed: { bg: 'bg-gray-100',   text: 'text-gray-700',   label: 'Completed' },
  cancelled: { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Cancelled' },
};

const RentalRequests = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  const statusFilter = activeTab === 'all' ? '' : activeTab;
  const { data, isLoading, error } = useQuery(
    ['rental-requests', statusFilter],
    async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      const res = await axios.get(`/api/rentals/my-items-rentals?${params}`);
      return res.data;
    }
  );

  const rentals = data?.rentals || [];

  const handleStatusChange = async (id, status) => {
    const messages = {
      confirmed: 'Confirm this rental request?',
      cancelled: 'Cancel this rental request?',
      active:    'Mark this rental as active (item handed over)?',
    };
    if (!window.confirm(messages[status] || 'Update rental?')) return;

    setProcessingId(`${id}-${status}`);
    try {
      await axios.put(`/api/rentals/${id}/status`, { status });
      toast.success(`Rental ${status} successfully`);
      queryClient.invalidateQueries('rental-requests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update rental');
    } finally {
      setProcessingId(null);
    }
  };

  const TABS = [
    { key: 'all',       label: 'All Requests' },
    { key: 'pending',   label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'active',    label: 'Active' },
    { key: 'completed', label: 'Completed' },
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
          <h1 className="text-3xl font-bold text-gray-900">Rental Requests</h1>
          <p className="text-gray-500 mt-1">Manage incoming requests for your listed items</p>
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
            Failed to load requests. Please refresh.
          </div>
        )}

        {rentals.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rental requests</h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'all'
                ? "Once people request to rent your items, they'll appear here"
                : `No ${activeTab} requests`}
            </p>
            <Link
              to="/my-listings"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View My Listings</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map(rental => {
              const status = STATUS_STYLES[rental.status] || STATUS_STYLES.pending;
              const item = rental.clothing;
              const renter = rental.renter;
              const startDate = new Date(rental.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
              const endDate   = new Date(rental.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
              const days = Math.ceil((new Date(rental.endDate) - new Date(rental.startDate)) / (1000 * 60 * 60 * 24));

              return (
                <div key={rental._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex">
                    <img
                      src={item?.images?.[0]?.url}
                      alt={item?.title}
                      className="w-28 h-full min-h-28 object-cover flex-shrink-0"
                      onError={(e) => { e.target.src = `https://placehold.co/200x200?text=${encodeURIComponent(item?.title || 'Item')}`; }}
                    />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item?.title}</h3>
                          <div className="flex items-center space-x-1.5 mt-1 text-sm text-gray-500">
                            <User className="w-3.5 h-3.5" />
                            <span>Requested by: <strong className="text-gray-700">{renter?.firstName} {renter?.lastName}</strong></span>
                          </div>
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
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{days} day{days !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="font-semibold text-primary-700">
                          ₹{rental.totalPrice?.toFixed(2)}
                        </div>
                      </div>

                      {rental.notes && (
                        <p className="mt-2 text-sm text-gray-500 italic bg-gray-50 rounded-lg px-3 py-1.5">
                          "{rental.notes}"
                        </p>
                      )}

                      <div className="flex items-center space-x-2 mt-3">
                        <Link
                          to={`/clothing/${item?._id}`}
                          className="flex items-center space-x-1 text-xs text-primary-600 hover:underline"
                        >
                          <span>View Item</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>

                        <div className="ml-auto flex items-center space-x-2">
                          {rental.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(rental._id, 'confirmed')}
                                disabled={processingId === `${rental._id}-confirmed`}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {processingId === `${rental._id}-confirmed` ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                                ) : (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Confirm</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleStatusChange(rental._id, 'cancelled')}
                                disabled={processingId === `${rental._id}-cancelled`}
                                className="flex items-center space-x-1 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                {processingId === `${rental._id}-cancelled` ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500" />
                                ) : (
                                  <>
                                    <X className="w-3 h-3" />
                                    <span>Decline</span>
                                  </>
                                )}
                              </button>
                            </>
                          )}
                          {rental.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(rental._id, 'active')}
                              disabled={processingId === `${rental._id}-active`}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {processingId === `${rental._id}-active` ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                              ) : (
                                <>
                                  <Package className="w-3 h-3" />
                                  <span>Mark as Handed Over</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalRequests;
