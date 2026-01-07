// app/dashboard/tenants/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  Building,
  Edit,
  Trash2,
  Download,
  Printer,
  MessageSquare,
  CreditCard,
  History,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function TenantDetailsPage() {
  const params = useParams();
  console.log(params);
  const router = useRouter();
  const { user } = useAuth(); // We'll use this for user state
  const [tenant, setTenant] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params.id) {
      fetchTenantDetails();
    }
  }, [params.id]);

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      
      // IMPORTANT: Don't send Authorization header - use cookies instead
      // Your getSession() function reads from cookies, not Authorization header
      const res = await fetch(`/api/tenants/${params.id}`, {
        credentials: 'include', // This ensures cookies are sent with the request
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setTenant(data);
        
        // Fetch property details if propertyId exists
        if (data.propertyId) {
          fetchPropertyDetails(data.propertyId);
        }
      } else if (res.status === 401) {
        toast.error('Please login to view tenant details');
        router.push('/login');
      } else if (res.status === 404) {
        toast.error('Tenant not found');
        router.push('/dashboard/tenants');
      } else {
        throw new Error('Failed to fetch tenant details');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load tenant details');
      router.push('/dashboard/tenants');
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyDetails = async (propertyId) => {
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        credentials: 'include', // Important: include cookies
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setProperty(data);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/tenants/${params.id}`, {
        method: 'DELETE',
        credentials: 'include', // Important: include cookies
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (res.ok) {
        toast.success('Tenant deleted successfully');
        router.push('/dashboard/tenants');
      } else if (res.status === 401) {
        toast.error('Unauthorized to delete tenant');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tenant not found</h3>
        <Link
          href="/dashboard/tenants"
          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tenants
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/tenants"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              {tenant.personalInfo?.fullName || 'Unnamed Tenant'}
            </h1>
            <p className="text-gray-600">Tenant Details & Management</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/tenants/${params.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['overview', 'lease', 'payments', 'documents', 'communication'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tenant Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Personal Information Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Full Name</label>
                    <p className="font-medium">{tenant.personalInfo?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {tenant.personalInfo?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Phone</label>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {tenant.personalInfo?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Date of Birth</label>
                    <p className="font-medium">
                      {tenant.personalInfo?.dateOfBirth ? formatDate(tenant.personalInfo.dateOfBirth) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Information Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Property Information
                </h2>
                {property ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{property.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {property.address?.street || 'No address'}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/properties/${property._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Property
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">Unit</label>
                        <p className="font-medium">{tenant.unit || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Occupancy</label>
                        <p className="font-medium">{tenant.occupants || 'N/A'} occupants</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No property assigned</p>
                )}
              </div>
            </div>
          )}

          {/* Lease Tab */}
          {activeTab === 'lease' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Lease Details
              </h2>
              
              {tenant.lease ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-600">Monthly Rent</label>
                        <DollarSign className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(tenant.lease.monthlyRent)}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-600">Security Deposit</label>
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(tenant.lease.securityDeposit)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-gray-500">Lease Start Date</label>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(tenant.lease.startDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Lease End Date</label>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(tenant.lease.endDate)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Lease Status</label>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-1 ${
                      tenant.lease.status === 'active' ? 'bg-green-100 text-green-800' :
                      tenant.lease.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      tenant.lease.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tenant.lease.status?.charAt(0).toUpperCase() + tenant.lease.status?.slice(1)}
                    </span>
                  </div>

                  {tenant.lease.notes && (
                    <div>
                      <label className="text-sm text-gray-500">Lease Notes</label>
                      <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {tenant.lease.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No lease information available</p>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment History
              </h2>
              
              {tenant.financial ? (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-600">Current Balance</p>
                        <p className={`text-2xl font-bold ${
                          (tenant.financial.currentBalance || 0) > 0 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {formatCurrency(tenant.financial.currentBalance)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Next Payment Due</p>
                        <p className="font-medium">
                          {tenant.financial.nextPaymentDue 
                            ? formatDate(tenant.financial.nextPaymentDue)
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment history list would go here */}
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Payment history will appear here</p>
                    <p className="text-sm mt-1">Transactions will be logged automatically</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No payment information available</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions & Status */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tenant Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lease Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  tenant.lease?.status === 'active' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {tenant.lease?.status?.charAt(0).toUpperCase() + tenant.lease?.status?.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  (tenant.financial?.currentBalance || 0) > 0 
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {(tenant.financial?.currentBalance || 0) > 0 ? 'Overdue' : 'Current'}
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                <Download className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Download Documents</p>
                  <p className="text-xs text-gray-500">Lease agreement & records</p>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                <Printer className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Print Summary</p>
                  <p className="text-xs text-gray-500">Tenant details summary</p>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                <CreditCard className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Record Payment</p>
                  <p className="text-xs text-gray-500">Log a rent payment</p>
                </div>
              </button>
            </div>
          </div>

          {/* Emergency Contact */}
          {tenant.personalInfo?.emergencyContact && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{tenant.personalInfo.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Relationship</p>
                  <p className="font-medium">{tenant.personalInfo.emergencyContact.relationship}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {tenant.personalInfo.emergencyContact.phone}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}