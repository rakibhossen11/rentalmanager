// app/profile/page.jsx or components/ProfilePage.jsx
'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Building,
  Users,
  DollarSign,
  Settings,
  Shield,
  FileText,
  Calendar,
  Edit,
  Key,
  Mail,
  Activity,
  CheckCircle,
  AlertCircle,
  Bell,
  Globe,
  Clock,
  Database,
  HardDrive,
  Award,
  Zap,
  TrendingUp,
  FileCheck,
  CreditCard,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/app/components/AuthProvider'; // Update path to your AuthContext

const ProfilePage = () => {
  const { user, logout } = useAuth(); // Get user from AuthContext
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Use user from AuthContext if available, otherwise fetch
  useEffect(() => {
    if (user) {
      setUserData(user);
      setLoading(false);
    } else {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setUserData(data.data);
      } else {
        throw new Error('No user data received');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate trial days remaining
  const calculateTrialDays = (trialEnds) => {
    if (!trialEnds) return 0;
    const endDate = new Date(trialEnds);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Handle field edit
  const handleEditField = (field, value) => {
    setEditingField(field);
    setEditForm({ [field]: value });
  };

  // Save field edit
  const saveEdit = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await fetchUserData(); // Refresh data
        setEditingField(null);
        setEditForm({});
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  // Get user's first letter for avatar
  const getUserInitial = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // Default currency
    }).format(amount || 0);
  };

  // Get usage limits - Based on subscription plan
  const getUsageLimits = () => {
    if (!userData?.subscription?.plan) return null;
    
    const plans = {
      free: {
        properties: 5,
        tenants: 10,
        storage: 100, // MB
        users: 1
      },
      basic: {
        properties: 20,
        tenants: 50,
        storage: 500,
        users: 3
      },
      professional: {
        properties: 100,
        tenants: 500,
        storage: 2000,
        users: 10
      },
      enterprise: {
        properties: 1000,
        tenants: 5000,
        storage: 10000,
        users: 50
      }
    };
    
    return plans[userData.subscription.plan] || plans.free;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mt-4"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <AlertCircle className="h-8 w-8 text-red-600 mb-4" />
          <h2 className="text-xl font-semibold text-red-800">Error Loading Profile</h2>
          <p className="text-red-600 mt-2">{error}</p>
          <button 
            onClick={fetchUserData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <AlertCircle className="h-8 w-8 text-yellow-600 mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800">No User Data</h2>
          <p className="text-yellow-600 mt-2">Please log in to view your profile.</p>
          <button 
            onClick={() => window.location.href = '/auth/login'}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const usageLimits = getUsageLimits();
  const trialDays = calculateTrialDays(userData.subscription?.trialEnds);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile & Account</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and view your dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col items-center text-center">
              {/* User Initial Avatar */}
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {getUserInitial(userData.name)}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold mt-4">{userData.name}</h2>
              <p className="text-gray-600">{userData.companyName || 'No company name set'}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${
                  userData.subscription?.status === 'trialing'
                    ? 'bg-yellow-100 text-yellow-800'
                    : userData.subscription?.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <CheckCircle size={14} /> 
                  {userData.subscription?.status?.charAt(0).toUpperCase() + userData.subscription?.status?.slice(1) || 'Active'}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {userData.subscription?.plan?.charAt(0).toUpperCase() + userData.subscription?.plan?.slice(1) || 'Free'} Plan
                </span>
              </div>
              
              {/* Trial Days Warning */}
              {userData.subscription?.status === 'trialing' && userData.subscription?.trialEnds && trialDays > 0 && (
                <div className="mt-3 w-full">
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="text-yellow-600" size={16} />
                      <span className="text-sm font-medium text-yellow-800">
                        {trialDays} days left in trial
                      </span>
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">
                      Trial ends: {formatDate(userData.subscription.trialEnds)}
                    </div>
                    <button className="w-full mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-900">
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{userData.stats?.totalProperties || 0}</div>
                  <div className="text-sm text-gray-600">Properties</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {userData.stats?.totalProperties || 0}/{usageLimits?.properties || 5} limit
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{userData.stats?.totalTenants || 0}</div>
                  <div className="text-sm text-gray-600">Tenants</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {userData.stats?.totalTenants || 0}/{usageLimits?.tenants || 10} limit
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="font-medium text-gray-900 mb-3">Account Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-400" size={18} />
                  <span className="text-gray-700">{userData.email}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="text-gray-400" size={18} />
                  <span className="text-gray-700">
                    Member since {formatDate(userData.created_at)}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="text-gray-400" size={18} />
                  <span className="text-gray-700">
                    Last login: {formatDate(userData.last_login || userData.updated_at)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-gray-400" size={18} />
                  <span className="text-gray-700">
                    Status: <span className="font-medium capitalize">{userData.status || 'active'}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => handleEditField('name', userData.name)}
              className="w-full mt-6 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Edit size={18} /> Edit Profile
            </button>

            <button 
              onClick={logout}
              className="w-full mt-3 border border-red-300 text-red-600 py-2.5 rounded-lg font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>

          {/* Limits Card */}
          {usageLimits && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database size={18} /> Usage Limits
              </h3>
              
              <div className="space-y-4">
                <LimitProgressBar
                  label="Properties"
                  current={userData.stats?.totalProperties || 0}
                  max={usageLimits.properties}
                  icon={<Building size={16} />}
                />
                
                <LimitProgressBar
                  label="Tenants"
                  current={userData.stats?.totalTenants || 0}
                  max={usageLimits.tenants}
                  icon={<Users size={16} />}
                />
                
                <LimitProgressBar
                  label="Storage"
                  current={0} // You might want to track this
                  max={usageLimits.storage}
                  unit="MB"
                  icon={<HardDrive size={16} />}
                />
                
                <LimitProgressBar
                  label="Team Users"
                  current={1} // Default user
                  max={usageLimits.users}
                  icon={<User size={16} />}
                />
              </div>
              
              <button className="w-full mt-4 border border-blue-600 text-blue-600 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition">
                <Zap size={18} className="inline mr-2" />
                Upgrade for Higher Limits
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Main Content */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="flex overflow-x-auto border-b border-gray-100">
              {[
                { id: 'overview', label: 'Overview', icon: <Activity size={18} /> },
                { id: 'financial', label: 'Financial', icon: <DollarSign size={18} /> },
                { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
                { id: 'security', label: 'Security', icon: <Shield size={18} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            {activeTab === 'overview' && (
              <OverviewTab userData={userData} formatCurrency={formatCurrency} formatDate={formatDate} />
            )}

            {activeTab === 'financial' && (
              <FinancialTab userData={userData} formatCurrency={formatCurrency} />
            )}

            {activeTab === 'settings' && (
              <SettingsTab 
                userData={userData} 
                onUpdate={fetchUserData}
                editingField={editingField}
                setEditingField={setEditingField}
                editForm={editForm}
                setEditForm={setEditForm}
                saveEdit={saveEdit}
              />
            )}

            {activeTab === 'security' && (
              <SecurityTab userData={userData} />
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingField && (
        <EditModal
          field={editingField}
          form={editForm}
          setForm={setEditForm}
          onSave={saveEdit}
          onClose={() => {
            setEditingField(null);
            setEditForm({});
          }}
        />
      )}
    </div>
  );
};

// Sub-components for tabs
const OverviewTab = ({ userData, formatCurrency, formatDate }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-gray-900">Overview Dashboard</h2>
      <span className="text-sm text-gray-500">
        Last updated: {formatDate(userData.updated_at)}
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="col-span-2">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Total Revenue</div>
              <div className="text-3xl font-bold mt-1">
                {formatCurrency(userData.stats?.totalRevenue || 0)}
              </div>
              <div className="text-sm opacity-90 mt-2">
                {userData.stats?.activeLeases || 0} Active Leases
              </div>
            </div>
            <TrendingUp size={48} className="opacity-80" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">Collection Rate</div>
            <div className="text-3xl font-bold mt-1">
              {/* Add collection rate calculation if available */}
              {userData.stats?.collectionRate || '100%'}
            </div>
            <div className="text-sm opacity-90 mt-2">
              On-time payments
            </div>
          </div>
          <FileCheck size={48} className="opacity-80" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Subscription Status</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Award className="text-blue-600" size={20} />
              <div>
                <div className="font-medium">Current Plan</div>
                <div className="text-sm text-gray-600">{userData.subscription?.plan || 'free'}</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              {userData.subscription?.status || 'active'}
            </span>
          </div>
          
          {userData.subscription?.trialEnds && (
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium">Trial Period</div>
                <div className="text-sm text-yellow-700">
                  Ends on {formatDate(userData.subscription.trialEnds)}
                </div>
              </div>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm">
                Upgrade
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Account Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <User className="text-gray-400" size={18} />
              <div>
                <div className="font-medium">Account Created</div>
                <div className="text-sm text-gray-600">{formatDate(userData.created_at)}</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="text-gray-400" size={18} />
              <div>
                <div className="font-medium">Last Login</div>
                <div className="text-sm text-gray-600">{formatDate(userData.last_login || userData.updated_at)}</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="text-gray-400" size={18} />
              <div>
                <div className="font-medium">User Role</div>
                <div className="text-sm text-gray-600">{userData.role || 'user'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FinancialTab = ({ userData, formatCurrency }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-6">Financial Overview</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <StatCard
        icon={<DollarSign className="text-green-600" />}
        label="Total Revenue"
        value={formatCurrency(userData.stats?.totalRevenue || 0)}
        change="+12.5% this month"
        color="green"
      />
      <StatCard
        icon={<CheckCircle className="text-blue-600" />}
        label="Active Leases"
        value={userData.stats?.activeLeases || 0}
        change="+2 this month"
        color="blue"
      />
      <StatCard
        icon={<FileCheck className="text-purple-600" />}
        label="Collection Rate"
        value={userData.stats?.collectionRate || '100%'}
        change="+2.3%"
        color="purple"
      />
    </div>
    
    <div className="p-4 border border-gray-200 rounded-lg">
      <h3 className="font-medium text-gray-900 mb-4">Payment Settings</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="font-medium">Primary Currency</div>
            <div className="text-gray-600">USD (Default)</div>
          </div>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Change Currency
          </button>
        </div>
        
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="font-medium">Payment Method</div>
            <div className="text-gray-600">No payment method added</div>
          </div>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            <CreditCard size={16} className="inline mr-1" />
            Add Payment Method
          </button>
        </div>
      </div>
    </div>
  </div>
);

const SettingsTab = ({ userData, onUpdate, editingField, setEditingField, editForm, setEditForm, saveEdit }) => {
  const updateSetting = async (key, value) => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error updating setting:', err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
      
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <EditableField
              label="Name"
              value={userData.name}
              onEdit={() => setEditingField('name')}
            />
            <EditableField
              label="Company Name"
              value={userData.companyName || 'Not set'}
              onEdit={() => setEditingField('companyName')}
            />
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-700">Email</div>
                <div className="text-gray-600">{userData.email}</div>
                {!userData.emailVerified && (
                  <span className="text-sm text-red-600">Not verified</span>
                )}
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                {userData.emailVerified ? 'Change Email' : 'Verify Email'}
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-700">Timezone</div>
                <div className="text-gray-600">UTC (Default)</div>
              </div>
              <select
                value="UTC"
                onChange={(e) => updateSetting('timezone', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-700">Date Format</div>
                <div className="text-gray-600">MM/DD/YYYY (Default)</div>
              </div>
              <select
                value="MM/DD/YYYY"
                onChange={(e) => updateSetting('dateFormat', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Bell size={18} /> Notification Preferences
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">Email Notifications</span>
              <ToggleSwitch 
                enabled={true}
                onChange={(enabled) => updateSetting('emailNotifications', enabled)}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">Rent Reminders</span>
              <ToggleSwitch 
                enabled={true}
                onChange={(enabled) => updateSetting('rentReminders', enabled)}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">Maintenance Alerts</span>
              <ToggleSwitch 
                enabled={true}
                onChange={(enabled) => updateSetting('maintenanceAlerts', enabled)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SecurityTab = ({ userData }) => {
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordForm),
      });

      if (response.ok) {
        setChangingPassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      console.error('Error changing password:', err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
      
      <div className="space-y-4">
        {/* Change Password */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Change Password</h3>
            <button
              onClick={() => setChangingPassword(!changingPassword)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {changingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>
          
          {changingPassword && (
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <input
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
                minLength={8}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Password
              </button>
            </form>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
              <div className="text-sm text-gray-600">Add an extra layer of security</div>
            </div>
            <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
              Enable 2FA
            </button>
          </div>
        </div>

        {/* Session Management */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Active Sessions</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium">Current Session</div>
                <div className="text-sm text-gray-600">
                  Last login: {(userData.last_login || userData.updated_at)}
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                Active
              </span>
            </div>
          </div>
          <button className="w-full mt-4 text-center text-sm text-red-600 hover:text-red-800 font-medium">
            Logout from all devices
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const LimitProgressBar = ({ label, current, max, unit = '', icon }) => {
  const percentage = (current / max) * 100;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm text-gray-600">{current}/{max} {unit}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${
            percentage >= 90 ? 'bg-red-500' :
            percentage >= 70 ? 'bg-yellow-500' :
            'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, change, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
    purple: 'bg-purple-50 border-purple-100',
    emerald: 'bg-emerald-50 border-emerald-100'
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-white">
          {icon}
        </div>
        <div className="text-sm font-medium text-gray-600">{label}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </div>
    </div>
  );
};

const EditableField = ({ label, value, onEdit }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <div className="font-medium text-gray-700">{label}</div>
      <div className="text-gray-600">{value}</div>
    </div>
    {value !== 'Not set' && (
      <button
        onClick={onEdit}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        Edit
      </button>
    )}
  </div>
);

const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    type="button"
    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
      enabled ? 'bg-blue-600' : 'bg-gray-300'
    }`}
    onClick={() => onChange(!enabled)}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const EditModal = ({ field, form, setForm, onSave, onClose }) => {
  const getFieldConfig = () => {
    switch (field) {
      case 'name':
        return {
          title: 'Edit Name',
          label: 'Full Name',
          type: 'text'
        };
      case 'companyName':
        return {
          title: 'Edit Company Name',
          label: 'Company Name',
          type: 'text'
        };
      default:
        return {
          title: 'Edit',
          label: 'Value',
          type: 'text'
        };
    }
  };

  const config = getFieldConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{config.title}</h3>
        <input
          type={config.type}
          value={form[field] || ''}
          onChange={(e) => setForm({ [field]: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
          placeholder={`Enter ${config.label.toLowerCase()}`}
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;