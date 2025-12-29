'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Home, 
  DollarSign,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  Edit,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function TenantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showBackendToast } = useToast();

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tenants/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch tenant');
        const data = await response.json();
        setTenant(data);
      } catch (error) {
        console.error('Error fetching tenant:', error);
        showBackendToast('Failed to load tenant details', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTenant();
    }
  }, [params.id, showBackendToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Tenant Not Found</h1>
        <p className="text-gray-600 mb-6">The tenant you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/tenants')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tenants
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.push('/tenants')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tenants
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/tenants/${tenant._id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Tenant
          </button>
        </div>
      </div>

      {/* Tenant Info Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex items-start gap-6 mb-8">
          <div className={`p-4 rounded-xl ${
            tenant.status === 'active' ? 'bg-green-50' :
            tenant.status === 'inactive' ? 'bg-yellow-50' :
            'bg-gray-50'
          }`}>
            <User className={`w-12 h-12 ${
              tenant.status === 'active' ? 'text-green-600' :
              tenant.status === 'inactive' ? 'text-yellow-600' :
              'text-gray-600'
            }`} />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{tenant.name}</h1>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  tenant.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : tenant.status === 'inactive'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {tenant.status?.charAt(0).toUpperCase() + tenant.status?.slice(1)} Tenant
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">
                  ${tenant.rentAmount ? parseFloat(tenant.rentAmount).toLocaleString() : '0'}
                  <span className="text-sm font-normal text-gray-600">/month</span>
                </p>
                <p className="text-gray-600">Due on Day {tenant.rentDueDay || '1'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5" />
              Contact Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-800">{tenant.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-800 break-all">{tenant.email}</p>
                </div>
              </div>
              
              {tenant.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-gray-800">{tenant.address}</p>
                  </div>
                </div>
              )}
              
              {tenant.propertyId && (
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Property ID</p>
                    <p className="font-medium text-gray-800">{tenant.propertyId}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Contact */}
            {(tenant.emergencyContact || tenant.emergencyPhone) && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Emergency Contact
                </h3>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <div className="space-y-2">
                    {tenant.emergencyContact && (
                      <p className="font-medium text-gray-800">{tenant.emergencyContact}</p>
                    )}
                    {tenant.emergencyPhone && (
                      <p className="text-gray-600">{tenant.emergencyPhone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lease & Financial Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Lease & Financial Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Lease Start</p>
                    <p className="font-medium text-gray-800">
                      {new Date(tenant.leaseStart).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Lease End</p>
                    <p className="font-medium text-gray-800">
                      {new Date(tenant.leaseEnd).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Rent Due Day</p>
                  <p className="font-medium text-gray-800">Day {tenant.rentDueDay || '1'} of each month</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Security Deposit</p>
                  <p className="font-medium text-gray-800">
                    ${tenant.securityDeposit ? parseFloat(tenant.securityDeposit).toLocaleString() : '0'}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {tenant.notes && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Additional Notes
                </h3>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{tenant.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(tenant.createdAt).toLocaleDateString()} at{' '}
              {new Date(tenant.createdAt).toLocaleTimeString()}
            </div>
            {tenant.updatedAt && (
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {new Date(tenant.updatedAt).toLocaleDateString()} at{' '}
                {new Date(tenant.updatedAt).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => showBackendToast('Record payment feature coming soon!', 'info')}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Record Payment
        </button>
        <button
          onClick={() => showBackendToast('Send notification feature coming soon!', 'info')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Send Notification
        </button>
        <button
          onClick={() => showBackendToast('View documents feature coming soon!', 'info')}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          View Documents
        </button>
      </div>
    </div>
  );
}