// app/dashboard/tenants/components/TenantDetailsModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { 
  X, User, Mail, Phone, Calendar, DollarSign, Home, 
  MapPin, Edit, Trash2, Building, FileText, CreditCard, 
  AlertCircle, Clock, Save, Download, Send, MessageSquare,
  Shield, ExternalLink, Upload, Image, CheckCircle, Eye,
  Users, Wallet, Receipt, History, Key, Smartphone, Globe,
  Briefcase, Map, Star, Flag, Package, Wifi, Car, Dog, Cat,
  Plus, Filter, ChevronLeft, ChevronRight, BarChart,
  TrendingUp, TrendingDown, CalendarDays, Banknote,
  ReceiptText, DollarSign as DollarSignIcon,
  CheckSquare, Clock3, AlertTriangle, ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TenantDetailsModal({ 
  tenant, 
  property,
  onClose, 
  onUpdate,
  onDelete,
  mode = 'view'
}) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(mode === 'edit');
  const [formData, setFormData] = useState(tenant);
  const [payments, setPayments] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState({});
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [paymentForm, setPaymentForm] = useState({
    amount: tenant?.lease?.monthlyRent || '',
    paymentDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentMethod: 'bank_transfer',
    status: 'paid',
    month: '',
    year: new Date().getFullYear(),
    notes: '',
    receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
    lateFee: 0
  });
  
  console.log(tenant._id);

  useEffect(() => {
    setFormData(tenant);
    if (tenant?._id && activeTab === 'payments') {
      fetchPayments();
    }
  }, [tenant, activeTab]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'lease', label: 'Lease Details', icon: FileText },
    { id: 'financial', label: 'Financial', icon: CreditCard },
    { id: 'payments', label: 'Payments', icon: Receipt },
    { id: 'emergency', label: 'Emergency', icon: AlertCircle },
    { id: 'documents', label: 'Documents', icon: Shield },
    { id: 'history', label: 'History', icon: History }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
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

  const calculateDaysUntil = (dateString) => {
    if (!dateString) return null;
    const target = new Date(dateString);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Payment functions
  const fetchPayments = async () => {
    if (!tenant?._id) return;
    
    try {
      setLoadingPayments(true);
      const response = await fetch(`/api/tenants/${tenant._id}/payments`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        setPaymentHistory(data.paymentHistory || {});
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoadingPayments(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/tenants/${tenant._id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Payment added successfully');
        setShowAddPayment(false);
        fetchPayments();
        // Reset form
        setPaymentForm({
          amount: tenant?.lease?.monthlyRent || '',
          paymentDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          paymentMethod: 'bank_transfer',
          status: 'paid',
          month: '',
          year: new Date().getFullYear(),
          notes: '',
          receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
          lateFee: 0
        });
      } else {
        throw new Error('Failed to add payment');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deletePayment = async (paymentId) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    
    try {
      const response = await fetch(`/api/tenants/${tenant._id}/payments/${paymentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Payment deleted successfully');
        fetchPayments();
      } else {
        throw new Error('Failed to delete payment');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const exportPaymentsCSV = () => {
    const headers = ['Date', 'Month', 'Amount', 'Method', 'Status', 'Receipt No', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...payments.map(p => [
        new Date(p.paymentDate).toLocaleDateString(),
        p.month,
        p.amount,
        p.paymentMethod,
        p.status,
        p.receiptNumber,
        `"${p.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tenant.personalInfo?.fullName}_payments.csv`;
    a.click();
  };

  const filteredPayments = payments.filter(payment => {
    if (paymentFilter === 'all') return true;
    return payment.status === paymentFilter;
  });

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock3 className="w-4 h-4 text-yellow-500" />;
      case 'late':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'bank_transfer':
        return <Banknote className="w-4 h-4" />;
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'cash':
        return <DollarSignIcon className="w-4 h-4" />;
      case 'check':
        return <ReceiptText className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  // Existing form handling functions
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value
      }
    }));
  };

  const handleLeaseChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      lease: {
        ...prev.lease,
        [name]: value
      }
    }));
  };

  const handleUpdate = async () => {
    console.log('update btn click', tenant._id);
    try {
      setLoading(true);
      const id = tenant._id;
      console.log('tenant id', id);
      const res = await fetch(`/api/tenants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update tenant');
      }

      toast.success('Tenant updated successfully');
      onUpdate(data.tenant);
      setEditMode(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tenant? All associated data will be removed.')) {
      return;
    }

    try {
      setLoading(true);
      await onDelete(tenant._id);
      toast.success('Tenant deleted successfully');
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== START: AddPaymentModal Component =====
  const AddPaymentModal = () => {
    // Get previous 12 months
    const getPrevious12Months = () => {
      const months = [];
      const currentDate = new Date();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(currentDate.getMonth() - i);
        
        const monthName = monthNames[date.getMonth()];
        const year = date.getFullYear();
        
        months.push({
          value: `${monthName} ${year}`,
          label: `${monthName} ${year}`,
          monthNumber: date.getMonth() + 1,
          year: year,
          date: new Date(date) // Store the date object for reference
        });
      }
      
      return months;
    };

    const previousMonths = getPrevious12Months();

    // Initialize month selection when modal opens
    useEffect(() => {
      if (previousMonths.length > 0 && !paymentForm.month) {
        const currentMonth = previousMonths[0]; // First one is current month
        setPaymentForm(prev => ({
          ...prev,
          month: currentMonth.value,
          year: currentMonth.year
        }));
      }
    }, []);

    const handleMonthChange = (e) => {
      const selectedMonthValue = e.target.value;
      const selectedMonthData = previousMonths.find(m => m.value === selectedMonthValue);
      
      if (selectedMonthData) {
        setPaymentForm(prev => ({
          ...prev,
          month: selectedMonthData.value,
          year: selectedMonthData.year
        }));
      }
    };

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div 
          className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
              <p className="text-sm text-gray-600">Add a new payment record</p>
            </div>
            <button
              onClick={() => setShowAddPayment(false)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Month <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={paymentForm.month}
                  onChange={handleMonthChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Month</option>
                  {previousMonths.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online Payment</option>
                  <option value="credit_card">Credit Card</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={paymentForm.status}
                  onChange={(e) => setPaymentForm({...paymentForm, status: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="late">Late</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Late Fee (Optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentForm.lateFee}
                  onChange={(e) => setPaymentForm({...paymentForm, lateFee: e.target.value})}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Add any additional notes about this payment..."
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => setShowAddPayment(false)}
                className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-sm"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  // ===== END: AddPaymentModal Component =====

  // Rest of the render functions remain the same...
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Status & Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Lease Status</h4>
            <span className={`px-2 py-1 text-xs rounded-full ${
              tenant.lease?.status === 'active' ? 'bg-green-100 text-green-800' :
              tenant.lease?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {tenant.lease?.status?.toUpperCase() || 'N/A'}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(tenant.lease?.monthlyRent)}
          </div>
          <div className="text-sm text-gray-500">Monthly Rent</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Balance</h4>
            <AlertCircle className="w-4 h-4 text-gray-400" />
          </div>
          <div className={`text-2xl font-bold ${
            (tenant.financial?.currentBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {formatCurrency(tenant.financial?.currentBalance)}
          </div>
          <div className="text-sm text-gray-500">Current Balance</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Next Payment</h4>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formatDate(tenant.financial?.nextPaymentDue)}
          </div>
          <div className="text-sm text-gray-500">
            {(() => {
              const days = calculateDaysUntil(tenant.financial?.nextPaymentDue);
              if (days === null) return 'No date set';
              if (days < 0) return `${Math.abs(days)} days overdue`;
              if (days === 0) return 'Due today';
              return `In ${days} days`;
            })()}
          </div>
        </div>
      </div>

      {/* Property Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Current Property</h4>
          <Home className="w-5 h-5 text-blue-600" />
        </div>
        {property ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-medium">{property.name}</span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {property.type}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {property.address?.street}, {property.address?.city}, {property.address?.state} {property.address?.zipCode}
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-500">Unit: </span>
                <span className="font-medium">{tenant.unit || 'N/A'}</span>
              </div>
              <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <ExternalLink className="w-4 h-4" />
                View Property
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">No property assigned</p>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium text-gray-900">{tenant.personalInfo?.email || 'N/A'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="font-medium text-gray-900">{tenant.personalInfo?.phone || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
          <Send className="w-6 h-6 text-blue-600 mb-2" />
          <span className="text-sm font-medium">Send Message</span>
        </button>
        <button 
          onClick={() => {
            setActiveTab('payments');
            setShowAddPayment(true);
          }}
          className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <Receipt className="w-6 h-6 text-green-600 mb-2" />
          <span className="text-sm font-medium">Record Payment</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
          <FileText className="w-6 h-6 text-purple-600 mb-2" />
          <span className="text-sm font-medium">View Lease</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
          <MessageSquare className="w-6 h-6 text-orange-600 mb-2" />
          <span className="text-sm font-medium">Send Reminder</span>
        </button>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            {editMode ? (
              <input
                type="text"
                name="fullName"
                value={formData.personalInfo?.fullName || ''}
                onChange={handlePersonalInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <p className="text-gray-900">{tenant.personalInfo?.fullName || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            {editMode ? (
              <input
                type="email"
                name="email"
                value={formData.personalInfo?.email || ''}
                onChange={handlePersonalInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{tenant.personalInfo?.email || 'N/A'}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            {editMode ? (
              <input
                type="tel"
                name="phone"
                value={formData.personalInfo?.phone || ''}
                onChange={handlePersonalInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{tenant.personalInfo?.phone || 'N/A'}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            {editMode ? (
              <input
                type="date"
                name="dateOfBirth"
                value={formData.personalInfo?.dateOfBirth ? new Date(formData.personalInfo.dateOfBirth).toISOString().split('T')[0] : ''}
                onChange={handlePersonalInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{formatDate(tenant.personalInfo?.dateOfBirth)}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
            {editMode ? (
              <input
                type="text"
                name="occupation"
                value={formData.personalInfo?.occupation || ''}
                onChange={handlePersonalInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{tenant.personalInfo?.occupation || 'N/A'}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employer</label>
            {editMode ? (
              <input
                type="text"
                name="employer"
                value={formData.personalInfo?.employer || ''}
                onChange={handlePersonalInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <p className="text-gray-900">{tenant.personalInfo?.employer || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeaseDetails = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-medium text-gray-900">Lease Information</h4>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {tenant.lease?.leaseType || 'Standard Lease'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lease Start Date</label>
            {editMode ? (
              <input
                type="date"
                name="startDate"
                value={formData.lease?.startDate ? new Date(formData.lease.startDate).toISOString().split('T')[0] : ''}
                onChange={handleLeaseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{formatDate(tenant.lease?.startDate)}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lease End Date</label>
            {editMode ? (
              <input
                type="date"
                name="endDate"
                value={formData.lease?.endDate ? new Date(formData.lease.endDate).toISOString().split('T')[0] : ''}
                onChange={handleLeaseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{formatDate(tenant.lease?.endDate)}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent</label>
            {editMode ? (
              <input
                type="number"
                name="monthlyRent"
                value={formData.lease?.monthlyRent || ''}
                onChange={handleLeaseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900 font-medium">{formatCurrency(tenant.lease?.monthlyRent)}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit</label>
            {editMode ? (
              <input
                type="number"
                name="securityDeposit"
                value={formData.lease?.securityDeposit || ''}
                onChange={handleLeaseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{formatCurrency(tenant.lease?.securityDeposit)}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lease Status</label>
            {editMode ? (
              <select
                name="status"
                value={formData.lease?.status || ''}
                onChange={handleLeaseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                tenant.lease?.status === 'active' ? 'bg-green-100 text-green-800' :
                tenant.lease?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {tenant.lease?.status?.toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Day</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="text-gray-900">Day {tenant.lease?.paymentDay || '1'} of each month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pets & Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Dog className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Pets</h4>
          </div>
          {tenant.personalInfo?.pets?.length > 0 ? (
            <div className="space-y-2">
              {tenant.personalInfo.pets.map((pet, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{pet.type}: {pet.name}</span>
                  <span className="text-sm text-gray-500">{pet.breed}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No pets registered</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Vehicles</h4>
          </div>
          {tenant.personalInfo?.vehicles?.length > 0 ? (
            <div className="space-y-2">
              {tenant.personalInfo.vehicles.map((vehicle, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                  <span className="text-sm text-gray-500">{vehicle.licensePlate}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No vehicles registered</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-green-800">Total Received</h4>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(paymentHistory.totalPaid || 0)}
          </div>
          <div className="text-sm text-green-700">All-time total</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-800">This Month</h4>
            <CalendarDays className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(payments
              .filter(p => {
                const paymentDate = new Date(p.paymentDate);
                const now = new Date();
                return paymentDate.getMonth() === now.getMonth() && 
                       paymentDate.getFullYear() === now.getFullYear() &&
                       p.status === 'paid';
              })
              .reduce((sum, p) => sum + p.amount, 0)
            )}
          </div>
          <div className="text-sm text-blue-700">Current month</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-yellow-800">Balance Due</h4>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-900">
            {formatCurrency(tenant.financial?.currentBalance || 0)}
          </div>
          <div className="text-sm text-yellow-700">Current balance</div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800">Total Payments</h4>
            <BarChart className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {payments.length}
          </div>
          <div className="text-sm text-gray-700">All payments</div>
        </div>
      </div>

      {/* Payment Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAddPayment(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Payment
          </button>
          <button
            onClick={exportPaymentsCSV}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => {
              const amount = tenant.lease?.monthlyRent || tenant.financial?.currentBalance || 0;
              if (amount > 0) {
                setPaymentForm(prev => ({ ...prev, amount }));
                setShowAddPayment(true);
              } else {
                toast.error('No amount to record');
              }
            }}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 shadow-sm"
          >
            <DollarSignIcon className="w-4 h-4 mr-2" />
            Record Full Rent
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="late">Late</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loadingPayments ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600">Loading payment history...</p>
          </div>
        ) : filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{payment.month}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </span>
                        {payment.lateFee > 0 && (
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                            +{formatCurrency(payment.lateFee)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className="text-sm text-gray-900 capitalize">
                          {payment.paymentMethod.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getPaymentStatusIcon(payment.status)}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          payment.status === 'late' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-mono">
                        {payment.receiptNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            toast.success(`Viewing payment ${payment.receiptNumber}`);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => deletePayment(payment._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {paymentFilter !== 'all' 
                ? 'No payments match the current filter'
                : 'Start by recording your first payment'
              }
            </p>
            <button
              onClick={() => setShowAddPayment(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Record First Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderFinancial = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Balance</label>
            <div className={`text-3xl font-bold ${
              (tenant.financial?.currentBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {formatCurrency(tenant.financial?.currentBalance)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="font-medium">{tenant.financial?.paymentMethod || 'Not specified'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmergency = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h4>
      <div className="text-gray-500 text-center py-8">
        Emergency contact information not available.
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Documents</h4>
      <div className="text-gray-500 text-center py-8">
        No documents uploaded yet.
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Activity History</h4>
      <div className="text-gray-500 text-center py-8">
        No activity history available.
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'personal':
        return renderPersonalInfo();
      case 'lease':
        return renderLeaseDetails();
      case 'financial':
        return renderFinancial();
      case 'payments':
        return renderPayments();
      case 'emergency':
        return renderEmergency();
      case 'documents':
        return renderDocuments();
      case 'history':
        return renderHistory();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div 
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {tenant.personalInfo?.fullName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      {tenant.personalInfo?.email}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">
                      {tenant.unit || 'No Unit'} • {property?.name || 'No Property'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex space-x-4 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 inline mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {renderTabContent()}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Tenant ID:</span> {tenant._id}
                <span className="mx-2">•</span>
                <span>Created: {formatDate(tenant.createdAt)}</span>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('payments');
                    setShowAddPayment(true);
                  }}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Modal */}
      {showAddPayment && <AddPaymentModal />}
    </div>
  );
}


// // app/dashboard/tenants/components/TenantDetailsModal.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { 
//   X, User, Mail, Phone, Calendar, DollarSign, Home, 
//   MapPin, Edit, Trash2, Building, FileText, CreditCard, 
//   AlertCircle, Clock, Save, Download, Send, MessageSquare,
//   Shield, ExternalLink, Upload, Image, CheckCircle, Eye,
//   Users, Wallet, Receipt, History, Key, Smartphone, Globe,
//   Briefcase, Map, Star, Flag, Package, Wifi, Car, Dog, Cat,
//   Plus, Filter, ChevronLeft, ChevronRight, BarChart,
//   TrendingUp, TrendingDown, CalendarDays, Banknote,
//   ReceiptText, DollarSign as DollarSignIcon,
//   CheckSquare, Clock3, AlertTriangle, ArrowUpRight,
//   ArrowDownRight
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// export default function TenantDetailsModal({ 
//   tenant, 
//   property,
//   onClose, 
//   onUpdate,
//   onDelete,
//   mode = 'view'
// }) {
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [editMode, setEditMode] = useState(mode === 'edit');
//   const [formData, setFormData] = useState(tenant);
//   const [payments, setPayments] = useState([]);
//   const [paymentHistory, setPaymentHistory] = useState({});
//   const [loadingPayments, setLoadingPayments] = useState(false);
//   const [showAddPayment, setShowAddPayment] = useState(false);
//   const [paymentFilter, setPaymentFilter] = useState('all');
//   const [paymentForm, setPaymentForm] = useState({
//     amount: tenant?.lease?.monthlyRent || '',
//     paymentDate: new Date().toISOString().split('T')[0],
//     dueDate: '',
//     paymentMethod: 'bank_transfer',
//     status: 'paid',
//     month: '',
//     year: new Date().getFullYear(),
//     notes: '',
//     receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
//     lateFee: 0
//   });
  
//   console.log(tenant._id);

//   useEffect(() => {
//     setFormData(tenant);
//     if (tenant?._id && activeTab === 'payments') {
//       fetchPayments();
//     }
//   }, [tenant, activeTab]);

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: User },
//     { id: 'personal', label: 'Personal Info', icon: User },
//     { id: 'lease', label: 'Lease Details', icon: FileText },
//     { id: 'financial', label: 'Financial', icon: CreditCard },
//     { id: 'payments', label: 'Payments', icon: Receipt },
//     { id: 'emergency', label: 'Emergency', icon: AlertCircle },
//     { id: 'documents', label: 'Documents', icon: Shield },
//     { id: 'history', label: 'History', icon: History }
//   ];

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not set';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const formatCurrency = (amount) => {
//     if (!amount) return '$0.00';
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD'
//     }).format(amount);
//   };

//   const calculateDaysUntil = (dateString) => {
//     if (!dateString) return null;
//     const target = new Date(dateString);
//     const today = new Date();
//     const diffTime = target - today;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
//   };

//   // Payment functions
//   const fetchPayments = async () => {
//     if (!tenant?._id) return;
    
//     try {
//       setLoadingPayments(true);
//       const response = await fetch(`/api/tenants/${tenant._id}/payments`);
//       if (response.ok) {
//         const data = await response.json();
//         setPayments(data.payments || []);
//         setPaymentHistory(data.paymentHistory || {});
//       }
//     } catch (error) {
//       console.error('Error fetching payments:', error);
//       toast.error('Failed to load payments');
//     } finally {
//       setLoadingPayments(false);
//     }
//   };

//   const handlePaymentSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`/api/tenants/${tenant._id}/payments`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(paymentForm)
//       });

//       if (response.ok) {
//         const data = await response.json();
//         toast.success('Payment added successfully');
//         setShowAddPayment(false);
//         fetchPayments();
//         // Reset form
//         setPaymentForm({
//           amount: tenant?.lease?.monthlyRent || '',
//           paymentDate: new Date().toISOString().split('T')[0],
//           dueDate: '',
//           paymentMethod: 'bank_transfer',
//           status: 'paid',
//           month: '',
//           year: new Date().getFullYear(),
//           notes: '',
//           receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
//           lateFee: 0
//         });
//       } else {
//         throw new Error('Failed to add payment');
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const deletePayment = async (paymentId) => {
//     if (!confirm('Are you sure you want to delete this payment?')) return;
    
//     try {
//       const response = await fetch(`/api/tenants/${tenant._id}/payments/${paymentId}`, {
//         method: 'DELETE'
//       });

//       if (response.ok) {
//         toast.success('Payment deleted successfully');
//         fetchPayments();
//       } else {
//         throw new Error('Failed to delete payment');
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const exportPaymentsCSV = () => {
//     const headers = ['Date', 'Month', 'Amount', 'Method', 'Status', 'Receipt No', 'Notes'];
//     const csvContent = [
//       headers.join(','),
//       ...payments.map(p => [
//         new Date(p.paymentDate).toLocaleDateString(),
//         p.month,
//         p.amount,
//         p.paymentMethod,
//         p.status,
//         p.receiptNumber,
//         `"${p.notes || ''}"`
//       ].join(','))
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `${tenant.personalInfo?.fullName}_payments.csv`;
//     a.click();
//   };

//   const filteredPayments = payments.filter(payment => {
//     if (paymentFilter === 'all') return true;
//     return payment.status === paymentFilter;
//   });

//   const getPaymentStatusIcon = (status) => {
//     switch (status) {
//       case 'paid':
//         return <CheckSquare className="w-4 h-4 text-green-500" />;
//       case 'pending':
//         return <Clock3 className="w-4 h-4 text-yellow-500" />;
//       case 'late':
//         return <AlertTriangle className="w-4 h-4 text-red-500" />;
//       default:
//         return null;
//     }
//   };

//   const getPaymentMethodIcon = (method) => {
//     switch (method) {
//       case 'bank_transfer':
//         return <Banknote className="w-4 h-4" />;
//       case 'credit_card':
//         return <CreditCard className="w-4 h-4" />;
//       case 'cash':
//         return <DollarSignIcon className="w-4 h-4" />;
//       case 'check':
//         return <ReceiptText className="w-4 h-4" />;
//       default:
//         return <CreditCard className="w-4 h-4" />;
//     }
//   };

//   // Existing form handling functions
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handlePersonalInfoChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       personalInfo: {
//         ...prev.personalInfo,
//         [name]: value
//       }
//     }));
//   };

//   const handleLeaseChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       lease: {
//         ...prev.lease,
//         [name]: value
//       }
//     }));
//   };

//   const handleUpdate = async () => {
//     console.log('update btn click', tenant._id);
//     try {
//       setLoading(true);
//       const id = tenant._id;
//       console.log('tenant id', id);
//       const res = await fetch(`/api/tenants/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Failed to update tenant');
//       }

//       toast.success('Tenant updated successfully');
//       onUpdate(data.tenant);
//       setEditMode(false);
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!confirm('Are you sure you want to delete this tenant? All associated data will be removed.')) {
//       return;
//     }

//     try {
//       setLoading(true);
//       await onDelete(tenant._id);
//       toast.success('Tenant deleted successfully');
//       onClose();
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Render functions
//   const renderOverview = () => (
//     <div className="space-y-6">
//       {/* Status & Quick Info */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white border border-gray-200 rounded-xl p-4">
//           <div className="flex items-center justify-between mb-2">
//             <h4 className="font-medium text-gray-900">Lease Status</h4>
//             <span className={`px-2 py-1 text-xs rounded-full ${
//               tenant.lease?.status === 'active' ? 'bg-green-100 text-green-800' :
//               tenant.lease?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//               'bg-red-100 text-red-800'
//             }`}>
//               {tenant.lease?.status?.toUpperCase() || 'N/A'}
//             </span>
//           </div>
//           <div className="text-2xl font-bold text-gray-900">
//             {formatCurrency(tenant.lease?.monthlyRent)}
//           </div>
//           <div className="text-sm text-gray-500">Monthly Rent</div>
//         </div>

//         <div className="bg-white border border-gray-200 rounded-xl p-4">
//           <div className="flex items-center justify-between mb-2">
//             <h4 className="font-medium text-gray-900">Balance</h4>
//             <AlertCircle className="w-4 h-4 text-gray-400" />
//           </div>
//           <div className={`text-2xl font-bold ${
//             (tenant.financial?.currentBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'
//           }`}>
//             {formatCurrency(tenant.financial?.currentBalance)}
//           </div>
//           <div className="text-sm text-gray-500">Current Balance</div>
//         </div>

//         <div className="bg-white border border-gray-200 rounded-xl p-4">
//           <div className="flex items-center justify-between mb-2">
//             <h4 className="font-medium text-gray-900">Next Payment</h4>
//             <Calendar className="w-4 h-4 text-gray-400" />
//           </div>
//           <div className="text-lg font-bold text-gray-900">
//             {formatDate(tenant.financial?.nextPaymentDue)}
//           </div>
//           <div className="text-sm text-gray-500">
//             {(() => {
//               const days = calculateDaysUntil(tenant.financial?.nextPaymentDue);
//               if (days === null) return 'No date set';
//               if (days < 0) return `${Math.abs(days)} days overdue`;
//               if (days === 0) return 'Due today';
//               return `In ${days} days`;
//             })()}
//           </div>
//         </div>
//       </div>

//       {/* Property Info Card */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
//         <div className="flex items-center justify-between mb-3">
//           <h4 className="font-medium text-gray-900">Current Property</h4>
//           <Home className="w-5 h-5 text-blue-600" />
//         </div>
//         {property ? (
//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <span className="text-gray-900 font-medium">{property.name}</span>
//               <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
//                 {property.type}
//               </span>
//             </div>
//             <div className="text-sm text-gray-600">
//               {property.address?.street}, {property.address?.city}, {property.address?.state} {property.address?.zipCode}
//             </div>
//             <div className="flex items-center justify-between text-sm">
//               <div>
//                 <span className="text-gray-500">Unit: </span>
//                 <span className="font-medium">{tenant.unit || 'N/A'}</span>
//               </div>
//               <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
//                 <ExternalLink className="w-4 h-4" />
//                 View Property
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="text-center py-4">
//             <Home className="w-12 h-12 text-gray-300 mx-auto mb-2" />
//             <p className="text-gray-600">No property assigned</p>
//           </div>
//         )}
//       </div>

//       {/* Contact Information */}
//       <div className="bg-white border border-gray-200 rounded-xl p-4">
//         <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-50 rounded-lg">
//               <Mail className="w-4 h-4 text-blue-600" />
//             </div>
//             <div>
//               <div className="text-sm text-gray-500">Email</div>
//               <div className="font-medium text-gray-900">{tenant.personalInfo?.email || 'N/A'}</div>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-green-50 rounded-lg">
//               <Phone className="w-4 h-4 text-green-600" />
//             </div>
//             <div>
//               <div className="text-sm text-gray-500">Phone</div>
//               <div className="font-medium text-gray-900">{tenant.personalInfo?.phone || 'N/A'}</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//         <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
//           <Send className="w-6 h-6 text-blue-600 mb-2" />
//           <span className="text-sm font-medium">Send Message</span>
//         </button>
//         <button 
//           onClick={() => {
//             setActiveTab('payments');
//             setShowAddPayment(true);
//           }}
//           className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50"
//         >
//           <Receipt className="w-6 h-6 text-green-600 mb-2" />
//           <span className="text-sm font-medium">Record Payment</span>
//         </button>
//         <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
//           <FileText className="w-6 h-6 text-purple-600 mb-2" />
//           <span className="text-sm font-medium">View Lease</span>
//         </button>
//         <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
//           <MessageSquare className="w-6 h-6 text-orange-600 mb-2" />
//           <span className="text-sm font-medium">Send Reminder</span>
//         </button>
//       </div>
//     </div>
//   );

//   const renderPersonalInfo = () => (
//     <div className="space-y-6">
//       <div className="bg-white border border-gray-200 rounded-xl p-6">
//         <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Details</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
//             {editMode ? (
//               <input
//                 type="text"
//                 name="fullName"
//                 value={formData.personalInfo?.fullName || ''}
//                 onChange={handlePersonalInfoChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <p className="text-gray-900">{tenant.personalInfo?.fullName || 'N/A'}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
//             {editMode ? (
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.personalInfo?.email || ''}
//                 onChange={handlePersonalInfoChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Mail className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{tenant.personalInfo?.email || 'N/A'}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
//             {editMode ? (
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.personalInfo?.phone || ''}
//                 onChange={handlePersonalInfoChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Phone className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{tenant.personalInfo?.phone || 'N/A'}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
//             {editMode ? (
//               <input
//                 type="date"
//                 name="dateOfBirth"
//                 value={formData.personalInfo?.dateOfBirth ? new Date(formData.personalInfo.dateOfBirth).toISOString().split('T')[0] : ''}
//                 onChange={handlePersonalInfoChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Calendar className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{formatDate(tenant.personalInfo?.dateOfBirth)}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
//             {editMode ? (
//               <input
//                 type="text"
//                 name="occupation"
//                 value={formData.personalInfo?.occupation || ''}
//                 onChange={handlePersonalInfoChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Briefcase className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{tenant.personalInfo?.occupation || 'N/A'}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Employer</label>
//             {editMode ? (
//               <input
//                 type="text"
//                 name="employer"
//                 value={formData.personalInfo?.employer || ''}
//                 onChange={handlePersonalInfoChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <p className="text-gray-900">{tenant.personalInfo?.employer || 'N/A'}</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderLeaseDetails = () => (
//     <div className="space-y-6">
//       <div className="bg-white border border-gray-200 rounded-xl p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h4 className="text-lg font-medium text-gray-900">Lease Information</h4>
//           <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
//             {tenant.lease?.leaseType || 'Standard Lease'}
//           </span>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Lease Start Date</label>
//             {editMode ? (
//               <input
//                 type="date"
//                 name="startDate"
//                 value={formData.lease?.startDate ? new Date(formData.lease.startDate).toISOString().split('T')[0] : ''}
//                 onChange={handleLeaseChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Calendar className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{formatDate(tenant.lease?.startDate)}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Lease End Date</label>
//             {editMode ? (
//               <input
//                 type="date"
//                 name="endDate"
//                 value={formData.lease?.endDate ? new Date(formData.lease.endDate).toISOString().split('T')[0] : ''}
//                 onChange={handleLeaseChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Calendar className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{formatDate(tenant.lease?.endDate)}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent</label>
//             {editMode ? (
//               <input
//                 type="number"
//                 name="monthlyRent"
//                 value={formData.lease?.monthlyRent || ''}
//                 onChange={handleLeaseChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <DollarSign className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900 font-medium">{formatCurrency(tenant.lease?.monthlyRent)}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit</label>
//             {editMode ? (
//               <input
//                 type="number"
//                 name="securityDeposit"
//                 value={formData.lease?.securityDeposit || ''}
//                 onChange={handleLeaseChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Shield className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{formatCurrency(tenant.lease?.securityDeposit)}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Lease Status</label>
//             {editMode ? (
//               <select
//                 name="status"
//                 value={formData.lease?.status || ''}
//                 onChange={handleLeaseChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               >
//                 <option value="active">Active</option>
//                 <option value="pending">Pending</option>
//                 <option value="expired">Expired</option>
//                 <option value="terminated">Terminated</option>
//               </select>
//             ) : (
//               <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                 tenant.lease?.status === 'active' ? 'bg-green-100 text-green-800' :
//                 tenant.lease?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                 'bg-red-100 text-red-800'
//               }`}>
//                 {tenant.lease?.status?.toUpperCase()}
//               </span>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Payment Day</label>
//             <div className="flex items-center gap-2">
//               <Calendar className="w-4 h-4 text-gray-400" />
//               <p className="text-gray-900">Day {tenant.lease?.paymentDay || '1'} of each month</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Pets & Vehicles */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white border border-gray-200 rounded-xl p-6">
//           <div className="flex items-center gap-2 mb-4">
//             <Dog className="w-5 h-5 text-gray-600" />
//             <h4 className="font-medium text-gray-900">Pets</h4>
//           </div>
//           {tenant.personalInfo?.pets?.length > 0 ? (
//             <div className="space-y-2">
//               {tenant.personalInfo.pets.map((pet, index) => (
//                 <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
//                   <span className="font-medium">{pet.type}: {pet.name}</span>
//                   <span className="text-sm text-gray-500">{pet.breed}</span>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-500 text-center py-4">No pets registered</p>
//           )}
//         </div>

//         <div className="bg-white border border-gray-200 rounded-xl p-6">
//           <div className="flex items-center gap-2 mb-4">
//             <Car className="w-5 h-5 text-gray-600" />
//             <h4 className="font-medium text-gray-900">Vehicles</h4>
//           </div>
//           {tenant.personalInfo?.vehicles?.length > 0 ? (
//             <div className="space-y-2">
//               {tenant.personalInfo.vehicles.map((vehicle, index) => (
//                 <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
//                   <span className="font-medium">{vehicle.make} {vehicle.model}</span>
//                   <span className="text-sm text-gray-500">{vehicle.licensePlate}</span>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-500 text-center py-4">No vehicles registered</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   const renderPayments = () => (
//     <div className="space-y-6">
//       {/* Payment Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
//           <div className="flex items-center justify-between mb-2">
//             <h4 className="font-medium text-green-800">Total Received</h4>
//             <TrendingUp className="w-5 h-5 text-green-600" />
//           </div>
//           <div className="text-2xl font-bold text-green-900">
//             {formatCurrency(paymentHistory.totalPaid || 0)}
//           </div>
//           <div className="text-sm text-green-700">All-time total</div>
//         </div>
        
//         <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
//           <div className="flex items-center justify-between mb-2">
//             <h4 className="font-medium text-blue-800">This Month</h4>
//             <CalendarDays className="w-5 h-5 text-blue-600" />
//           </div>
//           <div className="text-2xl font-bold text-blue-900">
//             {formatCurrency(payments
//               .filter(p => {
//                 const paymentDate = new Date(p.paymentDate);
//                 const now = new Date();
//                 return paymentDate.getMonth() === now.getMonth() && 
//                        paymentDate.getFullYear() === now.getFullYear() &&
//                        p.status === 'paid';
//               })
//               .reduce((sum, p) => sum + p.amount, 0)
//             )}
//           </div>
//           <div className="text-sm text-blue-700">Current month</div>
//         </div>
        
//         <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
//           <div className="flex items-center justify-between mb-2">
//             <h4 className="font-medium text-yellow-800">Balance Due</h4>
//             <AlertTriangle className="w-5 h-5 text-yellow-600" />
//           </div>
//           <div className="text-2xl font-bold text-yellow-900">
//             {formatCurrency(tenant.financial?.currentBalance || 0)}
//           </div>
//           <div className="text-sm text-yellow-700">Current balance</div>
//         </div>
        
//         <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
//           <div className="flex items-center justify-between mb-2">
//             <h4 className="font-medium text-gray-800">Total Payments</h4>
//             <BarChart className="w-5 h-5 text-gray-600" />
//           </div>
//           <div className="text-2xl font-bold text-gray-900">
//             {payments.length}
//           </div>
//           <div className="text-sm text-gray-700">All payments</div>
//         </div>
//       </div>

//       {/* Payment Actions */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div className="flex flex-wrap gap-3">
//           <button
//             onClick={() => setShowAddPayment(true)}
//             className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm"
//           >
//             <Plus className="w-4 h-4 mr-2" />
//             Add Payment
//           </button>
//           <button
//             onClick={exportPaymentsCSV}
//             className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
//           >
//             <Download className="w-4 h-4 mr-2" />
//             Export CSV
//           </button>
//           <button
//             onClick={() => {
//               const amount = tenant.lease?.monthlyRent || tenant.financial?.currentBalance || 0;
//               if (amount > 0) {
//                 setPaymentForm(prev => ({ ...prev, amount }));
//                 setShowAddPayment(true);
//               } else {
//                 toast.error('No amount to record');
//               }
//             }}
//             className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 shadow-sm"
//           >
//             <DollarSignIcon className="w-4 h-4 mr-2" />
//             Record Full Rent
//           </button>
//         </div>
        
//         <div className="flex items-center gap-3">
//           <Filter className="w-4 h-4 text-gray-400" />
//           <select
//             value={paymentFilter}
//             onChange={(e) => setPaymentFilter(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm"
//           >
//             <option value="all">All Payments</option>
//             <option value="paid">Paid</option>
//             <option value="pending">Pending</option>
//             <option value="late">Late</option>
//             <option value="partial">Partial</option>
//           </select>
//         </div>
//       </div>

//       {/* Payments List */}
//       <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
//         {loadingPayments ? (
//           <div className="p-8 text-center">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//             <p className="mt-3 text-gray-600">Loading payment history...</p>
//           </div>
//         ) : filteredPayments.length > 0 ? (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt No</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {filteredPayments.map((payment) => (
//                   <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">
//                         {new Date(payment.paymentDate).toLocaleDateString()}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900 font-medium">{payment.month}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-bold text-gray-900">
//                           {formatCurrency(payment.amount)}
//                         </span>
//                         {payment.lateFee > 0 && (
//                           <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
//                             +{formatCurrency(payment.lateFee)}
//                           </span>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center gap-2">
//                         {getPaymentMethodIcon(payment.paymentMethod)}
//                         <span className="text-sm text-gray-900 capitalize">
//                           {payment.paymentMethod.replace('_', ' ')}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center gap-2">
//                         {getPaymentStatusIcon(payment.status)}
//                         <span className={`text-xs font-medium px-2 py-1 rounded-full ${
//                           payment.status === 'paid' ? 'bg-green-100 text-green-800' :
//                           payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                           payment.status === 'late' ? 'bg-red-100 text-red-800' :
//                           'bg-blue-100 text-blue-800'
//                         }`}>
//                           {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-600 font-mono">
//                         {payment.receiptNumber}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => {
//                             toast.success(`Viewing payment ${payment.receiptNumber}`);
//                           }}
//                           className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//                         >
//                           View
//                         </button>
//                         <span className="text-gray-300">|</span>
//                         <button
//                           onClick={() => deletePayment(payment._id)}
//                           className="text-red-600 hover:text-red-800 text-sm font-medium"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div className="p-8 text-center">
//             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
//               <Receipt className="w-8 h-8 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
//             <p className="text-gray-600 mb-6 max-w-md mx-auto">
//               {paymentFilter !== 'all' 
//                 ? 'No payments match the current filter'
//                 : 'Start by recording your first payment'
//               }
//             </p>
//             <button
//               onClick={() => setShowAddPayment(true)}
//               className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm"
//             >
//               <Plus className="w-4 h-4 mr-2" />
//               Record First Payment
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   const renderFinancial = () => (
//     <div className="space-y-6">
//       <div className="bg-white border border-gray-200 rounded-xl p-6">
//         <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Current Balance</label>
//             <div className={`text-3xl font-bold ${
//               (tenant.financial?.currentBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'
//             }`}>
//               {formatCurrency(tenant.financial?.currentBalance)}
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
//             <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
//               <CreditCard className="w-5 h-5 text-gray-600" />
//               <span className="font-medium">{tenant.financial?.paymentMethod || 'Not specified'}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderEmergency = () => (
//     <div className="bg-white border border-gray-200 rounded-xl p-6">
//       <h4 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h4>
//       <div className="text-gray-500 text-center py-8">
//         Emergency contact information not available.
//       </div>
//     </div>
//   );

//   const renderDocuments = () => (
//     <div className="bg-white border border-gray-200 rounded-xl p-6">
//       <h4 className="text-lg font-medium text-gray-900 mb-4">Documents</h4>
//       <div className="text-gray-500 text-center py-8">
//         No documents uploaded yet.
//       </div>
//     </div>
//   );

//   const renderHistory = () => (
//     <div className="bg-white border border-gray-200 rounded-xl p-6">
//       <h4 className="text-lg font-medium text-gray-900 mb-4">Activity History</h4>
//       <div className="text-gray-500 text-center py-8">
//         No activity history available.
//       </div>
//     </div>
//   );

//   const AddPaymentModal = () => (
//     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//       <div 
//         className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
//             <p className="text-sm text-gray-600">Add a new payment record</p>
//           </div>
//           <button
//             onClick={() => setShowAddPayment(false)}
//             className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
//           >
//             <X className="w-5 h-5 text-gray-500" />
//           </button>
//         </div>
        
//         <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">
//               Amount <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//               <input
//                 type="number"
//                 step="0.01"
//                 min="0"
//                 required
//                 value={paymentForm.amount}
//                 onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
//                 className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="0.00"
//               />
//             </div>
//           </div>
          
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 Payment Date <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 required
//                 value={paymentForm.paymentDate}
//                 onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
//                 className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>
            
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 Month <span className="text-red-500">*</span>
//               </label>
//               <select
//                 required
//                 value={paymentForm.month}
//                 onChange={(e) => setPaymentForm({...paymentForm, month: e.target.value})}
//                 className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="">Select Month</option>
//                 {['January', 'February', 'March', 'April', 'May', 'June', 
//                   'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
//                   <option key={month} value={`${month} ${paymentForm.year}`}>
//                     {month} {paymentForm.year}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
          
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">Payment Method</label>
//               <select
//                 value={paymentForm.paymentMethod}
//                 onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
//                 className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="cash">Cash</option>
//                 <option value="check">Check</option>
//                 <option value="bank_transfer">Bank Transfer</option>
//                 <option value="online">Online Payment</option>
//                 <option value="credit_card">Credit Card</option>
//               </select>
//             </div>
            
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">Status</label>
//               <select
//                 value={paymentForm.status}
//                 onChange={(e) => setPaymentForm({...paymentForm, status: e.target.value})}
//                 className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="paid">Paid</option>
//                 <option value="pending">Pending</option>
//                 <option value="late">Late</option>
//                 <option value="partial">Partial</option>
//               </select>
//             </div>
//           </div>
          
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Late Fee (Optional)</label>
//             <div className="relative">
//               <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//               <input
//                 type="number"
//                 step="0.01"
//                 min="0"
//                 value={paymentForm.lateFee}
//                 onChange={(e) => setPaymentForm({...paymentForm, lateFee: e.target.value})}
//                 className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="0.00"
//               />
//             </div>
//           </div>
          
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
//             <textarea
//               value={paymentForm.notes}
//               onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
//               className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               rows="3"
//               placeholder="Add any additional notes about this payment..."
//             />
//           </div>
          
//           <div className="flex justify-end space-x-3 pt-6">
//             <button
//               type="button"
//               onClick={() => setShowAddPayment(false)}
//               className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-sm"
//             >
//               Record Payment
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'overview':
//         return renderOverview();
//       case 'personal':
//         return renderPersonalInfo();
//       case 'lease':
//         return renderLeaseDetails();
//       case 'financial':
//         return renderFinancial();
//       case 'payments':
//         return renderPayments();
//       case 'emergency':
//         return renderEmergency();
//       case 'documents':
//         return renderDocuments();
//       case 'history':
//         return renderHistory();
//       default:
//         return renderOverview();
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen p-4">
//         {/* Backdrop */}
//         <div 
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm"
//           onClick={onClose}
//         />
        
//         {/* Modal */}
//         <div 
//           className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
//                   <User className="h-6 w-6 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-900">
//                     {tenant.personalInfo?.fullName}
//                   </h2>
//                   <div className="flex items-center gap-2 mt-1">
//                     <span className="text-sm text-gray-500">
//                       {tenant.personalInfo?.email}
//                     </span>
//                     <span className="text-gray-300">•</span>
//                     <span className="text-sm text-gray-500">
//                       {tenant.unit || 'No Unit'} • {property?.name || 'No Property'}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 {editMode ? (
//                   <>
//                     <button
//                       onClick={() => setEditMode(false)}
//                       className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={handleUpdate}
//                       disabled={loading}
//                       className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
//                     >
//                       {loading ? (
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                       ) : (
//                         <Save className="w-4 h-4" />
//                       )}
//                       Save Changes
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <button
//                       onClick={() => setEditMode(true)}
//                       className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
//                     >
//                       <Edit className="w-4 h-4" />
//                       Edit
//                     </button>
//                     <button
//                       onClick={handleDelete}
//                       className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                       Delete
//                     </button>
//                   </>
//                 )}
//                 <button
//                   onClick={onClose}
//                   className="p-2 hover:bg-gray-100 rounded-lg"
//                 >
//                   <X className="w-5 h-5 text-gray-500" />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Tabs */}
//           <div className="border-b border-gray-200 px-6">
//             <div className="flex space-x-4 overflow-x-auto">
//               {tabs.map(tab => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
//                       activeTab === tab.id
//                         ? 'border-blue-500 text-blue-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     }`}
//                   >
//                     <Icon className="w-4 h-4 inline mr-2" />
//                     {tab.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Content */}
//           <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
//             {renderTabContent()}
//           </div>

//           {/* Footer */}
//           <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
//             <div className="flex justify-between items-center">
//               <div className="text-sm text-gray-600">
//                 <span className="font-medium">Tenant ID:</span> {tenant._id}
//                 <span className="mx-2">•</span>
//                 <span>Created: {formatDate(tenant.createdAt)}</span>
//               </div>
//               <div className="flex gap-3">
//                 <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
//                   <Send className="w-4 h-4" />
//                   Send Message
//                 </button>
//                 <button 
//                   onClick={() => {
//                     setActiveTab('payments');
//                     setShowAddPayment(true);
//                   }}
//                   className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2"
//                 >
//                   <Receipt className="w-4 h-4" />
//                   Record Payment
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Add Payment Modal */}
//       {showAddPayment && <AddPaymentModal />}
//     </div>
//   );
// }

// // app/dashboard/tenants/components/TenantDetailsModal.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { 
//   X, User, Mail, Phone, Calendar, DollarSign, Home, 
//   MapPin, Edit, Trash2, Building, FileText, CreditCard, 
//   AlertCircle, Clock, Save, Download, Send, MessageSquare,
//   Shield, ExternalLink, Upload, Image, CheckCircle, Eye,
//   Users, Wallet, Receipt, History, Key, Smartphone, Globe,
//   Briefcase, Map, Star, Flag, Package, Wifi, Car, Dog, Cat
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// export default function TenantDetailsModal({ 
//   tenant, 
//   property,
//   onClose, 
//   onUpdate,
//   onDelete,
//   mode = 'view'
// }) {
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [editMode, setEditMode] = useState(mode === 'edit');
//   const [formData, setFormData] = useState(tenant);
//   console.log(tenant._id);

//   useEffect(() => {
//     setFormData(tenant);
//   }, [tenant]);

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: User },
//     { id: 'personal', label: 'Personal Info', icon: User },
//     { id: 'lease', label: 'Lease Details', icon: FileText },
//     { id: 'financial', label: 'Financial', icon: CreditCard },
//     { id: 'emergency', label: 'Emergency', icon: AlertCircle },
//     { id: 'documents', label: 'Documents', icon: Shield },
//     { id: 'history', label: 'History', icon: History }
//   ];

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not set';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const formatCurrency = (amount) => {
//     if (!amount) return '$0.00';
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD'
//     }).format(amount);
//   };

//   const calculateDaysUntil = (dateString) => {
//     if (!dateString) return null;
//     const target = new Date(dateString);
//     const today = new Date();
//     const diffTime = target - today;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handlePersonalInfoChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       personalInfo: {
//         ...prev.personalInfo,
//         [name]: value
//       }
//     }));
//   };

//   const handleLeaseChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       lease: {
//         ...prev.lease,
//         [name]: value
//       }
//     }));
//   };

//   const handleUpdate = async () => {
//     console.log('uupdate btn click',tenant._id);
//     try {
//       setLoading(true);
//       const id = tenant._id;
//       console.log('tenant id',id);
//       const res = await fetch(`/api/tenants/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Failed to update tenant');
//       }

//       toast.success('Tenant updated successfully');
//       onUpdate(data.tenant);
//       setEditMode(false);
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!confirm('Are you sure you want to delete this tenant? All associated data will be removed.')) {
//       return;
//     }

//     try {
//       setLoading(true);
//       await onDelete(tenant._id);
//       toast.success('Tenant deleted successfully');
//       onClose();
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderOverview = () => (
//     <div className="space-y-6">
//       {/* Status & Quick Info */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white border border-gray-200 rounded-xl p-4">
//           <div className="flex items-center justify-between mb-2">
//             <h4 className="font-medium text-gray-900">Lease Status</h4>
//             <span className={`px-2 py-1 text-xs rounded-full ${
//               tenant.lease?.status === 'active' ? 'bg-green-100 text-green-800' :
//               tenant.lease?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//               'bg-red-100 text-red-800'
//             }`}>
//               {tenant.lease?.status?.toUpperCase() || 'N/A'}
//             </span>
//           </div>
//           <div className="text-2xl font-bold text-gray-900">
//             {formatCurrency(tenant.lease?.monthlyRent)}
//           </div>
//           <div className="text-sm text-gray-500">Monthly Rent</div>
//         </div>

//         <div className="bg-white border border-gray-200 rounded-xl p-4">
//           <div className="flex items-center justify-between mb-2">
//             <h4 className="font-medium text-gray-900">Balance</h4>
//             <AlertCircle className="w-4 h-4 text-gray-400" />
//           </div>
//           <div className={`text-2xl font-bold ${
//             (tenant.financial?.currentBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'
//           }`}>
//             {formatCurrency(tenant.financial?.currentBalance)}
//           </div>
//           <div className="text-sm text-gray-500">Current Balance</div>
//         </div>

//         <div className="bg-white border border-gray-200 rounded-xl p-4">
//           <div className="flex items-center justify-between mb-2">
//             <h4 className="font-medium text-gray-900">Next Payment</h4>
//             <Calendar className="w-4 h-4 text-gray-400" />
//           </div>
//           <div className="text-lg font-bold text-gray-900">
//             {formatDate(tenant.financial?.nextPaymentDue)}
//           </div>
//           <div className="text-sm text-gray-500">
//             {(() => {
//               const days = calculateDaysUntil(tenant.financial?.nextPaymentDue);
//               if (days === null) return 'No date set';
//               if (days < 0) return `${Math.abs(days)} days overdue`;
//               if (days === 0) return 'Due today';
//               return `In ${days} days`;
//             })()}
//           </div>
//         </div>
//       </div>

//       {/* Property Info Card */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
//         <div className="flex items-center justify-between mb-3">
//           <h4 className="font-medium text-gray-900">Current Property</h4>
//           <Home className="w-5 h-5 text-blue-600" />
//         </div>
//         {property ? (
//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <span className="text-gray-900 font-medium">{property.name}</span>
//               <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
//                 {property.type}
//               </span>
//             </div>
//             <div className="text-sm text-gray-600">
//               {property.address?.street}, {property.address?.city}, {property.address?.state} {property.address?.zipCode}
//             </div>
//             <div className="flex items-center justify-between text-sm">
//               <div>
//                 <span className="text-gray-500">Unit: </span>
//                 <span className="font-medium">{tenant.unit || 'N/A'}</span>
//               </div>
//               <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
//                 <ExternalLink className="w-4 h-4" />
//                 View Property
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="text-center py-4">
//             <Home className="w-12 h-12 text-gray-300 mx-auto mb-2" />
//             <p className="text-gray-600">No property assigned</p>
//           </div>
//         )}
//       </div>

//       {/* Contact Information */}
//       <div className="bg-white border border-gray-200 rounded-xl p-4">
//         <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-50 rounded-lg">
//               <Mail className="w-4 h-4 text-blue-600" />
//             </div>
//             <div>
//               <div className="text-sm text-gray-500">Email</div>
//               <div className="font-medium text-gray-900">{tenant.personalInfo?.email || 'N/A'}</div>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-green-50 rounded-lg">
//               <Phone className="w-4 h-4 text-green-600" />
//             </div>
//             <div>
//               <div className="text-sm text-gray-500">Phone</div>
//               <div className="font-medium text-gray-900">{tenant.personalInfo?.phone || 'N/A'}</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//         <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
//           <Send className="w-6 h-6 text-blue-600 mb-2" />
//           <span className="text-sm font-medium">Send Message</span>
//         </button>
//         <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
//           <Receipt className="w-6 h-6 text-green-600 mb-2" />
//           <span className="text-sm font-medium">Record Payment</span>
//         </button>
//         <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
//           <FileText className="w-6 h-6 text-purple-600 mb-2" />
//           <span className="text-sm font-medium">View Lease</span>
//         </button>
//         <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
//           <MessageSquare className="w-6 h-6 text-orange-600 mb-2" />
//           <span className="text-sm font-medium">Send Reminder</span>
//         </button>
//       </div>
//     </div>
//   );

//   const renderPersonalInfo = () => (
//     <div className="space-y-6">
//       <div className="bg-white border border-gray-200 rounded-xl p-6">
//         <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Details</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
//             {editMode ? (
//               <input
//                 type="text"
//                 name="fullName"
//                 value={formData.personalInfo?.fullName || ''}
//                 onChange={handlePersonalInfoChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <p className="text-gray-900">{tenant.personalInfo?.fullName || 'N/A'}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
//             {editMode ? (
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.personalInfo?.email || ''}
//                 onChange={handlePersonalInfoChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Mail className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{tenant.personalInfo?.email || 'N/A'}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
//             {editMode ? (
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.personalInfo?.phone || ''}
//                 onChange={handlePersonalInfoChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Phone className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{tenant.personalInfo?.phone || 'N/A'}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
//             {editMode ? (
//               <input
//                 type="date"
//                 name="dateOfBirth"
//                 value={formData.personalInfo?.dateOfBirth ? new Date(formData.personalInfo.dateOfBirth).toISOString().split('T')[0] : ''}
//                 onChange={handlePersonalInfoChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Calendar className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{formatDate(tenant.personalInfo?.dateOfBirth)}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
//             {editMode ? (
//               <input
//                 type="text"
//                 name="occupation"
//                 value={formData.personalInfo?.occupation || ''}
//                 onChange={handlePersonalInfoChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Briefcase className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{tenant.personalInfo?.occupation || 'N/A'}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Employer</label>
//             {editMode ? (
//               <input
//                 type="text"
//                 name="employer"
//                 value={formData.personalInfo?.employer || ''}
//                 onChange={handlePersonalInfoChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <p className="text-gray-900">{tenant.personalInfo?.employer || 'N/A'}</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderLeaseDetails = () => (
//     <div className="space-y-6">
//       <div className="bg-white border border-gray-200 rounded-xl p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h4 className="text-lg font-medium text-gray-900">Lease Information</h4>
//           <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
//             {tenant.lease?.leaseType || 'Standard Lease'}
//           </span>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Lease Start Date</label>
//             {editMode ? (
//               <input
//                 type="date"
//                 name="startDate"
//                 value={formData.lease?.startDate ? new Date(formData.lease.startDate).toISOString().split('T')[0] : ''}
//                 onChange={handleLeaseChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Calendar className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{formatDate(tenant.lease?.startDate)}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Lease End Date</label>
//             {editMode ? (
//               <input
//                 type="date"
//                 name="endDate"
//                 value={formData.lease?.endDate ? new Date(formData.lease.endDate).toISOString().split('T')[0] : ''}
//                 onChange={handleLeaseChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Calendar className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{formatDate(tenant.lease?.endDate)}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent</label>
//             {editMode ? (
//               <input
//                 type="number"
//                 name="monthlyRent"
//                 value={formData.lease?.monthlyRent || ''}
//                 onChange={handleLeaseChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <DollarSign className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900 font-medium">{formatCurrency(tenant.lease?.monthlyRent)}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit</label>
//             {editMode ? (
//               <input
//                 type="number"
//                 name="securityDeposit"
//                 value={formData.lease?.securityDeposit || ''}
//                 onChange={handleLeaseChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Shield className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{formatCurrency(tenant.lease?.securityDeposit)}</p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Lease Status</label>
//             {editMode ? (
//               <select
//                 name="status"
//                 value={formData.lease?.status || ''}
//                 onChange={handleLeaseChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               >
//                 <option value="active">Active</option>
//                 <option value="pending">Pending</option>
//                 <option value="expired">Expired</option>
//                 <option value="terminated">Terminated</option>
//               </select>
//             ) : (
//               <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                 tenant.lease?.status === 'active' ? 'bg-green-100 text-green-800' :
//                 tenant.lease?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                 'bg-red-100 text-red-800'
//               }`}>
//                 {tenant.lease?.status?.toUpperCase()}
//               </span>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Payment Day</label>
//             <div className="flex items-center gap-2">
//               <Calendar className="w-4 h-4 text-gray-400" />
//               <p className="text-gray-900">Day {tenant.lease?.paymentDay || '1'} of each month</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Pets & Vehicles */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white border border-gray-200 rounded-xl p-6">
//           <div className="flex items-center gap-2 mb-4">
//             <Dog className="w-5 h-5 text-gray-600" />
//             <h4 className="font-medium text-gray-900">Pets</h4>
//           </div>
//           {tenant.personalInfo?.pets?.length > 0 ? (
//             <div className="space-y-2">
//               {tenant.personalInfo.pets.map((pet, index) => (
//                 <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
//                   <span className="font-medium">{pet.type}: {pet.name}</span>
//                   <span className="text-sm text-gray-500">{pet.breed}</span>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-500 text-center py-4">No pets registered</p>
//           )}
//         </div>

//         <div className="bg-white border border-gray-200 rounded-xl p-6">
//           <div className="flex items-center gap-2 mb-4">
//             <Car className="w-5 h-5 text-gray-600" />
//             <h4 className="font-medium text-gray-900">Vehicles</h4>
//           </div>
//           {tenant.personalInfo?.vehicles?.length > 0 ? (
//             <div className="space-y-2">
//               {tenant.personalInfo.vehicles.map((vehicle, index) => (
//                 <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
//                   <span className="font-medium">{vehicle.make} {vehicle.model}</span>
//                   <span className="text-sm text-gray-500">{vehicle.licensePlate}</span>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-500 text-center py-4">No vehicles registered</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'overview':
//         return renderOverview();
//       case 'personal':
//         return renderPersonalInfo();
//       case 'lease':
//         return renderLeaseDetails();
//       case 'financial':
//         return (
//           <div className="space-y-6">
//             <div className="bg-white border border-gray-200 rounded-xl p-6">
//               <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h4>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Current Balance</label>
//                   <div className={`text-3xl font-bold ${
//                     (tenant.financial?.currentBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'
//                   }`}>
//                     {formatCurrency(tenant.financial?.currentBalance)}
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
//                   <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
//                     <CreditCard className="w-5 h-5 text-gray-600" />
//                     <span className="font-medium">{tenant.financial?.paymentMethod || 'Not specified'}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       default:
//         return renderOverview();
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen p-4">
//         {/* Backdrop */}
//         <div 
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm"
//           onClick={onClose}
//         />
        
//         {/* Modal */}
//         <div 
//           className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
//                   <User className="h-6 w-6 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-900">
//                     {tenant.personalInfo?.fullName}
//                   </h2>
//                   <div className="flex items-center gap-2 mt-1">
//                     <span className="text-sm text-gray-500">
//                       {tenant.personalInfo?.email}
//                     </span>
//                     <span className="text-gray-300">•</span>
//                     <span className="text-sm text-gray-500">
//                       {tenant.unit || 'No Unit'} • {property?.name || 'No Property'}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 {editMode ? (
//                   <>
//                     <button
//                       onClick={() => setEditMode(false)}
//                       className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={handleUpdate}
//                       disabled={loading}
//                       className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
//                     >
//                       {loading ? (
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                       ) : (
//                         <Save className="w-4 h-4" />
//                       )}
//                       Save Changes
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <button
//                       onClick={() => setEditMode(true)}
//                       className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
//                     >
//                       <Edit className="w-4 h-4" />
//                       Edit
//                     </button>
//                     <button
//                       onClick={handleDelete}
//                       className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                       Delete
//                     </button>
//                   </>
//                 )}
//                 <button
//                   onClick={onClose}
//                   className="p-2 hover:bg-gray-100 rounded-lg"
//                 >
//                   <X className="w-5 h-5 text-gray-500" />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Tabs */}
//           <div className="border-b border-gray-200 px-6">
//             <div className="flex space-x-4 overflow-x-auto">
//               {tabs.map(tab => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
//                       activeTab === tab.id
//                         ? 'border-blue-500 text-blue-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     }`}
//                   >
//                     <Icon className="w-4 h-4 inline mr-2" />
//                     {tab.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Content */}
//           <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
//             {renderTabContent()}
//           </div>

//           {/* Footer */}
//           <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
//             <div className="flex justify-between items-center">
//               <div className="text-sm text-gray-600">
//                 <span className="font-medium">Tenant ID:</span> {tenant._id}
//                 <span className="mx-2">•</span>
//                 <span>Created: {formatDate(tenant.createdAt)}</span>
//               </div>
//               <div className="flex gap-3">
//                 <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
//                   <Send className="w-4 h-4" />
//                   Send Message
//                 </button>
//                 <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
//                   <Receipt className="w-4 h-4" />
//                   Record Payment
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }