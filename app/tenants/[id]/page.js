'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, Phone, Mail, Calendar, Home, DollarSign, 
  FileText, Edit, ArrowLeft, Clock, CheckCircle, 
  AlertCircle, Download, Printer, MessageSquare,
  Building, MapPin, Bed, Shield
} from 'lucide-react';
import { useToast } from '@/app/contexts/ToastContext';
import Link from 'next/link';

// Mock data - Hardcoded instead of localStorage
const mockTenants = [
  {
    id: '101',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    emergencyContact: '+1 (555) 987-6543',
    occupation: 'Software Engineer',
    propertyId: '1',
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    rentDueDay: 5,
    rentAmount: 1500,
    securityDeposit: 3000,
    leaseType: '12-Month Fixed',
    notes: 'Always pays on time. Requested kitchen sink maintenance once.',
    status: 'active',
    createdAt: '2023-12-15'
  },
  {
    id: '102',
    name: 'Emma Johnson',
    email: 'emma.j@example.com',
    phone: '+1 (555) 234-5678',
    emergencyContact: '+1 (555) 876-5432',
    occupation: 'Marketing Manager',
    propertyId: '2',
    leaseStart: '2024-02-01',
    leaseEnd: '2025-01-31',
    rentDueDay: 10,
    rentAmount: 1200,
    securityDeposit: 2400,
    leaseType: '12-Month Fixed',
    notes: 'Very tidy tenant. Has one pet (cat).',
    status: 'active',
    createdAt: '2024-01-10'
  }
];

const mockProperties = [
  {
    id: '1',
    name: 'Sunshine Villa',
    address: '123 Main Street, San Francisco, CA 94110',
    rentAmount: 1500,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1200,
    status: 'occupied',
    type: 'Apartment',
    yearBuilt: 2010,
    amenities: ['Parking', 'Gym', 'Laundry', 'Balcony']
  },
  {
    id: '2',
    name: 'Garden Apartments',
    address: '456 Oak Avenue, Oakland, CA 94612',
    rentAmount: 1200,
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 850,
    status: 'occupied',
    type: 'Condo',
    yearBuilt: 2005,
    amenities: ['Parking', 'Garden', 'Storage']
  }
];

const mockPayments = [
  {
    id: 'p1',
    tenantId: '101',
    propertyId: '1',
    amount: 1500,
    date: '2024-03-05',
    status: 'paid',
    method: 'bank_transfer',
    month: '2024-03',
    receiptNumber: 'REC-001',
    notes: 'Paid on time via online banking'
  },
  {
    id: 'p2',
    tenantId: '101',
    propertyId: '1',
    amount: 1500,
    date: '2024-02-05',
    status: 'paid',
    method: 'bank_transfer',
    month: '2024-02',
    receiptNumber: 'REC-002',
    notes: 'Paid on time'
  },
  {
    id: 'p3',
    tenantId: '101',
    propertyId: '1',
    amount: 1500,
    date: '2024-01-05',
    status: 'paid',
    method: 'check',
    month: '2024-01',
    receiptNumber: 'REC-003',
    notes: 'Paid by check'
  },
  {
    id: 'p4',
    tenantId: '101',
    propertyId: '1',
    amount: 1500,
    date: '2024-04-01',
    status: 'pending',
    method: null,
    month: '2024-04',
    receiptNumber: null,
    notes: 'Due on April 5th'
  },
  {
    id: 'p5',
    tenantId: '102',
    propertyId: '2',
    amount: 1200,
    date: '2024-03-10',
    status: 'paid',
    method: 'online',
    month: '2024-03',
    receiptNumber: 'REC-004',
    notes: 'Paid via credit card'
  }
];

const mockNotes = [
  {
    id: 'n1',
    tenantId: '101',
    text: 'Requested maintenance for kitchen sink on March 15, 2024. Scheduled for March 20.',
    author: 'Property Manager',
    date: '2024-03-16',
    type: 'maintenance'
  },
  {
    id: 'n2',
    tenantId: '101',
    text: 'Always pays rent on time via bank transfer. Very reliable tenant.',
    author: 'Admin',
    date: '2024-02-01',
    type: 'comment'
  },
  {
    id: 'n3',
    tenantId: '101',
    text: 'Lease renewal discussion scheduled for November 2024.',
    author: 'Property Manager',
    date: '2024-01-15',
    type: 'reminder'
  }
];

export default function TenantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { showBackendToast } = useToast();
  
  const [tenant, setTenant] = useState(null);
  const [property, setProperty] = useState(null);
  const [payments, setPayments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      // Find tenant
      const foundTenant = mockTenants.find(t => t.id === params.id);
      
      if (foundTenant) {
        setTenant(foundTenant);
        
        // Find property
        const tenantProperty = mockProperties.find(p => p.id === foundTenant.propertyId);
        setProperty(tenantProperty || null);
        
        // Find payments
        const tenantPayments = mockPayments.filter(p => p.tenantId === foundTenant.id);
        setPayments(tenantPayments);
        
        // Find notes
        const tenantNotes = mockNotes.filter(n => n.tenantId === foundTenant.id);
        setNotes(tenantNotes);
      }
      
      setLoading(false);
    }, 500); // Simulate 500ms loading
  }, [params.id]);

  // Calculate stats
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const overduePayments = payments.filter(p => p.status === 'overdue');
  const paidPayments = payments.filter(p => p.status === 'paid');
  
  const statusIcons = {
    paid: <CheckCircle className="w-4 h-4 text-green-500" />,
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    overdue: <AlertCircle className="w-4 h-4 text-red-500" />
  };

  const statusColors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800'
  };

  const noteTypeColors = {
    maintenance: 'bg-yellow-50 border-l-4 border-yellow-500',
    comment: 'bg-blue-50 border-l-4 border-blue-500',
    reminder: 'bg-purple-50 border-l-4 border-purple-500'
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tenant Not Found</h2>
          <p className="text-gray-600 mb-6">The tenant you're looking for doesn't exist in our demo data.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/tenants')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Tenants
            </button>
            <button
              onClick={() => router.push('/tenants/101')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              View Demo Tenant
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/tenants')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tenant Details</h1>
            <p className="text-gray-600 text-sm md:text-base">View and manage tenant information</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={showBackendToast}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={showBackendToast}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Tenant</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tenant Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tenant Profile Card */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">{tenant.name}</h2>
                    <p className="text-gray-600 text-sm">Tenant ID: {tenant.id}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600 capitalize">{tenant.status}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Active Tenant
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      On-Time Payer
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{tenant.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{tenant.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Occupation</p>
                      <p className="font-medium">{tenant.occupation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Rent Due Day</p>
                      <p className="font-medium">Day {tenant.rentDueDay} each month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={showBackendToast}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                >
                  <DollarSign className="w-4 h-4" />
                  Record Payment
                </button>
                <button
                  onClick={showBackendToast}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
                <button
                  onClick={showBackendToast}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Generate Invoice
                </button>
                <button
                  onClick={showBackendToast}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  Report Issue
                </button>
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Property Information</h2>
              {property && (
                <button
                  onClick={showBackendToast}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  View Full Details →
                </button>
              )}
            </div>
            
            {property ? (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Building className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{property.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-600 text-sm">{property.address}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        property.status === 'occupied' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <p className="text-sm text-gray-500">Monthly Rent</p>
                        <p className="text-xl font-bold text-gray-800">${property.rentAmount.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center justify-center gap-1">
                          <Bed className="w-4 h-4 text-gray-500" />
                          <p className="text-sm text-gray-500">Bedrooms</p>
                        </div>
                        <p className="text-xl font-bold text-gray-800">{property.bedrooms}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <p className="text-sm text-gray-500">Bathrooms</p>
                        <p className="text-xl font-bold text-gray-800">{property.bathrooms}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <p className="text-sm text-gray-500">Square Feet</p>
                        <p className="text-xl font-bold text-gray-800">{property.squareFeet.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {property.amenities && property.amenities.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-2">
                          {property.amenities.map((amenity, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No property assigned to this tenant</p>
                <button
                  onClick={showBackendToast}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign Property
                </button>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800">Payment History</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={showBackendToast}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={showBackendToast}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <DollarSign className="w-4 h-4" />
                  New Payment
                </button>
              </div>
            </div>
            
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Month</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Method</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{payment.month}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-bold text-gray-800">${payment.amount.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="capitalize">{payment.method?.replace('_', ' ') || 'Not specified'}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {statusIcons[payment.status]}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[payment.status]}`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={showBackendToast}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Receipt
                            </button>
                            <button
                              onClick={showBackendToast}
                              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No payment history found for this tenant</p>
                <button
                  onClick={showBackendToast}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Record First Payment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Details */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Stats</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Paid</p>
                <p className="text-2xl font-bold text-blue-700">${totalPaid.toLocaleString()}</p>
                <p className="text-xs text-blue-500 mt-1">All time payments</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Paid</p>
                  <p className="text-xl font-bold text-green-700">{paidPayments.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">Pending</p>
                  <p className="text-xl font-bold text-yellow-700">{pendingPayments.length}</p>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">On-Time Rate</p>
                <p className="text-2xl font-bold text-purple-700">
                  {payments.length > 0 ? Math.round((paidPayments.length / payments.length) * 100) : 0}%
                </p>
                <p className="text-xs text-purple-500 mt-1">Based on {payments.length} payments</p>
              </div>
            </div>
          </div>

          {/* Lease Details */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Lease Details</h2>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Lease Duration</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-medium">{new Date(tenant.leaseStart).toLocaleDateString()}</p>
                  <span className="text-gray-400">→</span>
                  <p className="font-medium">{new Date(tenant.leaseEnd).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Rent Amount</p>
                  <p className="text-lg font-bold text-gray-800">${tenant.rentAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Deposit</p>
                  <p className="text-lg font-bold text-gray-800">${tenant.securityDeposit?.toLocaleString() || '0'}</p>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Time Remaining</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-medium text-green-600">
                    {Math.max(0, Math.floor((new Date(tenant.leaseEnd) - new Date()) / (1000 * 60 * 60 * 24)))} days
                  </p>
                  <span className="text-xs text-gray-500">
                    {Math.max(0, Math.floor((new Date(tenant.leaseEnd) - new Date()) / (1000 * 60 * 60 * 24 * 30.44)))} months
                  </span>
                </div>
              </div>
              
              <button
                onClick={showBackendToast}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <FileText className="w-5 h-5" />
                View Lease Agreement
              </button>
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Upcoming</h2>
            <div className="space-y-4">
              {pendingPayments.slice(0, 2).map((payment) => (
                <div key={payment.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium">{payment.month}</span>
                    </div>
                    <span className="font-bold">${payment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Due: Day {tenant.rentDueDay}</span>
                    <button
                      onClick={showBackendToast}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mark Paid
                    </button>
                  </div>
                </div>
              ))}
              
              {pendingPayments.length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-500">No pending payments</p>
                </div>
              )}
              
              <button
                onClick={showBackendToast}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors text-sm"
              >
                Record New Payment
              </button>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Notes & Activity</h2>
              <button
                onClick={showBackendToast}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                + Add Note
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <div key={note.id} className={`p-3 rounded-lg ${noteTypeColors[note.type]}`}>
                    <p className="text-sm text-gray-700">{note.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{note.author}</span>
                      <span className="text-xs text-gray-500">{new Date(note.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No notes yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-800">Demo Mode Active</h3>
            <p className="text-blue-700 text-sm">
              This is a client-side demo. All data is hardcoded. Click any action button to see backend integration notifications.
            </p>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => router.push('/tenants/101')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                View Tenant 101
              </button>
              <button
                onClick={() => router.push('/tenants/102')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                View Tenant 102
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}