import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { Heart, X, ShoppingBag, Star, MapPin } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Wishlist = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ['wishlist', page],
    async () => {
      const response = await axios.get(`/api/wishlist?page=${page}&limit=12`);
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  const removeFromWishlistMutation = useMutation(
    async (clothingId) => {
      await axios.delete(`/api/wishlist/${clothingId}`);
    },
    {
      onSuccess: () => {
        toast.success('Item removed from wishlist');
        queryClient.invalidateQueries('wishlist');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to remove item');
      },
    }
  );

  const handleRemoveFromWishlist = (clothingId) => {
    if (window.confirm('Are you sure you want to remove this item from your wishlist?')) {
      removeFromWishlistMutation.mutate(clothingId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">Failed to load wishlist. Please try again.</p>
        </div>
      </div>
    );
  }

  const { wishlistItems, pagination } = data || { wishlistItems: [], pagination: {} };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistItems.length > 0 
              ? `You have ${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} in your wishlist`
              : 'Your wishlist is empty'
            }
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">
              Start adding items you love to see them here
            </p>
            <Link
              to="/clothing"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Browse Items
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative">
                    <Link to={`/clothing/${item.clothing._id}`}>
                      <img
                        src={item.clothing.images[0]?.url || '/placeholder-clothing.jpg'}
                        alt={item.clothing.title}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.clothing._id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors duration-200"
                      disabled={removeFromWishlistMutation.isLoading}
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                    <div className="absolute top-2 left-2">
                      <span className="badge badge-primary">
                        ${item.clothing.dailyPrice}/day
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <Link
                      to={`/clothing/${item.clothing._id}`}
                      className="block hover:text-primary-600 transition-colors duration-200"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {item.clothing.title}
                      </h3>
                    </Link>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.clothing.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">
                          {item.clothing.averageRating.toFixed(1)} ({item.clothing.totalReviews})
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {item.clothing.size} • {item.clothing.color}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={item.clothing.owner.profilePicture || '/default-avatar.jpg'}
                          alt={item.clothing.owner.firstName}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-gray-600">
                          {item.clothing.owner.firstName} {item.clothing.owner.lastName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Nearby</span>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Link
                        to={`/clothing/${item.clothing._id}`}
                        className="flex-1 text-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                      >
                        View Details
                      </Link>
                      <button
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => {/* Handle quick booking */}}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setPage(index + 1)}
                      className={`px-3 py-2 border rounded-lg ${
                        page === index + 1
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
