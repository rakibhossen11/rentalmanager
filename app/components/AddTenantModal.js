// app/components/AddTenantModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { 
  X, User, Mail, Phone, Home, Calendar,
  DollarSign, FileText, UserPlus, CheckCircle,
  MapPin, Briefcase, Shield, Building, CreditCard,
  ChevronRight, ChevronLeft, Clock, AlertCircle,
  Loader2, Key, FileCheck, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Step configuration
const STEPS = [
  { number: 1, title: 'Personal', icon: User, color: 'blue' },
  { number: 2, title: 'Property', icon: Home, color: 'green' },
  { number: 3, title: 'Financial', icon: DollarSign, color: 'purple' },
  { number: 4, title: 'Review', icon: CheckCircle, color: 'emerald' }
];

// Initial form state
const INITIAL_FORM_DATA = {
  // Personal Info
  name: '',
  email: '',
  phone: '',
  occupation: '',
  
  // Property Info
  propertyId: '',
  unit: '',
  leaseStart: new Date().toISOString().split('T')[0],
  leaseEnd: '',
  rentDueDay: 5,
  
  // Financial Info
  rent: '',
  deposit: '',
  income: '',
  employer: '',
  
  // Additional Info
  emergencyContact: '',
  emergencyPhone: '',
  notes: '',
  status: 'active'
};

export default function AddTenantModal({ onClose, onSuccess, user }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties();
  }, []);

  // Validate current step
  useEffect(() => {
    validateCurrentStep();
  }, [formData, step]);

  const fetchProperties = async () => {
    try {
      setPropertiesLoading(true);
      const res = await fetch('/api/properties?status=active&limit=50');
      
      if (res.ok) {
        const data = await res.json();
        setAvailableProperties(data.properties || []);
      } else {
        throw new Error('Failed to fetch properties');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setPropertiesLoading(false);
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone is required';
        } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\D/g, ''))) {
          newErrors.phone = 'Invalid phone number';
        }
        break;
        
      case 2:
        if (!formData.propertyId) newErrors.propertyId = 'Property is required';
        if (!formData.leaseStart) newErrors.leaseStart = 'Lease start date is required';
        if (formData.leaseEnd && new Date(formData.leaseEnd) <= new Date(formData.leaseStart)) {
          newErrors.leaseEnd = 'Lease end must be after start date';
        }
        break;
        
      case 3:
        if (!formData.rent || parseFloat(formData.rent) <= 0) {
          newErrors.rent = 'Valid rent amount is required';
        }
        if (formData.deposit && parseFloat(formData.deposit) < 0) {
          newErrors.deposit = 'Deposit cannot be negative';
        }
        if (formData.income && parseFloat(formData.income) < 0) {
          newErrors.income = 'Income cannot be negative';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    
    // Format phone number
    if (name === 'phone' || name === 'emergencyPhone') {
      processedValue = formatPhoneNumber(value);
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: processedValue 
    }));
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const phone = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `(${phone.slice(0,3)}) ${phone.slice(3)}`;
    return `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6,10)}`;
  };

  const checkUserLimits = async () => {
    if (user?.subscription?.plan === 'free') {
      try {
        const tenantCountRes = await fetch('/api/tenants/count');
        if (tenantCountRes.ok) {
          const { count } = await tenantCountRes.json();
          if (count >= user?.limits?.tenants) {
            throw new Error(`Free plan limited to ${user.limits.tenants} tenants. Upgrade to add more.`);
          }
        }
      } catch (error) {
        throw error;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      toast.error('Please fix errors before submitting');
      return;
    }
    
    setLoading(true);
    
    try {
      // Check user limits
      await checkUserLimits();
      
      // Prepare data for API
      const tenantData = {
        personalInfo: {
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          occupation: formData.occupation.trim(),
          emergencyContact: {
            name: formData.emergencyContact.trim(),
            phone: formData.emergencyPhone.replace(/\D/g, '')
          }
        },
        propertyId: formData.propertyId,
        unit: formData.unit.trim(),
        lease: {
          startDate: formData.leaseStart,
          endDate: formData.leaseEnd || null,
          monthlyRent: parseFloat(formData.rent) || 0,
          securityDeposit: parseFloat(formData.deposit) || 0,
          dueDay: parseInt(formData.rentDueDay) || 5
        },
        financial: {
          monthlyIncome: parseFloat(formData.income) || 0,
          employer: formData.employer.trim()
        },
        notes: formData.notes.trim(),
        status: formData.status
      };
      
      // Submit to API
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(tenantData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Failed to add tenant (${res.status})`);
      }
      
      toast.success('Tenant added successfully!');
      onSuccess(data.tenant || data);
      
    } catch (error) {
      console.error('Error adding tenant:', error);
      toast.error(error.message || 'Failed to add tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Render steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-500">Basic tenant details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput({
                label: 'Full Name *',
                name: 'name',
                icon: User,
                placeholder: 'John Doe',
                required: true,
                error: errors.name
              })}
              
              {renderInput({
                label: 'Email *',
                name: 'email',
                type: 'email',
                icon: Mail,
                placeholder: 'john@example.com',
                required: true,
                error: errors.email
              })}

              {renderInput({
                label: 'Phone *',
                name: 'phone',
                type: 'tel',
                icon: Phone,
                placeholder: '(555) 123-4567',
                required: true,
                error: errors.phone
              })}

              {renderInput({
                label: 'Occupation',
                name: 'occupation',
                icon: Briefcase,
                placeholder: 'Software Engineer',
                required: false
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <Home className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Property & Lease</h3>
              <p className="text-sm text-gray-500">Where and when they'll live</p>
            </div>

            <div className="space-y-4">
              {propertiesLoading ? (
                <div className="text-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Loading properties...</p>
                </div>
              ) : availableProperties.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-800 font-medium">No properties available</p>
                      <p className="text-yellow-700 text-sm mt-1">
                        Add a property first to assign tenants. 
                        <button 
                          onClick={() => window.open('/properties/add', '_blank')}
                          className="ml-1 text-yellow-800 font-medium hover:underline"
                        >
                          Add Property →
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      Select Property *
                    </label>
                    <select
                      name="propertyId"
                      value={formData.propertyId}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90
                        ${errors.propertyId ? 'border-red-300' : 'border-gray-200'}`}
                      required
                    >
                      <option value="">Choose a property...</option>
                      {availableProperties.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name} • {p.address?.street}, {p.address?.city}
                        </option>
                      ))}
                    </select>
                    {errors.propertyId && (
                      <p className="text-red-500 text-xs mt-1">{errors.propertyId}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {renderInput({
                      label: 'Unit #',
                      name: 'unit',
                      icon: MapPin,
                      placeholder: 'Apt 4B',
                      className: 'col-span-1'
                    })}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        Rent Due Day *
                      </label>
                      <select
                        name="rentDueDay"
                        value={formData.rentDueDay}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90"
                      >
                        {[1, 5, 10, 15, 20, 25].map(day => (
                          <option key={day} value={day}>Day {day}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {renderInput({
                      label: 'Lease Start *',
                      name: 'leaseStart',
                      type: 'date',
                      error: errors.leaseStart,
                      min: new Date().toISOString().split('T')[0]
                    })}

                    {renderInput({
                      label: 'Lease End',
                      name: 'leaseEnd',
                      type: 'date',
                      error: errors.leaseEnd,
                      min: formData.leaseStart || new Date().toISOString().split('T')[0]
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Financial Details</h3>
              <p className="text-sm text-gray-500">Rent and income information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderCurrencyInput({
                label: 'Monthly Rent *',
                name: 'rent',
                icon: DollarSign,
                placeholder: '1500.00',
                required: true,
                error: errors.rent
              })}

              {renderCurrencyInput({
                label: 'Security Deposit',
                name: 'deposit',
                icon: Shield,
                placeholder: '1500.00',
                error: errors.deposit
              })}

              {renderCurrencyInput({
                label: 'Monthly Income',
                name: 'income',
                icon: CreditCard,
                placeholder: '5000.00',
                error: errors.income,
                helperText: formData.rent && formData.income 
                  ? `${(parseFloat(formData.income) / parseFloat(formData.rent)).toFixed(1)}x rent ratio`
                  : 'Recommended: 3x monthly rent'
              })}

              {renderInput({
                label: 'Employer',
                name: 'employer',
                placeholder: 'Company Name'
              })}
            </div>
          </div>
        );

      case 4:
        const selectedProperty = availableProperties.find(p => p._id === formData.propertyId);
        const rentRatio = formData.rent && formData.income 
          ? (parseFloat(formData.income) / parseFloat(formData.rent)).toFixed(1)
          : null;
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-3">
                <FileCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Review & Create</h3>
              <p className="text-sm text-gray-500">Confirm all details are correct</p>
            </div>

            {/* Summary Cards */}
            <div className="space-y-4">
              {renderSummaryCard({
                title: 'Personal Details',
                icon: User,
                color: 'blue',
                items: [
                  { label: 'Name', value: formData.name },
                  { label: 'Email', value: formData.email },
                  { label: 'Phone', value: formData.phone },
                  { label: 'Occupation', value: formData.occupation }
                ]
              })}

              {renderSummaryCard({
                title: 'Property & Lease',
                icon: Home,
                color: 'green',
                items: [
                  { 
                    label: 'Property', 
                    value: selectedProperty ? `${selectedProperty.name} - ${selectedProperty.address?.street}` : '—' 
                  },
                  { label: 'Unit', value: formData.unit },
                  { 
                    label: 'Lease Dates', 
                    value: `${formatDate(formData.leaseStart)} to ${formatDate(formData.leaseEnd) || 'Month-to-Month'}` 
                  },
                  { label: 'Rent Due Day', value: `Day ${formData.rentDueDay}` }
                ]
              })}

              {renderSummaryCard({
                title: 'Financial Information',
                icon: DollarSign,
                color: 'purple',
                items: [
                  { label: 'Monthly Rent', value: formatCurrency(formData.rent) },
                  { label: 'Security Deposit', value: formatCurrency(formData.deposit) },
                  { 
                    label: 'Monthly Income', 
                    value: `${formatCurrency(formData.income)} ${rentRatio ? `(${rentRatio}x)` : ''}`
                  },
                  { label: 'Employer', value: formData.employer }
                ]
              })}

              {/* Additional Information */}
              <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <FileText className="w-4 h-4 text-gray-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Additional Information</h4>
                </div>
                <div className="space-y-3">
                  {renderInput({
                    label: 'Emergency Contact',
                    name: 'emergencyContact',
                    placeholder: 'Contact name',
                    size: 'sm'
                  })}
                  {renderInput({
                    label: 'Emergency Phone',
                    name: 'emergencyPhone',
                    type: 'tel',
                    placeholder: '(555) 555-5555',
                    size: 'sm'
                  })}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white/90 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any special instructions or notes..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Helper render functions
  const renderInput = ({ 
    label, name, type = 'text', icon: Icon, placeholder, required, error, 
    min, max, className = '', size = 'md' 
  }) => {
    const inputClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3'
    };
    
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium text-gray-700 flex items-center">
          {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />}
          {label}
        </label>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90
            ${inputClasses[size]} 
            ${error ? 'border-red-300' : 'border-gray-200'}`}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
        />
        {error && (
          <p className="text-red-500 text-xs flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {error}
          </p>
        )}
      </div>
    );
  };

  const renderCurrencyInput = ({ label, name, icon: Icon, placeholder, required, error, helperText }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center">
        {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />}
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
        <input
          type="number"
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full pl-10 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90
            ${error ? 'border-red-300' : 'border-gray-200'}`}
          placeholder={placeholder}
          required={required}
          step="0.01"
          min="0"
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );

  const renderSummaryCard = ({ title, icon: Icon, color, items }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-100',
      green: 'bg-green-50 border-green-100',
      purple: 'bg-purple-50 border-purple-100'
    };
    
    const textColor = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600'
    };
    
    return (
      <div className={`${colorClasses[color]} border rounded-xl p-4`}>
        <div className="flex items-center mb-3">
          <Icon className={`w-4 h-4 ${textColor[color]} mr-2`} />
          <h4 className={`font-medium ${textColor[color].replace('600', '900')}`}>{title}</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {items.map((item, index) => (
            <div key={index}>
              <div className="text-gray-600 mb-1">{item.label}</div>
              <div className="font-medium text-gray-900 truncate">
                {item.value || <span className="text-gray-400">Not provided</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  // Determine if next button should be disabled
  const isNextDisabled = () => {
    switch (step) {
      case 1:
        return !formData.name || !formData.email || !formData.phone || Object.keys(errors).length > 0;
      case 2:
        return !formData.propertyId || availableProperties.length === 0 || Object.keys(errors).length > 0;
      case 3:
        return !formData.rent || Object.keys(errors).length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gradient-to-br from-gray-900/20 to-gray-900/30 backdrop-blur-[1px]"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div 
          className="relative w-full max-w-xl bg-white/95 backdrop-blur-sm rounded-2xl 
                     border border-gray-200/70 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-200/70 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Step indicators */}
                <div className="flex items-center space-x-2">
                  {STEPS.map(s => (
                    <div
                      key={s.number}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
                        ${step === s.number 
                          ? `bg-${s.color}-600 text-white shadow-md` 
                          : step > s.number 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                        }`}
                    >
                      {step > s.number ? '✓' : s.number}
                    </div>
                  ))}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Add Tenant</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Step {step} of {STEPS.length}: {STEPS[step-1]?.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100/80 rounded-lg transition-colors"
                aria-label="Close"
                disabled={loading}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          {/* Form Content */}
          <div className="p-6 max-h-[calc(100vh-180px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStep()}
            </form>
          </div>
          
          {/* Footer */}
          <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200/70 bg-white/95 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="px-4 py-2.5 text-gray-700 hover:bg-gray-100/80 rounded-xl transition-colors flex items-center text-sm font-medium disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </button>
                )}
              </div>
              
              <div className="flex gap-3">
                {step < 4 ? (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 text-gray-700 hover:bg-gray-100/80 rounded-xl transition-colors text-sm font-medium"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isNextDisabled() || loading}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                               transition-colors flex items-center text-sm font-medium 
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 text-gray-700 hover:bg-gray-100/80 rounded-xl transition-colors text-sm font-medium"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading || Object.keys(errors).length > 0}
                      className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 
                               transition-colors flex items-center text-sm font-medium 
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Tenant
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}