// app/dashboard/tenants/components/TenantTable.jsx
'use client';

import { useState } from 'react';
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function TenantTable({ tenants, onView, onEdit, onDelete }) {
  const [actionMenu, setActionMenu] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      past: 'bg-gray-100 text-gray-800 border-gray-200',
      pending: 'bg-blue-100 text-blue-800 border-blue-200',
      evicted: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getPaymentStatus = (tenant) => {
    const balance = tenant.rentStatus?.currentBalance || 0;
    const nextPaymentDue = tenant.rentStatus?.nextPaymentDue ? new Date(tenant.rentStatus.nextPaymentDue) : null;
    const today = new Date();

    if (balance > 0) {
      return {
        label: `Overdue: ${formatCurrency(balance)}`,
        style: 'bg-red-100 text-red-800 border-red-200'
      };
    } else if (nextPaymentDue && nextPaymentDue <= today) {
      return {
        label: 'Payment Due',
        style: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
    } else {
      return {
        label: 'Current',
        style: 'bg-green-100 text-green-800 border-green-200'
      };
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tenant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Property/Unit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lease Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rent Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tenants.map((tenant) => {
            const paymentStatus = getPaymentStatus(tenant);
            const isExpanded = expandedRow === tenant._id;
            
            return (
              <>
                <tr key={tenant._id} className="hover:bg-gray-50">
                  {/* Tenant Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {tenant.personalInfo?.fullName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          {tenant.personalInfo?.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {tenant.personalInfo.email}
                            </div>
                          )}
                          {tenant.personalInfo?.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {tenant.personalInfo.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Property/Unit */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {tenant.property?.name || 'No Property'}
                    </div>
                    {tenant.unit && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Unit {tenant.unit}
                      </div>
                    )}
                  </td>

                  {/* Lease Details */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(tenant.lease?.monthlyRent || 0)}/mo
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(tenant.lease?.startDate)}
                      </div>
                      <div className="text-xs">
                        to {formatDate(tenant.lease?.endDate)}
                      </div>
                    </div>
                  </td>

                  {/* Rent Status */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">
                      <span className={`px-2 py-1 text-xs rounded-full border ${paymentStatus.style}`}>
                        {paymentStatus.label}
                      </span>
                    </div>
                    {tenant.rentStatus?.nextPaymentDue && (
                      <div className="text-xs text-gray-500 mt-1">
                        Next: {formatDate(tenant.rentStatus.nextPaymentDue)}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {getStatusBadge(tenant.status)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : tenant._id)}
                        className="p-1 hover:bg-gray-100 rounded-lg"
                        title="Expand details"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === tenant._id ? null : tenant._id)}
                          className="p-1 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </button>

                        {actionMenu === tenant._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onView(tenant);
                                  setActionMenu(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  onEdit(tenant);
                                  setActionMenu(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this tenant?')) {
                                    onDelete(tenant._id);
                                  }
                                  setActionMenu(null);
                                }}
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
                  </td>
                </tr>
                
                {/* Expanded row */}
                {isExpanded && (
                  <tr className="bg-blue-50">
                    <td colSpan="6" className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Info</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{tenant.personalInfo?.email || 'No email'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{tenant.personalInfo?.phone || 'No phone'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Lease Info</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Security Deposit:</span>
                              <span className="font-medium">{formatCurrency(tenant.lease?.securityDeposit)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Late Fee:</span>
                              <span className="font-medium">{formatCurrency(tenant.lease?.lateFee)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Actions</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => onView(tenant)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              View Full Details
                            </button>
                            <button
                              onClick={() => onEdit(tenant)}
                              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Quick Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}