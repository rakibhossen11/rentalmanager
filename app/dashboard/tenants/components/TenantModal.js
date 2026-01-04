// app/components/TenantModal.jsx
import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, DollarSign, Home, Users, Car, FileText, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TenantModal({ tenant, onClose, onSuccess, mode = 'add' }) {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      nationality: '',
      language: '',
      identification: {
        type: '',
        number: '',
        issueDate: '',
        expiryDate: '',
        issuingAuthority: ''
      }
    },
    employment: {
      occupation: '',
      employer: '',
      workAddress: '',
      workPhone: '',
      employmentType: '',
      employmentStartDate: '',
      monthlyIncome: '',
      annualIncome: '',
      payFrequency: '',
      educationLevel: '',
      schoolName: '',
      graduationYear: ''
    },
    propertyId: '',
    unit: '',
    lease: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      monthlyRent: '',
      securityDeposit: '',
      petDeposit: '',
      dueDay: 1,
      lateFee: '',
      gracePeriod: 5,
      utilitiesIncluded: [],
      tenantPays: []
    },
    pets: [],
    vehicles: [],
    familyMembers: [],
    financial: {
      creditScore: '',
      paymentMethods: [],
      previousRentalHistory: [],
      monthlyDebtObligations: ''
    },
    insurance: {
      renterInsurance: {
        provider: '',
        policyNumber: '',
        coverageAmount: '',
        effectiveDate: '',
        monthlyPremium: ''
      }
    },
    emergencyContact: {
      primary: { name: '', relationship: '', phone: '' }
    },
    notes: '',
    status: 'active',
    tags: []
  });

  const [activeTab, setActiveTab] = useState('personal');

  // Load properties and set form data if editing
  useEffect(() => {
    fetchProperties();
    
    if (mode === 'edit' && tenant) {
      setFormData(prev => ({
        ...prev,
        ...tenant,
        propertyId: tenant.propertyId?._id || tenant.propertyId || '',
        lease: {
          ...prev.lease,
          ...tenant.lease,
          startDate: tenant.lease?.startDate ? new Date(tenant.lease.startDate).toISOString().split('T')[0] : '',
          endDate: tenant.lease?.endDate ? new Date(tenant.lease.endDate).toISOString().split('T')[0] : ''
        }
      }));
    } else {
      // For new tenant, calculate end date (3 months from start)
      const startDate = new Date(formData.lease.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3);
      
      setFormData(prev => ({
        ...prev,
        lease: {
          ...prev.lease,
          endDate: endDate.toISOString().split('T')[0]
        }
      }));
    }
  }, [tenant, mode]);

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties?status=active&limit=100');
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleChange = (e, section, subSection = null) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev };
      
      if (subSection) {
        newData[section][subSection] = {
          ...newData[section][subSection],
          [name]: type === 'checkbox' ? checked : value
        };
      } else if (section) {
        newData[section] = {
          ...newData[section],
          [name]: type === 'checkbox' ? checked : value
        };
      } else {
        newData[name] = type === 'checkbox' ? checked : value;
      }
      
      return newData;
    });
  };

  const handleLeaseDateChange = (dateType, value) => {
    setFormData(prev => {
      const newLease = { ...prev.lease, [dateType]: value };
      
      // If start date changes and end date is empty or less than start date, update end date
      if (dateType === 'startDate' && value) {
        const startDate = new Date(value);
        const currentEndDate = new Date(newLease.endDate);
        
        if (!newLease.endDate || currentEndDate <= startDate) {
          const newEndDate = new Date(startDate);
          newEndDate.setMonth(newEndDate.getMonth() + 3);
          newLease.endDate = newEndDate.toISOString().split('T')[0];
        }
      }
      
      return { ...prev, lease: newLease };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = mode === 'edit' ? `/api/tenants/${tenant._id}` : '/api/tenants';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(mode === 'edit' ? 'Tenant updated successfully!' : 'Tenant added successfully!');
        onSuccess(data.tenant || data.tenantId);
      } else {
        throw new Error(data.error || data.details?.[0] || 'Something went wrong');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'lease', label: 'Lease Details', icon: FileText },
    { id: 'employment', label: 'Employment', icon: Users },
    { id: 'property', label: 'Property', icon: Home },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'insurance', label: 'Insurance', icon: Shield },
    { id: 'additional', label: 'Additional', icon: Car }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.personalInfo.fullName}
                  onChange={(e) => handleChange(e, 'personalInfo')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleChange(e, 'personalInfo')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => handleChange(e, 'personalInfo')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Emergency Contact */}
            <div className="border-t pt-4">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.emergencyContact.primary.name}
                    onChange={(e) => handleChange(e, 'emergencyContact', 'primary')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="relationship"
                    value={formData.emergencyContact.primary.relationship}
                    onChange={(e) => handleChange(e, 'emergencyContact', 'primary')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.emergencyContact.primary.phone}
                    onChange={(e) => handleChange(e, 'emergencyContact', 'primary')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'lease':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.lease.startDate}
                  onChange={(e) => handleLeaseDateChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.lease.endDate}
                  onChange={(e) => handleLeaseDateChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                  <input
                    type="number"
                    name="monthlyRent"
                    value={formData.lease.monthlyRent}
                    onChange={(e) => handleChange(e, 'lease')}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security Deposit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                  <input
                    type="number"
                    name="securityDeposit"
                    value={formData.lease.securityDeposit}
                    onChange={(e) => handleChange(e, 'lease')}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rent Due Day
                </label>
                <select
                  name="dueDay"
                  value={formData.lease.dueDay}
                  onChange={(e) => handleChange(e, 'lease')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>
                      {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of month
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Late Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                  <input
                    type="number"
                    name="lateFee"
                    value={formData.lease.lateFee}
                    onChange={(e) => handleChange(e, 'lease')}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'property':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Property
                </label>
                <select
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={(e) => handleChange(e, '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No Property Selected</option>
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
                  name="unit"
                  value={formData.unit}
                  onChange={(e) => handleChange(e, '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., A101"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <p className="text-gray-500">Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {mode === 'edit' ? 'Edit Tenant' : 'Add New Tenant'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {mode === 'edit' ? 'Update tenant information' : 'Add a new tenant to your property'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 py-4 max-h-[60vh] overflow-y-auto">
              {renderTabContent()}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {mode === 'edit' ? 'Updating...' : 'Adding...'}
                  </span>
                ) : (
                  mode === 'edit' ? 'Update Tenant' : 'Add Tenant'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}