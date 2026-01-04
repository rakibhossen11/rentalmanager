// app/components/TenantFormModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { 
  X, User, Mail, Phone, Home, Calendar, DollarSign, FileText, 
  UserPlus, CheckCircle, MapPin, Briefcase, Shield, Building, 
  CreditCard, ChevronRight, ChevronLeft, Clock, AlertCircle,
  Loader2, Key, FileCheck, AlertTriangle, Users, IdCard, 
  Plus, Trash2, Heart, UserCog, Fingerprint, ShieldCheck,
  Car, Dog, Cat, Bank, GraduationCap, Globe, HeartPulse,
  Smartphone, Upload, Camera, FileUp, Lock, Eye, EyeOff,
  CreditCard as Card, FileSignature, Car as CarIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

// Step configuration
const STEPS = [
  { number: 1, title: 'Personal', icon: User, color: 'blue' },
  { number: 2, title: 'Employment', icon: Briefcase, color: 'purple' },
  { number: 3, title: 'Lease', icon: FileSignature, color: 'green' },
  { number: 4, title: 'ID & Family', icon: IdCard, color: 'indigo' },
  { number: 5, title: 'Financial', icon: DollarSign, color: 'yellow' },
  { number: 6, title: 'Review', icon: CheckCircle, color: 'emerald' }
];

// Initial form state
const INITIAL_FORM_DATA = {
  // Personal Info
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
  
  // Employment Info
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
  
  // Property & Lease
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
  
  // Pets
  pets: [],
  
  // Vehicles
  vehicles: [],
  
  // Family Members
  familyMembers: [],
  
  // Financial
  financial: {
    creditScore: '',
    paymentMethods: [],
    previousRentalHistory: [],
    monthlyDebtObligations: ''
  },
  
  // Insurance
  insurance: {
    renterInsurance: {
      provider: '',
      policyNumber: '',
      coverageAmount: '',
      effectiveDate: '',
      monthlyPremium: ''
    }
  },
  
  // Emergency Contact
  emergencyContact: {
    primary: {
      name: '',
      relationship: '',
      phone: ''
    }
  },
  
  // Additional
  notes: '',
  status: 'active',
  tags: []
};

// Options
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' }
];

const ID_TYPES = [
  { value: 'nid', label: 'National ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: 'Driver\'s License' },
  { value: 'student_id', label: 'Student ID' }
];

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' }
];

const PAY_FREQUENCY = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi_weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

const EDUCATION_LEVELS = [
  { value: 'high_school', label: 'High School' },
  { value: 'bachelors', label: 'Bachelor\'s Degree' },
  { value: 'masters', label: 'Master\'s Degree' },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' }
];

const UTILITY_OPTIONS = [
  { value: 'water', label: 'Water' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'gas', label: 'Gas' },
  { value: 'internet', label: 'Internet' },
  { value: 'trash', label: 'Trash' }
];

const PET_TYPES = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'fish', label: 'Fish' },
  { value: 'other', label: 'Other' }
];

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'mobile_banking', label: 'Mobile Banking' }
];

export default function TenantFormModal({ 
  onClose, 
  onSuccess, 
  user, 
  tenant = null, 
  propertyId = null,
  mode = 'add' // 'add' or 'edit'
}) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});

  // Initialize form with tenant data if editing
  useEffect(() => {
    if (tenant && mode === 'edit') {
      setFormData({
        ...INITIAL_FORM_DATA,
        ...tenant,
        personalInfo: {
          ...INITIAL_FORM_DATA.personalInfo,
          ...tenant.personalInfo,
          identification: {
            ...INITIAL_FORM_DATA.personalInfo.identification,
            ...tenant.personalInfo?.identification
          }
        },
        employment: tenant.employment || INITIAL_FORM_DATA.employment,
        lease: {
          ...INITIAL_FORM_DATA.lease,
          ...tenant.lease
        },
        financial: {
          ...INITIAL_FORM_DATA.financial,
          ...tenant.financial
        },
        insurance: tenant.insurance || INITIAL_FORM_DATA.insurance,
        emergencyContact: tenant.emergencyContact || INITIAL_FORM_DATA.emergencyContact
      });
      
      if (tenant.propertyId) {
        setFormData(prev => ({ ...prev, propertyId: tenant.propertyId }));
      }
    }
    
    if (propertyId && mode === 'add') {
      setFormData(prev => ({ ...prev, propertyId }));
    }
  }, [tenant, mode, propertyId]);

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties();
  }, []);

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

  // Handle input changes
  const handleChange = (path, value) => {
    const keys = path.split('.');
    
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });

    // Clear error for this field
    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: null }));
    }
  };

  // Format phone number for Bangladesh
  const formatBangladeshiPhone = (value) => {
    // Remove all non-digits
    let phone = value.replace(/\D/g, '');
    
    // For Bangladesh numbers
    if (phone.startsWith('0')) {
      phone = phone.substring(1); // Remove leading 0
    }
    
    if (phone.startsWith('880')) {
      phone = phone.substring(3); // Remove country code if already there
    }
    
    // Format as 01XXX-XXXXXX
    if (phone.length <= 2) return phone;
    if (phone.length <= 5) return `01${phone.slice(0,2)}-${phone.slice(2)}`;
    return `01${phone.slice(0,2)}-${phone.slice(2,8)}`;
  };

  const handlePhoneChange = (path, value) => {
    const formatted = formatBangladeshiPhone(value);
    handleChange(path, formatted);
  };

  // Handle utility toggles
  const handleUtilityToggle = (utility, type) => {
    setFormData(prev => {
      const currentUtilities = prev.lease[type] || [];
      const newUtilities = currentUtilities.includes(utility)
        ? currentUtilities.filter(u => u !== utility)
        : [...currentUtilities, utility];
      
      return {
        ...prev,
        lease: {
          ...prev.lease,
          [type]: newUtilities
        }
      };
    });
  };

  // Pet management
  const addPet = () => {
    setFormData(prev => ({
      ...prev,
      pets: [...prev.pets, {
        id: Date.now(),
        type: 'dog',
        breed: '',
        name: '',
        weight: '',
        age: '',
        isVaccinated: false,
        vaccinationDate: ''
      }]
    }));
  };

  const updatePet = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      pets: prev.pets.map(pet => 
        pet.id === id ? { ...pet, [field]: value } : pet
      )
    }));
  };

  const removePet = (id) => {
    setFormData(prev => ({
      ...prev,
      pets: prev.pets.filter(pet => pet.id !== id)
    }));
  };

  // Vehicle management
  const addVehicle = () => {
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, {
        id: Date.now(),
        make: '',
        model: '',
        year: '',
        color: '',
        licensePlate: '',
        parkingSpot: ''
      }]
    }));
  };

  const updateVehicle = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map(vehicle => 
        vehicle.id === id ? { ...vehicle, [field]: value } : vehicle
      )
    }));
  };

  const removeVehicle = (id) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter(vehicle => vehicle.id !== id)
    }));
  };

  // Family member management
  const addFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, {
        id: Date.now(),
        name: '',
        relationship: 'spouse',
        dateOfBirth: '',
        occupation: '',
        phone: ''
      }]
    }));
  };

  const updateFamilyMember = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      )
    }));
  };

  const removeFamilyMember = (id) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(member => member.id !== id)
    }));
  };

  // Payment method management
  const addPaymentMethod = () => {
    setFormData(prev => ({
      ...prev,
      financial: {
        ...prev.financial,
        paymentMethods: [...prev.financial.paymentMethods, {
          id: Date.now(),
          type: 'bank_transfer',
          details: ''
        }]
      }
    }));
  };

  const updatePaymentMethod = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      financial: {
        ...prev.financial,
        paymentMethods: prev.financial.paymentMethods.map(method => 
          method.id === id ? { ...method, [field]: value } : method
        )
      }
    }));
  };

  const removePaymentMethod = (id) => {
    setFormData(prev => ({
      ...prev,
      financial: {
        ...prev.financial,
        paymentMethods: prev.financial.paymentMethods.filter(method => method.id !== id)
      }
    }));
  };

  // Tag management
  const handleTagToggle = (tag) => {
    setFormData(prev => {
      const currentTags = prev.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];
      
      return { ...prev, tags: newTags };
    });
  };

  const TAG_OPTIONS = [
    'professional', 'student', 'family', 'single', 'long_term', 
    'short_term', 'no_pets', 'has_pets', 'reliable', 'new', 
    'international', 'local', 'premium', 'standard'
  ];

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for API
      const tenantData = {
        ...formData,
        personalInfo: {
          ...formData.personalInfo,
          phone: formData.personalInfo.phone.replace(/\D/g, '')
        },
        // Clean up empty arrays and objects
        pets: formData.pets.filter(pet => pet.name || pet.type),
        vehicles: formData.vehicles.filter(vehicle => vehicle.make || vehicle.licensePlate),
        familyMembers: formData.familyMembers.filter(member => member.name),
        financial: {
          ...formData.financial,
          paymentMethods: formData.financial.paymentMethods.filter(method => method.type)
        }
      };

      // Determine API endpoint and method
      const url = mode === 'edit' ? `/api/tenants/${tenant._id}` : '/api/tenants';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(tenantData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${mode === 'edit' ? 'update' : 'add'} tenant`);
      }
      
      toast.success(`Tenant ${mode === 'edit' ? 'updated' : 'added'} successfully!`);
      onSuccess(data.tenant || data);
      
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'adding'} tenant:`, error);
      toast.error(error.message || `Failed to ${mode === 'edit' ? 'update' : 'add'} tenant`);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Render steps
  const renderStep = () => {
    switch (step) {
      case 1: // Personal Info
        return (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-500">Primary tenant details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              {renderInput({
                label: 'Full Name',
                value: formData.personalInfo.fullName,
                onChange: (value) => handleChange('personalInfo.fullName', value),
                icon: User,
                placeholder: 'John Doe'
              })}
              
              {renderInput({
                label: 'Email',
                value: formData.personalInfo.email,
                onChange: (value) => handleChange('personalInfo.email', value),
                type: 'email',
                icon: Mail,
                placeholder: 'john@example.com'
              })}

              {renderInput({
                label: 'Phone (Bangladeshi)',
                value: formData.personalInfo.phone,
                onChange: (value) => handlePhoneChange('personalInfo.phone', value),
                type: 'tel',
                icon: Phone,
                placeholder: '01XX-XXXXXXX',
                helperText: 'Format: 01XX-XXXXXXX'
              })}

              {renderInput({
                label: 'Date of Birth',
                value: formData.personalInfo.dateOfBirth,
                onChange: (value) => handleChange('personalInfo.dateOfBirth', value),
                type: 'date',
                icon: Calendar,
                max: new Date().toISOString().split('T')[0]
              })}

              {/* Demographics */}
              {renderSelect({
                label: 'Gender',
                value: formData.personalInfo.gender,
                onChange: (value) => handleChange('personalInfo.gender', value),
                options: GENDER_OPTIONS,
                placeholder: 'Select gender'
              })}

              {renderSelect({
                label: 'Marital Status',
                value: formData.personalInfo.maritalStatus,
                onChange: (value) => handleChange('personalInfo.maritalStatus', value),
                options: MARITAL_STATUS_OPTIONS,
                placeholder: 'Select status'
              })}

              {renderInput({
                label: 'Nationality',
                value: formData.personalInfo.nationality,
                onChange: (value) => handleChange('personalInfo.nationality', value),
                placeholder: 'e.g., Bangladeshi, US Citizen'
              })}

              {renderInput({
                label: 'Language',
                value: formData.personalInfo.language,
                onChange: (value) => handleChange('personalInfo.language', value),
                placeholder: 'e.g., Bengali, English'
              })}
            </div>
          </div>
        );

      case 2: // Employment
        return (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Employment & Education</h3>
              <p className="text-sm text-gray-500">Occupation and education details</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput({
                  label: 'Occupation',
                  value: formData.employment.occupation,
                  onChange: (value) => handleChange('employment.occupation', value),
                  icon: Briefcase,
                  placeholder: 'Software Engineer'
                })}

                {renderInput({
                  label: 'Employer',
                  value: formData.employment.employer,
                  onChange: (value) => handleChange('employment.employer', value),
                  placeholder: 'Company Name'
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect({
                  label: 'Employment Type',
                  value: formData.employment.employmentType,
                  onChange: (value) => handleChange('employment.employmentType', value),
                  options: EMPLOYMENT_TYPES,
                  placeholder: 'Select type'
                })}

                {renderInput({
                  label: 'Employment Start Date',
                  value: formData.employment.employmentStartDate,
                  onChange: (value) => handleChange('employment.employmentStartDate', value),
                  type: 'date',
                  icon: Calendar
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderCurrencyInput({
                  label: 'Monthly Income',
                  value: formData.employment.monthlyIncome,
                  onChange: (value) => handleChange('employment.monthlyIncome', value),
                  placeholder: '50000'
                })}

                {renderSelect({
                  label: 'Pay Frequency',
                  value: formData.employment.payFrequency,
                  onChange: (value) => handleChange('employment.payFrequency', value),
                  options: PAY_FREQUENCY,
                  placeholder: 'Select frequency'
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect({
                  label: 'Education Level',
                  value: formData.employment.educationLevel,
                  onChange: (value) => handleChange('employment.educationLevel', value),
                  options: EDUCATION_LEVELS,
                  placeholder: 'Select education'
                })}

                {renderInput({
                  label: 'School/University',
                  value: formData.employment.schoolName,
                  onChange: (value) => handleChange('employment.schoolName', value),
                  icon: GraduationCap,
                  placeholder: 'University Name'
                })}
              </div>

              {renderInput({
                label: 'Work Address',
                value: formData.employment.workAddress,
                onChange: (value) => handleChange('employment.workAddress', value),
                placeholder: 'Company address'
              })}
            </div>
          </div>
        );

      case 3: // Lease & Property
        return (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <Home className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Property & Lease Details</h3>
              <p className="text-sm text-gray-500">Rental agreement information</p>
            </div>

            <div className="space-y-4">
              {/* Property Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Building className="w-4 h-4 mr-2 text-gray-400" />
                  Select Property
                </label>
                {propertiesLoading ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" />
                  </div>
                ) : (
                  <select
                    value={formData.propertyId}
                    onChange={(e) => handleChange('propertyId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Choose a property...</option>
                    {availableProperties.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} • {p.address?.street}, {p.address?.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {renderInput({
                  label: 'Unit Number',
                  value: formData.unit,
                  onChange: (value) => handleChange('unit', value),
                  icon: MapPin,
                  placeholder: 'Apt 4B, Room 201'
                })}

                {renderSelect({
                  label: 'Rent Due Day',
                  value: formData.lease.dueDay,
                  onChange: (value) => handleChange('lease.dueDay', value),
                  options: Array.from({length: 28}, (_, i) => ({
                    value: i + 1,
                    label: `Day ${i + 1}`
                  })),
                  placeholder: 'Select day'
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput({
                  label: 'Lease Start Date',
                  value: formData.lease.startDate,
                  onChange: (value) => handleChange('lease.startDate', value),
                  type: 'date',
                  icon: Calendar
                })}

                {renderInput({
                  label: 'Lease End Date',
                  value: formData.lease.endDate,
                  onChange: (value) => handleChange('lease.endDate', value),
                  type: 'date',
                  icon: Calendar,
                  min: formData.lease.startDate
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderCurrencyInput({
                  label: 'Monthly Rent',
                  value: formData.lease.monthlyRent,
                  onChange: (value) => handleChange('lease.monthlyRent', value),
                  placeholder: '15000'
                })}

                {renderCurrencyInput({
                  label: 'Security Deposit',
                  value: formData.lease.securityDeposit,
                  onChange: (value) => handleChange('lease.securityDeposit', value),
                  placeholder: '15000'
                })}
              </div>

              {/* Utilities */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Utilities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {UTILITY_OPTIONS.map(utility => (
                    <div key={utility.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.lease.utilitiesIncluded?.includes(utility.value)}
                        onChange={() => handleUtilityToggle(utility.value, 'utilitiesIncluded')}
                        className="h-4 w-4 text-green-600 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        {utility.label} (Included)
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // ID & Family
        return (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
                <IdCard className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Identification & Family</h3>
              <p className="text-sm text-gray-500">ID details and family members</p>
            </div>

            <div className="space-y-6">
              {/* Identification */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <h4 className="font-medium text-indigo-900 mb-3 flex items-center">
                  <IdCard className="w-5 h-5 mr-2" />
                  Identification Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelect({
                    label: 'ID Type',
                    value: formData.personalInfo.identification.type,
                    onChange: (value) => handleChange('personalInfo.identification.type', value),
                    options: ID_TYPES,
                    placeholder: 'Select ID type'
                  })}

                  {renderInput({
                    label: 'ID Number',
                    value: formData.personalInfo.identification.number,
                    onChange: (value) => handleChange('personalInfo.identification.number', value),
                    placeholder: 'ID number'
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {renderInput({
                    label: 'Issue Date',
                    value: formData.personalInfo.identification.issueDate,
                    onChange: (value) => handleChange('personalInfo.identification.issueDate', value),
                    type: 'date'
                  })}

                  {renderInput({
                    label: 'Expiry Date',
                    value: formData.personalInfo.identification.expiryDate,
                    onChange: (value) => handleChange('personalInfo.identification.expiryDate', value),
                    type: 'date'
                  })}
                </div>

                {renderInput({
                  label: 'Issuing Authority',
                  value: formData.personalInfo.identification.issuingAuthority,
                  onChange: (value) => handleChange('personalInfo.identification.issuingAuthority', value),
                  className: 'mt-4',
                  placeholder: 'e.g., Bangladesh Election Commission'
                })}
              </div>

              {/* Family Members */}
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Family Members
                  </h4>
                  <button
                    type="button"
                    onClick={addFamilyMember}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Member
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.familyMembers.map((member, index) => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="text-sm font-medium text-gray-900">
                          Family Member {index + 1}
                        </h5>
                        <button
                          type="button"
                          onClick={() => removeFamilyMember(member.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderInput({
                          label: 'Full Name',
                          value: member.name,
                          onChange: (value) => updateFamilyMember(member.id, 'name', value),
                          size: 'sm'
                        })}

                        {renderInput({
                          label: 'Relationship',
                          value: member.relationship,
                          onChange: (value) => updateFamilyMember(member.id, 'relationship', value),
                          placeholder: 'e.g., Spouse, Child',
                          size: 'sm'
                        })}

                        {renderInput({
                          label: 'Date of Birth',
                          value: member.dateOfBirth,
                          onChange: (value) => updateFamilyMember(member.id, 'dateOfBirth', value),
                          type: 'date',
                          size: 'sm'
                        })}

                        {renderInput({
                          label: 'Phone',
                          value: member.phone,
                          onChange: (value) => updateFamilyMember(member.id, 'phone', formatBangladeshiPhone(value)),
                          type: 'tel',
                          placeholder: '01XX-XXXXXXX',
                          size: 'sm'
                        })}
                      </div>

                      {renderInput({
                        label: 'Occupation',
                        value: member.occupation,
                        onChange: (value) => updateFamilyMember(member.id, 'occupation', value),
                        className: 'mt-2',
                        size: 'sm',
                        placeholder: 'Occupation'
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Financial & Additional
        return (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Financial & Additional Information</h3>
              <p className="text-sm text-gray-500">Payment methods and additional details</p>
            </div>

            <div className="space-y-6">
              {/* Financial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput({
                  label: 'Credit Score',
                  value: formData.financial.creditScore,
                  onChange: (value) => handleChange('financial.creditScore', value),
                  type: 'number',
                  min: 300,
                  max: 850,
                  placeholder: 'e.g., 750'
                })}

                {renderCurrencyInput({
                  label: 'Monthly Debt',
                  value: formData.financial.monthlyDebtObligations,
                  onChange: (value) => handleChange('financial.monthlyDebtObligations', value),
                  placeholder: 'e.g., 5000'
                })}
              </div>

              {/* Payment Methods */}
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Methods
                  </h4>
                  <button
                    type="button"
                    onClick={addPaymentMethod}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Method
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.financial.paymentMethods.map((method, index) => (
                    <div key={method.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <select
                        value={method.type}
                        onChange={(e) => updatePaymentMethod(method.id, 'type', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        <option value="">Select method</option>
                        {PAYMENT_METHODS.map(pm => (
                          <option key={pm.value} value={pm.value}>{pm.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={method.details || ''}
                        onChange={(e) => updatePaymentMethod(method.id, 'details', e.target.value)}
                        placeholder="Details (e.g., bank name, last 4 digits)"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removePaymentMethod(method.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pets */}
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Dog className="w-5 h-5 mr-2" />
                    Pets
                  </h4>
                  <button
                    type="button"
                    onClick={addPet}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Pet
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.pets.map((pet, index) => (
                    <div key={pet.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="text-sm font-medium text-gray-900">
                          Pet {index + 1}
                        </h5>
                        <button
                          type="button"
                          onClick={() => removePet(pet.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select
                          value={pet.type}
                          onChange={(e) => updatePet(pet.id, 'type', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        >
                          <option value="">Select type</option>
                          {PET_TYPES.map(pt => (
                            <option key={pt.value} value={pt.value}>{pt.label}</option>
                          ))}
                        </select>

                        {renderInput({
                          value: pet.name,
                          onChange: (value) => updatePet(pet.id, 'name', value),
                          placeholder: 'Pet name',
                          size: 'sm'
                        })}

                        {renderInput({
                          value: pet.breed,
                          onChange: (value) => updatePet(pet.id, 'breed', value),
                          placeholder: 'Breed',
                          size: 'sm'
                        })}

                        {renderInput({
                          value: pet.age,
                          onChange: (value) => updatePet(pet.id, 'age', value),
                          placeholder: 'Age (years)',
                          type: 'number',
                          size: 'sm'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {TAG_OPTIONS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        formData.tags?.includes(tag)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tag.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6: // Review
        const selectedProperty = availableProperties.find(p => p._id === formData.propertyId);
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Review Details</h3>
              <p className="text-sm text-gray-500">Confirm all information is correct</p>
            </div>

            <div className="space-y-4">
              {/* Personal Summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-blue-700">Full Name</div>
                    <div className="font-medium">{formData.personalInfo.fullName || '—'}</div>
                  </div>
                  <div>
                    <div className="text-blue-700">Phone</div>
                    <div className="font-medium">{formData.personalInfo.phone || '—'}</div>
                  </div>
                  <div>
                    <div className="text-blue-700">Email</div>
                    <div className="font-medium">{formData.personalInfo.email || '—'}</div>
                  </div>
                  <div>
                    <div className="text-blue-700">Gender</div>
                    <div className="font-medium capitalize">
                      {GENDER_OPTIONS.find(g => g.value === formData.personalInfo.gender)?.label || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Summary */}
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <h4 className="font-medium text-purple-900 mb-3 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Employment
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-purple-700">Occupation</div>
                    <div className="font-medium">{formData.employment.occupation || '—'}</div>
                  </div>
                  <div>
                    <div className="text-purple-700">Monthly Income</div>
                    <div className="font-medium">
                      {formData.employment.monthlyIncome ? `৳${parseFloat(formData.employment.monthlyIncome).toLocaleString('en-BD')}` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-700">Employer</div>
                    <div className="font-medium">{formData.employment.employer || '—'}</div>
                  </div>
                  <div>
                    <div className="text-purple-700">Education</div>
                    <div className="font-medium">
                      {EDUCATION_LEVELS.find(e => e.value === formData.employment.educationLevel)?.label || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lease Summary */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <h4 className="font-medium text-green-900 mb-3 flex items-center">
                  <Home className="w-5 h-5 mr-2" />
                  Lease Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-green-700">Property</div>
                    <div className="font-medium">{selectedProperty?.name || '—'}</div>
                  </div>
                  <div>
                    <div className="text-green-700">Unit</div>
                    <div className="font-medium">{formData.unit || '—'}</div>
                  </div>
                  <div>
                    <div className="text-green-700">Monthly Rent</div>
                    <div className="font-medium">
                      {formData.lease.monthlyRent ? `৳${parseFloat(formData.lease.monthlyRent).toLocaleString('en-BD')}` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-green-700">Due Day</div>
                    <div className="font-medium">Day {formData.lease.dueDay}</div>
                  </div>
                </div>
              </div>

              {/* Family & ID Summary */}
              {(formData.familyMembers.length > 0 || formData.personalInfo.identification.number) && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <h4 className="font-medium text-indigo-900 mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Family & Identification
                  </h4>
                  <div className="space-y-3 text-sm">
                    {formData.personalInfo.identification.number && (
                      <div>
                        <div className="text-indigo-700">ID Number</div>
                        <div className="font-medium">{formData.personalInfo.identification.number}</div>
                      </div>
                    )}
                    {formData.familyMembers.filter(m => m.name).length > 0 && (
                      <div>
                        <div className="text-indigo-700">Family Members</div>
                        <div className="font-medium">
                          {formData.familyMembers.filter(m => m.name).length} member(s)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags Summary */}
              {formData.tags?.length > 0 && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {tag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  // Helper render functions
  const renderInput = ({ 
    label, value, onChange, type = 'text', icon: Icon, placeholder, required, error, 
    min, max, className = '', size = 'md', helperText 
  }) => {
    const inputClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3'
    };
    
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="text-sm font-medium text-gray-700 flex items-center">
            {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />}
            {label}
          </label>
        )}
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
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
        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  };

  const renderSelect = ({
    label, value, onChange, options, placeholder, icon: Icon, className = ''
  }) => (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 flex items-center">
          {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />}
          {label}
        </label>
      )}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90"
      >
        <option value="">{placeholder || 'Select...'}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderCurrencyInput = ({ label, value, onChange, placeholder, className = '' }) => (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          step="0.01"
          min="0"
        />
      </div>
    </div>
  );

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
          className="relative w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-2xl 
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
                  <h2 className="text-lg font-semibold text-gray-900">
                    {mode === 'edit' ? 'Edit Tenant' : 'Add New Tenant'}
                  </h2>
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
                {step < STEPS.length ? (
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
                      disabled={loading}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                               transition-colors flex items-center text-sm font-medium 
                               disabled:opacity-50"
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
                      disabled={loading}
                      className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 
                               transition-colors flex items-center text-sm font-medium 
                               disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {mode === 'edit' ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {mode === 'edit' ? 'Update Tenant' : 'Create Tenant'}
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

// app/components/AddTenantModal.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { 
//   X, User, Mail, Phone, Home, Calendar,
//   DollarSign, FileText, UserPlus, CheckCircle,
//   MapPin, Briefcase, Shield, Building, CreditCard,
//   ChevronRight, ChevronLeft, Clock, AlertCircle,
//   Loader2, Key, FileCheck, AlertTriangle,
//   Users, IdCard, Plus, Trash2, Heart, 
//   UserCog, Fingerprint, ShieldCheck
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// // Step configuration
// const STEPS = [
//   { number: 1, title: 'Personal', icon: User, color: 'blue' },
//   { number: 2, title: 'Property', icon: Home, color: 'green' },
//   { number: 3, title: 'Financial', icon: DollarSign, color: 'purple' },
//   { number: 4, title: 'Family & ID', icon: Users, color: 'indigo' },
//   { number: 5, title: 'Review', icon: CheckCircle, color: 'emerald' }
// ];

// // Initial form state
// const INITIAL_FORM_DATA = {
//   // Personal Info
//   name: '',
//   email: '',
//   phone: '',
//   occupation: '',
//   dateOfBirth: '',
  
//   // NID/Passport Information
//   identification: {
//     type: 'nid', // 'nid', 'passport', 'driving_license'
//     number: '',
//     issueDate: '',
//     expiryDate: '',
//     issuingAuthority: ''
//   },
  
//   // Property Info
//   propertyId: '',
//   unit: '',
//   leaseStart: new Date().toISOString().split('T')[0],
//   leaseEnd: '',
//   rentDueDay: 5,
  
//   // Financial Info
//   rent: '',
//   deposit: '',
//   income: '',
//   employer: '',
  
//   // Family Members
//   familyMembers: [
//     {
//       id: Date.now(),
//       name: '',
//       relationship: 'spouse', // spouse, child, parent, sibling, other
//       dateOfBirth: '',
//       occupation: '',
//       phone: ''
//     }
//   ],
  
//   // Additional Info
//   emergencyContact: '',
//   emergencyPhone: '',
//   notes: '',
//   status: 'active'
// };

// // Relationship options
// const RELATIONSHIP_TYPES = [
//   { value: 'spouse', label: 'Spouse', icon: Heart },
//   { value: 'child', label: 'Child', icon: User },
//   { value: 'parent', label: 'Parent', icon: UserCog },
//   { value: 'sibling', label: 'Sibling', icon: Users },
//   { value: 'other', label: 'Other', icon: User }
// ];

// // ID types
// const ID_TYPES = [
//   { value: 'nid', label: 'National ID', icon: IdCard },
//   { value: 'passport', label: 'Passport', icon: FileCheck },
//   { value: 'driving_license', label: 'Driving License', icon: ShieldCheck }
// ];

// export default function AddTenantModal({ onClose, onSuccess, user }) {
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState(1);
//   const [availableProperties, setAvailableProperties] = useState([]);
//   const [propertiesLoading, setPropertiesLoading] = useState(true);
//   const [formData, setFormData] = useState(INITIAL_FORM_DATA);
//   const [errors, setErrors] = useState({});

//   // Fetch properties on mount
//   useEffect(() => {
//     fetchProperties();
//   }, []);

//   // Validate current step
//   useEffect(() => {
//     validateCurrentStep();
//   }, [formData, step]);

//   const fetchProperties = async () => {
//     try {
//       setPropertiesLoading(true);
//       const res = await fetch('/api/properties?status=active&limit=50');
      
//       if (res.ok) {
//         const data = await res.json();
//         setAvailableProperties(data.properties || []);
//       } else {
//         throw new Error('Failed to fetch properties');
//       }
//     } catch (error) {
//       console.error('Error fetching properties:', error);
//       toast.error('Failed to load properties');
//     } finally {
//       setPropertiesLoading(false);
//     }
//   };

//   const validateCurrentStep = () => {
//     const newErrors = {};
    
//     switch (step) {
//       case 1:
//         if (!formData.name.trim()) newErrors.name = 'Name is required';
//         if (!formData.email.trim()) {
//           newErrors.email = 'Email is required';
//         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//           newErrors.email = 'Invalid email format';
//         }
//         if (!formData.phone.trim()) {
//           newErrors.phone = 'Phone is required';
//         } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\D/g, ''))) {
//           newErrors.phone = 'Invalid phone number';
//         }
//         break;
        
//       case 2:
//         if (!formData.propertyId) newErrors.propertyId = 'Property is required';
//         if (!formData.leaseStart) newErrors.leaseStart = 'Lease start date is required';
//         if (formData.leaseEnd && new Date(formData.leaseEnd) <= new Date(formData.leaseStart)) {
//           newErrors.leaseEnd = 'Lease end must be after start date';
//         }
//         break;
        
//       case 3:
//         if (!formData.rent || parseFloat(formData.rent) <= 0) {
//           newErrors.rent = 'Valid rent amount is required';
//         }
//         if (formData.deposit && parseFloat(formData.deposit) < 0) {
//           newErrors.deposit = 'Deposit cannot be negative';
//         }
//         if (formData.income && parseFloat(formData.income) < 0) {
//           newErrors.income = 'Income cannot be negative';
//         }
//         break;
        
//       case 4:
//         // Validate NID/Passport
//         if (!formData.identification?.number) {
//           newErrors.idNumber = 'ID number is required';
//         }
//         break;
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value, type } = e.target;
//     let processedValue = value;
    
//     // Format phone number
//     if (name === 'phone' || name === 'emergencyPhone') {
//       processedValue = formatPhoneNumber(value);
//     }
    
//     // Clear error for this field
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: null }));
//     }
    
//     setFormData(prev => ({ 
//       ...prev, 
//       [name]: processedValue 
//     }));
//   };

//   const handleIdentificationChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       identification: {
//         ...prev.identification,
//         [name]: value
//       }
//     }));
//   };

//   const handleFamilyMemberChange = (id, field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       familyMembers: prev.familyMembers.map(member =>
//         member.id === id ? { ...member, [field]: value } : member
//       )
//     }));
//   };

//   const addFamilyMember = () => {
//     setFormData(prev => ({
//       ...prev,
//       familyMembers: [
//         ...prev.familyMembers,
//         {
//           id: Date.now(),
//           name: '',
//           relationship: 'other',
//           dateOfBirth: '',
//           occupation: '',
//           phone: ''
//         }
//       ]
//     }));
//   };

//   const removeFamilyMember = (id) => {
//     if (formData.familyMembers.length <= 1) {
//       toast.error('At least one family member (tenant) is required');
//       return;
//     }
    
//     setFormData(prev => ({
//       ...prev,
//       familyMembers: prev.familyMembers.filter(member => member.id !== id)
//     }));
//   };

//   const formatPhoneNumber = (value) => {
//     // Remove all non-digits
//     const phone = value.replace(/\D/g, '');
    
//     // Format as (XXX) XXX-XXXX for US numbers
//     if (phone.length <= 3) return phone;
//     if (phone.length <= 6) return `(${phone.slice(0,3)}) ${phone.slice(3)}`;
//     return `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6,10)}`;
//   };

//   const checkUserLimits = async () => {
//     if (user?.subscription?.plan === 'free') {
//       try {
//         const tenantCountRes = await fetch('/api/tenants/count');
//         if (tenantCountRes.ok) {
//           const { count } = await tenantCountRes.json();
//           if (count >= user?.limits?.tenants) {
//             throw new Error(`Free plan limited to ${user.limits.tenants} tenants. Upgrade to add more.`);
//           }
//         }
//       } catch (error) {
//         throw error;
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateCurrentStep()) {
//       toast.error('Please fix errors before submitting');
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       // Check user limits
//       await checkUserLimits();
      
//       // Prepare data for API
//       const tenantData = {
//         personalInfo: {
//           fullName: formData.name.trim(),
//           email: formData.email.trim(),
//           phone: formData.phone.replace(/\D/g, ''),
//           occupation: formData.occupation.trim(),
//           dateOfBirth: formData.dateOfBirth || null,
//           identification: formData.identification,
//           emergencyContact: {
//             name: formData.emergencyContact.trim(),
//             phone: formData.emergencyPhone.replace(/\D/g, '')
//           }
//         },
//         familyMembers: formData.familyMembers.filter(member => member.name.trim()).map(member => ({
//           name: member.name.trim(),
//           relationship: member.relationship,
//           dateOfBirth: member.dateOfBirth || null,
//           occupation: member.occupation.trim(),
//           phone: member.phone.replace(/\D/g, '')
//         })),
//         propertyId: formData.propertyId,
//         unit: formData.unit.trim(),
//         lease: {
//           startDate: formData.leaseStart,
//           endDate: formData.leaseEnd || null,
//           monthlyRent: parseFloat(formData.rent) || 0,
//           securityDeposit: parseFloat(formData.deposit) || 0,
//           dueDay: parseInt(formData.rentDueDay) || 5
//         },
//         financial: {
//           monthlyIncome: parseFloat(formData.income) || 0,
//           employer: formData.employer.trim()
//         },
//         notes: formData.notes.trim(),
//         status: formData.status
//       };
      
//       // Submit to API
//       const res = await fetch('/api/tenants', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Cache-Control': 'no-cache'
//         },
//         body: JSON.stringify(tenantData)
//       });
      
//       const data = await res.json();
      
//       if (!res.ok) {
//         throw new Error(data.error || `Failed to add tenant (${res.status})`);
//       }
      
//       toast.success('Tenant added successfully!');
//       onSuccess(data.tenant || data);
      
//     } catch (error) {
//       console.error('Error adding tenant:', error);
//       toast.error(error.message || 'Failed to add tenant');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleNext = () => {
//     if (validateCurrentStep()) {
//       setStep(prev => Math.min(prev + 1, STEPS.length));
//     }
//   };

//   const handleBack = () => {
//     setStep(prev => Math.max(prev - 1, 1));
//   };

//   // Render steps
//   const renderStep = () => {
//     switch (step) {
//       case 1:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-2">
//               <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
//                 <User className="w-6 h-6 text-blue-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
//               <p className="text-sm text-gray-500">Primary tenant details</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {renderInput({
//                 label: 'Full Name *',
//                 name: 'name',
//                 icon: User,
//                 placeholder: 'John Doe',
//                 required: true,
//                 error: errors.name
//               })}
              
//               {renderInput({
//                 label: 'Email *',
//                 name: 'email',
//                 type: 'email',
//                 icon: Mail,
//                 placeholder: 'john@example.com',
//                 required: true,
//                 error: errors.email
//               })}

//               {renderInput({
//                 label: 'Phone *',
//                 name: 'phone',
//                 type: 'tel',
//                 icon: Phone,
//                 placeholder: '(555) 123-4567',
//                 required: true,
//                 error: errors.phone
//               })}

//               {renderInput({
//                 label: 'Date of Birth',
//                 name: 'dateOfBirth',
//                 type: 'date',
//                 icon: Calendar,
//                 max: new Date().toISOString().split('T')[0]
//               })}

//               {renderInput({
//                 label: 'Occupation',
//                 name: 'occupation',
//                 icon: Briefcase,
//                 placeholder: 'Software Engineer',
//                 required: false
//               })}
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-2">
//               <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
//                 <Home className="w-6 h-6 text-green-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Property & Lease</h3>
//               <p className="text-sm text-gray-500">Where and when they'll live</p>
//             </div>

//             <div className="space-y-4">
//               {propertiesLoading ? (
//                 <div className="text-center py-6">
//                   <Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto mb-2" />
//                   <p className="text-gray-500 text-sm">Loading properties...</p>
//                 </div>
//               ) : availableProperties.length === 0 ? (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
//                   <div className="flex items-start">
//                     <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="text-yellow-800 font-medium">No properties available</p>
//                       <p className="text-yellow-700 text-sm mt-1">
//                         Add a property first to assign tenants. 
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-gray-700 flex items-center">
//                       <Building className="w-4 h-4 mr-2 text-gray-400" />
//                       Select Property *
//                     </label>
//                     <select
//                       name="propertyId"
//                       value={formData.propertyId}
//                       onChange={handleChange}
//                       className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90
//                         ${errors.propertyId ? 'border-red-300' : 'border-gray-200'}`}
//                       required
//                     >
//                       <option value="">Choose a property...</option>
//                       {availableProperties.map(p => (
//                         <option key={p._id} value={p._id}>
//                           {p.name} • {p.address?.street}, {p.address?.city}
//                         </option>
//                       ))}
//                     </select>
//                     {errors.propertyId && (
//                       <p className="text-red-500 text-xs mt-1">{errors.propertyId}</p>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     {renderInput({
//                       label: 'Unit #',
//                       name: 'unit',
//                       icon: MapPin,
//                       placeholder: 'Apt 4B',
//                       className: 'col-span-1'
//                     })}

//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-gray-700 flex items-center">
//                         <Clock className="w-4 h-4 mr-2 text-gray-400" />
//                         Rent Due Day *
//                       </label>
//                       <select
//                         name="rentDueDay"
//                         value={formData.rentDueDay}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90"
//                       >
//                         {[1, 5, 10, 15, 20, 25].map(day => (
//                           <option key={day} value={day}>Day {day}</option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     {renderInput({
//                       label: 'Lease Start *',
//                       name: 'leaseStart',
//                       type: 'date',
//                       error: errors.leaseStart,
//                       min: new Date().toISOString().split('T')[0]
//                     })}

//                     {renderInput({
//                       label: 'Lease End',
//                       name: 'leaseEnd',
//                       type: 'date',
//                       error: errors.leaseEnd,
//                       min: formData.leaseStart || new Date().toISOString().split('T')[0]
//                     })}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         );

//       case 3:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-2">
//               <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
//                 <DollarSign className="w-6 h-6 text-purple-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Financial Details</h3>
//               <p className="text-sm text-gray-500">Rent and income information</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {renderCurrencyInput({
//                 label: 'Monthly Rent *',
//                 name: 'rent',
//                 icon: DollarSign,
//                 placeholder: '1500.00',
//                 required: true,
//                 error: errors.rent
//               })}

//               {renderCurrencyInput({
//                 label: 'Security Deposit',
//                 name: 'deposit',
//                 icon: Shield,
//                 placeholder: '1500.00',
//                 error: errors.deposit
//               })}

//               {renderCurrencyInput({
//                 label: 'Monthly Income',
//                 name: 'income',
//                 icon: CreditCard,
//                 placeholder: '5000.00',
//                 error: errors.income,
//                 helperText: formData.rent && formData.income 
//                   ? `${(parseFloat(formData.income) / parseFloat(formData.rent)).toFixed(1)}x rent ratio`
//                   : 'Recommended: 3x monthly rent'
//               })}

//               {renderInput({
//                 label: 'Employer',
//                 name: 'employer',
//                 placeholder: 'Company Name'
//               })}
//             </div>
//           </div>
//         );

//       case 4:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-2">
//               <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
//                 <Users className="w-6 h-6 text-indigo-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Family & Identification</h3>
//               <p className="text-sm text-gray-500">Add family members and ID details</p>
//             </div>

//             <div className="space-y-6">
//               {/* Identification Section */}
//               <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
//                 <div className="flex items-center mb-3">
//                   <IdCard className="w-5 h-5 text-indigo-600 mr-2" />
//                   <h4 className="font-medium text-indigo-900">Identification Details</h4>
//                 </div>
                
//                 <div className="space-y-3">
//                   <div className="grid grid-cols-2 gap-3">
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-gray-700">ID Type</label>
//                       <select
//                         name="type"
//                         value={formData.identification.type}
//                         onChange={handleIdentificationChange}
//                         className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                       >
//                         {ID_TYPES.map(type => (
//                           <option key={type.value} value={type.value}>
//                             {type.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
                    
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-gray-700">
//                         {formData.identification.type === 'nid' ? 'NID Number *' : 
//                          formData.identification.type === 'passport' ? 'Passport Number *' : 
//                          'License Number *'}
//                       </label>
//                       <input
//                         type="text"
//                         name="number"
//                         value={formData.identification.number}
//                         onChange={handleIdentificationChange}
//                         className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500
//                           ${errors.idNumber ? 'border-red-300' : 'border-gray-200'}`}
//                         placeholder={
//                           formData.identification.type === 'nid' ? '1234567890123' : 
//                           formData.identification.type === 'passport' ? 'A12345678' : 
//                           'DL-12345-2023'
//                         }
//                       />
//                       {errors.idNumber && (
//                         <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-3">
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-gray-700">Issue Date</label>
//                       <input
//                         type="date"
//                         name="issueDate"
//                         value={formData.identification.issueDate}
//                         onChange={handleIdentificationChange}
//                         className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                       />
//                     </div>
                    
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-gray-700">Expiry Date</label>
//                       <input
//                         type="date"
//                         name="expiryDate"
//                         value={formData.identification.expiryDate}
//                         onChange={handleIdentificationChange}
//                         className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         min={formData.identification.issueDate}
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-gray-700">Issuing Authority</label>
//                     <input
//                       type="text"
//                       name="issuingAuthority"
//                       value={formData.identification.issuingAuthority}
//                       onChange={handleIdentificationChange}
//                       className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Government of Country / Passport Office"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Family Members Section */}
//               <div className="border border-gray-200 rounded-xl p-4">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center">
//                     <Users className="w-5 h-5 text-gray-600 mr-2" />
//                     <h4 className="font-medium text-gray-900">Family Members</h4>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={addFamilyMember}
//                     className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center"
//                   >
//                     <Plus className="w-4 h-4 mr-1" />
//                     Add Member
//                   </button>
//                 </div>

//                 <div className="space-y-4">
//                   {formData.familyMembers.map((member, index) => (
//                     <div key={member.id} className="border border-gray-200 rounded-lg p-4">
//                       <div className="flex justify-between items-start mb-3">
//                         <div className="flex items-center">
//                           <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
//                             <span className="text-sm font-medium text-blue-600">
//                               {RELATIONSHIP_TYPES.find(r => r.value === member.relationship)?.label?.charAt(0) || 'F'}
//                             </span>
//                           </div>
//                           <div>
//                             <h5 className="text-sm font-medium text-gray-900">
//                               {member.name || `Family Member ${index + 1}`}
//                             </h5>
//                             <p className="text-xs text-gray-500 capitalize">
//                               {member.relationship || 'Relationship'}
//                             </p>
//                           </div>
//                         </div>
//                         {formData.familyMembers.length > 1 && (
//                           <button
//                             type="button"
//                             onClick={() => removeFamilyMember(member.id)}
//                             className="p-1 hover:bg-red-50 text-red-500 rounded"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         )}
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         <div className="space-y-1">
//                           <label className="text-xs font-medium text-gray-600">Full Name</label>
//                           <input
//                             type="text"
//                             value={member.name}
//                             onChange={(e) => handleFamilyMemberChange(member.id, 'name', e.target.value)}
//                             className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
//                             placeholder="Family member name"
//                           />
//                         </div>

//                         <div className="space-y-1">
//                           <label className="text-xs font-medium text-gray-600">Relationship</label>
//                           <select
//                             value={member.relationship}
//                             onChange={(e) => handleFamilyMemberChange(member.id, 'relationship', e.target.value)}
//                             className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
//                           >
//                             {RELATIONSHIP_TYPES.map(rel => (
//                               <option key={rel.value} value={rel.value}>
//                                 {rel.label}
//                               </option>
//                             ))}
//                           </select>
//                         </div>

//                         <div className="space-y-1">
//                           <label className="text-xs font-medium text-gray-600">Date of Birth</label>
//                           <input
//                             type="date"
//                             value={member.dateOfBirth}
//                             onChange={(e) => handleFamilyMemberChange(member.id, 'dateOfBirth', e.target.value)}
//                             className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
//                             max={new Date().toISOString().split('T')[0]}
//                           />
//                         </div>

//                         <div className="space-y-1">
//                           <label className="text-xs font-medium text-gray-600">Phone</label>
//                           <input
//                             type="tel"
//                             value={member.phone}
//                             onChange={(e) => handleFamilyMemberChange(member.id, 'phone', formatPhoneNumber(e.target.value))}
//                             className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
//                             placeholder="(555) 123-4567"
//                           />
//                         </div>

//                         <div className="md:col-span-2 space-y-1">
//                           <label className="text-xs font-medium text-gray-600">Occupation</label>
//                           <input
//                             type="text"
//                             value={member.occupation}
//                             onChange={(e) => handleFamilyMemberChange(member.id, 'occupation', e.target.value)}
//                             className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
//                             placeholder="Occupation"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Emergency Contact */}
//               <div className="space-y-3">
//                 <h4 className="font-medium text-gray-900">Emergency Contact</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {renderInput({
//                     label: 'Contact Name',
//                     name: 'emergencyContact',
//                     placeholder: 'Emergency contact name',
//                     size: 'sm'
//                   })}
                  
//                   {renderInput({
//                     label: 'Emergency Phone',
//                     name: 'emergencyPhone',
//                     type: 'tel',
//                     placeholder: '(555) 555-5555',
//                     size: 'sm'
//                   })}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 5:
//         const selectedProperty = availableProperties.find(p => p._id === formData.propertyId);
//         const rentRatio = formData.rent && formData.income 
//           ? (parseFloat(formData.income) / parseFloat(formData.rent)).toFixed(1)
//           : null;
        
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-2">
//               <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-3">
//                 <FileCheck className="w-6 h-6 text-emerald-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Review & Create</h3>
//               <p className="text-sm text-gray-500">Confirm all details are correct</p>
//             </div>

//             {/* Summary Cards */}
//             <div className="space-y-4">
//               {renderSummaryCard({
//                 title: 'Personal Details',
//                 icon: User,
//                 color: 'blue',
//                 items: [
//                   { label: 'Name', value: formData.name },
//                   { label: 'Email', value: formData.email },
//                   { label: 'Phone', value: formData.phone },
//                   { label: 'Occupation', value: formData.occupation }
//                 ]
//               })}

//               {renderSummaryCard({
//                 title: 'Property & Lease',
//                 icon: Home,
//                 color: 'green',
//                 items: [
//                   { 
//                     label: 'Property', 
//                     value: selectedProperty ? `${selectedProperty.name} - ${selectedProperty.address?.street}` : '—' 
//                   },
//                   { label: 'Unit', value: formData.unit },
//                   { 
//                     label: 'Lease Dates', 
//                     value: `${formatDate(formData.leaseStart)} to ${formatDate(formData.leaseEnd) || 'Month-to-Month'}` 
//                   },
//                   { label: 'Rent Due Day', value: `Day ${formData.rentDueDay}` }
//                 ]
//               })}

//               {renderSummaryCard({
//                 title: 'Financial Information',
//                 icon: DollarSign,
//                 color: 'purple',
//                 items: [
//                   { label: 'Monthly Rent', value: formatCurrency(formData.rent) },
//                   { label: 'Security Deposit', value: formatCurrency(formData.deposit) },
//                   { 
//                     label: 'Monthly Income', 
//                     value: `${formatCurrency(formData.income)} ${rentRatio ? `(${rentRatio}x)` : ''}`
//                   },
//                   { label: 'Employer', value: formData.employer }
//                 ]
//               })}

//               {/* Identification Summary */}
//               {formData.identification.number && (
//                 <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
//                   <div className="flex items-center mb-3">
//                     <IdCard className="w-4 h-4 text-indigo-600 mr-2" />
//                     <h4 className="font-medium text-indigo-900">Identification</h4>
//                   </div>
//                   <div className="grid grid-cols-2 gap-3 text-sm">
//                     <div>
//                       <div className="text-indigo-700">ID Type</div>
//                       <div className="font-medium text-gray-900 capitalize">
//                         {formData.identification.type?.replace('_', ' ') || '—'}
//                       </div>
//                     </div>
//                     <div>
//                       <div className="text-indigo-700">ID Number</div>
//                       <div className="font-medium text-gray-900">{formData.identification.number || '—'}</div>
//                     </div>
//                     {formData.identification.issueDate && (
//                       <div>
//                         <div className="text-indigo-700">Issue Date</div>
//                         <div className="font-medium text-gray-900">{formatDate(formData.identification.issueDate)}</div>
//                       </div>
//                     )}
//                     {formData.identification.expiryDate && (
//                       <div>
//                         <div className="text-indigo-700">Expiry Date</div>
//                         <div className="font-medium text-gray-900">{formatDate(formData.identification.expiryDate)}</div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Family Members Summary */}
//               {formData.familyMembers.some(m => m.name.trim()) && (
//                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
//                   <div className="flex items-center mb-3">
//                     <Users className="w-4 h-4 text-blue-600 mr-2" />
//                     <h4 className="font-medium text-blue-900">Family Members</h4>
//                     <span className="ml-2 text-sm text-blue-700">
//                       ({formData.familyMembers.filter(m => m.name.trim()).length})
//                     </span>
//                   </div>
//                   <div className="space-y-2">
//                     {formData.familyMembers
//                       .filter(member => member.name.trim())
//                       .map((member, index) => (
//                         <div key={member.id} className="flex justify-between items-center text-sm">
//                           <div>
//                             <span className="font-medium text-gray-900">{member.name}</span>
//                             <span className="text-gray-500 ml-2 capitalize">({member.relationship})</span>
//                           </div>
//                           <div className="text-gray-600">
//                             {member.occupation || 'No occupation'}
//                           </div>
//                         </div>
//                       ))}
//                   </div>
//                 </div>
//               )}

//               {/* Additional Information */}
//               <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4">
//                 <div className="flex items-center mb-3">
//                   <FileText className="w-4 h-4 text-gray-600 mr-2" />
//                   <h4 className="font-medium text-gray-900">Additional Information</h4>
//                 </div>
//                 <div className="space-y-3">
//                   <div className="grid grid-cols-2 gap-3 text-sm">
//                     <div>
//                       <div className="text-gray-600">Emergency Contact</div>
//                       <div className="font-medium text-gray-900">{formData.emergencyContact || '—'}</div>
//                     </div>
//                     <div>
//                       <div className="text-gray-600">Emergency Phone</div>
//                       <div className="font-medium text-gray-900">{formData.emergencyPhone || '—'}</div>
//                     </div>
//                   </div>
//                   {formData.notes && (
//                     <div>
//                       <div className="text-sm text-gray-600">Notes</div>
//                       <div className="font-medium text-gray-900 text-sm">{formData.notes}</div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//     }
//   };

//   // Helper render functions
//   const renderInput = ({ 
//     label, name, type = 'text', icon: Icon, placeholder, required, error, 
//     min, max, className = '', size = 'md' 
//   }) => {
//     const inputClasses = {
//       sm: 'px-3 py-2 text-sm',
//       md: 'px-4 py-3'
//     };
    
//     return (
//       <div className={`space-y-2 ${className}`}>
//         <label className="text-sm font-medium text-gray-700 flex items-center">
//           {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />}
//           {label}
//         </label>
//         <input
//           type={type}
//           name={name}
//           value={formData[name]}
//           onChange={handleChange}
//           className={`w-full border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90
//             ${inputClasses[size]} 
//             ${error ? 'border-red-300' : 'border-gray-200'}`}
//           placeholder={placeholder}
//           required={required}
//           min={min}
//           max={max}
//         />
//         {error && (
//           <p className="text-red-500 text-xs flex items-center">
//             <AlertCircle className="w-3 h-3 mr-1" />
//             {error}
//           </p>
//         )}
//       </div>
//     );
//   };

//   const renderCurrencyInput = ({ label, name, icon: Icon, placeholder, required, error, helperText }) => (
//     <div className="space-y-2">
//       <label className="text-sm font-medium text-gray-700 flex items-center">
//         {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />}
//         {label}
//       </label>
//       <div className="relative">
//         <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//         <input
//           type="number"
//           name={name}
//           value={formData[name]}
//           onChange={handleChange}
//           className={`w-full pl-10 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90
//             ${error ? 'border-red-300' : 'border-gray-200'}`}
//           placeholder={placeholder}
//           required={required}
//           step="0.01"
//           min="0"
//         />
//       </div>
//       {error && (
//         <p className="text-red-500 text-xs flex items-center">
//           <AlertCircle className="w-3 h-3 mr-1" />
//           {error}
//         </p>
//       )}
//       {helperText && !error && (
//         <p className="text-xs text-gray-500">{helperText}</p>
//       )}
//     </div>
//   );

//   const renderSummaryCard = ({ title, icon: Icon, color, items }) => {
//     const colorClasses = {
//       blue: 'bg-blue-50 border-blue-100',
//       green: 'bg-green-50 border-green-100',
//       purple: 'bg-purple-50 border-purple-100',
//       indigo: 'bg-indigo-50 border-indigo-100'
//     };
    
//     const textColor = {
//       blue: 'text-blue-600',
//       green: 'text-green-600',
//       purple: 'text-purple-600',
//       indigo: 'text-indigo-600'
//     };
    
//     return (
//       <div className={`${colorClasses[color]} border rounded-xl p-4`}>
//         <div className="flex items-center mb-3">
//           <Icon className={`w-4 h-4 ${textColor[color]} mr-2`} />
//           <h4 className={`font-medium ${textColor[color].replace('600', '900')}`}>{title}</h4>
//         </div>
//         <div className="grid grid-cols-2 gap-3 text-sm">
//           {items.map((item, index) => (
//             <div key={index}>
//               <div className="text-gray-600 mb-1">{item.label}</div>
//               <div className="font-medium text-gray-900 truncate">
//                 {item.value || <span className="text-gray-400">Not provided</span>}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   // Helper functions
//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   const formatCurrency = (amount) => {
//     if (!amount || isNaN(amount)) return '—';
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD'
//     }).format(parseFloat(amount));
//   };

//   // Determine if next button should be disabled
//   const isNextDisabled = () => {
//     switch (step) {
//       case 1:
//         return !formData.name || !formData.email || !formData.phone || Object.keys(errors).length > 0;
//       case 2:
//         return !formData.propertyId || availableProperties.length === 0 || Object.keys(errors).length > 0;
//       case 3:
//         return !formData.rent || Object.keys(errors).length > 0;
//       case 4:
//         return !formData.identification.number || Object.keys(errors).length > 0;
//       default:
//         return false;
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen p-4">
//         {/* Backdrop */}
//         <div 
//           className="fixed inset-0 bg-gradient-to-br from-gray-900/20 to-gray-900/30 backdrop-blur-[1px]"
//           onClick={onClose}
//         />
        
//         {/* Modal */}
//         <div 
//           className="relative w-full max-w-xl bg-white/95 backdrop-blur-sm rounded-2xl 
//                      border border-gray-200/70 shadow-2xl overflow-hidden"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-200/70 bg-white/95 backdrop-blur-sm">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 {/* Step indicators */}
//                 <div className="flex items-center space-x-2">
//                   {STEPS.map(s => (
//                     <div
//                       key={s.number}
//                       className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
//                         ${step === s.number 
//                           ? `bg-${s.color}-600 text-white shadow-md` 
//                           : step > s.number 
//                           ? 'bg-green-100 text-green-700'
//                           : 'bg-gray-100 text-gray-400'
//                         }`}
//                     >
//                       {step > s.number ? '✓' : s.number}
//                     </div>
//                   ))}
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900">Add Tenant</h2>
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     Step {step} of {STEPS.length}: {STEPS[step-1]?.title}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="p-1.5 hover:bg-gray-100/80 rounded-lg transition-colors"
//                 aria-label="Close"
//                 disabled={loading}
//               >
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>
//           </div>
          
//           {/* Form Content */}
//           <div className="p-6 max-h-[calc(100vh-180px)] overflow-y-auto">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {renderStep()}
//             </form>
//           </div>
          
//           {/* Footer */}
//           <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200/70 bg-white/95 backdrop-blur-sm">
//             <div className="flex justify-between items-center">
//               <div>
//                 {step > 1 && (
//                   <button
//                     type="button"
//                     onClick={handleBack}
//                     disabled={loading}
//                     className="px-4 py-2.5 text-gray-700 hover:bg-gray-100/80 rounded-xl transition-colors flex items-center text-sm font-medium disabled:opacity-50"
//                   >
//                     <ChevronLeft className="w-4 h-4 mr-2" />
//                     Back
//                   </button>
//                 )}
//               </div>
              
//               <div className="flex gap-3">
//                 {step < STEPS.length ? (
//                   <>
//                     <button
//                       type="button"
//                       onClick={onClose}
//                       className="px-4 py-2.5 text-gray-700 hover:bg-gray-100/80 rounded-xl transition-colors text-sm font-medium"
//                       disabled={loading}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="button"
//                       onClick={handleNext}
//                       disabled={isNextDisabled() || loading}
//                       className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
//                                transition-colors flex items-center text-sm font-medium 
//                                disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Continue
//                       <ChevronRight className="w-4 h-4 ml-2" />
//                     </button>
//                   </>
//                 ) : (
//                   <div className="flex gap-3">
//                     <button
//                       type="button"
//                       onClick={onClose}
//                       className="px-4 py-2.5 text-gray-700 hover:bg-gray-100/80 rounded-xl transition-colors text-sm font-medium"
//                       disabled={loading}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="button"
//                       onClick={handleSubmit}
//                       disabled={loading || Object.keys(errors).length > 0}
//                       className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 
//                                transition-colors flex items-center text-sm font-medium 
//                                disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loading ? (
//                         <>
//                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                           Creating...
//                         </>
//                       ) : (
//                         <>
//                           <UserPlus className="w-4 h-4 mr-2" />
//                           Create Tenant
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // app/components/AddTenantModal.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { 
//   X, User, Mail, Phone, Home, Calendar,
//   DollarSign, FileText, UserPlus, CheckCircle,
//   MapPin, Briefcase, Shield, Building, CreditCard,
//   ChevronRight, ChevronLeft, Clock, AlertCircle,
//   Loader2, Key, FileCheck, AlertTriangle
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// // Step configuration
// const STEPS = [
//   { number: 1, title: 'Personal', icon: User, color: 'blue' },
//   { number: 2, title: 'Property', icon: Home, color: 'green' },
//   { number: 3, title: 'Financial', icon: DollarSign, color: 'purple' },
//   { number: 4, title: 'Review', icon: CheckCircle, color: 'emerald' }
// ];

// // Initial form state
// const INITIAL_FORM_DATA = {
//   // Personal Info
//   name: '',
//   email: '',
//   phone: '',
//   occupation: '',
  
//   // Property Info
//   propertyId: '',
//   unit: '',
//   leaseStart: new Date().toISOString().split('T')[0],
//   leaseEnd: '',
//   rentDueDay: 5,
  
//   // Financial Info
//   rent: '',
//   deposit: '',
//   income: '',
//   employer: '',
  
//   // Additional Info
//   emergencyContact: '',
//   emergencyPhone: '',
//   notes: '',
//   status: 'active'
// };

// export default function AddTenantModal({ onClose, onSuccess, user }) {
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState(1);
//   const [availableProperties, setAvailableProperties] = useState([]);
//   const [propertiesLoading, setPropertiesLoading] = useState(true);
//   const [formData, setFormData] = useState(INITIAL_FORM_DATA);
//   const [errors, setErrors] = useState({});

//   // Fetch properties on mount
//   useEffect(() => {
//     fetchProperties();
//   }, []);

//   // Validate current step
//   useEffect(() => {
//     validateCurrentStep();
//   }, [formData, step]);

//   const fetchProperties = async () => {
//     try {
//       setPropertiesLoading(true);
//       const res = await fetch('/api/properties?status=active&limit=50');
      
//       if (res.ok) {
//         const data = await res.json();
//         setAvailableProperties(data.properties || []);
//       } else {
//         throw new Error('Failed to fetch properties');
//       }
//     } catch (error) {
//       console.error('Error fetching properties:', error);
//       toast.error('Failed to load properties');
//     } finally {
//       setPropertiesLoading(false);
//     }
//   };

//   const validateCurrentStep = () => {
//     const newErrors = {};
    
//     switch (step) {
//       case 1:
//         if (!formData.name.trim()) newErrors.name = 'Name is required';
//         if (!formData.email.trim()) {
//           newErrors.email = 'Email is required';
//         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//           newErrors.email = 'Invalid email format';
//         }
//         if (!formData.phone.trim()) {
//           newErrors.phone = 'Phone is required';
//         } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\D/g, ''))) {
//           newErrors.phone = 'Invalid phone number';
//         }
//         break;
        
//       case 2:
//         if (!formData.propertyId) newErrors.propertyId = 'Property is required';
//         if (!formData.leaseStart) newErrors.leaseStart = 'Lease start date is required';
//         if (formData.leaseEnd && new Date(formData.leaseEnd) <= new Date(formData.leaseStart)) {
//           newErrors.leaseEnd = 'Lease end must be after start date';
//         }
//         break;
        
//       case 3:
//         if (!formData.rent || parseFloat(formData.rent) <= 0) {
//           newErrors.rent = 'Valid rent amount is required';
//         }
//         if (formData.deposit && parseFloat(formData.deposit) < 0) {
//           newErrors.deposit = 'Deposit cannot be negative';
//         }
//         if (formData.income && parseFloat(formData.income) < 0) {
//           newErrors.income = 'Income cannot be negative';
//         }
//         break;
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value, type } = e.target;
//     let processedValue = value;
    
//     // Format phone number
//     if (name === 'phone' || name === 'emergencyPhone') {
//       processedValue = formatPhoneNumber(value);
//     }
    
//     // Clear error for this field
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: null }));
//     }
    
//     setFormData(prev => ({ 
//       ...prev, 
//       [name]: processedValue 
//     }));
//   };

//   const formatPhoneNumber = (value) => {
//     // Remove all non-digits
//     const phone = value.replace(/\D/g, '');
    
//     // Format as (XXX) XXX-XXXX for US numbers
//     if (phone.length <= 3) return phone;
//     if (phone.length <= 6) return `(${phone.slice(0,3)}) ${phone.slice(3)}`;
//     return `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6,10)}`;
//   };

//   const checkUserLimits = async () => {
//     if (user?.subscription?.plan === 'free') {
//       try {
//         const tenantCountRes = await fetch('/api/tenants/count');
//         if (tenantCountRes.ok) {
//           const { count } = await tenantCountRes.json();
//           if (count >= user?.limits?.tenants) {
//             throw new Error(`Free plan limited to ${user.limits.tenants} tenants. Upgrade to add more.`);
//           }
//         }
//       } catch (error) {
//         throw error;
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateCurrentStep()) {
//       toast.error('Please fix errors before submitting');
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       // Check user limits
//       await checkUserLimits();
      
//       // Prepare data for API
//       const tenantData = {
//         personalInfo: {
//           fullName: formData.name.trim(),
//           email: formData.email.trim(),
//           phone: formData.phone.replace(/\D/g, ''),
//           occupation: formData.occupation.trim(),
//           emergencyContact: {
//             name: formData.emergencyContact.trim(),
//             phone: formData.emergencyPhone.replace(/\D/g, '')
//           }
//         },
//         propertyId: formData.propertyId,
//         unit: formData.unit.trim(),
//         lease: {
//           startDate: formData.leaseStart,
//           endDate: formData.leaseEnd || null,
//           monthlyRent: parseFloat(formData.rent) || 0,
//           securityDeposit: parseFloat(formData.deposit) || 0,
//           dueDay: parseInt(formData.rentDueDay) || 5
//         },
//         financial: {
//           monthlyIncome: parseFloat(formData.income) || 0,
//           employer: formData.employer.trim()
//         },
//         notes: formData.notes.trim(),
//         status: formData.status
//       };
      
//       // Submit to API
//       const res = await fetch('/api/tenants', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Cache-Control': 'no-cache'
//         },
//         body: JSON.stringify(tenantData)
//       });
      
//       const data = await res.json();
      
//       if (!res.ok) {
//         throw new Error(data.error || `Failed to add tenant (${res.status})`);
//       }
      
//       toast.success('Tenant added successfully!');
//       onSuccess(data.tenant || data);
      
//     } catch (error) {
//       console.error('Error adding tenant:', error);
//       toast.error(error.message || 'Failed to add tenant');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleNext = () => {
//     if (validateCurrentStep()) {
//       setStep(prev => Math.min(prev + 1, 4));
//     }
//   };

//   const handleBack = () => {
//     setStep(prev => Math.max(prev - 1, 1));
//   };

//   // Render steps
//   const renderStep = () => {
//     switch (step) {
//       case 1:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-2">
//               <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
//                 <User className="w-6 h-6 text-blue-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
//               <p className="text-sm text-gray-500">Basic tenant details</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {renderInput({
//                 label: 'Full Name *',
//                 name: 'name',
//                 icon: User,
//                 placeholder: 'John Doe',
//                 required: true,
//                 error: errors.name
//               })}
              
//               {renderInput({
//                 label: 'Email *',
//                 name: 'email',
//                 type: 'email',
//                 icon: Mail,
//                 placeholder: 'john@example.com',
//                 required: true,
//                 error: errors.email
//               })}

//               {renderInput({
//                 label: 'Phone *',
//                 name: 'phone',
//                 type: 'tel',
//                 icon: Phone,
//                 placeholder: '(555) 123-4567',
//                 required: true,
//                 error: errors.phone
//               })}

//               {renderInput({
//                 label: 'Occupation',
//                 name: 'occupation',
//                 icon: Briefcase,
//                 placeholder: 'Software Engineer',
//                 required: false
//               })}
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-2">
//               <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
//                 <Home className="w-6 h-6 text-green-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Property & Lease</h3>
//               <p className="text-sm text-gray-500">Where and when they'll live</p>
//             </div>

//             <div className="space-y-4">
//               {propertiesLoading ? (
//                 <div className="text-center py-6">
//                   <Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto mb-2" />
//                   <p className="text-gray-500 text-sm">Loading properties...</p>
//                 </div>
//               ) : availableProperties.length === 0 ? (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
//                   <div className="flex items-start">
//                     <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="text-yellow-800 font-medium">No properties available</p>
//                       <p className="text-yellow-700 text-sm mt-1">
//                         Add a property first to assign tenants. 
//                         <button 
//                           onClick={() => window.open('/properties/add', '_blank')}
//                           className="ml-1 text-yellow-800 font-medium hover:underline"
//                         >
//                           Add Property →
//                         </button>
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-gray-700 flex items-center">
//                       <Building className="w-4 h-4 mr-2 text-gray-400" />
//                       Select Property *
//                     </label>
//                     <select
//                       name="propertyId"
//                       value={formData.propertyId}
//                       onChange={handleChange}
//                       className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90
//                         ${errors.propertyId ? 'border-red-300' : 'border-gray-200'}`}
//                       required
//                     >
//                       <option value="">Choose a property...</option>
//                       {availableProperties.map(p => (
//                         <option key={p._id} value={p._id}>
//                           {p.name} • {p.address?.street}, {p.address?.city}
//                         </option>
//                       ))}
//                     </select>
//                     {errors.propertyId && (
//                       <p className="text-red-500 text-xs mt-1">{errors.propertyId}</p>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     {renderInput({
//                       label: 'Unit #',
//                       name: 'unit',
//                       icon: MapPin,
//                       placeholder: 'Apt 4B',
//                       className: 'col-span-1'
//                     })}

//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-gray-700 flex items-center">
//                         <Clock className="w-4 h-4 mr-2 text-gray-400" />
//                         Rent Due Day *
//                       </label>
//                       <select
//                         name="rentDueDay"
//                         value={formData.rentDueDay}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90"
//                       >
//                         {[1, 5, 10, 15, 20, 25].map(day => (
//                           <option key={day} value={day}>Day {day}</option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     {renderInput({
//                       label: 'Lease Start *',
//                       name: 'leaseStart',
//                       type: 'date',
//                       error: errors.leaseStart,
//                       min: new Date().toISOString().split('T')[0]
//                     })}

//                     {renderInput({
//                       label: 'Lease End',
//                       name: 'leaseEnd',
//                       type: 'date',
//                       error: errors.leaseEnd,
//                       min: formData.leaseStart || new Date().toISOString().split('T')[0]
//                     })}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         );

//       case 3:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-2">
//               <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
//                 <DollarSign className="w-6 h-6 text-purple-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Financial Details</h3>
//               <p className="text-sm text-gray-500">Rent and income information</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {renderCurrencyInput({
//                 label: 'Monthly Rent *',
//                 name: 'rent',
//                 icon: DollarSign,
//                 placeholder: '1500.00',
//                 required: true,
//                 error: errors.rent
//               })}

//               {renderCurrencyInput({
//                 label: 'Security Deposit',
//                 name: 'deposit',
//                 icon: Shield,
//                 placeholder: '1500.00',
//                 error: errors.deposit
//               })}

//               {renderCurrencyInput({
//                 label: 'Monthly Income',
//                 name: 'income',
//                 icon: CreditCard,
//                 placeholder: '5000.00',
//                 error: errors.income,
//                 helperText: formData.rent && formData.income 
//                   ? `${(parseFloat(formData.income) / parseFloat(formData.rent)).toFixed(1)}x rent ratio`
//                   : 'Recommended: 3x monthly rent'
//               })}

//               {renderInput({
//                 label: 'Employer',
//                 name: 'employer',
//                 placeholder: 'Company Name'
//               })}
//             </div>
//           </div>
//         );

//       case 4:
//         const selectedProperty = availableProperties.find(p => p._id === formData.propertyId);
//         const rentRatio = formData.rent && formData.income 
//           ? (parseFloat(formData.income) / parseFloat(formData.rent)).toFixed(1)
//           : null;
        
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-2">
//               <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-3">
//                 <FileCheck className="w-6 h-6 text-emerald-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Review & Create</h3>
//               <p className="text-sm text-gray-500">Confirm all details are correct</p>
//             </div>

//             {/* Summary Cards */}
//             <div className="space-y-4">
//               {renderSummaryCard({
//                 title: 'Personal Details',
//                 icon: User,
//                 color: 'blue',
//                 items: [
//                   { label: 'Name', value: formData.name },
//                   { label: 'Email', value: formData.email },
//                   { label: 'Phone', value: formData.phone },
//                   { label: 'Occupation', value: formData.occupation }
//                 ]
//               })}

//               {renderSummaryCard({
//                 title: 'Property & Lease',
//                 icon: Home,
//                 color: 'green',
//                 items: [
//                   { 
//                     label: 'Property', 
//                     value: selectedProperty ? `${selectedProperty.name} - ${selectedProperty.address?.street}` : '—' 
//                   },
//                   { label: 'Unit', value: formData.unit },
//                   { 
//                     label: 'Lease Dates', 
//                     value: `${formatDate(formData.leaseStart)} to ${formatDate(formData.leaseEnd) || 'Month-to-Month'}` 
//                   },
//                   { label: 'Rent Due Day', value: `Day ${formData.rentDueDay}` }
//                 ]
//               })}

//               {renderSummaryCard({
//                 title: 'Financial Information',
//                 icon: DollarSign,
//                 color: 'purple',
//                 items: [
//                   { label: 'Monthly Rent', value: formatCurrency(formData.rent) },
//                   { label: 'Security Deposit', value: formatCurrency(formData.deposit) },
//                   { 
//                     label: 'Monthly Income', 
//                     value: `${formatCurrency(formData.income)} ${rentRatio ? `(${rentRatio}x)` : ''}`
//                   },
//                   { label: 'Employer', value: formData.employer }
//                 ]
//               })}

//               {/* Additional Information */}
//               <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4">
//                 <div className="flex items-center mb-3">
//                   <FileText className="w-4 h-4 text-gray-600 mr-2" />
//                   <h4 className="font-medium text-gray-900">Additional Information</h4>
//                 </div>
//                 <div className="space-y-3">
//                   {renderInput({
//                     label: 'Emergency Contact',
//                     name: 'emergencyContact',
//                     placeholder: 'Contact name',
//                     size: 'sm'
//                   })}
//                   {renderInput({
//                     label: 'Emergency Phone',
//                     name: 'emergencyPhone',
//                     type: 'tel',
//                     placeholder: '(555) 555-5555',
//                     size: 'sm'
//                   })}
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-gray-700">Notes</label>
//                     <textarea
//                       name="notes"
//                       value={formData.notes}
//                       onChange={handleChange}
//                       rows="2"
//                       className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white/90 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="Any special instructions or notes..."
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//     }
//   };

//   // Helper render functions
//   const renderInput = ({ 
//     label, name, type = 'text', icon: Icon, placeholder, required, error, 
//     min, max, className = '', size = 'md' 
//   }) => {
//     const inputClasses = {
//       sm: 'px-3 py-2 text-sm',
//       md: 'px-4 py-3'
//     };
    
//     return (
//       <div className={`space-y-2 ${className}`}>
//         <label className="text-sm font-medium text-gray-700 flex items-center">
//           {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />}
//           {label}
//         </label>
//         <input
//           type={type}
//           name={name}
//           value={formData[name]}
//           onChange={handleChange}
//           className={`w-full border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90
//             ${inputClasses[size]} 
//             ${error ? 'border-red-300' : 'border-gray-200'}`}
//           placeholder={placeholder}
//           required={required}
//           min={min}
//           max={max}
//         />
//         {error && (
//           <p className="text-red-500 text-xs flex items-center">
//             <AlertCircle className="w-3 h-3 mr-1" />
//             {error}
//           </p>
//         )}
//       </div>
//     );
//   };

//   const renderCurrencyInput = ({ label, name, icon: Icon, placeholder, required, error, helperText }) => (
//     <div className="space-y-2">
//       <label className="text-sm font-medium text-gray-700 flex items-center">
//         {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />}
//         {label}
//       </label>
//       <div className="relative">
//         <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//         <input
//           type="number"
//           name={name}
//           value={formData[name]}
//           onChange={handleChange}
//           className={`w-full pl-10 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90
//             ${error ? 'border-red-300' : 'border-gray-200'}`}
//           placeholder={placeholder}
//           required={required}
//           step="0.01"
//           min="0"
//         />
//       </div>
//       {error && (
//         <p className="text-red-500 text-xs flex items-center">
//           <AlertCircle className="w-3 h-3 mr-1" />
//           {error}
//         </p>
//       )}
//       {helperText && !error && (
//         <p className="text-xs text-gray-500">{helperText}</p>
//       )}
//     </div>
//   );

//   const renderSummaryCard = ({ title, icon: Icon, color, items }) => {
//     const colorClasses = {
//       blue: 'bg-blue-50 border-blue-100',
//       green: 'bg-green-50 border-green-100',
//       purple: 'bg-purple-50 border-purple-100'
//     };
    
//     const textColor = {
//       blue: 'text-blue-600',
//       green: 'text-green-600',
//       purple: 'text-purple-600'
//     };
    
//     return (
//       <div className={`${colorClasses[color]} border rounded-xl p-4`}>
//         <div className="flex items-center mb-3">
//           <Icon className={`w-4 h-4 ${textColor[color]} mr-2`} />
//           <h4 className={`font-medium ${textColor[color].replace('600', '900')}`}>{title}</h4>
//         </div>
//         <div className="grid grid-cols-2 gap-3 text-sm">
//           {items.map((item, index) => (
//             <div key={index}>
//               <div className="text-gray-600 mb-1">{item.label}</div>
//               <div className="font-medium text-gray-900 truncate">
//                 {item.value || <span className="text-gray-400">Not provided</span>}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   // Helper functions
//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   const formatCurrency = (amount) => {
//     if (!amount || isNaN(amount)) return '—';
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD'
//     }).format(parseFloat(amount));
//   };

//   // Determine if next button should be disabled
//   const isNextDisabled = () => {
//     switch (step) {
//       case 1:
//         return !formData.name || !formData.email || !formData.phone || Object.keys(errors).length > 0;
//       case 2:
//         return !formData.propertyId || availableProperties.length === 0 || Object.keys(errors).length > 0;
//       case 3:
//         return !formData.rent || Object.keys(errors).length > 0;
//       default:
//         return false;
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen p-4">
//         {/* Backdrop */}
//         <div 
//           className="fixed inset-0 bg-gradient-to-br from-gray-900/20 to-gray-900/30 backdrop-blur-[1px]"
//           onClick={onClose}
//         />
        
//         {/* Modal */}
//         <div 
//           className="relative w-full max-w-xl bg-white/95 backdrop-blur-sm rounded-2xl 
//                      border border-gray-200/70 shadow-2xl overflow-hidden"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-200/70 bg-white/95 backdrop-blur-sm">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 {/* Step indicators */}
//                 <div className="flex items-center space-x-2">
//                   {STEPS.map(s => (
//                     <div
//                       key={s.number}
//                       className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
//                         ${step === s.number 
//                           ? `bg-${s.color}-600 text-white shadow-md` 
//                           : step > s.number 
//                           ? 'bg-green-100 text-green-700'
//                           : 'bg-gray-100 text-gray-400'
//                         }`}
//                     >
//                       {step > s.number ? '✓' : s.number}
//                     </div>
//                   ))}
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900">Add Tenant</h2>
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     Step {step} of {STEPS.length}: {STEPS[step-1]?.title}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="p-1.5 hover:bg-gray-100/80 rounded-lg transition-colors"
//                 aria-label="Close"
//                 disabled={loading}
//               >
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>
//           </div>
          
//           {/* Form Content */}
//           <div className="p-6 max-h-[calc(100vh-180px)] overflow-y-auto">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {renderStep()}
//             </form>
//           </div>
          
//           {/* Footer */}
//           <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200/70 bg-white/95 backdrop-blur-sm">
//             <div className="flex justify-between items-center">
//               <div>
//                 {step > 1 && (
//                   <button
//                     type="button"
//                     onClick={handleBack}
//                     disabled={loading}
//                     className="px-4 py-2.5 text-gray-700 hover:bg-gray-100/80 rounded-xl transition-colors flex items-center text-sm font-medium disabled:opacity-50"
//                   >
//                     <ChevronLeft className="w-4 h-4 mr-2" />
//                     Back
//                   </button>
//                 )}
//               </div>
              
//               <div className="flex gap-3">
//                 {step < 4 ? (
//                   <>
//                     <button
//                       type="button"
//                       onClick={onClose}
//                       className="px-4 py-2.5 text-gray-700 hover:bg-gray-100/80 rounded-xl transition-colors text-sm font-medium"
//                       disabled={loading}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="button"
//                       onClick={handleNext}
//                       disabled={isNextDisabled() || loading}
//                       className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
//                                transition-colors flex items-center text-sm font-medium 
//                                disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Continue
//                       <ChevronRight className="w-4 h-4 ml-2" />
//                     </button>
//                   </>
//                 ) : (
//                   <div className="flex gap-3">
//                     <button
//                       type="button"
//                       onClick={onClose}
//                       className="px-4 py-2.5 text-gray-700 hover:bg-gray-100/80 rounded-xl transition-colors text-sm font-medium"
//                       disabled={loading}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="button"
//                       onClick={handleSubmit}
//                       disabled={loading || Object.keys(errors).length > 0}
//                       className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 
//                                transition-colors flex items-center text-sm font-medium 
//                                disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loading ? (
//                         <>
//                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                           Creating...
//                         </>
//                       ) : (
//                         <>
//                           <UserPlus className="w-4 h-4 mr-2" />
//                           Create Tenant
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }