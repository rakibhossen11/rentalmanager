'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Home, 
  DollarSign, 
  X,
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [filteredTenants, setFilteredTenants] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9);
    const { showBackendToast } = useToast();
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        propertyId: '',
        leaseStart: '',
        leaseEnd: '',
        rentAmount: '',
        rentDueDay: '1',
        securityDeposit: '',
        emergencyContact: '',
        emergencyPhone: '',
        notes: '',
        status: 'active'
    });

    // Fetch tenants from API
    const fetchTenants = async () => {
        try {
            setLoading(true);
            console.log('📡 Fetching tenants from API...');
            
            const response = await fetch('/api/tenants', {
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            console.log('API Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
            }
            
            const data = await response.json();
            console.log('API Response data:', data);
            
            if (Array.isArray(data)) {
                setTenants(data);
                setFilteredTenants(data);
                console.log(`✅ Loaded ${data.length} tenants`);
            } else if (data.success === false) {
                throw new Error(data.message || 'Failed to load tenants');
            } else {
                console.warn('Unexpected response format:', data);
                setTenants([]);
                setFilteredTenants([]);
            }
            
        } catch (error) {
            console.error('❌ Error fetching tenants:', error);
            showBackendToast(`Failed to load tenants: ${error.message}`, 'error');
            setTenants([]);
            setFilteredTenants([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    // Apply filters whenever search term or status filter changes
    useEffect(() => {
        let filtered = tenants;
        
        // Apply search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(tenant =>
                tenant.name?.toLowerCase().includes(term) ||
                tenant.email?.toLowerCase().includes(term) ||
                tenant.phone?.toLowerCase().includes(term) ||
                tenant.address?.toLowerCase().includes(term)
            );
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(tenant => tenant.status === statusFilter);
        }
        
        setFilteredTenants(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [tenants, searchTerm, statusFilter]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTenants = filteredTenants.slice(startIndex, endIndex);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('📤 Submitting form data:', formData);
        
        // Basic validation
        if (!formData.name || !formData.email || !formData.phone) {
            showBackendToast('Please fill in all required fields (name, email, phone)', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const url = editingTenant ? `/api/tenants/${editingTenant._id}` : '/api/tenants';
            const method = editingTenant ? 'PUT' : 'POST';
            
            console.log(`Making ${method} request to ${url}`);
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);
            
            // Check content type
            const contentType = response.headers.get('content-type');
            let result;
            
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text.substring(0, 500));
                throw new Error(`Server returned ${response.status} with non-JSON response`);
            }
            
            console.log('Response data:', result);
            
            if (!response.ok) {
                throw new Error(result.message || result.error || `HTTP ${response.status}: ${result.details || ''}`);
            }
            
            showBackendToast(
                editingTenant ? 'Tenant updated successfully!' : 'Tenant added successfully!',
                'success'
            );
            
            // Reset form and close modal
            resetForm();
            setIsModalOpen(false);
            setEditingTenant(null);
            
            // Refresh tenants list
            await fetchTenants();
            
        } catch (error) {
            console.error('❌ Error saving tenant:', error);
            showBackendToast(`Failed to save tenant: ${error.message}`, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (tenant) => {
        console.log('✏️ Editing tenant:', tenant);
        setEditingTenant(tenant);
        
        // Format dates for date inputs (YYYY-MM-DD)
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        };
        
        setFormData({
            name: tenant.name || '',
            phone: tenant.phone || '',
            email: tenant.email || '',
            address: tenant.address || '',
            propertyId: tenant.propertyId || '',
            leaseStart: formatDateForInput(tenant.leaseStart),
            leaseEnd: formatDateForInput(tenant.leaseEnd),
            rentAmount: tenant.rentAmount?.toString() || '',
            rentDueDay: tenant.rentDueDay?.toString() || '1',
            securityDeposit: tenant.securityDeposit?.toString() || '',
            emergencyContact: tenant.emergencyContact || '',
            emergencyPhone: tenant.emergencyPhone || '',
            notes: tenant.notes || '',
            status: tenant.status || 'active'
        });
        
        setIsModalOpen(true);
    };

    const handleDelete = async (tenantId) => {
        if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) return;

        try {
            console.log('🗑️ Deleting tenant:', tenantId);
            const response = await fetch(`/api/tenants/${tenantId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete tenant');
            }

            showBackendToast('Tenant deleted successfully!', 'success');
            await fetchTenants();
            
        } catch (error) {
            console.error('❌ Error deleting tenant:', error);
            showBackendToast(`Failed to delete tenant: ${error.message}`, 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            address: '',
            propertyId: '',
            leaseStart: '',
            leaseEnd: '',
            rentAmount: '',
            rentDueDay: '1',
            securityDeposit: '',
            emergencyContact: '',
            emergencyPhone: '',
            notes: '',
            status: 'active'
        });
        setEditingTenant(null);
    };

    const handleModalClose = () => {
        if (submitting) return;
        setIsModalOpen(false);
        setTimeout(() => {
            resetForm();
        }, 300);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
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

    const formatCurrency = (amount) => {
        if (!amount) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
            case 'inactive': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
            case 'past': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
            case 'pending': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Modal for adding/editing tenant */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        {editingTenant ? 'Update tenant details' : 'Enter tenant details below'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleModalClose}
                                    disabled={submitting}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-200px)]">
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Personal Information
                                    </h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            disabled={submitting}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                disabled={submitting}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                disabled={submitting}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Emergency Contact
                                        </label>
                                        <input
                                            type="text"
                                            name="emergencyContact"
                                            value={formData.emergencyContact}
                                            onChange={handleInputChange}
                                            disabled={submitting}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                                            placeholder="Emergency contact name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Emergency Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="emergencyPhone"
                                            value={formData.emergencyPhone}
                                            onChange={handleInputChange}
                                            disabled={submitting}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                                            placeholder="Emergency phone number"
                                        />
                                    </div>
                                </div>

                                {/* Property Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <Home className="w-5 h-5" />
                                        Property Information
                                    </h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Property Address
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                disabled={submitting}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                                                placeholder="123 Main St, City, State"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Property ID
                                        </label>
                                        <input
                                            type="text"
                                            name="propertyId"
                                            value={formData.propertyId}
                                            onChange={handleInputChange}
                                            disabled={submitting}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                                            placeholder="PROP-001"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Lease Start Date
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-gray-400" />
                                                <input
                                                    type="date"
                                                    name="leaseStart"
                                                    value={formData.leaseStart}
                                                    onChange={handleInputChange}
                                                    disabled={submitting}
                                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Lease End Date
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-gray-400" />
                                                <input
                                                    type="date"
                                                    name="leaseEnd"
                                                    value={formData.leaseEnd}
                                                    onChange={handleInputChange}
                                                    disabled={submitting}
                                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5" />
                                        Financial Information
                                    </h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Monthly Rent
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                $
                                            </div>
                                            <input
                                                type="number"
                                                name="rentAmount"
                                                value={formData.rentAmount}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                                disabled={submitting}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Security Deposit
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                $
                                            </div>
                                            <input
                                                type="number"
                                                name="securityDeposit"
                                                value={formData.securityDeposit}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                                disabled={submitting}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rent Due Day
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-gray-400" />
                                            <select
                                                name="rentDueDay"
                                                value={formData.rentDueDay}
                                                onChange={handleInputChange}
                                                disabled={submitting}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                                            >
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                    <option key={day} value={day}>
                                                        Day {day} of each month
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            disabled={submitting}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="past">Past Tenant</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Additional Notes */}
                                <div className="space-y-4 md:col-span-2">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Additional Information
                                    </h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows="4"
                                            disabled={submitting}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none disabled:opacity-50 disabled:bg-gray-100"
                                            placeholder="Any additional notes about the tenant..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Fields marked with * are required</span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleModalClose}
                                        disabled={submitting}
                                        className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                {editingTenant ? 'Updating...' : 'Adding...'}
                                            </>
                                        ) : (
                                            <>
                                                {editingTenant ? (
                                                    <>
                                                        <Edit className="w-5 h-5" />
                                                        Update Tenant
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-5 h-5" />
                                                        Add Tenant
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Tenants</h1>
                            <p className="text-gray-600 mt-1">Manage your rental tenants</p>
                        </div>
                        
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Add Tenant
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <Search className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search tenants by name, email, phone, or address..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="w-full md:w-48">
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                        <option value="past">Past Tenant</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Active filters */}
                        {(searchTerm || statusFilter !== 'all') && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {searchTerm && (
                                    <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        <span>Search: "{searchTerm}"</span>
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="ml-1 hover:text-blue-900"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                                {statusFilter !== 'all' && (
                                    <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        <span>Status: {statusFilter}</span>
                                        <button
                                            onClick={() => setStatusFilter('all')}
                                            className="ml-1 hover:text-blue-900"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-600">Loading tenants...</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-xl shadow-sm p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Tenants</p>
                                        <p className="text-2xl font-bold text-gray-800">{tenants.length}</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-sm p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Active Tenants</p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {tenants.filter(t => t.status === 'active').length}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <User className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-sm p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Monthly Revenue</p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {formatCurrency(
                                                tenants
                                                    .filter(t => t.status === 'active')
                                                    .reduce((sum, tenant) => sum + (parseFloat(tenant.rentAmount) || 0), 0)
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <DollarSign className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-sm p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Showing</p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {filteredTenants.length} / {tenants.length}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <Filter className="w-6 h-6 text-gray-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tenants Grid or Empty State */}
                        {tenants.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tenants Yet</h3>
                                <p className="text-gray-500 mb-6">Add your first tenant to get started</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Your First Tenant
                                </button>
                            </div>
                        ) : filteredTenants.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Matching Tenants</h3>
                                <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                    }}
                                    className="px-6 py-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Tenants Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {currentTenants.map((tenant) => {
                                        const statusColors = getStatusColor(tenant.status);
                                        
                                        return (
                                            <div 
                                                key={tenant._id} 
                                                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                                            >
                                                {/* Tenant Header */}
                                                <div className="p-5 border-b border-gray-100">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <div className={`p-2 rounded-lg ${statusColors.bg}`}>
                                                                <User className={`w-5 h-5 ${statusColors.text}`} />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-lg text-gray-800">{tenant.name}</h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                                                                        {tenant.status?.charAt(0).toUpperCase() + tenant.status?.slice(1)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleEdit(tenant)}
                                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="Edit tenant"
                                                            >
                                                                <Edit className="w-4 h-4 text-gray-600" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(tenant._id)}
                                                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete tenant"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Contact Info */}
                                                <div className="p-5">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                            <span className="text-sm text-gray-600 truncate">{tenant.phone}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                            <span className="text-sm text-gray-600 truncate">{tenant.email}</span>
                                                        </div>
                                                        {tenant.address && (
                                                            <div className="flex items-start gap-2">
                                                                <Home className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                                                <span className="text-sm text-gray-600 line-clamp-2">{tenant.address}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Financial Info */}
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm text-gray-600">Monthly Rent</span>
                                                            <span className="font-bold text-gray-800">
                                                                {formatCurrency(tenant.rentAmount)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Due Day</span>
                                                            <span className="font-medium text-gray-800">Day {tenant.rentDueDay || '1'}</span>
                                                        </div>
                                                    </div>

                                                    {/* Lease Info */}
                                                    {tenant.leaseStart && (
                                                        <div className="mt-3 text-sm text-gray-600 flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>
                                                                {formatDate(tenant.leaseStart)} - {formatDate(tenant.leaseEnd)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="p-5 pt-0 flex gap-2">
                                                    <Link
                                                        href={`/tenants/${tenant._id}`}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        View Details
                                                    </Link>
                                                    <button
                                                        onClick={() => showBackendToast('Record payment feature coming soon!', 'info')}
                                                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                    >
                                                        Record Payment
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm p-4">
                                        <div className="text-sm text-gray-600">
                                            Showing {startIndex + 1}-{Math.min(endIndex, filteredTenants.length)} of {filteredTenants.length} tenants
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`w-10 h-10 rounded-lg font-medium ${
                                                            currentPage === pageNum
                                                                ? 'bg-blue-600 text-white'
                                                                : 'border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                            
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}