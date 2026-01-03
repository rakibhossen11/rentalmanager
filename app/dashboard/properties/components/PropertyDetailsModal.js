// app/components/PropertyDetailsModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { 
  X, Home, MapPin, DollarSign, Bath, Bed, Square, 
  Car, Calendar, Shield, Building, Edit, Save,
  Trash2, Users, Eye, EyeOff, Upload, Image,
  CheckCircle, AlertCircle, Phone, Mail, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PropertyDetailsModal({ 
  property, 
  onClose, 
  onUpdate,
  onDelete,
  mode = 'view' // 'view', 'edit'
}) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(mode === 'edit');
  const [formData, setFormData] = useState(property);

  useEffect(() => {
    setFormData(property);
  }, [property]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'units', label: 'Units/Rooms', icon: Building },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: Shield },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleFinancialChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      financial: {
        ...prev.financial,
        [name]: value
      }
    }));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/properties/${property._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update property');
      }

      toast.success('Property updated successfully');
      onUpdate(data.property);
      setEditMode(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await onDelete(property._id);
      toast.success('Property deleted successfully');
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Property Type Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            property.status === 'active' ? 'bg-green-100 text-green-800' :
            property.status === 'vacant' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {property.status.replace('_', ' ')}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
            {property.type}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium capitalize">
            {property.propertyStructure === 'single_unit' ? 'Single Unit' :
             property.propertyStructure === 'multi_room' ? 'Multiple Rooms' :
             'Multiple Units'}
          </span>
        </div>
      </div>

      {/* Address Section */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center mb-3">
          <MapPin className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="font-medium text-gray-900">Property Address</h3>
        </div>
        {editMode ? (
          <div className="space-y-3">
            <input
              type="text"
              name="street"
              value={formData.address?.street || ''}
              onChange={handleAddressChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Street address"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="city"
                value={formData.address?.city || ''}
                onChange={handleAddressChange}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="City"
              />
              <input
                type="text"
                name="state"
                value={formData.address?.state || ''}
                onChange={handleAddressChange}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="State"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="zipCode"
                value={formData.address?.zipCode || ''}
                onChange={handleAddressChange}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="ZIP Code"
              />
              <input
                type="text"
                name="country"
                value={formData.address?.country || ''}
                onChange={handleAddressChange}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Country"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-gray-900 font-medium">{property.address?.street || 'No address provided'}</p>
            <p className="text-gray-600">
              {property.address?.city && `${property.address.city}, `}
              {property.address?.state && `${property.address.state} `}
              {property.address?.zipCode}
            </p>
            <p className="text-gray-500 text-sm">{property.address?.country || 'US'}</p>
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <Bed className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{property.details?.totalBedrooms || 0}</div>
          <div className="text-sm text-gray-600">Bedrooms</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <Bath className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{property.details?.totalBathrooms || 0}</div>
          <div className="text-sm text-gray-600">Bathrooms</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <Square className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{property.details?.totalSquareFeet?.toLocaleString() || '0'}</div>
          <div className="text-sm text-gray-600">Square Feet</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <Car className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{property.details?.parkingSpaces || 0}</div>
          <div className="text-sm text-gray-600">Parking</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
        <h3 className="font-medium text-gray-900 mb-3">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <div className="text-sm text-gray-600">Monthly Income</div>
            <div className="text-lg font-bold text-gray-900">
              ${property.financial?.totalMonthlyIncome?.toLocaleString() || property.financial?.marketRent?.toLocaleString() || '0'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Property Value</div>
            <div className="text-lg font-bold text-gray-900">
              ${property.financial?.currentValue?.toLocaleString() || '0'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Tenants</div>
            <div className="text-lg font-bold text-gray-900">
              {property.tenants?.length || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUnits = () => (
    <div className="space-y-4">
      {property.details?.units?.length > 0 ? (
        property.details.units.map((unit, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{unit.unitNumber}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {unit.type}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    unit.status === 'occupied' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {unit.status}
                  </span>
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900">
                ${unit.monthlyRent?.toLocaleString() || '0'}/month
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-gray-600">Bedrooms</div>
                <div className="font-medium">{unit.bedrooms}</div>
              </div>
              <div>
                <div className="text-gray-600">Bathrooms</div>
                <div className="font-medium">{unit.bathrooms}</div>
              </div>
              <div>
                <div className="text-gray-600">Size</div>
                <div className="font-medium">{unit.squareFeet} sq ft</div>
              </div>
              <div>
                <div className="text-gray-600">Deposit</div>
                <div className="font-medium">${unit.deposit?.toLocaleString() || '0'}</div>
              </div>
            </div>
            {unit.features?.length > 0 && (
              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-1">Features:</div>
                <div className="flex flex-wrap gap-1">
                  {unit.features.map((feature, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Units/Rooms</h4>
          <p className="text-gray-600">This is a single unit property.</p>
        </div>
      )}
    </div>
  );

  const renderFinancial = () => (
    <div className="space-y-6">
      {/* Income Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-medium text-gray-900 mb-3">Income Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Monthly Rent</span>
            <span className="font-medium">
              ${property.financial?.marketRent?.toLocaleString() || '0'}
            </span>
          </div>
          {property.financial?.totalMonthlyIncome > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Total Monthly Income</span>
              <span className="font-medium text-green-600">
                ${property.financial.totalMonthlyIncome.toLocaleString()}
              </span>
            </div>
          )}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">Annual Income</span>
              <span className="font-bold text-gray-900">
                ${((property.financial?.marketRent || property.financial?.totalMonthlyIncome || 0) * 12).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-medium text-gray-900 mb-3">Expenses</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Property Tax (Annual)</span>
            <span className="font-medium">
              ${property.financial?.propertyTax?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Insurance (Annual)</span>
            <span className="font-medium">
              ${property.financial?.insurance?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">HOA Fees (Monthly)</span>
            <span className="font-medium">
              ${property.financial?.hoaFees?.toLocaleString() || '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Mortgage */}
      {property.financial?.mortgage?.hasMortgage && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-900 mb-3">Mortgage Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-700">Lender</span>
              <span className="font-medium">{property.financial.mortgage.lender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Loan Amount</span>
              <span className="font-medium">${property.financial.mortgage.loanAmount?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Interest Rate</span>
              <span className="font-medium">{property.financial.mortgage.interestRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Monthly Payment</span>
              <span className="font-medium">${property.financial.mortgage.monthlyPayment?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ROI Calculation */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h3 className="font-medium text-green-900 mb-3">Investment Analysis</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-green-700">Property Value</span>
            <span className="font-medium">${property.financial?.currentValue?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Annual Income</span>
            <span className="font-medium">
              ${((property.financial?.marketRent || property.financial?.totalMonthlyIncome || 0) * 12).toLocaleString()}
            </span>
          </div>
          {property.financial?.currentValue > 0 && (
            <div className="pt-3 border-t border-green-200">
              <div className="flex justify-between">
                <span className="text-green-900 font-medium">Cap Rate</span>
                <span className="font-bold text-green-900">
                  {(((property.financial?.marketRent || property.financial?.totalMonthlyIncome || 0) * 12 / 
                    property.financial.currentValue) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'units':
        return renderUnits();
      case 'financial':
        return renderFinancial();
      case 'tenants':
        return (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Tenant Management</h4>
            <p className="text-gray-600">Manage tenants from the property detail page.</p>
          </div>
        );
      case 'documents':
        return (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Property Documents</h4>
            <p className="text-gray-600">Upload and manage property documents.</p>
          </div>
        );
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
              <div>
                <h2 className="text-xl font-bold text-gray-900">{property.name}</h2>
                <p className="text-sm text-gray-500">
                  {editMode ? 'Edit Property' : 'Property Details'}
                </p>
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
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                Created: {new Date(property.createdAt).toLocaleDateString()}
              </div>
              <div>
                Last Updated: {new Date(property.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}