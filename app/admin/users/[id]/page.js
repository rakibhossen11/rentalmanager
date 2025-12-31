// app/admin/users/[id]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkAdminAuth } from '@/app/utils/authHelper';

const UserDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    // Check admin authentication
    // const admin = checkAdminAuth();
    // if (!admin) {
    //   router.push('/admin/login');
    //   return;
    // }
    // setLoggedInAdmin(admin);
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user details');
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError(error.message || 'Failed to load user details');
      
      // Fallback mock data for development
      setUser({
        _id: userId,
        email: 'admin@example.com',
        name: 'Rakib Hossen',
        companyName: "Rakib Hossen's Properties",
        avatar: null,
        subscription: {
          plan: 'free',
          status: 'trialing',
          trialEnds: '2026-01-13T08:38:44.873Z',
          currentPeriodEnd: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          cancelAtPeriodEnd: false
        },
        limits: {
          tenants: 10,
          properties: 5,
          users: 1,
          storage: 100
        },
        settings: {
          currency: 'USD',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          notifications: {
            email: true,
            sms: false,
            paymentReminders: true,
            maintenanceAlerts: true
          }
        },
        stats: {
          totalTenants: 0,
          totalProperties: 0,
          totalRevenue: 0,
          activeLeases: 0
        },
        emailVerified: false,
        verificationToken: 'e0552ccf8978f788a1ea1d2cb8f9fd65d4cdc8b62a533ec817a585760d034ed5',
        resetToken: null,
        resetTokenExpiry: null,
        lastLogin: '2025-12-30T11:05:55.875Z',
        createdAt: '2025-12-30T08:38:44.956Z',
        updatedAt: '2025-12-30T11:05:55.875Z',
        role: 'admin'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = (field, value) => {
    setEditingField(field);
    setEditValue(value);
  };

  const handleSaveField = async (field) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: editValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const data = await response.json();
      setUser(data);
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating user:', error);
      setError(`Failed to update ${field}: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleToggleEmailVerification = async () => {
    try {
      const newStatus = !user.emailVerified;
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailVerified: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update verification status');
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error toggling email verification:', error);
      setError(`Failed to update verification: ${error.message}`);
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete user');
        }

        router.push('/admin/users');
      } catch (error) {
        console.error('Error deleting user:', error);
        setError(`Failed to delete user: ${error.message}`);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSubscriptionStatus = (status) => {
    const statusMap = {
      'trialing': { label: 'Trialing', color: 'bg-blue-100 text-blue-800' },
      'active': { label: 'Active', color: 'bg-green-100 text-green-800' },
      'past_due': { label: 'Past Due', color: 'bg-yellow-100 text-yellow-800' },
      'canceled': { label: 'Canceled', color: 'bg-red-100 text-red-800' },
      'inactive': { label: 'Inactive', color: 'bg-gray-100 text-gray-800' }
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading user details...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-4">
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl mr-3"></i>
            <h2 className="text-xl font-bold text-red-700">Error Loading User</h2>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={fetchUserDetails}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Try Again
            </button>
            <Link
              href="/admin/users"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle text-red-500 mr-3"></i>
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-500 hover:text-red-700"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <Link
              href="/admin/users"
              className="text-indigo-600 hover:text-indigo-800 flex items-center mb-2"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Users
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">User Details</h1>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2"
              disabled={user?._id === loggedInAdmin?.id}
            >
              <i className="fas fa-trash"></i>
              <span>Delete User</span>
            </button>
            <Link
              href={`/admin/users/${userId}/edit`}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center space-x-2"
            >
              <i className="fas fa-edit"></i>
              <span>Edit User</span>
            </Link>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0 md:mr-6">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <i className="fas fa-user text-indigo-500 text-3xl"></i>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">{user?.name}</h2>
                  <p className="text-gray-600 mb-2">{user?.email}</p>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user?.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user?.emailVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user?.emailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <button
                    onClick={handleToggleEmailVerification}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                      user?.emailVerified
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    <i className={`fas ${user?.emailVerified ? 'fa-envelope' : 'fa-envelope-open'}`}></i>
                    <span>{user?.emailVerified ? 'Mark Unverified' : 'Mark Verified'}</span>
                  </button>
                </div>
              </div>
              
              {user?.companyName && (
                <div className="mt-4">
                  <p className="text-gray-700">
                    <i className="fas fa-building mr-2 text-gray-500"></i>
                    {user.companyName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-2">
          {['overview', 'subscription', 'settings', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-white border-t border-l border-r border-gray-200 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Overview</h3>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tenants</p>
                  <p className="text-2xl font-bold">{user?.stats?.totalTenants || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Properties</p>
                  <p className="text-2xl font-bold">{user?.stats?.totalProperties || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">
                    ${user?.stats?.totalRevenue?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Active Leases</p>
                  <p className="text-2xl font-bold">{user?.stats?.activeLeases || 0}</p>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-mono text-sm">{user?._id}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(user?._id || '')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Created At</p>
                    <p>{formatDate(user?.createdAt)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p>{formatDate(user?.lastLogin)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p>{formatDate(user?.updatedAt)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Email Status</p>
                    <div className="flex items-center space-x-2">
                      <span className={user?.emailVerified ? 'text-green-600' : 'text-yellow-600'}>
                        {user?.emailVerified ? 'Verified' : 'Pending Verification'}
                      </span>
                      {user?.verificationToken && (
                        <button
                          onClick={() => navigator.clipboard.writeText(user.verificationToken)}
                          className="text-gray-500 hover:text-gray-700 text-sm"
                          title="Copy verification token"
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Subscription Details</h3>
                {formatSubscriptionStatus(user?.subscription?.status)}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="text-lg font-semibold capitalize">{user?.subscription?.plan || 'Free'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-semibold capitalize">{user?.subscription?.status}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Trial Ends</p>
                    <p>{formatDate(user?.subscription?.trialEnds)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Current Period End</p>
                    <p>{formatDate(user?.subscription?.currentPeriodEnd) || 'N/A'}</p>
                  </div>
                </div>

                {/* Stripe Information */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Stripe Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Customer ID:</span>
                      <span className="font-mono text-sm">
                        {user?.subscription?.stripeCustomerId || 'Not connected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Subscription ID:</span>
                      <span className="font-mono text-sm">
                        {user?.subscription?.stripeSubscriptionId || 'Not connected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Cancel at Period End:</span>
                      <span className={user?.subscription?.cancelAtPeriodEnd ? 'text-red-600' : 'text-green-600'}>
                        {user?.subscription?.cancelAtPeriodEnd ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && user?.settings && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">User Settings</h3>

              <div className="space-y-6">
                {/* Preferences */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Preferences</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Currency</p>
                      <p className="font-medium">{user.settings.currency || 'USD'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Timezone</p>
                      <p className="font-medium">{user.settings.timezone || 'UTC'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Date Format</p>
                      <p className="font-medium">{user.settings.dateFormat || 'MM/DD/YYYY'}</p>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Notification Settings</h4>
                  <div className="space-y-2">
                    {user.settings.notifications && Object.entries(user.settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <div className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                          value ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'
                        }`}>
                          <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {/* Activity items would go here */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">No activity recorded yet.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions & Limits */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/admin/users/${userId}/send-email`)}
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center">
                  <i className="fas fa-envelope mr-3"></i>
                  <span>Send Email</span>
                </div>
                <i className="fas fa-chevron-right"></i>
              </button>

              <button
                onClick={() => router.push(`/admin/users/${userId}/reset-password`)}
                className="w-full text-left px-4 py-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center">
                  <i className="fas fa-key mr-3"></i>
                  <span>Reset Password</span>
                </div>
                <i className="fas fa-chevron-right"></i>
              </button>

              <button
                onClick={() => router.push(`/admin/users/${userId}/impersonate`)}
                className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center">
                  <i className="fas fa-user-secret mr-3"></i>
                  <span>Impersonate User</span>
                </div>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          {/* Usage Limits */}
          {user?.limits && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Usage Limits</h3>
              <div className="space-y-4">
                {Object.entries(user.limits).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-600">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: '75%' }} // This would be actual usage percentage
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Email Verified:</span>
                <span className={user?.emailVerified ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                  {user?.emailVerified ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Active:</span>
                <span>{formatDate(user?.lastLogin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Age:</span>
                <span>
                  {user?.createdAt 
                    ? `${Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Edit {editingField.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveField(editingField)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailsPage;