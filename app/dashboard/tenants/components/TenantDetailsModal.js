// app/dashboard/tenants/components/TenantDetailsModal.jsx
'use client';

import { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Home, 
  MapPin,
  Edit, 
  Trash2,
  Building,
  Briefcase,
  FileText,
  CreditCard,
  AlertCircle
} from 'lucide-react';

export default function TenantDetailsModal({ tenant, property, onClose, onUpdate, onDelete }) {
  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'lease', label: 'Lease', icon: FileText },
    { id: 'financial', label: 'Financial', icon: CreditCard }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Personal Info */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{tenant.personalInfo?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{tenant.personalInfo?.email || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{tenant.personalInfo?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{formatDate(tenant.personalInfo?.dateOfBirth)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Info */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Property Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Property</label>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{property?.name || 'No Property Assigned'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Unit</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{tenant.unit || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'lease':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Lease Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{formatDate(tenant.lease?.startDate)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">End Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{formatDate(tenant.lease?.endDate)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Monthly Rent</label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900 font-medium">{formatCurrency(tenant.lease?.monthlyRent)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Security Deposit</label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{formatCurrency(tenant.lease?.securityDeposit)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Rent Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Balance</label>
                  <p className={`text-xl font-bold ${(tenant.rentStatus?.currentBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(tenant.rentStatus?.currentBalance)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Next Payment Due</label>
                  <p className="text-gray-900">{formatDate(tenant.rentStatus?.nextPaymentDue)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Payment Date</label>
                  <p className="text-gray-900">{formatDate(tenant.rentStatus?.lastPaymentDate)}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto z-50">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {tenant.personalInfo?.fullName}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  tenant.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : tenant.status === 'inactive'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {tenant.status?.charAt(0).toUpperCase() + tenant.status?.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  Since {formatDate(tenant.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(tenant._id)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {renderTabContent()}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Tenant ID: {tenant._id}
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Send Reminder
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Record Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}