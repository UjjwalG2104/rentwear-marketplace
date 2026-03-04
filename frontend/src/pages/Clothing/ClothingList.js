import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Heart, 
  MapPin,
  SlidersHorizontal
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ClothingList = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: '',
    size: '',
    color: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'dress', 'suit', 'casual', 'formal', 'accessories', 'shoes', 'outerwear', 'sportswear'
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'custom'];
  const conditions = ['excellent', 'good', 'fair', 'like-new'];

  const { data, isLoading, error } = useQuery(
    ['clothing', filters, page],
    async () => {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.size) params.append('size', filters.size);
      if (filters.color) params.append('color', filters.color);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      params.append('page', page);
      params.append('limit', '12');

      const response = await axios.get(`/api/clothing?${params.toString()}`);
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const { clothing, pagination } = data || { clothing: [], pagination: {} };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Clothing</h1>
              <p className="text-gray-600">
                Discover amazing pieces available for rent
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-white rounded-lg border border-gray-300">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Quick Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleFilterChange('category', filters.category === category ? '' : category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  filters.category === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <select
                  value={filters.size}
                  onChange={(e) => handleFilterChange('size', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Sizes</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <input
                  type="text"
                  value={filters.color}
                  onChange={(e) => handleFilterChange('color', e.target.value)}
                  placeholder="e.g., Black, Red, Blue"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price ($)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price ($)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="1000"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : `Showing ${pagination.totalItems || 0} items`}
          </p>
          <div className="flex items-center space-x-4">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="createdAt">Date Listed</option>
              <option value="dailyPrice">Price</option>
              <option value="averageRating">Rating</option>
              <option value="views">Popularity</option>
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">Failed to load clothing items. Please try again.</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && (
          <>
            {clothing.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {clothing.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                      >
                        <div className="relative">
                          <Link to={`/clothing/${item._id}`}>
                            <img
                              src={item.images[0]?.url || '/placeholder-clothing.jpg'}
                              alt={item.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                          <div className="absolute top-2 left-2">
                            <span className="badge badge-primary">
                              ${item.dailyPrice}/day
                            </span>
                          </div>
                          <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors duration-200">
                            <Heart className="w-4 h-4 text-gray-600 hover:text-red-600" />
                          </button>
                        </div>

                        <div className="p-4">
                          <Link
                            to={`/clothing/${item._id}`}
                            className="block hover:text-primary-600 transition-colors duration-200"
                          >
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {item.title}
                            </h3>
                          </Link>

                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600">
                                {item.averageRating.toFixed(1)} ({item.totalReviews})
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {item.size} • {item.color}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <img
                                src={item.owner.profilePicture || '/default-avatar.jpg'}
                                alt={item.owner.firstName}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="text-sm text-gray-600">
                                {item.owner.firstName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">Nearby</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clothing.map((item) => (
                      <div key={item._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex space-x-6">
                          <img
                            src={item.images[0]?.url || '/placeholder-clothing.jpg'}
                            alt={item.title}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <Link
                                  to={`/clothing/${item._id}`}
                                  className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
                                >
                                  {item.title}
                                </Link>
                                <p className="text-gray-600 mt-1">{item.description}</p>
                              </div>
                              <span className="badge badge-primary">
                                ${item.dailyPrice}/day
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-sm text-gray-600">
                                    {item.averageRating.toFixed(1)} ({item.totalReviews})
                                  </span>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {item.size} • {item.color}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button className="p-2 hover:bg-red-50 rounded-full transition-colors duration-200">
                                  <Heart className="w-4 h-4 text-gray-600 hover:text-red-600" />
                                </button>
                                <Link
                                  to={`/clothing/${item._id}`}
                                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                                >
                                  View Details
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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
          </>
        )}
      </div>
    </div>
  );
};

export default ClothingList;
