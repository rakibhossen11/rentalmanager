'use client';

import { useState } from 'react';
import { 
    X, 
    User, 
    Mail, 
    Phone, 
    MapPin,
    Calendar,
    DollarSign,
    FileText,
    AlertCircle,
    Building2,
    Shield,
    Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddTenantModal({ onClose, onSuccess, user }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        alternatePhone: '',
        address: '',
        unitNumber: '',
        rentAmount: '',
        securityDeposit: '',
        petDeposit: '',
        rentDueDay: '1',
        leaseStart: '',
        leaseEnd: '',
        emergencyContact: '',
        emergencyPhone: '',
        notes: '',
        status: 'active'
    });
    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        
        if (formData.rentAmount && isNaN(parseFloat(formData.rentAmount))) {
            newErrors.rentAmount = 'Rent amount must be a number';
        }
        
        if (formData.rentDueDay && (parseInt(formData.rentDueDay) < 1 || parseInt(formData.rentDueDay) > 31)) {
            newErrors.rentDueDay = 'Rent due day must be between 1 and 31';
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setLoading(true);
        
        try {
            const res = await fetch('/api/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            
            if (res.ok) {
                toast.success('Tenant added successfully!');
                onSuccess();
            } else {
                throw new Error(data.error || 'Failed to add tenant');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add New Tenant</h2>
                        <p className="text-sm text-gray-600">Fill in the tenant's information</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <User className="w-4 h-4 mr-2" />
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
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="John Doe"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alternate Phone
                                </label>
                                <input
                                    type="tel"
                                    name="alternatePhone"
                                    value={formData.alternatePhone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="(555) 987-6543"
                                />
                            </div>
                        </div>
                        
                        {/* Property Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <Building2 className="w-4 h-4 mr-2" />
                                Property Information
                            </h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="123 Main St, Apt 4B"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unit Number
                                </label>
                                <input
                                    type="text"
                                    name="unitNumber"
                                    value={formData.unitNumber}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="4B"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Monthly Rent
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            name="rentAmount"
                                            value={formData.rentAmount}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.rentAmount ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="2500"
                                            step="0.01"
                                        />
                                    </div>
                                    {errors.rentAmount && (
                                        <p className="mt-1 text-sm text-red-600">{errors.rentAmount}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rent Due Day
                                    </label>
                                    <select
                                        name="rentDueDay"
                                        value={formData.rentDueDay}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.rentDueDay ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    >
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                            <option key={day} value={day}>
                                                Day {day}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.rentDueDay && (
                                        <p className="mt-1 text-sm text-red-600">{errors.rentDueDay}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Security Deposit
                                    </label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            name="securityDeposit"
                                            value={formData.securityDeposit}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="2500"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pet Deposit
                                    </label>
                                    <input
                                        type="number"
                                        name="petDeposit"
                                        value={formData.petDeposit}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="500"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Lease Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Lease Information
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lease Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="leaseStart"
                                        value={formData.leaseStart}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lease End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="leaseEnd"
                                        value={formData.leaseEnd}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                    <option value="past">Past</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Emergency Contact & Notes */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Additional Information
                            </h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Emergency Contact Name
                                </label>
                                <input
                                    type="text"
                                    name="emergencyContact"
                                    value={formData.emergencyContact}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Jane Smith"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Emergency Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    name="emergencyPhone"
                                    value={formData.emergencyPhone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="(555) 555-5555"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Any additional notes about this tenant..."
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Adding Tenant...
                                </span>
                            ) : 'Add Tenant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}