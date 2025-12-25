'use client';

import { useEffect, useState } from 'react';
import { Home, Users, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { getDashboardStats } from './lib/storage/localStorage';
import { useToast } from './contexts/ToastContext';

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const { showBackendToast } = useToast();

  useEffect(() => {
    setStats(getDashboardStats());
  }, []);

  const statCards = [
    {
      title: 'Total Properties',
      value: stats?.totalProperties || 0,
      icon: <Home className="w-6 h-6" />,
      color: 'bg-blue-500',
      onClick: showBackendToast
    },
    {
      title: 'Active Tenants',
      value: stats?.totalTenants || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      onClick: showBackendToast
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats?.monthlyRevenue?.toLocaleString() || 0}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-purple-500',
      onClick: showBackendToast
    },
    {
      title: 'Pending Payments',
      value: stats?.pendingPayments || 0,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'bg-yellow-500',
      onClick: showBackendToast
    },
    {
      title: 'Occupancy Rate',
      value: `${stats?.vacancyRate ? (100 - parseFloat(stats.vacancyRate)).toFixed(0) : 0}%`,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-indigo-500',
      onClick: showBackendToast
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to your rental management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={stat.onClick}
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
            </div>
            <h3 className="text-gray-600 font-medium">{stat.title}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Payments</h2>
            <button
              onClick={showBackendToast}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">John Smith</h4>
                  <p className="text-sm text-gray-500">Apr 2024 • Sunshine Villa</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">$1,500</p>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vacant Properties */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Vacant Properties</h2>
          <div className="space-y-4">
            {[1].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Lake View House</h4>
                  <p className="text-sm text-gray-500">4 Bedrooms • $2,000/month</p>
                </div>
                <button
                  onClick={showBackendToast}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Find Tenant
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-bold text-yellow-800">Note: Local Storage Mode</h3>
            <p className="text-yellow-700">
              This app is currently running in client-side only mode. All data is stored in your browser's local storage.
              Backend integration is in progress. Click on any action button to see the backend notification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}