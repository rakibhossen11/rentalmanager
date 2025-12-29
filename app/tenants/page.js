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
  Filter
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
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

    // Fetch tenants from MongoDB
    const fetchTenants = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/tenants');
            if (!response.ok) throw new Error('Failed to fetch tenants');
            const data = await response.json();
            setTenants(data);
        } catch (error) {
            console.error('Error fetching tenants:', error);
            showBackendToast('Failed to load tenants', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.name || !formData.phone || !formData.email || !formData.leaseStart || !formData.leaseEnd) {
            showBackendToast('Please fill in all required fields', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const url = editingTenant ? `/api/tenants/${editingTenant._id}` : '/api/tenants';
            const method = editingTenant ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save tenant');
            }

            const savedTenant = await response.json();
            
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
            console.error('Error saving tenant:', error);
            showBackendToast(error.message || 'Failed to save tenant', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (tenant) => {
        setEditingTenant(tenant);
        setFormData({
            name: tenant.name || '',
            phone: tenant.phone || '',
            email: tenant.email || '',
            address: tenant.address || '',
            propertyId: tenant.propertyId || '',
            leaseStart: tenant.leaseStart ? tenant.leaseStart.split('T')[0] : '',
            leaseEnd: tenant.leaseEnd ? tenant.leaseEnd.split('T')[0] : '',
            rentAmount: tenant.rentAmount || '',
            rentDueDay: tenant.rentDueDay || '1',
            securityDeposit: tenant.securityDeposit || '',
            emergencyContact: tenant.emergencyContact || '',
            emergencyPhone: tenant.emergencyPhone || '',
            notes: tenant.notes || '',
            status: tenant.status || 'active'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (tenantId) => {
        if (!confirm('Are you sure you want to delete this tenant?')) return;

        try {
            const response = await fetch(`/api/tenants/${tenantId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete tenant');
            }

            showBackendToast('Tenant deleted successfully!', 'success');
            await fetchTenants();
        } catch (error) {
            console.error('Error deleting tenant:', error);
            showBackendToast(error.message || 'Failed to delete tenant', 'error');
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
        setIsModalOpen(false);
        setTimeout(() => {
            resetForm();
        }, 300);
    };

    // Filter tenants based on search term
    const filteredTenants = tenants.filter(tenant =>
        tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.phone?.includes(searchTerm) ||
        tenant.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            {/* Modal for adding/editing tenant */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b">
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
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            disabled={submitting}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number *
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                disabled={submitting}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address *
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                disabled={submitting}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Emergency Contact
                                        </label>
                                        <input
                                            type="text"
                                            name="emergencyContact"
                                            value={formData.emergencyContact}
                                            onChange={handleInputChange}
                                            disabled={submitting}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
                                            placeholder="Emergency contact name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Emergency Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="emergencyPhone"
                                            value={formData.emergencyPhone}
                                            onChange={handleInputChange}
                                            disabled={submitting}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Property Address
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                disabled={submitting}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
                                                placeholder="123 Main St, City, State"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Property ID
                                        </label>
                                        <input
                                            type="text"
                                            name="propertyId"
                                            value={formData.propertyId}
                                            onChange={handleInputChange}
                                            disabled={submitting}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
                                            placeholder="PROP-001"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Lease Start *
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    name="leaseStart"
                                                    value={formData.leaseStart}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={submitting}
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Lease End *
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    name="leaseEnd"
                                                    value={formData.leaseEnd}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={submitting}
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Monthly Rent *
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
                                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rent Due Day *
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <select
                                                name="rentDueDay"
                                                value={formData.rentDueDay}
                                                onChange={handleInputChange}
                                                required
                                                disabled={submitting}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            disabled={submitting}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows="4"
                                            disabled={submitting}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none disabled:opacity-50"
                                            placeholder="Any additional notes about the tenant..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t bg-gray-50">
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Fields marked with * are required</span>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleModalClose}
                                        disabled={submitting}
                                        className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                {editingTenant ? 'Updating...' : 'Adding...'}
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5" />
                                                {editingTenant ? 'Update Tenant' : 'Add Tenant'}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Tenants</h1>
                    <p className="text-gray-600">Manage your rental tenants</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Filter className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search tenants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64"
                        />
                    </div>
                    
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Tenant
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            ) : tenants.length === 0 ? (
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
            ) : (
                <>
                    <div className="mb-4 flex justify-between items-center">
                        <p className="text-gray-600">
                            Showing {filteredTenants.length} of {tenants.length} tenants
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTenants.map((tenant) => (
                            <div key={tenant._id} className="bg-white rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`p-3 rounded-lg ${
                                        tenant.status === 'active' ? 'bg-green-50' :
                                        tenant.status === 'inactive' ? 'bg-yellow-50' :
                                        tenant.status === 'past' ? 'bg-red-50' : 'bg-blue-50'
                                    }`}>
                                        <User className={`w-6 h-6 ${
                                            tenant.status === 'active' ? 'text-green-600' :
                                            tenant.status === 'inactive' ? 'text-yellow-600' :
                                            tenant.status === 'past' ? 'text-red-600' : 'text-blue-600'
                                        }`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <h3 className="text-xl font-bold text-gray-800">{tenant.name}</h3>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(tenant)}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                    title="Edit tenant"
                                                >
                                                    <Edit className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tenant._id)}
                                                    className="p-1 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete tenant"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                tenant.status === 'active' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : tenant.status === 'inactive'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : tenant.status === 'past'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {tenant.status?.charAt(0).toUpperCase() + tenant.status?.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="w-4 h-4" />
                                                <span className="text-sm">{tenant.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-sm truncate max-w-[120px]">{tenant.email}</span>
                                            </div>
                                        </div>
                                        {tenant.address && (
                                            <div className="flex items-center gap-2 text-gray-600 mt-2">
                                                <Home className="w-4 h-4" />
                                                <span className="text-sm truncate">{tenant.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">Lease Period:</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-800">
                                            {new Date(tenant.leaseStart).toLocaleDateString()} - {new Date(tenant.leaseEnd).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Rent:</span>
                                        <span className="font-bold text-gray-800">
                                            ${tenant.rentAmount ? parseFloat(tenant.rentAmount).toLocaleString() : '0'}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Due Day:</span>
                                        <span className="font-bold text-gray-800">Day {tenant.rentDueDay || '1'}</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-2">
                                    <Link
                                        href={`/tenants/${tenant._id}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <FileText className="w-4 h-4" />
                                        View Details
                                    </Link>
                                    <button
                                        onClick={() => showBackendToast('Payment feature coming soon!', 'info')}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Record Payment
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}