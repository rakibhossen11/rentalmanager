// app/components/DashboardClient.js
'use client';

import { useState } from 'react';
import { Home, Users, DollarSign, Calendar, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function DashboardClient({ initialData }) {
  const [dashboardData, setDashboardData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const { showBackendToast } = useToast();

  const refreshData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to refresh data');
      const data = await response.json();
      setDashboardData(data);
      showBackendToast('Dashboard data refreshed!', 'success');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      showBackendToast('Failed to refresh data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Properties',
      value: dashboardData?.stats?.totalProperties || 0,
      icon: <Home className="w-6 h-6" />,
      color: 'bg-blue-500',
      trend: dashboardData?.stats?.propertiesGrowth || 0,
      description: 'Total properties managed'
    },
    {
      title: 'Active Tenants',
      value: dashboardData?.stats?.activeTenants || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      trend: dashboardData?.stats?.tenantsGrowth || 0,
      description: 'Currently active tenants'
    },
    {
      title: 'Monthly Revenue',
      value: `$${(dashboardData?.stats?.monthlyRevenue || 0).toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-purple-500',
      trend: dashboardData?.stats?.revenueGrowth || 0,
      description: 'Expected this month'
    },
    {
      title: 'Pending Payments',
      value: dashboardData?.stats?.pendingPayments || 0,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'bg-yellow-500',
      trend: dashboardData?.stats?.paymentsChange || 0,
      description: 'Payments due'
    },
    {
      title: 'Occupancy Rate',
      value: `${dashboardData?.stats?.occupancyRate || 0}%`,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-indigo-500',
      trend: dashboardData?.stats?.occupancyChange || 0,
      description: 'Properties occupied'
    }
  ];

  return (
    <div className="p-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your properties.
            <span className="text-sm text-gray-500 ml-2">
              Last updated: {dashboardData?.lastUpdated ? new Date(dashboardData.lastUpdated).toLocaleTimeString() : 'Just now'}
            </span>
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => showBackendToast(`Viewing ${stat.title} details`, 'info')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-800 block">{stat.value}</span>
                {stat.trend !== undefined && (
                  <div className={`flex items-center gap-1 text-sm ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`w-4 h-4 ${stat.trend < 0 ? 'transform rotate-180' : ''}`} />
                    {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                  </div>
                )}
              </div>
            </div>
            <h3 className="text-gray-600 font-medium mb-1">{stat.title}</h3>
            <p className="text-sm text-gray-500">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Payments</h2>
            <button
              onClick={() => showBackendToast('Viewing all payments', 'info')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData?.recentPayments && dashboardData.recentPayments.length > 0 ? (
              dashboardData.recentPayments.slice(0, 5).map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-800">{payment.tenantName}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })} • {payment.propertyName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">${payment.amount.toLocaleString()}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      payment.status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent payments found</p>
              </div>
            )}
          </div>
        </div>

        {/* Vacant Properties */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Vacant Properties</h2>
            <button
              onClick={() => showBackendToast('Viewing all vacant properties', 'info')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData?.vacantProperties && dashboardData.vacantProperties.length > 0 ? (
              dashboardData.vacantProperties.slice(0, 5).map((property, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-800">{property.name}</h4>
                    <p className="text-sm text-gray-500">
                      {property.type} • {property.bedrooms} Bed • ${property.rent.toLocaleString()}/month
                    </p>
                    {property.vacantSince && (
                      <p className="text-xs text-gray-400 mt-1">
                        Vacant since {new Date(property.vacantSince).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => showBackendToast(`Find tenant for ${property.name}`, 'info')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Find Tenant
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No vacant properties</p>
                <p className="text-sm text-gray-400 mt-1">Great! All properties are occupied.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Tasks/Lease Renewals */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Upcoming Tasks</h2>
          <button
            onClick={() => showBackendToast('Viewing all tasks', 'info')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </button>
        </div>
        <div className="space-y-4">
          {dashboardData?.upcomingTasks && dashboardData.upcomingTasks.length > 0 ? (
            dashboardData.upcomingTasks.slice(0, 3).map((task, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    task.type === 'lease' ? 'bg-blue-50 text-blue-600' :
                    task.type === 'payment' ? 'bg-green-50 text-green-600' :
                    task.type === 'maintenance' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{task.title}</h4>
                    <p className="text-sm text-gray-500">
                      {task.description} • Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming tasks</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Chart (Placeholder for now) */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Monthly Performance</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Revenue chart will be displayed here</p>
            <p className="text-sm text-gray-400">Integration with chart library coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}