import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Search, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Star,
  ArrowRight,
  Calendar,
  MapPin,
  Heart,
  Shield
} from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredItems, setFeaturedItems] = useState([]);

  // Fetch featured clothing items
  const { data: clothingData, isLoading } = useQuery(
    'featuredClothing',
    async () => {
      const response = await axios.get('/api/clothing?limit=6&sortBy=views&sortOrder=desc');
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  useEffect(() => {
    if (clothingData?.clothing) {
      setFeaturedItems(clothingData.clothing);
    }
  }, [clothingData]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const categories = [
    { name: 'Dresses', icon: '👗', count: '2.5k', color: 'bg-pink-100 text-pink-600' },
    { name: 'Suits', icon: '🤵', count: '1.8k', color: 'bg-blue-100 text-blue-600' },
    { name: 'Casual', icon: '👕', count: '3.2k', color: 'bg-green-100 text-green-600' },
    { name: 'Accessories', icon: '👜', count: '1.5k', color: 'bg-purple-100 text-purple-600' },
    { name: 'Shoes', icon: '👠', count: '2.1k', color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Outerwear', icon: '🧥', count: '1.3k', color: 'bg-red-100 text-red-600' },
  ];

  const stats = [
    { icon: Users, label: 'Active Users', value: '50K+', color: 'text-blue-600' },
    { icon: ShoppingBag, label: 'Items Listed', value: '100K+', color: 'text-green-600' },
    { icon: Star, label: 'Happy Customers', value: '98%', color: 'text-yellow-600' },
    { icon: Shield, label: 'Insured Rentals', value: '100%', color: 'text-purple-600' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Insurance Protection',
      description: 'Every rental is covered by our comprehensive insurance policy for peace of mind.',
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Choose rental periods that work for you - from days to months.',
    },
    {
      icon: MapPin,
      title: 'Local & Nationwide',
      description: 'Find items nearby or have them delivered from anywhere in the country.',
    },
    {
      icon: Heart,
      title: 'Sustainable Fashion',
      description: 'Reduce waste and promote circular fashion by renting instead of buying.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Rent Premium Fashion
              <span className="block text-3xl md:text-5xl mt-2 text-primary-200">
                Without the Premium Price
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Discover and rent high-quality clothing from trusted owners. 
              Sustainable, affordable, and stylish fashion at your fingertips.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for dresses, suits, accessories..."
                    className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary-300"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-secondary-600 text-white rounded-lg font-semibold hover:bg-secondary-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Search</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="text-center">
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-sm text-primary-200">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find exactly what you're looking for in our curated collections
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(({ name, icon, count, color }) => (
              <Link
                key={name}
                to={`/search?category=${name.toLowerCase()}`}
                className={`p-6 rounded-xl ${color} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-center group`}
              >
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-semibold text-lg mb-1">{name}</h3>
                <p className="text-sm opacity-75">{count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RentWear?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of fashion with our innovative rental platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center group">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured Items
              </h2>
              <p className="text-xl text-gray-600">
                Discover our most popular and trending pieces
              </p>
            </div>
            <Link
              to="/clothing"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredItems.map((item) => (
                <Link
                  key={item._id}
                  to={`/clothing/${item._id}`}
                  className="group card-hover"
                >
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={item.images[0]?.url || '/placeholder-clothing.jpg'}
                      alt={item.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="badge badge-primary">
                        ${item.dailyPrice}/day
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">
                        {item.averageRating.toFixed(1)} ({item.totalReviews})
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {item.size} • {item.color}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Renting?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of fashion enthusiasts who are already saving money and reducing waste.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Get Started Now
            </Link>
            <Link
              to="/clothing"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200"
            >
              Browse Items
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
