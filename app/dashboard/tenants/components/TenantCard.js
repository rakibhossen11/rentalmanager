// app/dashboard/tenants/components/TenantCard.jsx
'use client';

import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign,
  Home,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

export default function TenantCard({ tenant, onDelete }) {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'past':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatus = (balance) => {
    if (balance > 0) {
      return {
        label: `Overdue: ${formatCurrency(balance)}`,
        color: 'bg-red-100 text-red-800 border-red-200'
      };
    }
    return {
      label: 'Current',
      color: 'bg-green-100 text-green-800 border-green-200'
    };
  };

  const paymentStatus = getPaymentStatus(tenant.rentStatus?.currentBalance || 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Header with Tenant Info */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">
                {tenant.personalInfo?.fullName || 'N/A'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(tenant.status)}`}>
                  {tenant.status?.charAt(0).toUpperCase() + tenant.status?.slice(1)}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full border ${paymentStatus.color}`}>
                  {paymentStatus.label}
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(tenant._id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="space-y-2">
          {tenant.personalInfo?.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span className="truncate">{tenant.personalInfo.email}</span>
            </div>
          )}
          {tenant.personalInfo?.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              {tenant.personalInfo.phone}
            </div>
          )}
        </div>
      </div>
      
      {/* Property & Lease Info */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Property</div>
            <div className="flex items-center gap-2 font-medium text-gray-900">
              <Home className="h-4 w-4 text-gray-400" />
              <span>{tenant.property?.name || 'No Property'}</span>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Unit</div>
            <div className="flex items-center gap-2 font-medium text-gray-900">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{tenant.unit || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Monthly Rent</div>
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <DollarSign className="h-4 w-4 text-gray-400" />
              {formatCurrency(tenant.lease?.monthlyRent)}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Lease Start</div>
            <div className="flex items-center gap-2 text-gray-900">
              <Calendar className="h-4 w-4 text-gray-400" />
              {formatDate(tenant.lease?.startDate)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {tenant.rentStatus?.nextPaymentDue ? (
              <span>Next payment: {formatDate(tenant.rentStatus.nextPaymentDue)}</span>
            ) : (
              <span>No upcoming payments</span>
            )}
          </div>
          <span className="text-xs">
            Since {formatDate(tenant.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}