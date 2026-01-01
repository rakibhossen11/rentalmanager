// app/components/AddTenantModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { 
  X, User, Mail, Phone, Home, Calendar,
  DollarSign, FileText, UserPlus, CheckCircle,
  MapPin, Briefcase, Shield, Building, CreditCard,
  ChevronRight, ChevronLeft, Clock, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddTenantModal({ onClose, onSuccess, user }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  console.log(user);

  // All form data in a compact structure
  const [formData, setFormData] = useState({
    // Personal Info (Step 1)
    name: '',
    email: '',
    phone: '',
    occupation: '',
    
    // Property Info (Step 2)
    propertyId: '',
    unit: '',
    leaseStart: new Date().toISOString().split('T')[0],
    leaseEnd: '',
    rentDueDay: 5,
    
    // Financial Info (Step 3)
    rent: '',
    deposit: '',
    income: '',
    employer: '',
    
    // Additional (Step 4)
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
    status: 'active'
  });

  // Fetch properties on mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setPropertiesLoading(true);
        const res = await fetch('/api/properties?status=active&limit=20');
        if (res.ok) {
          const data = await res.json();
          setAvailableProperties(data.properties || []);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setPropertiesLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.name || !formData.email || !formData.propertyId || !formData.rent) {
        throw new Error('Please fill in all required fields');
      }

      // Check limits
      if (user?.subscription?.plan === 'free') {
        const tenantCountRes = await fetch('/api/tenants/count');
        if (tenantCountRes.ok) {
          const { count } = await tenantCountRes.json();
          if (count >= user?.limits?.tenants) {
            throw new Error(`Free plan limited to ${user.limits.tenants} tenants. Upgrade to add more.`);
          }
        }
      }

      // Prepare data for API
      const tenantData = {
        personalInfo: {
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          occupation: formData.occupation,
          emergencyContact: {
            name: formData.emergencyContact,
            phone: formData.emergencyPhone
          }
        },
        propertyId: formData.propertyId,
        unit: formData.unit,
        lease: {
          startDate: formData.leaseStart,
          endDate: formData.leaseEnd,
          monthlyRent: parseFloat(formData.rent) || 0,
          securityDeposit: parseFloat(formData.deposit) || 0,
          dueDay: parseInt(formData.rentDueDay) || 5
        },
        financial: {
          monthlyIncome: parseFloat(formData.income) || 0,
          employer: formData.employer
        },
        notes: formData.notes,
        status: formData.status
      };

      // Submit to API
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add tenant');
      }

      toast.success('✓ Tenant added successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Steps configuration
  const steps = [
    { number: 1, title: 'Personal', icon: User, color: 'blue' },
    { number: 2, title: 'Property', icon: Home, color: 'green' },
    { number: 3, title: 'Financial', icon: DollarSign, color: 'purple' },
    { number: 4, title: 'Review', icon: CheckCircle, color: 'emerald' }
  ];

  // Compact step rendering
  const renderStep = () => {
    switch (step) {
      case 1: // Personal Info
        return (
          <div className="modal-overlay space-y-5">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-500">Basic tenant details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90"
                  placeholder="Software Engineer"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Property Info
        return (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <Home className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Property & Lease</h3>
              <p className="text-sm text-gray-500">Where and when they'll live</p>
            </div>

            <div className="space-y-4">
              {propertiesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-500 text-sm mt-2">Loading properties...</p>
                </div>
              ) : availableProperties.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-800 font-medium">No properties available</p>
                      <p className="text-yellow-700 text-sm mt-1">Add a property first to assign tenants.</p>
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90"
                      required
                    >
                      <option value="">Choose a property...</option>
                      {availableProperties.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name} • {p.address?.street}, {p.address?.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        Unit #
                      </label>
                      <input
                        type="text"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90"
                        placeholder="Apt 4B"
                      />
                    </div>

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
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Lease Start *</label>
                      <input
                        type="date"
                        name="leaseStart"
                        value={formData.leaseStart}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Lease End</label>
                      <input
                        type="date"
                        name="leaseEnd"
                        value={formData.leaseEnd}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 3: // Financial Info
        return (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Financial Details</h3>
              <p className="text-sm text-gray-500">Rent and income information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  Monthly Rent *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90"
                    placeholder="1500.00"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-gray-400" />
                  Security Deposit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90"
                    placeholder="1500.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                  Monthly Income
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="income"
                    value={formData.income}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90"
                    placeholder="5000.00"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.rent && formData.income 
                    ? `${(parseFloat(formData.income) / parseFloat(formData.rent)).toFixed(1)}x rent ratio`
                    : 'Recommended: 3x monthly rent'
                  }
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Employer</label>
                <input
                  type="text"
                  name="employer"
                  value={formData.employer}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90"
                  placeholder="Company Name"
                />
              </div>
            </div>
          </div>
        );

      case 4: // Review & Submit
        const selectedProperty = availableProperties.find(p => p._id === formData.propertyId);
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Review & Create</h3>
              <p className="text-sm text-gray-500">Confirm all details are correct</p>
            </div>

            {/* Summary Cards */}
            <div className="space-y-4">
              {/* Personal Summary */}
              <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <User className="w-4 h-4 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-900">Personal Details</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-blue-700">Name</div>
                    <div className="font-medium text-gray-900">{formData.name || "—"}</div>
                  </div>
                  <div>
                    <div className="text-blue-700">Email</div>
                    <div className="font-medium text-gray-900">{formData.email || "—"}</div>
                  </div>
                  <div>
                    <div className="text-blue-700">Phone</div>
                    <div className="font-medium text-gray-900">{formData.phone || "—"}</div>
                  </div>
                  <div>
                    <div className="text-blue-700">Occupation</div>
                    <div className="font-medium text-gray-900">{formData.occupation || "—"}</div>
                  </div>
                </div>
              </div>

              {/* Property & Lease Summary */}
              <div className="bg-green-50/80 border border-green-100 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Home className="w-4 h-4 text-green-600 mr-2" />
                  <h4 className="font-medium text-green-900">Property & Lease</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-green-700">Property</div>
                    <div className="font-medium text-gray-900">
                      {selectedProperty?.name || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-green-700">Unit</div>
                    <div className="font-medium text-gray-900">{formData.unit || "—"}</div>
                  </div>
                  <div>
                    <div className="text-green-700">Lease Start</div>
                    <div className="font-medium text-gray-900">
                      {formData.leaseStart ? new Date(formData.leaseStart).toLocaleDateString() : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-green-700">Rent Due Day</div>
                    <div className="font-medium text-gray-900">Day {formData.rentDueDay}</div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-purple-50/80 border border-purple-100 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="w-4 h-4 text-purple-600 mr-2" />
                  <h4 className="font-medium text-purple-900">Financial</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-purple-700">Monthly Rent</div>
                    <div className="font-medium text-gray-900">
                      {formData.rent ? `$${parseFloat(formData.rent).toLocaleString()}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-700">Deposit</div>
                    <div className="font-medium text-gray-900">
                      {formData.deposit ? `$${parseFloat(formData.deposit).toLocaleString()}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-700">Monthly Income</div>
                    <div className="font-medium text-gray-900">
                      {formData.income ? `$${parseFloat(formData.income).toLocaleString()}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-700">Employer</div>
                    <div className="font-medium text-gray-900">{formData.employer || "—"}</div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <FileText className="w-4 h-4 text-gray-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Additional Information</h4>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/90"
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Emergency Phone</label>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/90"
                      placeholder="(555) 555-5555"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/90"
                      placeholder="Any special instructions or notes..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Ultra-transparent backdrop - almost invisible */}
        <div 
          className="fixed inset-0 bg-gradient-to-br from-gray-50/30 to-gray-100/30 backdrop-blur-[2px]"
          onClick={onClose}
        />
        
        {/* Transparent modal with glass effect */}
        <div 
          className="relative w-full max-w-xl bg-white/95 backdrop-blur-sm rounded-2xl 
                     border border-gray-200/70 shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Compact Header */}
          <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-200/70 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {steps.map(s => (
                    <div
                      key={s.number}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                        ${step === s.number 
                          ? `bg-${s.color}-600 text-white` 
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
                    Step {step}: {steps[step-1]?.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100/80 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          {/* Form Content - Compact */}
          <div className="p-6 max-h-[calc(100vh-180px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {renderStep()}
            </form>
          </div>
          
          {/* Compact Footer */}
          <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200/70 bg-white/95 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2.5 text-gray-700 hover:bg-gray-100/80 rounded-xl transition-colors flex items-center text-sm font-medium"
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
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      disabled={
                        (step === 1 && (!formData.name || !formData.email || !formData.phone)) ||
                        (step === 2 && (!formData.propertyId || availableProperties.length === 0)) ||
                        (step === 3 && !formData.rent)
                      }
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                               transition-colors flex items-center text-sm font-medium 
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 
                             transition-colors flex items-center text-sm font-medium 
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Tenant
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}