// app/components/AddTenantModal.jsx
'use client';

import { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Home, 
  Calendar,
  FileText,
  DollarSign,
  UserPlus,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddTenantModal({ onClose, onSuccess, user }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    
    // Address Information
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    
    // Lease Information
    propertyId: '',
    leaseStartDate: new Date().toISOString().split('T')[0],
    leaseEndDate: '',
    monthlyRent: '',
    securityDeposit: '',
    rentDueDay: 1,
    
    // Additional Details
    occupation: '',
    employer: '',
    monthlyIncome: '',
    notes: '',
    
    // Documents (to be uploaded separately)
    documents: []
  });

  const [step, setStep] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [availableProperties, setAvailableProperties] = useState([]);

  // Fetch available properties on mount
//   useState(() => {
//     fetchAvailableProperties();
//   }, []);

//   const fetchAvailableProperties = async () => {
//     try {
//       const res = await fetch('/api/properties?status=active&available=true');
//       if (res.ok) {
//         const data = await res.json();
//         setAvailableProperties(data);
//       }
//     } catch (error) {
//       console.error('Error fetching properties:', error);
//     }
//   };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects (like address)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.propertyId) {
        throw new Error('Please fill in all required fields');
      }

      // Check user limits
      if (user?.subscription?.plan === 'free') {
        const tenantCountRes = await fetch('/api/tenants/count');
        if (tenantCountRes.ok) {
          const { count } = await tenantCountRes.json();
          if (count >= user?.limits?.tenants) {
            throw new Error(`Free plan limited to ${user.limits.tenants} tenants. Please upgrade to add more.`);
          }
        }
      }

      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add tenant');
      }

      toast.success('Tenant added successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Property & Lease', icon: Home },
    { number: 3, title: 'Financial Details', icon: DollarSign },
    { number: 4, title: 'Review & Submit', icon: CheckCircle }
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Software Engineer"
                />
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Emergency contact name"
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Emergency contact phone"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Property & Lease Details
            </h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Property *
              </label>
              <select
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a property</option>
                {availableProperties.map(property => (
                  <option key={property._id} value={property._id}>
                    {property.name} - {property.address.street}, {property.address.city}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Lease Start Date *
                </label>
                <input
                  type="date"
                  name="leaseStartDate"
                  value={formData.leaseStartDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Lease End Date
                </label>
                <input
                  type="date"
                  name="leaseEndDate"
                  value={formData.leaseEndDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Rent Due Day *
              </label>
              <select
                name="rentDueDay"
                value={formData.rentDueDay}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Financial Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Monthly Rent ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="monthlyRent"
                    value={formData.monthlyRent}
                    onChange={handleChange}
                    className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1500.00"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Security Deposit ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                    className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1500.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Monthly Income ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5000.00"
                  step="0.01"
                />
              </div>
              <p className="text-sm text-gray-500">
                Typically should be 3x the monthly rent
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Employer
              </label>
              <input
                type="text"
                name="employer"
                value={formData.employer}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Company Name"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Review & Submit
            </h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tenant Name:</span>
                    <span className="font-medium">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Rent:</span>
                    <span className="font-medium">${formData.monthlyRent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lease Start:</span>
                    <span className="font-medium">
                      {new Date(formData.leaseStartDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any additional notes or special instructions..."
                />
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
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Add New Tenant</h2>
                <p className="text-blue-100 text-sm">
                  Step {step} of 4: {steps[step - 1]?.title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex justify-between mt-6">
              {steps.map((stepItem) => {
                const Icon = stepItem.icon;
                const isActive = stepItem.number === step;
                const isCompleted = stepItem.number < step;
                
                return (
                  <div key={stepItem.number} className="flex flex-col items-center">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full mb-2
                      ${isCompleted ? 'bg-green-500' : isActive ? 'bg-white' : 'bg-blue-400'}
                      transition-colors
                    `}>
                      <Icon className={`
                        w-5 h-5
                        ${isCompleted ? 'text-white' : isActive ? 'text-blue-600' : 'text-white'}
                      `} />
                    </div>
                    <span className={`
                      text-xs font-medium
                      ${isActive ? 'text-white' : 'text-blue-200'}
                    `}>
                      {stepItem.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Form Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <form onSubmit={handleSubmit}>
              {renderStep()}
            </form>
          </div>
          
          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    Next Step
                    <span className="ml-2">→</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding Tenant...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Tenant
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


// 'use client';

// import { useState } from 'react';
// import { 
//     X, 
//     User, 
//     Mail, 
//     Phone, 
//     MapPin,
//     Calendar,
//     DollarSign,
//     FileText,
//     AlertCircle,
//     Building2,
//     Shield,
//     Camera
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// export default function AddTenantModal({ onClose, onSuccess, user }) {
//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         phone: '',
//         alternatePhone: '',
//         address: '',
//         unitNumber: '',
//         rentAmount: '',
//         securityDeposit: '',
//         petDeposit: '',
//         rentDueDay: '1',
//         leaseStart: '',
//         leaseEnd: '',
//         emergencyContact: '',
//         emergencyPhone: '',
//         notes: '',
//         status: 'active'
//     });
    
//     const [loading, setLoading] = useState(false);
//     const [errors, setErrors] = useState({});

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
        
//         // Clear error for this field
//         if (errors[name]) {
//             setErrors(prev => ({ ...prev, [name]: '' }));
//         }
//     };

//     const validateForm = () => {
//         const newErrors = {};
        
//         if (!formData.name.trim()) {
//             newErrors.name = 'Name is required';
//         }
        
//         if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//             newErrors.email = 'Invalid email format';
//         }
        
//         if (formData.rentAmount && isNaN(parseFloat(formData.rentAmount))) {
//             newErrors.rentAmount = 'Rent amount must be a number';
//         }
        
//         if (formData.rentDueDay && (parseInt(formData.rentDueDay) < 1 || parseInt(formData.rentDueDay) > 31)) {
//             newErrors.rentDueDay = 'Rent due day must be between 1 and 31';
//         }
        
//         return newErrors;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         const validationErrors = validateForm();
//         if (Object.keys(validationErrors).length > 0) {
//             setErrors(validationErrors);
//             return;
//         }
        
//         setLoading(true);
        
//         try {
//             const res = await fetch('/api/tenants', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(formData)
//             });
            
//             const data = await res.json();
            
//             if (res.ok) {
//                 toast.success('Tenant added successfully!');
//                 onSuccess();
//             } else {
//                 throw new Error(data.error || 'Failed to add tenant');
//             }
//         } catch (error) {
//             toast.error(error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
//                 {/* Header */}
//                 <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
//                     <div>
//                         <h2 className="text-xl font-bold text-gray-900">Add New Tenant</h2>
//                         <p className="text-sm text-gray-600">Fill in the tenant's information</p>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                     >
//                         <X className="w-5 h-5" />
//                     </button>
//                 </div>
                
//                 {/* Form */}
//                 <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {/* Personal Information */}
//                         <div className="space-y-4">
//                             <h3 className="font-semibold text-gray-900 flex items-center">
//                                 <User className="w-4 h-4 mr-2" />
//                                 Personal Information
//                             </h3>
                            
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Full Name *
//                                 </label>
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={formData.name}
//                                     onChange={handleChange}
//                                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                                         errors.name ? 'border-red-300' : 'border-gray-300'
//                                     }`}
//                                     placeholder="John Doe"
//                                 />
//                                 {errors.name && (
//                                     <p className="mt-1 text-sm text-red-600">{errors.name}</p>
//                                 )}
//                             </div>
                            
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Email Address
//                                 </label>
//                                 <div className="relative">
//                                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                                     <input
//                                         type="email"
//                                         name="email"
//                                         value={formData.email}
//                                         onChange={handleChange}
//                                         className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                                             errors.email ? 'border-red-300' : 'border-gray-300'
//                                         }`}
//                                         placeholder="john@example.com"
//                                     />
//                                 </div>
//                                 {errors.email && (
//                                     <p className="mt-1 text-sm text-red-600">{errors.email}</p>
//                                 )}
//                             </div>
                            
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Phone Number
//                                 </label>
//                                 <div className="relative">
//                                     <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                                     <input
//                                         type="tel"
//                                         name="phone"
//                                         value={formData.phone}
//                                         onChange={handleChange}
//                                         className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                         placeholder="(555) 123-4567"
//                                     />
//                                 </div>
//                             </div>
                            
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Alternate Phone
//                                 </label>
//                                 <input
//                                     type="tel"
//                                     name="alternatePhone"
//                                     value={formData.alternatePhone}
//                                     onChange={handleChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     placeholder="(555) 987-6543"
//                                 />
//                             </div>
//                         </div>
                        
//                         {/* Property Information */}
//                         <div className="space-y-4">
//                             <h3 className="font-semibold text-gray-900 flex items-center">
//                                 <Building2 className="w-4 h-4 mr-2" />
//                                 Property Information
//                             </h3>
                            
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Address
//                                 </label>
//                                 <div className="relative">
//                                     <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                                     <input
//                                         type="text"
//                                         name="address"
//                                         value={formData.address}
//                                         onChange={handleChange}
//                                         className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                         placeholder="123 Main St, Apt 4B"
//                                     />
//                                 </div>
//                             </div>
                            
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Unit Number
//                                 </label>
//                                 <input
//                                     type="text"
//                                     name="unitNumber"
//                                     value={formData.unitNumber}
//                                     onChange={handleChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     placeholder="4B"
//                                 />
//                             </div>
                            
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Monthly Rent
//                                     </label>
//                                     <div className="relative">
//                                         <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                                         <input
//                                             type="number"
//                                             name="rentAmount"
//                                             value={formData.rentAmount}
//                                             onChange={handleChange}
//                                             className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                                                 errors.rentAmount ? 'border-red-300' : 'border-gray-300'
//                                             }`}
//                                             placeholder="2500"
//                                             step="0.01"
//                                         />
//                                     </div>
//                                     {errors.rentAmount && (
//                                         <p className="mt-1 text-sm text-red-600">{errors.rentAmount}</p>
//                                     )}
//                                 </div>
                                
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Rent Due Day
//                                     </label>
//                                     <select
//                                         name="rentDueDay"
//                                         value={formData.rentDueDay}
//                                         onChange={handleChange}
//                                         className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                                             errors.rentDueDay ? 'border-red-300' : 'border-gray-300'
//                                         }`}
//                                     >
//                                         {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
//                                             <option key={day} value={day}>
//                                                 Day {day}
//                                             </option>
//                                         ))}
//                                     </select>
//                                     {errors.rentDueDay && (
//                                         <p className="mt-1 text-sm text-red-600">{errors.rentDueDay}</p>
//                                     )}
//                                 </div>
//                             </div>
                            
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Security Deposit
//                                     </label>
//                                     <div className="relative">
//                                         <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                                         <input
//                                             type="number"
//                                             name="securityDeposit"
//                                             value={formData.securityDeposit}
//                                             onChange={handleChange}
//                                             className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                             placeholder="2500"
//                                             step="0.01"
//                                         />
//                                     </div>
//                                 </div>
                                
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Pet Deposit
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="petDeposit"
//                                         value={formData.petDeposit}
//                                         onChange={handleChange}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                         placeholder="500"
//                                         step="0.01"
//                                     />
//                                 </div>
//                             </div>
//                         </div>
                        
//                         {/* Lease Information */}
//                         <div className="space-y-4">
//                             <h3 className="font-semibold text-gray-900 flex items-center">
//                                 <Calendar className="w-4 h-4 mr-2" />
//                                 Lease Information
//                             </h3>
                            
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Lease Start Date
//                                     </label>
//                                     <input
//                                         type="date"
//                                         name="leaseStart"
//                                         value={formData.leaseStart}
//                                         onChange={handleChange}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     />
//                                 </div>
                                
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Lease End Date
//                                     </label>
//                                     <input
//                                         type="date"
//                                         name="leaseEnd"
//                                         value={formData.leaseEnd}
//                                         onChange={handleChange}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     />
//                                 </div>
//                             </div>
                            
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Status
//                                 </label>
//                                 <select
//                                     name="status"
//                                     value={formData.status}
//                                     onChange={handleChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 >
//                                     <option value="active">Active</option>
//                                     <option value="inactive">Inactive</option>
//                                     <option value="pending">Pending</option>
//                                     <option value="past">Past</option>
//                                 </select>
//                             </div>
//                         </div>
                        
//                         {/* Emergency Contact & Notes */}
//                         <div className="space-y-4">
//                             <h3 className="font-semibold text-gray-900 flex items-center">
//                                 <AlertCircle className="w-4 h-4 mr-2" />
//                                 Additional Information
//                             </h3>
                            
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Emergency Contact Name
//                                 </label>
//                                 <input
//                                     type="text"
//                                     name="emergencyContact"
//                                     value={formData.emergencyContact}
//                                     onChange={handleChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     placeholder="Jane Smith"
//                                 />
//                             </div>
                            
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Emergency Contact Phone
//                                 </label>
//                                 <input
//                                     type="tel"
//                                     name="emergencyPhone"
//                                     value={formData.emergencyPhone}
//                                     onChange={handleChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     placeholder="(555) 555-5555"
//                                 />
//                             </div>
                            
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Notes
//                                 </label>
//                                 <textarea
//                                     name="notes"
//                                     value={formData.notes}
//                                     onChange={handleChange}
//                                     rows="3"
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     placeholder="Any additional notes about this tenant..."
//                                 />
//                             </div>
//                         </div>
//                     </div>
                    
//                     {/* Actions */}
//                     <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//                         >
//                             {loading ? (
//                                 <span className="flex items-center">
//                                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                                     </svg>
//                                     Adding Tenant...
//                                 </span>
//                             ) : 'Add Tenant'}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }