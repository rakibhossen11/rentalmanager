// app/dashboard/tenants/components/AddTenantModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, DollarSign, Home, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddTenantModal({ onClose, onSuccess, user, properties = [] }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: ''
    },
    propertyId: '',
    unit: '',
    lease: {
      startDate: new Date().toISOString().split('T')[0],
      monthlyRent: ''
    },
    status: 'active'
  });

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.personalInfo.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    
    if (!formData.lease.monthlyRent || isNaN(parseFloat(formData.lease.monthlyRent))) {
      toast.error('Valid monthly rent is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Tenant added successfully!');
        onSuccess(data);
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto z-50">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Add New Tenant</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.personalInfo.fullName}
              onChange={(e) => handleChange(e, 'personalInfo')}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.personalInfo.email}
              onChange={(e) => handleChange(e, 'personalInfo')}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="john@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.personalInfo.phone}
              onChange={(e) => handleChange(e, 'personalInfo')}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="(123) 456-7890"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Property
            </label>
            <select
              value={formData.propertyId}
              onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No Property</option>
              {properties.map(property => (
                <option key={property._id} value={property._id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Number
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., A101"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lease Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.lease.startDate}
              onChange={(e) => handleChange(e, 'lease')}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Rent *
            </label>
            <input
              type="number"
              name="monthlyRent"
              value={formData.lease.monthlyRent}
              onChange={(e) => handleChange(e, 'lease')}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              step="0.01"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}