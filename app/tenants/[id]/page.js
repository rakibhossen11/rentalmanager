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
  Loader2,
  Trash2,
  Download,
  MessageSquare,
  CreditCard,
  Building,
  BadgeCheck,
  Printer,
  Share2,
  Copy,
  History,
  MoreVertical
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function TenantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showBackendToast } = useToast();

  // Fetch tenant details
  const fetchTenant = async () => {
    try {
      setLoading(true);
      console.log(`Fetching tenant ${params.id}...`);
      
      const response = await fetch(`/api/tenants/${params.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Tenant data received:', data);
      setTenant(data);
      
    } catch (error) {
      console.error('Error fetching tenant:', error);
      showBackendToast(`Failed to load tenant details: ${error.message}`, 'error');
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchTenant();
    }
  }, [params.id]);

  // Delete tenant
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/tenants/${params.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete tenant');
      }

      showBackendToast('Tenant deleted successfully!', 'success');
      router.push('/tenants');
      
    } catch (error) {
      console.error('Error deleting tenant:', error);
      showBackendToast(`Failed to delete tenant: ${error.message}`, 'error');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0';
    const num = parseFloat(amount);
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(num);
  };

  // Calculate days until lease ends
  const getDaysUntilLeaseEnd = () => {
    if (!tenant?.leaseEnd) return null;
    const today = new Date();
    const leaseEnd = new Date(tenant.leaseEnd);
    const diffTime = leaseEnd - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get lease status
  const getLeaseStatus = () => {
    if (!tenant?.leaseEnd) return 'No lease set';
    
    const daysUntilEnd = getDaysUntilLeaseEnd();
    
    if (daysUntilEnd < 0) return 'Expired';
    if (daysUntilEnd <= 30) return 'Expiring soon';
    return 'Active';
  };

  // Copy to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
      .then(() => showBackendToast(`${label} copied to clipboard`, 'success'))
      .catch(() => showBackendToast('Failed to copy', 'error'));
  };

  // Export tenant data
  const exportTenantData = () => {
    if (!tenant) return;
    
    const dataStr = JSON.stringify(tenant, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `tenant-${tenant.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showBackendToast('Tenant data exported successfully', 'success');
  };

  // Print tenant details
  const printTenantDetails = () => {
    window.print();
  };

  // Send notification
  const sendNotification = () => {
    if (tenant?.email) {
      window.location.href = `mailto:${tenant.email}?subject=Rental%20Management%20Update&body=Dear%20${encodeURIComponent(tenant.name)}%2C%0A%0A`;
      showBackendToast('Email client opened', 'info');
    } else {
      showBackendToast('No email address available', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading tenant details...</p>
        <p className="text-sm text-gray-400 mt-2">Please wait</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Tenant Not Found</h1>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          The tenant you're looking for doesn't exist or has been removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/tenants')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Tenants
          </button>
          <button
            onClick={() => router.push('/tenants')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <User className="w-5 h-5" />
            View All Tenants
          </button>
        </div>
      </div>
    );
  }

  const daysUntilLeaseEnd = getDaysUntilLeaseEnd();
  const leaseStatus = getLeaseStatus();
  const isLeaseExpiringSoon = daysUntilLeaseEnd && daysUntilLeaseEnd <= 30;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <h3 className="text-xl font-bold text-gray-800">Delete Tenant</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{tenant.name}</strong>? 
              This action cannot be undone and all associated data will be lost.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Tenant
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/tenants')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Tenants</span>
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tenant Details</h1>
                <p className="text-gray-600">View and manage tenant information</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={exportTenantData}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Export tenant data"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                
                <button
                  onClick={printTenantDetails}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Print tenant details"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                
                <button
                  onClick={sendNotification}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Send notification to tenant"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Contact</span>
                </button>
                
                <button
                  onClick={() => router.push(`/tenants/${tenant._id}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Tenant</span>
                </button>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tenant Profile */}
          <div className="lg:col-span-2">
            {/* Tenant Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                <div className={`p-4 rounded-2xl ${
                  tenant.status === 'active' ? 'bg-green-50' :
                  tenant.status === 'inactive' ? 'bg-yellow-50' :
                  tenant.status === 'past' ? 'bg-red-50' :
                  'bg-blue-50'
                }`}>
                  <User className={`w-16 h-16 ${
                    tenant.status === 'active' ? 'text-green-600' :
                    tenant.status === 'inactive' ? 'text-yellow-600' :
                    tenant.status === 'past' ? 'text-red-600' :
                    'text-blue-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-800">{tenant.name}</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          tenant.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : tenant.status === 'inactive'
                            ? 'bg-yellow-100 text-yellow-800'
                            : tenant.status === 'past'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {tenant.status?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <BadgeCheck className="w-4 h-4" />
                          <span className="text-sm">Tenant ID: {tenant._id.substring(0, 8)}...</span>
                          <button
                            onClick={() => copyToClipboard(tenant._id, 'Tenant ID')}
                            className="text-blue-600 hover:text-blue-800"
                            title="Copy ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {tenant.propertyId && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building className="w-4 h-4" />
                            <span className="text-sm">Property: {tenant.propertyId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="mb-2">
                        <p className="text-2xl font-bold text-gray-800">
                          {formatCurrency(tenant.rentAmount)}
                          <span className="text-sm font-normal text-gray-600">/month</span>
                        </p>
                        <p className="text-gray-600">
                          Due on Day {tenant.rentDueDay || '1'} of each month
                        </p>
                      </div>
                      
                      {tenant.securityDeposit && (
                        <p className="text-sm text-gray-600">
                          Deposit: {formatCurrency(tenant.securityDeposit)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-800">{tenant.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => tenant.phone && copyToClipboard(tenant.phone, 'Phone number')}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={!tenant.phone}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-800 break-all">{tenant.email || 'Not provided'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => tenant.email && copyToClipboard(tenant.email, 'Email')}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={!tenant.email}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {tenant.address && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="font-medium text-gray-800">{tenant.address}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(tenant.address, 'Address')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {tenant.emergencyContact && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <p className="text-sm font-medium text-red-800">Emergency Contact</p>
                        </div>
                        <p className="text-gray-800">{tenant.emergencyContact}</p>
                        {tenant.emergencyPhone && (
                          <p className="text-sm text-gray-600">{tenant.emergencyPhone}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lease Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Lease Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-800">Lease Period</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isLeaseExpiringSoon ? 'bg-yellow-100 text-yellow-800' :
                          leaseStatus === 'Expired' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {leaseStatus}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Start Date</p>
                          <p className="font-medium text-gray-800">
                            {formatDate(tenant.leaseStart)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">End Date</p>
                          <p className="font-medium text-gray-800">
                            {formatDate(tenant.leaseEnd)}
                          </p>
                        </div>
                      </div>
                      
                      {daysUntilLeaseEnd !== null && (
                        <div className="mt-3 pt-3 border-t border-blue-100">
                          <p className="text-sm text-gray-600">
                            {daysUntilLeaseEnd > 0 
                              ? `${daysUntilLeaseEnd} days until lease ends`
                              : 'Lease has expired'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-800">Payment Schedule</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Monthly Rent</span>
                          <span className="font-bold text-gray-800">
                            {formatCurrency(tenant.rentAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Due Day</span>
                          <span className="font-medium text-gray-800">
                            Day {tenant.rentDueDay || '1'} of each month
                          </span>
                        </div>
                        {tenant.securityDeposit && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Security Deposit</span>
                            <span className="font-medium text-gray-800">
                              {formatCurrency(tenant.securityDeposit)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {tenant.notes && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Additional Notes
                  </h2>
                  
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{tenant.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions & History */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => showBackendToast('Record payment feature coming soon!', 'info')}
                  className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Record Payment</p>
                      <p className="text-sm text-gray-600">Add a new payment record</p>
                    </div>
                  </div>
                  <span className="text-green-600 group-hover:text-green-800">→</span>
                </button>
                
                <button
                  onClick={sendNotification}
                  className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Send Message</p>
                      <p className="text-sm text-gray-600">Email or SMS notification</p>
                    </div>
                  </div>
                  <span className="text-blue-600 group-hover:text-blue-800">→</span>
                </button>
                
                <button
                  onClick={() => showBackendToast('Document upload feature coming soon!', 'info')}
                  className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Upload Document</p>
                      <p className="text-sm text-gray-600">Lease agreement, ID, etc.</p>
                    </div>
                  </div>
                  <span className="text-purple-600 group-hover:text-purple-800">→</span>
                </button>
                
                <button
                  onClick={() => showBackendToast('Generate report feature coming soon!', 'info')}
                  className="w-full flex items-center justify-between p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Download className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Generate Report</p>
                      <p className="text-sm text-gray-600">Payment history or details</p>
                    </div>
                  </div>
                  <span className="text-yellow-600 group-hover:text-yellow-800">→</span>
                </button>
              </div>
            </div>

            {/* Tenant Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Tenant Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Account Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tenant.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : tenant.status === 'inactive'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.status?.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Lease Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isLeaseExpiringSoon ? 'bg-yellow-100 text-yellow-800' :
                    leaseStatus === 'Expired' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {leaseStatus}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Monthly Rent</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(tenant.rentAmount)}
                  </span>
                </div>
                
                {tenant.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="text-gray-800">{formatDate(tenant.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity (Placeholder) */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                <button
                  onClick={() => showBackendToast('View all activity coming soon!', 'info')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Account Created</p>
                    <p className="text-xs text-gray-500">
                      {tenant.createdAt ? formatDate(tenant.createdAt) : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Edit className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Last Updated</p>
                    <p className="text-xs text-gray-500">
                      {tenant.updatedAt ? formatDate(tenant.updatedAt) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => showBackendToast('Record payment feature coming soon!', 'info')}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <CreditCard className="w-5 h-5" />
              Record Payment
            </button>
            <button
              onClick={sendNotification}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <MessageSquare className="w-5 h-5" />
              Send Notification
            </button>
            <button
              onClick={() => showBackendToast('View documents feature coming soon!', 'info')}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <FileText className="w-5 h-5" />
              View Documents
            </button>
            <button
              onClick={() => showBackendToast('Payment history coming soon!', 'info')}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              <History className="w-5 h-5" />
              Payment History
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content,
          .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}