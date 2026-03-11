import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Plus, Package, Trash2, Eye, EyeOff,
  Star, DollarSign, Calendar,
  ShoppingBag
} from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const MyListings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const { data: listings = [], isLoading, error } = useQuery(
    'my-listings',
    async () => {
      const res = await axios.get('/api/clothing/user/listings');
      return res.data;
    }
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/clothing/${id}`);
      toast.success('Listing deleted');
      queryClient.invalidateQueries('my-listings');
    } catch {
      toast.error('Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailability = async (id) => {
    setTogglingId(id);
    try {
      const res = await axios.put(`/api/clothing/${id}/availability`);
      toast.success(res.data.isAvailable ? 'Listing is now active' : 'Listing paused');
      queryClient.invalidateQueries('my-listings');
    } catch {
      toast.error('Failed to update availability');
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-500 mt-1">{listings.length} item{listings.length !== 1 ? 's' : ''} listed</p>
          </div>
          <button
            onClick={() => navigate('/create-listing')}
            className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Listing</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6">
            Failed to load listings. Please refresh the page.
          </div>
        )}

        {listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-6">Start earning by listing your clothes for rent</p>
            <button
              onClick={() => navigate('/create-listing')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Listing</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(item => (
              <div key={item._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={item.images[0]?.url}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => { e.target.src = `https://placehold.co/400x300?text=${encodeURIComponent(item.title)}`; }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.isAvailable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.isAvailable ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 text-xs font-bold text-primary-700 shadow">
                    ₹{item.dailyPrice}/day
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 capitalize">{item.category} · {item.size} · {item.color}</p>

                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{item.averageRating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span>Deposit: ₹{item.deposit}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{item.views || 0} views</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-4">
                    <Link
                      to={`/clothing/${item._id}`}
                      className="flex-1 flex items-center justify-center space-x-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      <span>View</span>
                    </Link>

                    <button
                      onClick={() => handleToggleAvailability(item._id)}
                      disabled={togglingId === item._id}
                      className={`flex-1 flex items-center justify-center space-x-1 py-2 border rounded-lg text-sm transition-colors ${
                        item.isAvailable
                          ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          : 'border-green-200 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {togglingId === item._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      ) : item.isAvailable ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      className="p-2 border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      {deletingId === item._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
