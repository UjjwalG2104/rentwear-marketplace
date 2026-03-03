import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Star,
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // days

  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboardStats',
    async () => {
      const response = await axios.get('/api/admin/dashboard');
      return response.data;
    }
  );

  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    ['analytics', selectedPeriod],
    async () => {
      const response = await axios.get(`/api/admin/analytics?period=${selectedPeriod}`);
      return response.data;
    }
  );

  if (statsLoading || analyticsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Listings',
      value: stats?.stats?.totalClothing || 0,
      icon: ShoppingBag,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Rentals',
      value: stats?.stats?.totalRentals || 0,
      icon: Package,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+20%',
      changeType: 'positive'
    },
  ];

  const rentalStats = [
    {
      title: 'Active Rentals',
      value: stats?.stats?.activeRentals || 0,
      icon: Clock,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Pending Rentals',
      value: stats?.stats?.pendingRentals || 0,
      icon: Calendar,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      title: 'Completed Rentals',
      value: stats?.stats?.completedRentals || 0,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Cancelled Rentals',
      value: stats?.stats?.cancelledRentals || 0,
      icon: XCircle,
      color: 'bg-red-100 text-red-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your marketplace.</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">from last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rental Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {rentalStats.map((stat) => (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} mr-4`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats?.recentActivity?.users?.map((user) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  to="/admin/users"
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                  View all users →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Rentals */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Rentals</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats?.recentActivity?.rentals?.map((rental) => (
                  <div key={rental._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {rental.clothing.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {rental.renter.firstName} → {rental.owner.firstName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        rental.status === 'completed' ? 'bg-green-100 text-green-800' :
                        rental.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        rental.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rental.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  to="/admin/rentals"
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                  View all rentals →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Registration Trends */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">User Registration Trends</h4>
                <div className="space-y-2">
                  {analytics?.userTrends?.slice(-7).map((trend) => (
                    <div key={trend._id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{trend._id}</span>
                      <span className="text-sm font-medium text-gray-900">{trend.count} users</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Popular Categories</h4>
                <div className="space-y-2">
                  {analytics?.popularCategories?.map((category) => (
                    <div key={category._id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{category._id}</span>
                      <span className="text-sm font-medium text-gray-900">{category.count} items</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
