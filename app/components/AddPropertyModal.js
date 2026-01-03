// app/components/AddPropertyModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { 
  X, Home, MapPin, DollarSign, CheckCircle, ChevronLeft, 
  ChevronRight, Plus, Trash2, DoorOpen, Building2, House
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddPropertyModal({ onClose, onSuccess, user }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Simplified property structure types
  const PROPERTY_STRUCTURES = [
    { 
      id: 'single_unit', 
      name: 'Single Property',
      description: 'One complete property',
      icon: House,
    },
    { 
      id: 'multi_room', 
      name: 'Multiple Rooms',
      description: 'House with individual rooms',
      icon: DoorOpen,
    },
    { 
      id: 'multi_unit', 
      name: 'Multiple Units',
      description: 'Building with separate units',
      icon: Building2,
    }
  ];

  const [formData, setFormData] = useState({
    // Step 1: Basic Info (only name required)
    name: '',
    propertyStructure: 'single_unit',
    
    // Step 2: Rental Configuration
    // For single unit
    monthlyRent: '',
    
    // For multi-unit/room
    units: [
      {
        id: Date.now(),
        unitNumber: 'Room 1',
        monthlyRent: '',
      }
    ],
  });

  // Simplified steps
  const steps = [
    { number: 1, title: 'Basic', icon: Home, color: 'blue' },
    { number: 2, title: 'Rent', icon: DollarSign, color: 'green' },
    { number: 3, title: 'Review', icon: CheckCircle, color: 'emerald' }
  ];

  // Initialize units if switching to multi
  useEffect(() => {
    if ((formData.propertyStructure === 'multi_room' || formData.propertyStructure === 'multi_unit') && formData.units.length === 0) {
      setFormData(prev => ({
        ...prev,
        units: [{
          id: Date.now(),
          unitNumber: formData.propertyStructure === 'multi_room' ? 'Room 1' : 'Unit 1A',
          monthlyRent: '',
        }]
      }));
    }
  }, [formData.propertyStructure]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle number inputs
  const handleNumberChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value)
    }));
  };

  // Unit/Room Management Functions
  const addUnit = () => {
    const isRoom = formData.propertyStructure === 'multi_room';
    const prefix = isRoom ? 'Room' : 'Unit';
    const unitCount = formData.units.length;
    
    let unitNumber;
    if (isRoom) {
      unitNumber = `${prefix} ${unitCount + 1}`;
    } else {
      // For units, use letters: A, B, C, etc.
      unitNumber = `${prefix} ${String.fromCharCode(65 + unitCount)}`;
    }
    
    const newUnit = {
      id: Date.now(),
      unitNumber,
      monthlyRent: '',
    };
    
    setFormData(prev => ({
      ...prev,
      units: [...prev.units, newUnit]
    }));
  };

  const removeUnit = (id) => {
    if (formData.units.length <= 1) {
      toast.error('At least one unit is required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      units: prev.units.filter(unit => unit.id !== id)
    }));
  };

  const updateUnit = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        unit.id === id ? { ...unit, [field]: value } : unit
      )
    }));
  };

  // Calculate total monthly income from all units
  const calculateTotalMonthlyIncome = () => {
    if (formData.propertyStructure === 'single_unit') {
      return parseFloat(formData.monthlyRent) || 0;
    }
    return formData.units.reduce((total, unit) => {
      return total + (parseFloat(unit.monthlyRent) || 0);
    }, 0);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check user limits
      if (user?.subscription?.plan === 'free') {
        const res = await fetch('/api/properties/count');
        if (res.ok) {
          const { count } = await res.json();
          if (count >= user?.limits?.properties) {
            throw new Error(`Free plan limited to ${user.limits.properties} properties. Please upgrade.`);
          }
        }
      }

      // Prepare minimal data for API
      const propertyData = {
        name: formData.name,
        propertyStructure: formData.propertyStructure,
        
        // Optional fields (empty for now)
        address: {},
        details: {},
        financial: {},
        images: []
      };

      // Add rental info
      if (formData.propertyStructure === 'single_unit') {
        propertyData.financial.marketRent = parseFloat(formData.monthlyRent) || 0;
      } else {
        propertyData.details.units = formData.units.map(unit => ({
          unitNumber: unit.unitNumber,
          monthlyRent: parseFloat(unit.monthlyRent) || 0,
          status: 'available'
        }));
        propertyData.financial.totalMonthlyIncome = calculateTotalMonthlyIncome();
      }

      // Submit to API
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add property');
      }

      toast.success('Property added successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 1: // Basic Info
        return (
          <div className="space-y-6">
            <div className="text-center mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Add New Property</h3>
              <p className="text-sm text-gray-500">Start with basic information</p>
            </div>

            <div className="space-y-4">
              {/* Property Name (Required) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Property Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter property name"
                  required
                  autoFocus
                />
              </div>

              {/* Property Structure Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Property Type
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PROPERTY_STRUCTURES.map(structure => {
                    const Icon = structure.icon;
                    return (
                      <button
                        key={structure.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          propertyStructure: structure.id 
                        }))}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          formData.propertyStructure === structure.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 ${
                            formData.propertyStructure === structure.id
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{structure.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{structure.description}</p>
                          </div>
                          {formData.propertyStructure === structure.id && (
                            <CheckCircle className="w-5 h-5 text-blue-600 ml-2" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Rent Configuration
        const isMulti = formData.propertyStructure !== 'single_unit';
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isMulti ? 'Set Rental Rates' : 'Set Monthly Rent'}
              </h3>
              <p className="text-sm text-gray-500">
                {isMulti ? 'Configure rent for each unit' : 'Enter monthly rent amount'}
              </p>
            </div>

            <div className="space-y-4">
              {!isMulti ? (
                // Single Unit Rent
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Monthly Rent *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="monthlyRent"
                      value={formData.monthlyRent}
                      onChange={(e) => handleNumberChange('monthlyRent', e.target.value)}
                      className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="1500"
                      required
                      min="0"
                      step="1"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    You can update this later if needed
                  </p>
                </div>
              ) : (
                // Multiple Units/Rooms Rent
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">
                      {formData.propertyStructure === 'multi_room' ? 'Rooms' : 'Units'} ({formData.units.length})
                    </h4>
                    <button
                      type="button"
                      onClick={addUnit}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add {formData.propertyStructure === 'multi_room' ? 'Room' : 'Unit'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.units.map((unit, index) => (
                      <div key={unit.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-blue-600">
                                {unit.unitNumber.charAt(unit.unitNumber.length - 1)}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{unit.unitNumber}</h4>
                              <p className="text-xs text-gray-500">
                                {formData.propertyStructure === 'multi_room' ? 'Individual Room' : 'Separate Unit'}
                              </p>
                            </div>
                          </div>
                          {formData.units.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeUnit(unit.id)}
                              className="p-1 hover:bg-red-50 text-red-500 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Monthly Rent *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={unit.monthlyRent}
                              onChange={(e) => updateUnit(unit.id, 'monthlyRent', e.target.value)}
                              className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder={formData.propertyStructure === 'multi_room' ? "500" : "1200"}
                              required
                              min="0"
                              step="1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Income Summary */}
                  {formData.units.some(unit => unit.monthlyRent) && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium text-green-900">Total Monthly Income</div>
                          <div className="text-xs text-green-700">
                            {formData.units.length} {formData.propertyStructure === 'multi_room' ? 'rooms' : 'units'}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-900">
                          ${calculateTotalMonthlyIncome().toLocaleString()}
                        </div>
                      </div>
                      <div className="text-xs text-green-700 mt-1">
                        Average: ${formData.units.length > 0 ? Math.round(calculateTotalMonthlyIncome() / formData.units.length) : 0}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 3: // Review
        const totalIncome = calculateTotalMonthlyIncome();
        const isMultiReview = formData.propertyStructure !== 'single_unit';
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Ready to Create</h3>
              <p className="text-sm text-gray-500">Review your property details</p>
            </div>

            <div className="space-y-4">
              {/* Property Summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Home className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-900">Property Summary</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Property Name</span>
                    <span className="font-medium text-gray-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Property Type</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {formData.propertyStructure === 'single_unit' && 'Single Property'}
                      {formData.propertyStructure === 'multi_room' && 'House with Rooms'}
                      {formData.propertyStructure === 'multi_unit' && 'Building with Units'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rent Summary */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-green-900">Rent Information</h4>
                </div>
                {!isMultiReview ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Monthly Rent</span>
                      <span className="text-lg font-bold text-green-900">
                        ${parseFloat(formData.monthlyRent || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.units.map((unit, index) => (
                      <div key={unit.id} className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-green-700">{unit.unitNumber}</div>
                          <div className="text-xs text-green-600">
                            {formData.propertyStructure === 'multi_room' ? 'Room' : 'Unit'}
                          </div>
                        </div>
                        <div className="font-medium text-gray-900">
                          ${parseFloat(unit.monthlyRent || 0).toLocaleString()}/month
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-green-200">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-green-900">Total Monthly Income</span>
                        <span className="text-lg font-bold text-green-900">
                          ${totalIncome.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Note about updates */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Note</h4>
                <p className="text-xs text-gray-600">
                  You've added only the required information. You can update address, 
                  property details, photos, and other information later in the property settings.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Check if current step is valid
  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.trim() !== ''; // Only name required
      case 2:
        if (formData.propertyStructure === 'single_unit') {
          return formData.monthlyRent && parseFloat(formData.monthlyRent) > 0;
        } else {
          // For multi, all units must have rent > 0
          return formData.units.length > 0 && 
                 formData.units.every(unit => unit.monthlyRent && parseFloat(unit.monthlyRent) > 0);
        }
      case 3:
        return true; // Review step always valid
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl 
                   border border-gray-200 shadow-2xl overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {steps.map(s => (
                  <div
                    key={s.number}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
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
                <h2 className="text-lg font-semibold text-gray-900">Add Property</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Step {step} of {steps.length}: {steps[step-1]?.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-180px)] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {renderStep()}
          </form>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium flex items-center"
                  disabled={loading}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              {step < steps.length ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={!isStepValid() || loading}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                             transition-colors text-sm font-medium flex items-center
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
                  disabled={loading || !isStepValid()}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 
                           transition-colors text-sm font-medium flex items-center
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Property
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// app/components/AddPropertyModal.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { 
//   X, Home, MapPin, DollarSign, Bath, Bed, Square, 
//   Car, Layers, Calendar, Shield, CheckCircle, ChevronLeft, 
//   ChevronRight, Building, Ruler, Info, Image, 
//   Plus, Trash2, Users, DoorOpen, Hash, Key,
//   Building2, Apartment, House, Hotel
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// export default function AddPropertyModal({ onClose, onSuccess, user }) {
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState(1);
  
//   // Property structure types
//   const PROPERTY_STRUCTURES = [
//     { 
//       id: 'single_unit', 
//       name: 'Single Unit Property',
//       description: 'One complete property for single tenant',
//       icon: House,
//       type: 'single'
//     },
//     { 
//       id: 'multi_room_house', 
//       name: 'House with Individual Rooms',
//       description: 'One house with multiple rooms for rent separately',
//       icon: Hotel,
//       type: 'rooms'
//     },
//     { 
//       id: 'multi_unit_building', 
//       name: 'Building with Multiple Units',
//       description: 'Building with separate apartments/flats',
//       icon: Building2,
//       type: 'units'
//     }
//   ];

//   const [formData, setFormData] = useState({
//     // Step 1: Basic Info
//     name: '',
//     type: 'apartment',
//     status: 'active',
//     propertyStructure: 'single_unit', // 'single_unit', 'multi_room_house', 'multi_unit_building'
    
//     // Step 2: Address
//     street: '',
//     city: '',
//     state: '',
//     zipCode: '',
//     country: 'US',
    
//     // Step 3: Overall Property Details
//     totalBedrooms: 1,
//     totalBathrooms: 1,
//     totalSquareFeet: '',
//     yearBuilt: new Date().getFullYear(),
//     parkingSpaces: 0,
//     amenities: [],
    
//     // Step 4: Unit/Room Configuration
//     // For multi_room_house: Array of rooms
//     // For multi_unit_building: Array of units/flats
//     units: [], // Will hold either rooms or apartments
    
//     // Step 5: Financial
//     purchasePrice: '',
//     currentValue: '',
//     propertyTax: '',
//     insurance: '',
//     hoaFees: '',
    
//     // Mortgage
//     hasMortgage: false,
//     lender: '',
//     loanAmount: '',
//     interestRate: '',
//     monthlyPayment: '',
//     termYears: 30,
    
//     // Step 6: Images
//     images: []
//   });

//   // Steps configuration - dynamic based on property structure
//   const getSteps = () => {
//     const baseSteps = [
//       { number: 1, title: 'Basic', icon: Home, color: 'blue' },
//       { number: 2, title: 'Address', icon: MapPin, color: 'green' },
//       { number: 3, title: 'Details', icon: Layers, color: 'purple' },
//     ];
    
//     if (formData.propertyStructure === 'single_unit') {
//       return [
//         ...baseSteps,
//         { number: 4, title: 'Financial', icon: DollarSign, color: 'yellow' },
//         { number: 5, title: 'Review', icon: CheckCircle, color: 'emerald' }
//       ];
//     } else {
//       return [
//         ...baseSteps,
//         { number: 4, title: formData.propertyStructure === 'multi_room_house' ? 'Rooms' : 'Units', icon: DoorOpen, color: 'indigo' },
//         { number: 5, title: 'Financial', icon: DollarSign, color: 'yellow' },
//         { number: 6, title: 'Review', icon: CheckCircle, color: 'emerald' }
//       ];
//     }
//   };

//   const steps = getSteps();

//   // Initialize units based on property structure
//   useEffect(() => {
//     if (formData.propertyStructure === 'multi_room_house' && formData.units.length === 0) {
//       // Initialize with 3 rooms for a house
//       setFormData(prev => ({
//         ...prev,
//         units: [
//           {
//             id: Date.now(),
//             unitNumber: 'Room 1',
//             type: 'room',
//             bedrooms: 1,
//             bathrooms: 0, // Shared bathroom
//             squareFeet: '',
//             hasKitchen: false,
//             hasPrivateBathroom: false,
//             monthlyRent: '',
//             deposit: '',
//             status: 'available',
//             features: []
//           },
//           {
//             id: Date.now() + 1,
//             unitNumber: 'Room 2',
//             type: 'room',
//             bedrooms: 1,
//             bathrooms: 0,
//             squareFeet: '',
//             hasKitchen: false,
//             hasPrivateBathroom: false,
//             monthlyRent: '',
//             deposit: '',
//             status: 'available',
//             features: []
//           },
//           {
//             id: Date.now() + 2,
//             unitNumber: 'Room 3',
//             type: 'room',
//             bedrooms: 1,
//             bathrooms: 0,
//             squareFeet: '',
//             hasKitchen: false,
//             hasPrivateBathroom: false,
//             monthlyRent: '',
//             deposit: '',
//             status: 'available',
//             features: []
//           }
//         ]
//       }));
//     } else if (formData.propertyStructure === 'multi_unit_building' && formData.units.length === 0) {
//       // Initialize with 2 apartments for a building
//       setFormData(prev => ({
//         ...prev,
//         units: [
//           {
//             id: Date.now(),
//             unitNumber: 'Unit 1A',
//             type: 'apartment',
//             bedrooms: 1,
//             bathrooms: 1,
//             squareFeet: '',
//             hasKitchen: true,
//             hasPrivateBathroom: true,
//             monthlyRent: '',
//             deposit: '',
//             status: 'available',
//             features: []
//           },
//           {
//             id: Date.now() + 1,
//             unitNumber: 'Unit 1B',
//             type: 'apartment',
//             bedrooms: 2,
//             bathrooms: 1,
//             squareFeet: '',
//             hasKitchen: true,
//             hasPrivateBathroom: true,
//             monthlyRent: '',
//             deposit: '',
//             status: 'available',
//             features: []
//           }
//         ]
//       }));
//     } else if (formData.propertyStructure === 'single_unit') {
//       // Clear units for single property
//       setFormData(prev => ({
//         ...prev,
//         units: []
//       }));
//     }
//   }, [formData.propertyStructure]);

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   // Handle number inputs
//   const handleNumberChange = (name, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [name]: value === '' ? '' : parseFloat(value)
//     }));
//   };

//   // Handle amenities selection
//   const handleAmenityToggle = (amenity) => {
//     setFormData(prev => {
//       const currentAmenities = prev.amenities || [];
//       const newAmenities = currentAmenities.includes(amenity)
//         ? currentAmenities.filter(a => a !== amenity)
//         : [...currentAmenities, amenity];
//       return { ...prev, amenities: newAmenities };
//     });
//   };

//   // Unit/Room Management Functions
//   const addUnit = () => {
//     let newUnit;
    
//     if (formData.propertyStructure === 'multi_room_house') {
//       newUnit = {
//         id: Date.now(),
//         unitNumber: `Room ${formData.units.length + 1}`,
//         type: 'room',
//         bedrooms: 1,
//         bathrooms: 0,
//         squareFeet: '',
//         hasKitchen: false,
//         hasPrivateBathroom: false,
//         monthlyRent: '',
//         deposit: '',
//         status: 'available',
//         features: []
//       };
//     } else if (formData.propertyStructure === 'multi_unit_building') {
//       newUnit = {
//         id: Date.now(),
//         unitNumber: `Unit ${String.fromCharCode(65 + formData.units.length)}`,
//         type: 'apartment',
//         bedrooms: 1,
//         bathrooms: 1,
//         squareFeet: '',
//         hasKitchen: true,
//         hasPrivateBathroom: true,
//         monthlyRent: '',
//         deposit: '',
//         status: 'available',
//         features: []
//       };
//     }
    
//     if (newUnit) {
//       setFormData(prev => ({
//         ...prev,
//         units: [...prev.units, newUnit]
//       }));
//     }
//   };

//   const removeUnit = (id) => {
//     if (formData.units.length <= 1) {
//       toast.error('At least one unit is required');
//       return;
//     }
    
//     setFormData(prev => ({
//       ...prev,
//       units: prev.units.filter(unit => unit.id !== id)
//     }));
//   };

//   const updateUnit = (id, field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       units: prev.units.map(unit => 
//         unit.id === id ? { ...unit, [field]: value } : unit
//       )
//     }));
//   };

//   const toggleUnitFeature = (unitId, feature) => {
//     setFormData(prev => ({
//       ...prev,
//       units: prev.units.map(unit => {
//         if (unit.id === unitId) {
//           const currentFeatures = unit.features || [];
//           const newFeatures = currentFeatures.includes(feature)
//             ? currentFeatures.filter(f => f !== feature)
//             : [...currentFeatures, feature];
//           return { ...unit, features: newFeatures };
//         }
//         return unit;
//       })
//     }));
//   };

//   // Calculate total monthly income from all units
//   const calculateTotalMonthlyIncome = () => {
//     return formData.units.reduce((total, unit) => {
//       return total + (parseFloat(unit.monthlyRent) || 0);
//     }, 0);
//   };

//   // Calculate total property value based on unit rents
//   const calculatePropertyValue = () => {
//     const monthlyIncome = calculateTotalMonthlyIncome();
//     // Assuming 5% capitalization rate for valuation
//     return monthlyIncome * 12 / 0.05;
//   };

//   // Submit form
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Check user limits
//       if (user?.subscription?.plan === 'free') {
//         const res = await fetch('/api/properties/count');
//         if (res.ok) {
//           const { count } = await res.json();
//           if (count >= user?.limits?.properties) {
//             throw new Error(`Free plan limited to ${user.limits.properties} properties. Please upgrade.`);
//           }
//         }
//       }

//       // Prepare data structure based on property type
//       let propertyData = {
//         name: formData.name,
//         type: formData.type,
//         status: formData.status,
//         propertyStructure: formData.propertyStructure,
        
//         address: {
//           street: formData.street,
//           city: formData.city,
//           state: formData.state,
//           zipCode: formData.zipCode,
//           country: formData.country
//         },
        
//         details: {
//           totalBedrooms: parseInt(formData.totalBedrooms) || 0,
//           totalBathrooms: parseInt(formData.totalBathrooms) || 0,
//           totalSquareFeet: parseFloat(formData.totalSquareFeet) || 0,
//           yearBuilt: parseInt(formData.yearBuilt) || new Date().getFullYear(),
//           parkingSpaces: parseInt(formData.parkingSpaces) || 0,
//           amenities: formData.amenities
//         },
        
//         financial: {
//           purchasePrice: parseFloat(formData.purchasePrice) || 0,
//           currentValue: parseFloat(formData.currentValue) || calculatePropertyValue(),
//           propertyTax: parseFloat(formData.propertyTax) || 0,
//           insurance: parseFloat(formData.insurance) || 0,
//           hoaFees: parseFloat(formData.hoaFees) || 0,
//           mortgage: formData.hasMortgage ? {
//             lender: formData.lender,
//             loanAmount: parseFloat(formData.loanAmount) || 0,
//             interestRate: parseFloat(formData.interestRate) || 0,
//             monthlyPayment: parseFloat(formData.monthlyPayment) || 0,
//             termYears: parseInt(formData.termYears) || 30
//           } : null
//         },
        
//         images: formData.images
//       };

//       // Add rental units data if not single unit
//       if (formData.propertyStructure !== 'single_unit') {
//         propertyData.details.units = formData.units.map(unit => ({
//           unitNumber: unit.unitNumber,
//           type: unit.type,
//           bedrooms: parseInt(unit.bedrooms) || 0,
//           bathrooms: parseInt(unit.bathrooms) || 0,
//           squareFeet: parseFloat(unit.squareFeet) || 0,
//           hasKitchen: unit.hasKitchen,
//           hasPrivateBathroom: unit.hasPrivateBathroom,
//           monthlyRent: parseFloat(unit.monthlyRent) || 0,
//           deposit: parseFloat(unit.deposit) || 0,
//           status: unit.status,
//           features: unit.features
//         }));

//         // For multi-unit properties, add total rental income
//         propertyData.financial.totalMonthlyIncome = calculateTotalMonthlyIncome();
//       } else {
//         // For single unit, add market rent
//         propertyData.financial.marketRent = parseFloat(formData.marketRent) || 0;
//       }

//       // Submit to API
//       const res = await fetch('/api/properties', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(propertyData)
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Failed to add property');
//       }

//       toast.success('Property added successfully!');
//       onSuccess();
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Common amenities
//   const amenitiesList = [
//     'parking', 'gym', 'pool', 'laundry', 'elevator', 
//     'security', 'balcony', 'garden', 'garage', 'ac'
//   ];

//   // Room/Unit features
//   const roomFeatures = [
//     'furnished', 'closet', 'desk', 'chair', 'wardrobe', 
//     'air_conditioning', 'heating', 'window', 'balcony', 'private_entrance'
//   ];

//   const apartmentFeatures = [
//     'furnished', 'dishwasher', 'microwave', 'oven', 'refrigerator',
//     'washing_machine', 'dryer', 'air_conditioning', 'heating', 'balcony'
//   ];

//   // Property types
//   const propertyTypes = [
//     { value: 'apartment', label: 'Apartment' },
//     { value: 'house', label: 'House' },
//     { value: 'condo', label: 'Condo' },
//     { value: 'townhouse', label: 'Townhouse' },
//     { value: 'villa', label: 'Villa' },
//     { value: 'commercial', label: 'Commercial' }
//   ];

//   // Status options
//   const statusOptions = [
//     { value: 'active', label: 'Active', color: 'green' },
//     { value: 'vacant', label: 'Vacant', color: 'yellow' },
//     { value: 'under_maintenance', label: 'Maintenance', color: 'orange' }
//   ];

//   // Render current step
//   const renderStep = () => {
//     switch (step) {
//       case 1: // Basic Info with Property Structure
//         return (
//           <div className="space-y-4">
//             <div className="text-center mb-3">
//               <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <Home className="w-5 h-5 text-blue-600" />
//               </div>
//               <h3 className="text-base font-semibold text-gray-900">Property Structure</h3>
//               <p className="text-sm text-gray-500">Select how your property is organized</p>
//             </div>

//             <div className="space-y-3">
//               {/* Property Structure Selection */}
//               <div className="grid grid-cols-1 gap-3">
//                 {PROPERTY_STRUCTURES.map(structure => {
//                   const Icon = structure.icon;
//                   return (
//                     <button
//                       key={structure.id}
//                       type="button"
//                       onClick={() => setFormData(prev => ({ 
//                         ...prev, 
//                         propertyStructure: structure.id 
//                       }))}
//                       className={`p-4 border rounded-xl text-left transition-all ${
//                         formData.propertyStructure === structure.id
//                           ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
//                           : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                       }`}
//                     >
//                       <div className="flex items-start">
//                         <div className={`p-2 rounded-lg mr-3 ${
//                           formData.propertyStructure === structure.id
//                             ? 'bg-blue-100 text-blue-600'
//                             : 'bg-gray-100 text-gray-500'
//                         }`}>
//                           <Icon className="w-5 h-5" />
//                         </div>
//                         <div className="flex-1">
//                           <h4 className="font-medium text-gray-900">{structure.name}</h4>
//                           <p className="text-xs text-gray-500 mt-1">{structure.description}</p>
//                         </div>
//                         {formData.propertyStructure === structure.id && (
//                           <CheckCircle className="w-5 h-5 text-blue-600 ml-2" />
//                         )}
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>

//               {/* Property Name */}
//               <div className="space-y-1 pt-2">
//                 <label className="text-sm font-medium text-gray-700">Property Name *</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   placeholder={
//                     formData.propertyStructure === 'single_unit' ? "123 Main Street" :
//                     formData.propertyStructure === 'multi_room_house' ? "Maple House" :
//                     "Sunshine Apartments"
//                   }
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Property Type</label>
//                   <select
//                     name="type"
//                     value={formData.type}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     {propertyTypes.map(type => (
//                       <option key={type.value} value={type.value}>{type.label}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Status *</label>
//                   <select
//                     name="status"
//                     value={formData.status}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     {statusOptions.map(status => (
//                       <option key={status.value} value={status.value}>{status.label}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 2: // Address
//         return (
//           <div className="space-y-4">
//             <div className="text-center mb-3">
//               <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <MapPin className="w-5 h-5 text-green-600" />
//               </div>
//               <h3 className="text-base font-semibold text-gray-900">Property Address</h3>
//             </div>

//             <div className="space-y-3">
//               <div className="space-y-1">
//                 <label className="text-sm font-medium text-gray-700">Street Address *</label>
//                 <input
//                   type="text"
//                   name="street"
//                   value={formData.street}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
//                   placeholder="123 Main Street"
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">City *</label>
//                   <input
//                     type="text"
//                     name="city"
//                     value={formData.city}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
//                     placeholder="New York"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">State *</label>
//                   <input
//                     type="text"
//                     name="state"
//                     value={formData.state}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
//                     placeholder="NY"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">ZIP Code *</label>
//                   <input
//                     type="text"
//                     name="zipCode"
//                     value={formData.zipCode}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
//                     placeholder="10001"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Country</label>
//                   <input
//                     type="text"
//                     name="country"
//                     value={formData.country}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
//                     placeholder="US"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 3: // Overall Property Details
//         return (
//           <div className="space-y-4">
//             <div className="text-center mb-3">
//               <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <Layers className="w-5 h-5 text-purple-600" />
//               </div>
//               <h3 className="text-base font-semibold text-gray-900">Property Details</h3>
//               <p className="text-sm text-gray-500">
//                 {formData.propertyStructure === 'single_unit' ? 'Overall property details' :
//                  formData.propertyStructure === 'multi_room_house' ? 'House details (rooms will be added next)' :
//                  'Building details (units will be added next)'}
//               </p>
//             </div>

//             <div className="space-y-3">
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">
//                     {formData.propertyStructure === 'multi_room_house' ? 'Total Bedrooms (all rooms)' :
//                      formData.propertyStructure === 'multi_unit_building' ? 'Total Bedrooms (all units)' :
//                      'Bedrooms'}
//                   </label>
//                   <div className="relative">
//                     <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <input
//                       type="number"
//                       name="totalBedrooms"
//                       value={formData.totalBedrooms}
//                       onChange={(e) => handleNumberChange('totalBedrooms', e.target.value)}
//                       className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//                       min="0"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">
//                     {formData.propertyStructure === 'multi_room_house' ? 'Total Bathrooms' :
//                      formData.propertyStructure === 'multi_unit_building' ? 'Total Bathrooms (all units)' :
//                      'Bathrooms'}
//                   </label>
//                   <div className="relative">
//                     <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <input
//                       type="number"
//                       name="totalBathrooms"
//                       value={formData.totalBathrooms}
//                       onChange={(e) => handleNumberChange('totalBathrooms', e.target.value)}
//                       className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//                       min="0"
//                       step="0.5"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Total Square Feet</label>
//                   <div className="relative">
//                     <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <input
//                       type="number"
//                       name="totalSquareFeet"
//                       value={formData.totalSquareFeet}
//                       onChange={(e) => handleNumberChange('totalSquareFeet', e.target.value)}
//                       className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//                       placeholder="2000"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Year Built</label>
//                   <input
//                     type="number"
//                     name="yearBuilt"
//                     value={formData.yearBuilt}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//                     min="1800"
//                     max={new Date().getFullYear()}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-sm font-medium text-gray-700">Parking Spaces</label>
//                 <div className="relative">
//                   <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     type="number"
//                     name="parkingSpaces"
//                     value={formData.parkingSpaces}
//                     onChange={(e) => handleNumberChange('parkingSpaces', e.target.value)}
//                     className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//                     min="0"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-sm font-medium text-gray-700">Amenities</label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {amenitiesList.map(amenity => (
//                     <button
//                       key={amenity}
//                       type="button"
//                       onClick={() => handleAmenityToggle(amenity)}
//                       className={`px-2 py-1.5 text-xs rounded-lg border ${
//                         formData.amenities.includes(amenity)
//                           ? 'border-purple-500 bg-purple-50 text-purple-700'
//                           : 'border-gray-200 text-gray-600 hover:bg-gray-50'
//                       }`}
//                     >
//                       {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 4: // Units/Rooms Configuration (for multi-unit properties)
//         if (formData.propertyStructure === 'single_unit') {
//           // Skip to financial step for single unit
//           return renderStepFinancial();
//         }

//         const isRooms = formData.propertyStructure === 'multi_room_house';
//         const title = isRooms ? 'Room Configuration' : 'Unit Configuration';
//         const description = isRooms 
//           ? 'Configure individual rooms in the house' 
//           : 'Configure separate apartments/flats in the building';

//         return (
//           <div className="space-y-4">
//             <div className="text-center mb-3">
//               <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <DoorOpen className="w-5 h-5 text-indigo-600" />
//               </div>
//               <h3 className="text-base font-semibold text-gray-900">{title}</h3>
//               <p className="text-sm text-gray-500">{description}</p>
//             </div>

//             <div className="space-y-3">
//               <div className="flex justify-between items-center">
//                 <h4 className="text-sm font-medium text-gray-700">
//                   {isRooms ? 'Rooms' : 'Units'} ({formData.units.length})
//                 </h4>
//                 <button
//                   type="button"
//                   onClick={addUnit}
//                   className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 flex items-center"
//                 >
//                   <Plus className="w-3 h-3 mr-1" />
//                   Add {isRooms ? 'Room' : 'Unit'}
//                 </button>
//               </div>

//               <div className="space-y-3">
//                 {formData.units.map((unit, index) => (
//                   <div key={unit.id} className="border border-gray-200 rounded-lg p-3">
//                     <div className="flex justify-between items-start mb-3">
//                       <div className="flex items-center">
//                         <Hash className="w-4 h-4 text-gray-400 mr-2" />
//                         <h4 className="text-sm font-medium text-gray-900">{unit.unitNumber}</h4>
//                         <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
//                           unit.status === 'available' 
//                             ? 'bg-green-100 text-green-800' 
//                             : 'bg-gray-100 text-gray-800'
//                         }`}>
//                           {unit.status}
//                         </span>
//                       </div>
//                       {formData.units.length > 1 && (
//                         <button
//                           type="button"
//                           onClick={() => removeUnit(unit.id)}
//                           className="p-1 hover:bg-red-50 text-red-500 rounded"
//                         >
//                           <Trash2 className="w-3 h-3" />
//                         </button>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-2 gap-3">
//                       <div className="space-y-1">
//                         <label className="text-xs font-medium text-gray-600">
//                           {isRooms ? 'Room Number' : 'Unit Number'}
//                         </label>
//                         <input
//                           type="text"
//                           value={unit.unitNumber}
//                           onChange={(e) => updateUnit(unit.id, 'unitNumber', e.target.value)}
//                           className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
//                           placeholder={isRooms ? "Room 1" : "Unit 1A"}
//                         />
//                       </div>

//                       <div className="space-y-1">
//                         <label className="text-xs font-medium text-gray-600">Type</label>
//                         <select
//                           value={unit.type}
//                           onChange={(e) => updateUnit(unit.id, 'type', e.target.value)}
//                           className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
//                         >
//                           {isRooms ? (
//                             <>
//                               <option value="room">Standard Room</option>
//                               <option value="master_room">Master Room</option>
//                               <option value="shared_room">Shared Room</option>
//                             </>
//                           ) : (
//                             <>
//                               <option value="studio">Studio</option>
//                               <option value="apartment">Apartment</option>
//                               <option value="flat">Flat</option>
//                               <option value="penthouse">Penthouse</option>
//                             </>
//                           )}
//                         </select>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-3 gap-2 mt-2">
//                       <div className="space-y-1">
//                         <label className="text-xs font-medium text-gray-600">Bedrooms</label>
//                         <input
//                           type="number"
//                           value={unit.bedrooms}
//                           onChange={(e) => updateUnit(unit.id, 'bedrooms', e.target.value)}
//                           className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
//                           min="0"
//                         />
//                       </div>

//                       <div className="space-y-1">
//                         <label className="text-xs font-medium text-gray-600">Bathrooms</label>
//                         <input
//                           type="number"
//                           value={unit.bathrooms}
//                           onChange={(e) => updateUnit(unit.id, 'bathrooms', e.target.value)}
//                           className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
//                           min="0"
//                           step="0.5"
//                         />
//                       </div>

//                       <div className="space-y-1">
//                         <label className="text-xs font-medium text-gray-600">Size (sq ft)</label>
//                         <input
//                           type="number"
//                           value={unit.squareFeet}
//                           onChange={(e) => updateUnit(unit.id, 'squareFeet', e.target.value)}
//                           className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
//                           placeholder={isRooms ? "150" : "750"}
//                         />
//                       </div>
//                     </div>

//                     <div className="mt-2 grid grid-cols-2 gap-2">
//                       <label className="flex items-center space-x-2">
//                         <input
//                           type="checkbox"
//                           checked={unit.hasKitchen}
//                           onChange={(e) => updateUnit(unit.id, 'hasKitchen', e.target.checked)}
//                           className="rounded border-gray-300"
//                           disabled={isRooms} // Rooms usually don't have kitchens
//                         />
//                         <span className="text-xs text-gray-600">Private Kitchen</span>
//                       </label>

//                       <label className="flex items-center space-x-2">
//                         <input
//                           type="checkbox"
//                           checked={unit.hasPrivateBathroom}
//                           onChange={(e) => updateUnit(unit.id, 'hasPrivateBathroom', e.target.checked)}
//                           className="rounded border-gray-300"
//                         />
//                         <span className="text-xs text-gray-600">Private Bathroom</span>
//                       </label>
//                     </div>

//                     <div className="grid grid-cols-2 gap-2 mt-2">
//                       <div className="space-y-1">
//                         <label className="text-xs font-medium text-gray-600">Monthly Rent</label>
//                         <div className="relative">
//                           <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
//                           <input
//                             type="number"
//                             value={unit.monthlyRent}
//                             onChange={(e) => updateUnit(unit.id, 'monthlyRent', e.target.value)}
//                             className="w-full pl-6 px-2 py-1.5 text-sm border border-gray-200 rounded"
//                             placeholder={isRooms ? "500" : "1200"}
//                           />
//                         </div>
//                       </div>

//                       <div className="space-y-1">
//                         <label className="text-xs font-medium text-gray-600">Deposit</label>
//                         <div className="relative">
//                           <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
//                           <input
//                             type="number"
//                             value={unit.deposit}
//                             onChange={(e) => updateUnit(unit.id, 'deposit', e.target.value)}
//                             className="w-full pl-6 px-2 py-1.5 text-sm border border-gray-200 rounded"
//                             placeholder={isRooms ? "500" : "1200"}
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mt-3">
//                       <label className="text-xs font-medium text-gray-600 mb-1 block">Features</label>
//                       <div className="flex flex-wrap gap-1">
//                         {(isRooms ? roomFeatures : apartmentFeatures).map(feature => (
//                           <button
//                             key={feature}
//                             type="button"
//                             onClick={() => toggleUnitFeature(unit.id, feature)}
//                             className={`px-2 py-1 text-xs rounded border ${
//                               unit.features.includes(feature)
//                                 ? 'border-blue-500 bg-blue-50 text-blue-700'
//                                 : 'border-gray-200 text-gray-600 hover:bg-gray-50'
//                             }`}
//                           >
//                             {feature.replace('_', ' ')}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-4">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <div className="text-sm font-medium text-indigo-900">Total Monthly Income</div>
//                     <div className="text-xs text-indigo-700">From all {isRooms ? 'rooms' : 'units'}</div>
//                   </div>
//                   <div className="text-lg font-bold text-indigo-900">
//                     ${calculateTotalMonthlyIncome().toLocaleString()}
//                   </div>
//                 </div>
//                 <div className="text-xs text-indigo-700 mt-1">
//                   {isRooms ? 
//                     `${formData.units.length} rooms × average $${formData.units.length > 0 ? Math.round(calculateTotalMonthlyIncome() / formData.units.length) : 0}/room` :
//                     `${formData.units.length} units × average $${formData.units.length > 0 ? Math.round(calculateTotalMonthlyIncome() / formData.units.length) : 0}/unit`
//                   }
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 5: // Financial (for single unit) or Review (for multi-unit)
//         if (formData.propertyStructure === 'single_unit') {
//           // For single unit, step 5 is financial
//           return renderStepFinancial();
//         } else {
//           // For multi-unit, step 5 is financial, step 6 will be review
//           return renderStepFinancial();
//         }

//       case 6: // Review (only for multi-unit properties)
//         return renderStepReview();

//       default:
//         return null;
//     }
//   };

//   // Separate financial step renderer
//   const renderStepFinancial = () => {
//     const isSingleUnit = formData.propertyStructure === 'single_unit';
//     const totalIncome = isSingleUnit ? 0 : calculateTotalMonthlyIncome();

//     return (
//       <div className="space-y-4">
//         <div className="text-center mb-3">
//           <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
//             <DollarSign className="w-5 h-5 text-yellow-600" />
//           </div>
//           <h3 className="text-base font-semibold text-gray-900">Financial Details</h3>
//           <p className="text-sm text-gray-500">
//             {isSingleUnit ? 'Property financial information' : 'Property investment details'}
//           </p>
//         </div>

//         <div className="space-y-3">
//           {/* For single unit: Market Rent */}
//           {isSingleUnit ? (
//             <div className="space-y-1">
//               <label className="text-sm font-medium text-gray-700">Market Rent *</label>
//               <div className="relative">
//                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                 <input
//                   type="number"
//                   name="marketRent"
//                   value={formData.marketRent || ''}
//                   onChange={(e) => handleNumberChange('marketRent', e.target.value)}
//                   className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
//                   placeholder="1500"
//                   required
//                 />
//               </div>
//             </div>
//           ) : (
//             /* For multi-unit: Show total income summary */
//             <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <div className="text-sm font-medium text-blue-900">
//                     Total {formData.propertyStructure === 'multi_room_house' ? 'Room' : 'Unit'} Rental Income
//                   </div>
//                   <div className="text-xs text-blue-700">
//                     {formData.units.length} {formData.propertyStructure === 'multi_room_house' ? 'rooms' : 'units'} × 
//                     ${totalIncome.toLocaleString()}/month
//                   </div>
//                 </div>
//                 <div className="text-lg font-bold text-blue-900">
//                   ${totalIncome.toLocaleString()}
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1">
//               <label className="text-sm font-medium text-gray-700">Purchase Price</label>
//               <div className="relative">
//                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                 <input
//                   type="number"
//                   name="purchasePrice"
//                   value={formData.purchasePrice}
//                   onChange={(e) => handleNumberChange('purchasePrice', e.target.value)}
//                   className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
//                   placeholder="250000"
//                   step="1000"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1">
//               <label className="text-sm font-medium text-gray-700">Current Value</label>
//               <div className="relative">
//                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                 <input
//                   type="number"
//                   name="currentValue"
//                   value={formData.currentValue || calculatePropertyValue()}
//                   onChange={(e) => handleNumberChange('currentValue', e.target.value)}
//                   className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
//                   placeholder="300000"
//                   step="1000"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1">
//               <label className="text-sm font-medium text-gray-700">Property Tax (Annual)</label>
//               <div className="relative">
//                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                 <input
//                   type="number"
//                   name="propertyTax"
//                   value={formData.propertyTax}
//                   onChange={(e) => handleNumberChange('propertyTax', e.target.value)}
//                   className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
//                   placeholder="2500"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1">
//               <label className="text-sm font-medium text-gray-700">Insurance (Annual)</label>
//               <div className="relative">
//                 <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <input
//                   type="number"
//                   name="insurance"
//                   value={formData.insurance}
//                   onChange={(e) => handleNumberChange('insurance', e.target.value)}
//                   className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
//                   placeholder="800"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1">
//               <label className="text-sm font-medium text-gray-700">HOA Fees (Monthly)</label>
//               <div className="relative">
//                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                 <input
//                   type="number"
//                   name="hoaFees"
//                   value={formData.hoaFees}
//                   onChange={(e) => handleNumberChange('hoaFees', e.target.value)}
//                   className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
//                   placeholder="0"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1">
//               <label className="text-sm font-medium text-gray-700">Maintenance Budget (Monthly)</label>
//               <div className="relative">
//                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                 <input
//                   type="number"
//                   name="maintenanceBudget"
//                   value={formData.maintenanceBudget || ''}
//                   onChange={(e) => handleNumberChange('maintenanceBudget', e.target.value)}
//                   className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
//                   placeholder="200"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="space-y-2 pt-2 border-t border-gray-100">
//             <div className="flex items-center justify-between">
//               <label className="text-sm font-medium text-gray-700">Has Mortgage</label>
//               <button
//                 type="button"
//                 onClick={() => setFormData(prev => ({ ...prev, hasMortgage: !prev.hasMortgage }))}
//                 className={`relative inline-flex h-6 w-11 items-center rounded-full ${
//                   formData.hasMortgage ? 'bg-blue-600' : 'bg-gray-200'
//                 }`}
//               >
//                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
//                   formData.hasMortgage ? 'translate-x-6' : 'translate-x-1'
//                 }`} />
//               </button>
//             </div>

//             {formData.hasMortgage && (
//               <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Lender</label>
//                   <input
//                     type="text"
//                     name="lender"
//                     value={formData.lender}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-200 rounded-lg"
//                     placeholder="Bank of America"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-1">
//                     <label className="text-sm font-medium text-gray-700">Loan Amount</label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                       <input
//                         type="number"
//                         name="loanAmount"
//                         value={formData.loanAmount}
//                         onChange={(e) => handleNumberChange('loanAmount', e.target.value)}
//                         className="w-full pl-9 px-3 py-2 border border-gray-200 rounded-lg"
//                         placeholder="200000"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-1">
//                     <label className="text-sm font-medium text-gray-700">Interest Rate</label>
//                     <div className="relative">
//                       <input
//                         type="number"
//                         name="interestRate"
//                         value={formData.interestRate}
//                         onChange={(e) => handleNumberChange('interestRate', e.target.value)}
//                         className="w-full px-3 py-2 border border-gray-200 rounded-lg"
//                         placeholder="3.5"
//                         step="0.1"
//                       />
//                       <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* ROI Calculation for Multi-Unit Properties */}
//           {!isSingleUnit && totalIncome > 0 && (
//             <div className="bg-green-50 border border-green-100 rounded-lg p-3">
//               <h4 className="text-sm font-medium text-green-900 mb-2">Investment Analysis</h4>
//               <div className="grid grid-cols-2 gap-3 text-xs">
//                 <div>
//                   <div className="text-green-700">Gross Monthly Income</div>
//                   <div className="font-medium text-gray-900">${totalIncome.toLocaleString()}</div>
//                 </div>
//                 <div>
//                   <div className="text-green-700">Annual Income</div>
//                   <div className="font-medium text-gray-900">${(totalIncome * 12).toLocaleString()}</div>
//                 </div>
//                 <div>
//                   <div className="text-green-700">Cap Rate</div>
//                   <div className="font-medium text-gray-900">
//                     {formData.currentValue ? `${((totalIncome * 12 / parseFloat(formData.currentValue)) * 100).toFixed(1)}%` : "—"}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="text-green-700">Avg. {formData.propertyStructure === 'multi_room_house' ? 'Room' : 'Unit'} Rent</div>
//                   <div className="font-medium text-gray-900">
//                     ${formData.units.length > 0 ? Math.round(totalIncome / formData.units.length) : 0}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Separate review step renderer
//   const renderStepReview = () => {
//     const isSingleUnit = formData.propertyStructure === 'single_unit';
//     const isMultiRoom = formData.propertyStructure === 'multi_room_house';
//     const isMultiUnit = formData.propertyStructure === 'multi_unit_building';
    
//     const totalIncome = isSingleUnit ? (parseFloat(formData.marketRent) || 0) : calculateTotalMonthlyIncome();

//     return (
//       <div className="space-y-4">
//         <div className="text-center mb-3">
//           <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
//             <CheckCircle className="w-5 h-5 text-emerald-600" />
//           </div>
//           <h3 className="text-base font-semibold text-gray-900">Review & Create</h3>
//           <p className="text-sm text-gray-500">Confirm all details are correct</p>
//         </div>

//         <div className="space-y-3">
//           {/* Property Structure Summary */}
//           <div className="border border-gray-200 rounded-lg p-3">
//             <div className="flex items-center mb-2">
//               <Home className="w-4 h-4 text-blue-500 mr-2" />
//               <h4 className="text-sm font-medium text-gray-900">Property Structure</h4>
//             </div>
//             <div className="text-xs space-y-1">
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Type:</span>
//                 <span className="font-medium capitalize">
//                   {isSingleUnit && 'Single Unit Property'}
//                   {isMultiRoom && 'House with Individual Rooms'}
//                   {isMultiUnit && 'Building with Multiple Units'}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Property Name:</span>
//                 <span className="font-medium">{formData.name || "—"}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Property Type:</span>
//                 <span className="font-medium capitalize">{formData.type}</span>
//               </div>
//             </div>
//           </div>

//           {/* Address Summary */}
//           <div className="border border-gray-200 rounded-lg p-3">
//             <div className="flex items-center mb-2">
//               <MapPin className="w-4 h-4 text-green-500 mr-2" />
//               <h4 className="text-sm font-medium text-gray-900">Address</h4>
//             </div>
//             <div className="text-xs space-y-1">
//               <div>
//                 <div className="text-gray-500 mb-1">Address:</div>
//                 <div className="font-medium">
//                   {formData.street}<br />
//                   {formData.city}, {formData.state} {formData.zipCode}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Property Details Summary */}
//           <div className="border border-gray-200 rounded-lg p-3">
//             <div className="flex items-center mb-2">
//               <Layers className="w-4 h-4 text-purple-500 mr-2" />
//               <h4 className="text-sm font-medium text-gray-900">Property Details</h4>
//             </div>
//             <div className="text-xs space-y-1">
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <div className="text-gray-500">Total Bedrooms</div>
//                   <div className="font-medium">{formData.totalBedrooms}</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-500">Total Bathrooms</div>
//                   <div className="font-medium">{formData.totalBathrooms}</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-500">Square Feet</div>
//                   <div className="font-medium">{formData.totalSquareFeet || "—"}</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-500">Parking Spaces</div>
//                   <div className="font-medium">{formData.parkingSpaces}</div>
//                 </div>
//               </div>
//               {formData.amenities.length > 0 && (
//                 <div className="mt-2">
//                   <div className="text-gray-500">Amenities</div>
//                   <div className="font-medium text-xs">
//                     {formData.amenities.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Units/Rooms Summary (for multi-unit properties) */}
//           {!isSingleUnit && (
//             <div className="border border-gray-200 rounded-lg p-3">
//               <div className="flex items-center mb-2">
//                 <DoorOpen className="w-4 h-4 text-indigo-500 mr-2" />
//                 <h4 className="text-sm font-medium text-gray-900">
//                   {isMultiRoom ? 'Room Configuration' : 'Unit Configuration'}
//                 </h4>
//               </div>
//               <div className="text-xs space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Total {isMultiRoom ? 'Rooms' : 'Units'}:</span>
//                   <span className="font-medium">{formData.units.length}</span>
//                 </div>
//                 {formData.units.slice(0, 3).map(unit => (
//                   <div key={unit.id} className="flex justify-between items-center">
//                     <div>
//                       <span className="font-medium">{unit.unitNumber}</span>
//                       <span className="text-gray-500 ml-2">
//                         ({unit.bedrooms} bed, {unit.bathrooms} bath)
//                       </span>
//                     </div>
//                     <div className="font-medium">${unit.monthlyRent || "0"}/month</div>
//                   </div>
//                 ))}
//                 {formData.units.length > 3 && (
//                   <div className="text-gray-500 text-center">
//                     + {formData.units.length - 3} more {isMultiRoom ? 'rooms' : 'units'}
//                   </div>
//                 )}
//                 <div className="pt-2 border-t border-gray-100">
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Total Monthly Income:</span>
//                     <span className="font-bold text-green-600">
//                       ${totalIncome.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Financial Summary */}
//           <div className="border border-gray-200 rounded-lg p-3">
//             <div className="flex items-center mb-2">
//               <DollarSign className="w-4 h-4 text-yellow-500 mr-2" />
//               <h4 className="text-sm font-medium text-gray-900">Financial Summary</h4>
//             </div>
//             <div className="text-xs space-y-1">
//               <div className="flex justify-between">
//                 <span className="text-gray-500">Monthly Income:</span>
//                 <span className="font-medium text-green-600">
//                   ${totalIncome.toLocaleString()}
//                 </span>
//               </div>
//               {formData.currentValue && (
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Property Value:</span>
//                   <span className="font-medium">
//                     ${parseFloat(formData.currentValue).toLocaleString()}
//                   </span>
//                 </div>
//               )}
//               {formData.hasMortgage && formData.loanAmount && (
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Mortgage:</span>
//                   <span className="font-medium">
//                     ${parseFloat(formData.loanAmount).toLocaleString()}
//                   </span>
//                 </div>
//               )}
//               {!isSingleUnit && formData.currentValue && (
//                 <div className="pt-1 border-t border-gray-100">
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Annual ROI:</span>
//                     <span className="font-medium text-green-600">
//                       {((totalIncome * 12 / parseFloat(formData.currentValue)) * 100).toFixed(1)}%
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Check if current step is valid
//   const isStepValid = () => {
//     switch (step) {
//       case 1:
//         return formData.name && formData.propertyStructure;
//       case 2:
//         return formData.street && formData.city && formData.state && formData.zipCode;
//       case 3:
//         return true; // All fields optional
//       case 4:
//         if (formData.propertyStructure !== 'single_unit') {
//           return formData.units.length > 0 && 
//                  formData.units.every(unit => unit.unitNumber && unit.monthlyRent);
//         }
//         return true;
//       case 5:
//         if (formData.propertyStructure === 'single_unit') {
//           return formData.marketRent; // Single unit needs market rent
//         } else {
//           return true; // Multi-unit financial is optional
//         }
//       case 6:
//         return true; // Review step always valid
//       default:
//         return false;
//     }
//   };

//   // Get the current step number based on property structure
//   const getCurrentStep = () => {
//     if (formData.propertyStructure === 'single_unit') {
//       // Single unit: 1-2-3-4(financial)-5(review)
//       return step;
//     } else {
//       // Multi-unit: 1-2-3-4(units)-5(financial)-6(review)
//       return step;
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       {/* Backdrop */}
//       <div 
//         className="fixed inset-0 bg-black/10 backdrop-blur-[1px]"
//         onClick={onClose}
//       />
      
//       {/* Modal */}
//       <div 
//         className="relative w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl 
//                    border border-gray-200/50 shadow-lg overflow-hidden mx-4"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="px-4 py-3 border-b border-gray-200/50 bg-white/90">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="flex items-center space-x-1">
//                 {steps.map(s => (
//                   <div
//                     key={s.number}
//                     className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
//                       ${getCurrentStep() === s.number 
//                         ? `bg-${s.color}-600 text-white` 
//                         : getCurrentStep() > s.number 
//                         ? 'bg-green-100 text-green-700'
//                         : 'bg-gray-100 text-gray-400'
//                       }`}
//                   >
//                     {getCurrentStep() > s.number ? '✓' : s.number}
//                   </div>
//                 ))}
//               </div>
//               <div>
//                 <h2 className="text-sm font-semibold text-gray-900">Add Property</h2>
//                 <p className="text-xs text-gray-500">{steps[getCurrentStep()-1]?.title}</p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-1 hover:bg-gray-100/50 rounded"
//               aria-label="Close"
//               disabled={loading}
//             >
//               <X className="w-4 h-4 text-gray-500" />
//             </button>
//           </div>
//         </div>
        
//         {/* Content */}
//         <div className="p-4 max-h-[calc(100vh-180px)] overflow-y-auto">
//           <form onSubmit={handleSubmit}>
//             {renderStep()}
//           </form>
//         </div>
        
//         {/* Footer */}
//         <div className="px-4 py-3 border-t border-gray-200/50 bg-white/90">
//           <div className="flex justify-between items-center">
//             <div>
//               {step > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => setStep(step - 1)}
//                   className="px-3 py-1.5 text-gray-700 hover:bg-gray-100/50 rounded-lg text-sm flex items-center"
//                   disabled={loading}
//                 >
//                   <ChevronLeft className="w-3 h-3 mr-1" />
//                   Back
//                 </button>
//               )}
//             </div>
            
//             <div className="flex gap-2">
//               {step < steps.length ? (
//                 <>
//                   <button
//                     type="button"
//                     onClick={onClose}
//                     className="px-3 py-1.5 text-gray-700 hover:bg-gray-100/50 rounded-lg text-sm"
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setStep(step + 1)}
//                     disabled={!isStepValid() || loading}
//                     className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 
//                              disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//                   >
//                     Continue
//                     <ChevronRight className="w-3 h-3 ml-1" />
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   type="button"
//                   onClick={handleSubmit}
//                   disabled={loading || !isStepValid()}
//                   className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 
//                            disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//                 >
//                   {loading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
//                       Creating...
//                     </>
//                   ) : (
//                     <>
//                       <Home className="w-3 h-3 mr-1.5" />
//                       Create Property
//                     </>
//                   )}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// // app/components/AddPropertyModal.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { 
//   X, Home, MapPin, DollarSign, Bath, Bed, Square, 
//   Car, Layers, Calendar, Shield, CheckCircle, ChevronLeft, 
//   ChevronRight, Building, Ruler, Info, Image, 
//   Plus, Trash2, Users, DoorOpen, Hash, Key
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// export default function AddPropertyModal({ onClose, onSuccess, user }) {
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState(1);
  
//   const [formData, setFormData] = useState({
//     // Step 1: Basic Info
//     name: '',
//     type: 'apartment',
//     status: 'active',
//     rentalType: 'entire', // 'entire' or 'rooms'
    
//     // Step 2: Address
//     street: '',
//     city: '',
//     state: '',
//     zipCode: '',
//     country: 'US',
    
//     // Step 3: Details
//     bedrooms: 1,
//     bathrooms: 1,
//     squareFeet: '',
//     yearBuilt: new Date().getFullYear(),
//     parkingSpaces: 0,
//     amenities: [],
    
//     // Step 4: Room Configuration (only if rentalType === 'rooms')
//     rooms: [
//       {
//         id: Date.now(),
//         roomNumber: '101',
//         type: 'bedroom',
//         size: '',
//         privateBathroom: false,
//         monthlyRent: '',
//         deposit: '',
//         status: 'available',
//         features: []
//       }
//     ],
    
//     // Step 5: Common Areas & Shared Facilities
//     commonAreas: [
//       'living_room',
//       'kitchen',
//       'laundry'
//     ],
    
//     // Step 6: Financial
//     purchasePrice: '',
//     currentValue: '',
//     marketRent: '', // Only for 'entire' rental type
//     propertyTax: '',
//     insurance: '',
//     hoaFees: '',
//     utilities: {
//       water: false,
//       electricity: false,
//       gas: false,
//       internet: false,
//       includedInRent: []
//     },
    
//     // Mortgage
//     hasMortgage: false,
//     lender: '',
//     loanAmount: '',
//     interestRate: '',
//     monthlyPayment: '',
//     termYears: 30,
    
//     // Step 7: Images
//     images: []
//   });

//   // Steps configuration - now includes room configuration step
//   const steps = [
//     { number: 1, title: 'Basic', icon: Home, color: 'blue' },
//     { number: 2, title: 'Address', icon: MapPin, color: 'green' },
//     { number: 3, title: 'Details', icon: Layers, color: 'purple' },
//     { number: 4, title: 'Rooms', icon: DoorOpen, color: 'indigo' },
//     { number: 5, title: 'Shared', icon: Users, color: 'orange' },
//     { number: 6, title: 'Financial', icon: DollarSign, color: 'yellow' },
//     { number: 7, title: 'Review', icon: CheckCircle, color: 'emerald' }
//   ];

//   // Room types
//   const roomTypes = [
//     { value: 'bedroom', label: 'Bedroom', icon: Bed },
//     { value: 'studio', label: 'Studio', icon: Home },
//     { value: 'master_bedroom', label: 'Master Bedroom', icon: Key },
//     { value: 'shared_room', label: 'Shared Room', icon: Users }
//   ];

//   // Room features
//   const roomFeatures = [
//     'closet', 'desk', 'chair', 'wardrobe', 'air_conditioning',
//     'heating', 'window', 'balcony', 'private_entrance'
//   ];

//   // Common areas options
//   const commonAreaOptions = [
//     { value: 'living_room', label: 'Living Room' },
//     { value: 'kitchen', label: 'Kitchen' },
//     { value: 'dining_room', label: 'Dining Room' },
//     { value: 'laundry', label: 'Laundry Room' },
//     { value: 'bathroom', label: 'Shared Bathroom' },
//     { value: 'garden', label: 'Garden/Yard' },
//     { value: 'parking', label: 'Parking Area' },
//     { value: 'gym', label: 'Gym' },
//     { value: 'pool', label: 'Swimming Pool' }
//   ];

//   // Utility options
//   const utilityOptions = [
//     { value: 'water', label: 'Water' },
//     { value: 'electricity', label: 'Electricity' },
//     { value: 'gas', label: 'Gas' },
//     { value: 'internet', label: 'Internet/WiFi' },
//     { value: 'trash', label: 'Trash Collection' },
//     { value: 'cleaning', label: 'Cleaning Service' }
//   ];

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
    
//     // Special handling for rental type changes
//     if (name === 'rentalType' && value === 'entire') {
//       // When switching to entire property rental, clear rooms
//       setFormData(prev => ({
//         ...prev,
//         [name]: value,
//         rooms: value === 'entire' ? [] : prev.rooms
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: type === 'checkbox' ? checked : value
//       }));
//     }
//   };

//   // Handle utility toggle
//   const handleUtilityToggle = (utility) => {
//     setFormData(prev => {
//       const currentUtilities = prev.utilities?.includedInRent || [];
//       const newUtilities = currentUtilities.includes(utility)
//         ? currentUtilities.filter(u => u !== utility)
//         : [...currentUtilities, utility];
      
//       return {
//         ...prev,
//         utilities: {
//           ...prev.utilities,
//           includedInRent: newUtilities
//         }
//       };
//     });
//   };

//   // Handle number inputs
//   const handleNumberChange = (name, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [name]: value === '' ? '' : parseFloat(value)
//     }));
//   };

//   // Handle amenities selection
//   const handleAmenityToggle = (amenity) => {
//     setFormData(prev => {
//       const currentAmenities = prev.amenities || [];
//       const newAmenities = currentAmenities.includes(amenity)
//         ? currentAmenities.filter(a => a !== amenity)
//         : [...currentAmenities, amenity];
//       return { ...prev, amenities: newAmenities };
//     });
//   };

//   // Handle common area toggle
//   const handleCommonAreaToggle = (area) => {
//     setFormData(prev => {
//       const currentAreas = prev.commonAreas || [];
//       const newAreas = currentAreas.includes(area)
//         ? currentAreas.filter(a => a !== area)
//         : [...currentAreas, area];
//       return { ...prev, commonAreas: newAreas };
//     });
//   };

//   // Room Management Functions
//   const addRoom = () => {
//     const newRoom = {
//       id: Date.now() + Math.random(),
//       roomNumber: `${formData.rooms.length + 101}`,
//       type: 'bedroom',
//       size: '',
//       privateBathroom: false,
//       monthlyRent: '',
//       deposit: '',
//       status: 'available',
//       features: []
//     };
    
//     setFormData(prev => ({
//       ...prev,
//       rooms: [...prev.rooms, newRoom]
//     }));
//   };

//   const removeRoom = (id) => {
//     if (formData.rooms.length <= 1) {
//       toast.error('At least one room is required');
//       return;
//     }
    
//     setFormData(prev => ({
//       ...prev,
//       rooms: prev.rooms.filter(room => room.id !== id)
//     }));
//   };

//   const updateRoom = (id, field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       rooms: prev.rooms.map(room => 
//         room.id === id ? { ...room, [field]: value } : room
//       )
//     }));
//   };

//   const toggleRoomFeature = (roomId, feature) => {
//     setFormData(prev => ({
//       ...prev,
//       rooms: prev.rooms.map(room => {
//         if (room.id === roomId) {
//           const currentFeatures = room.features || [];
//           const newFeatures = currentFeatures.includes(feature)
//             ? currentFeatures.filter(f => f !== feature)
//             : [...currentFeatures, feature];
//           return { ...room, features: newFeatures };
//         }
//         return room;
//       })
//     }));
//   };

//   // Calculate total monthly income from all rooms
//   const calculateTotalMonthlyIncome = () => {
//     return formData.rooms.reduce((total, room) => {
//       return total + (parseFloat(room.monthlyRent) || 0);
//     }, 0);
//   };

//   // Submit form
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Check user limits
//       if (user?.subscription?.plan === 'free') {
//         const res = await fetch('/api/properties/count');
//         if (res.ok) {
//           const { count } = await res.json();
//           if (count >= user?.limits?.properties) {
//             throw new Error(`Free plan limited to ${user.limits.properties} properties. Please upgrade.`);
//           }
//         }
//       }

//       // Prepare data for API
//       const propertyData = {
//         name: formData.name,
//         type: formData.type,
//         status: formData.status,
//         rentalType: formData.rentalType,
        
//         address: {
//           street: formData.street,
//           city: formData.city,
//           state: formData.state,
//           zipCode: formData.zipCode,
//           country: formData.country
//         },
        
//         details: {
//           bedrooms: parseInt(formData.bedrooms) || 0,
//           bathrooms: parseInt(formData.bathrooms) || 0,
//           squareFeet: parseFloat(formData.squareFeet) || 0,
//           yearBuilt: parseInt(formData.yearBuilt) || new Date().getFullYear(),
//           parkingSpaces: parseInt(formData.parkingSpaces) || 0,
//           amenities: formData.amenities,
//           rentalConfiguration: {
//             type: formData.rentalType,
//             rooms: formData.rentalType === 'rooms' ? formData.rooms.map(room => ({
//               roomNumber: room.roomNumber,
//               type: room.type,
//               size: parseFloat(room.size) || 0,
//               privateBathroom: room.privateBathroom,
//               monthlyRent: parseFloat(room.monthlyRent) || 0,
//               deposit: parseFloat(room.deposit) || 0,
//               status: room.status,
//               features: room.features
//             })) : [],
//             commonAreas: formData.commonAreas,
//             utilities: formData.utilities
//           }
//         },
        
//         financial: {
//           purchasePrice: parseFloat(formData.purchasePrice) || 0,
//           currentValue: parseFloat(formData.currentValue) || 0,
//           marketRent: formData.rentalType === 'entire' 
//             ? parseFloat(formData.marketRent) || 0 
//             : calculateTotalMonthlyIncome(),
//           propertyTax: parseFloat(formData.propertyTax) || 0,
//           insurance: parseFloat(formData.insurance) || 0,
//           hoaFees: parseFloat(formData.hoaFees) || 0,
//           mortgage: formData.hasMortgage ? {
//             lender: formData.lender,
//             loanAmount: parseFloat(formData.loanAmount) || 0,
//             interestRate: parseFloat(formData.interestRate) || 0,
//             monthlyPayment: parseFloat(formData.monthlyPayment) || 0,
//             termYears: parseInt(formData.termYears) || 30
//           } : null
//         },
        
//         images: formData.images
//       };

//       // Submit to API
//       const res = await fetch('/api/properties', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(propertyData)
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Failed to add property');
//       }

//       toast.success('Property added successfully!');
//       onSuccess();
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Common amenities
//   const amenitiesList = [
//     'parking', 'gym', 'pool', 'laundry', 'elevator', 
//     'security', 'balcony', 'garden', 'garage', 'ac'
//   ];

//   // Property types
//   const propertyTypes = [
//     { value: 'apartment', label: 'Apartment' },
//     { value: 'house', label: 'House' },
//     { value: 'condo', label: 'Condo' },
//     { value: 'townhouse', label: 'Townhouse' },
//     { value: 'commercial', label: 'Commercial' },
//     { value: 'boarding_house', label: 'Boarding House' }
//   ];

//   // Status options
//   const statusOptions = [
//     { value: 'active', label: 'Active', color: 'green' },
//     { value: 'vacant', label: 'Vacant', color: 'yellow' },
//     { value: 'under_maintenance', label: 'Maintenance', color: 'orange' }
//   ];

//   // Render current step
//   const renderStep = () => {
//     switch (step) {
//       case 1: // Basic Info
//         return (
//           <div className="space-y-4">
//             <div className="text-center mb-3">
//               <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <Home className="w-5 h-5 text-blue-600" />
//               </div>
//               <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
//             </div>

//             <div className="space-y-3">
//               <div className="space-y-1">
//                 <label className="text-sm font-medium text-gray-700">Property Name *</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   placeholder="123 Main Street"
//                   required
//                 />
//               </div>

//               <div className="space-y-1">
//                 <label className="text-sm font-medium text-gray-700">Property Type *</label>
//                 <select
//                   name="type"
//                   value={formData.type}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 >
//                   {propertyTypes.map(type => (
//                     <option key={type.value} value={type.value}>{type.label}</option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-sm font-medium text-gray-700">Rental Type *</label>
//                 <div className="grid grid-cols-2 gap-2">
//                   <button
//                     type="button"
//                     onClick={() => setFormData(prev => ({ 
//                       ...prev, 
//                       rentalType: 'entire',
//                       rooms: []
//                     }))}
//                     className={`px-3 py-2.5 text-sm rounded-lg border flex flex-col items-center ${
//                       formData.rentalType === 'entire'
//                         ? 'border-blue-500 bg-blue-50 text-blue-700'
//                         : 'border-gray-200 text-gray-600 hover:bg-gray-50'
//                     }`}
//                   >
//                     <Home className="w-4 h-4 mb-1" />
//                     Entire Property
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setFormData(prev => ({ 
//                       ...prev, 
//                       rentalType: 'rooms',
//                       rooms: prev.rooms.length === 0 ? [{
//                         id: Date.now(),
//                         roomNumber: '101',
//                         type: 'bedroom',
//                         size: '',
//                         privateBathroom: false,
//                         monthlyRent: '',
//                         deposit: '',
//                         status: 'available',
//                         features: []
//                       }] : prev.rooms
//                     }))}
//                     className={`px-3 py-2.5 text-sm rounded-lg border flex flex-col items-center ${
//                       formData.rentalType === 'rooms'
//                         ? 'border-purple-500 bg-purple-50 text-purple-700'
//                         : 'border-gray-200 text-gray-600 hover:bg-gray-50'
//                     }`}
//                   >
//                     <DoorOpen className="w-4 h-4 mb-1" />
//                     Individual Rooms
//                   </button>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {formData.rentalType === 'entire' 
//                     ? 'Rent the entire property to one tenant'
//                     : 'Rent individual rooms to multiple tenants'
//                   }
//                 </p>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-sm font-medium text-gray-700">Status *</label>
//                 <div className="flex gap-2">
//                   {statusOptions.map(status => (
//                     <button
//                       key={status.value}
//                       type="button"
//                       onClick={() => setFormData(prev => ({ ...prev, status: status.value }))}
//                       className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
//                         formData.status === status.value
//                           ? `border-${status.color}-500 bg-${status.color}-50 text-${status.color}-700`
//                           : 'border-gray-200 text-gray-600 hover:bg-gray-50'
//                       }`}
//                     >
//                       {status.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 2: // Address (same as before)
//         return (
//           <div className="space-y-4">
//             <div className="text-center mb-3">
//               <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <MapPin className="w-5 h-5 text-green-600" />
//               </div>
//               <h3 className="text-base font-semibold text-gray-900">Property Address</h3>
//             </div>

//             <div className="space-y-3">
//               <div className="space-y-1">
//                 <label className="text-sm font-medium text-gray-700">Street Address *</label>
//                 <input
//                   type="text"
//                   name="street"
//                   value={formData.street}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
//                   placeholder="123 Main Street"
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">City *</label>
//                   <input
//                     type="text"
//                     name="city"
//                     value={formData.city}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
//                     placeholder="New York"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">State *</label>
//                   <input
//                     type="text"
//                     name="state"
//                     value={formData.state}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
//                     placeholder="NY"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">ZIP Code *</label>
//                   <input
//                     type="text"
//                     name="zipCode"
//                     value={formData.zipCode}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
//                     placeholder="10001"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Country</label>
//                   <input
//                     type="text"
//                     name="country"
//                     value={formData.country}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
//                     placeholder="US"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 3: // Details (same as before)
//         return (
//           <div className="space-y-4">
//             <div className="text-center mb-3">
//               <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <Layers className="w-5 h-5 text-purple-600" />
//               </div>
//               <h3 className="text-base font-semibold text-gray-900">Property Details</h3>
//             </div>

//             <div className="space-y-3">
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Bedrooms</label>
//                   <div className="relative">
//                     <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <input
//                       type="number"
//                       name="bedrooms"
//                       value={formData.bedrooms}
//                       onChange={(e) => handleNumberChange('bedrooms', e.target.value)}
//                       className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//                       min="0"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Bathrooms</label>
//                   <div className="relative">
//                     <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <input
//                       type="number"
//                       name="bathrooms"
//                       value={formData.bathrooms}
//                       onChange={(e) => handleNumberChange('bathrooms', e.target.value)}
//                       className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//                       min="0"
//                       step="0.5"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Square Feet</label>
//                   <div className="relative">
//                     <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <input
//                       type="number"
//                       name="squareFeet"
//                       value={formData.squareFeet}
//                       onChange={(e) => handleNumberChange('squareFeet', e.target.value)}
//                       className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//                       placeholder="850"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Year Built</label>
//                   <input
//                     type="number"
//                     name="yearBuilt"
//                     value={formData.yearBuilt}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//                     min="1800"
//                     max={new Date().getFullYear()}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-sm font-medium text-gray-700">Parking Spaces</label>
//                 <div className="relative">
//                   <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     type="number"
//                     name="parkingSpaces"
//                     value={formData.parkingSpaces}
//                     onChange={(e) => handleNumberChange('parkingSpaces', e.target.value)}
//                     className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
//                     min="0"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-sm font-medium text-gray-700">Amenities</label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {amenitiesList.map(amenity => (
//                     <button
//                       key={amenity}
//                       type="button"
//                       onClick={() => handleAmenityToggle(amenity)}
//                       className={`px-2 py-1.5 text-xs rounded-lg border ${
//                         formData.amenities.includes(amenity)
//                           ? 'border-purple-500 bg-purple-50 text-purple-700'
//                           : 'border-gray-200 text-gray-600 hover:bg-gray-50'
//                       }`}
//                     >
//                       {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 4: // Room Configuration (New Step)
//         if (formData.rentalType !== 'rooms') {
//           return (
//             <div className="text-center py-8">
//               <DoorOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">Individual Rooms</h3>
//               <p className="text-gray-500 mb-4">Room configuration is only available for individual room rentals.</p>
//               <p className="text-sm text-gray-400">
//                 Change rental type to "Individual Rooms" in Step 1 to configure rooms
//               </p>
//             </div>
//           );
//         }

//         return (
//           <div className="space-y-4">
//             <div className="text-center mb-3">
//               <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <DoorOpen className="w-5 h-5 text-indigo-600" />
//               </div>
//               <h3 className="text-base font-semibold text-gray-900">Room Configuration</h3>
//               <p className="text-sm text-gray-500">Configure individual rooms for rental</p>
//             </div>

//             <div className="space-y-3">
//               <div className="flex justify-between items-center">
//                 <h4 className="text-sm font-medium text-gray-700">Rooms ({formData.rooms.length})</h4>
//                 <button
//                   type="button"
//                   onClick={addRoom}
//                   className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 flex items-center"
//                 >
//                   <Plus className="w-3 h-3 mr-1" />
//                   Add Room
//                 </button>
//               </div>

//               <div className="space-y-3">
//                 {formData.rooms.map((room, index) => (
//                   <div key={room.id} className="border border-gray-200 rounded-lg p-3">
//                     <div className="flex justify-between items-start mb-3">
//                       <div className="flex items-center">
//                         <Hash className="w-4 h-4 text-gray-400 mr-2" />
//                         <h4 className="text-sm font-medium text-gray-900">Room {room.roomNumber}</h4>
//                         <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
//                           room.status === 'available' 
//                             ? 'bg-green-100 text-green-800' 
//                             : 'bg-gray-100 text-gray-800'
//                         }`}>
//                           {room.status}
//                         </span>
//                       </div>
//                       {formData.rooms.length > 1 && (
//                         <button
//                           type="button"
//                           onClick={() => removeRoom(room.id)}
//                           className="p-1 hover:bg-red-50 text-red-500 rounded"
//                         >
//                           <Trash2 className="w-3 h-3" />
//                         </button>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-2 gap-3">
//                       <div className="space-y-1">
//                         <label className="text-xs font-medium text-gray-600">Room Number</label>
//                         <input
//                           type="text"
//                           value={room.roomNumber}
//                           onChange={(e) => updateRoom(room.id, 'roomNumber', e.target.value)}
//                           className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
//                           placeholder="101"
//                         />
//                       </div>

//                       <div className="space-y-1">
//                         <label className="text-xs font-medium text-gray-600">Room Type</label>
//                         <select
//                           value={room.type}
//                           onChange={(e) => updateRoom(room.id, 'type', e.target.value)}
//                           className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
//                         >
//                           {roomTypes.map(type => (
//                             <option key={type.value} value={type.value}>
//                               {type.label}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-3 mt-2">
//                       <div className="space-y-1">
//                         <label className="text-xs font-medium text-gray-600">Size (sq ft)</label>
//                         <input
//                           type="number"
//                           value={room.size}
//                           onChange={(e) => updateRoom(room.id, 'size', e.target.value)}
//                           className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
//                           placeholder="150"
//                         />
//                       </div>

//                       <div className="space-y-1">
//                         <label className="text-xs font-medium text-gray-600">Monthly Rent</label>
//                         <div className="relative">
//                           <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
//                           <input
//                             type="number"
//                             value={room.monthlyRent}
//                             onChange={(e) => updateRoom(room.id, 'monthlyRent', e.target.value)}
//                             className="w-full pl-6 px-2 py-1.5 text-sm border border-gray-200 rounded"
//                             placeholder="500"
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mt-2 flex items-center justify-between">
//                       <label className="flex items-center space-x-2">
//                         <input
//                           type="checkbox"
//                           checked={room.privateBathroom}
//                           onChange={(e) => updateRoom(room.id, 'privateBathroom', e.target.checked)}
//                           className="rounded border-gray-300"
//                         />
//                         <span className="text-xs text-gray-600">Private Bathroom</span>
//                       </label>

//                       <div className="space-y-1">
//                         <label className="text-xs font-medium text-gray-600">Deposit</label>
//                         <div className="relative">
//                           <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
//                           <input
//                             type="number"
//                             value={room.deposit}
//                             onChange={(e) => updateRoom(room.id, 'deposit', e.target.value)}
//                             className="w-24 pl-6 px-2 py-1.5 text-sm border border-gray-200 rounded"
//                             placeholder="500"
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mt-3">
//                       <label className="text-xs font-medium text-gray-600 mb-1 block">Room Features</label>
//                       <div className="flex flex-wrap gap-1">
//                         {roomFeatures.map(feature => (
//                           <button
//                             key={feature}
//                             type="button"
//                             onClick={() => toggleRoomFeature(room.id, feature)}
//                             className={`px-2 py-1 text-xs rounded border ${
//                               room.features.includes(feature)
//                                 ? 'border-blue-500 bg-blue-50 text-blue-700'
//                                 : 'border-gray-200 text-gray-600 hover:bg-gray-50'
//                             }`}
//                           >
//                             {feature.replace('_', ' ')}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-4">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <div className="text-sm font-medium text-indigo-900">Total Monthly Income</div>
//                     <div className="text-xs text-indigo-700">From all rooms</div>
//                   </div>
//                   <div className="text-lg font-bold text-indigo-900">
//                     ${calculateTotalMonthlyIncome().toLocaleString()}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 5: // Common Areas & Shared Facilities
//         return (
//           <div className="space-y-4">
//             <div className="text-center mb-3">
//               <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <Users className="w-5 h-5 text-orange-600" />
//               </div>
//               <h3 className="text-base font-semibold text-gray-900">Shared Facilities</h3>
//               <p className="text-sm text-gray-500">
//                 {formData.rentalType === 'rooms' 
//                   ? 'Common areas shared by all tenants' 
//                   : 'Available facilities in the property'
//                 }
//               </p>
//             </div>

//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700">Common Areas</label>
//                 <p className="text-xs text-gray-500 mb-2">
//                   Select areas that are shared among tenants
//                 </p>
//                 <div className="grid grid-cols-2 gap-2">
//                   {commonAreaOptions.map(area => (
//                     <button
//                       key={area.value}
//                       type="button"
//                       onClick={() => handleCommonAreaToggle(area.value)}
//                       className={`px-3 py-2 text-sm rounded-lg border flex items-center justify-center ${
//                         formData.commonAreas.includes(area.value)
//                           ? 'border-orange-500 bg-orange-50 text-orange-700'
//                           : 'border-gray-200 text-gray-600 hover:bg-gray-50'
//                       }`}
//                     >
//                       {area.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700">Utilities Included in Rent</label>
//                 <p className="text-xs text-gray-500 mb-2">
//                   Select utilities that are included in the monthly rent
//                 </p>
//                 <div className="grid grid-cols-2 gap-2">
//                   {utilityOptions.map(utility => (
//                     <button
//                       key={utility.value}
//                       type="button"
//                       onClick={() => handleUtilityToggle(utility.value)}
//                       className={`px-3 py-2 text-sm rounded-lg border flex items-center justify-center ${
//                         formData.utilities?.includedInRent?.includes(utility.value)
//                           ? 'border-green-500 bg-green-50 text-green-700'
//                           : 'border-gray-200 text-gray-600 hover:bg-gray-50'
//                       }`}
//                     >
//                       {utility.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {formData.rentalType === 'rooms' && (
//                 <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
//                   <h4 className="text-sm font-medium text-gray-900 mb-2">Room Rental Notes</h4>
//                   <ul className="text-xs text-gray-600 space-y-1">
//                     <li>• Tenants share common areas selected above</li>
//                     <li>• Selected utilities are included in monthly rent</li>
//                     <li>• Each room can be rented independently</li>
//                     <li>• Room deposits are separate from property security deposit</li>
//                   </ul>
//                 </div>
//               )}
//             </div>
//           </div>
//         );

//       case 6: // Financial (updated)
//         return (
//           <div className="space-y-4">
//             <div className="text-center mb-3">
//               <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <DollarSign className="w-5 h-5 text-yellow-600" />
//               </div>
//               <h3 className="text-base font-semibold text-gray-900">Financial Details</h3>
//               <p className="text-sm text-gray-500">
//                 {formData.rentalType === 'entire' 
//                   ? 'Property financial information' 
//                   : 'Property and room rental finances'
//                 }
//               </p>
//             </div>

//             <div className="space-y-3">
//               {formData.rentalType === 'entire' ? (
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Market Rent *</label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                     <input
//                       type="number"
//                       name="marketRent"
//                       value={formData.marketRent}
//                       onChange={(e) => handleNumberChange('marketRent', e.target.value)}
//                       className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
//                       placeholder="1500"
//                       required
//                     />
//                   </div>
//                 </div>
//               ) : (
//                 <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <div className="text-sm font-medium text-blue-900">Total Room Rental Income</div>
//                       <div className="text-xs text-blue-700">
//                         {formData.rooms.length} rooms × ${calculateTotalMonthlyIncome().toLocaleString()}/month
//                       </div>
//                     </div>
//                     <div className="text-lg font-bold text-blue-900">
//                       ${calculateTotalMonthlyIncome().toLocaleString()}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Purchase Price</label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                     <input
//                       type="number"
//                       name="purchasePrice"
//                       value={formData.purchasePrice}
//                       onChange={(e) => handleNumberChange('purchasePrice', e.target.value)}
//                       className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
//                       placeholder="250000"
//                       step="1000"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Current Value</label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                     <input
//                       type="number"
//                       name="currentValue"
//                       value={formData.currentValue}
//                       onChange={(e) => handleNumberChange('currentValue', e.target.value)}
//                       className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
//                       placeholder="300000"
//                       step="1000"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Property Tax</label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                     <input
//                       type="number"
//                       name="propertyTax"
//                       value={formData.propertyTax}
//                       onChange={(e) => handleNumberChange('propertyTax', e.target.value)}
//                       className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
//                       placeholder="2500"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Insurance</label>
//                   <div className="relative">
//                     <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <input
//                       type="number"
//                       name="insurance"
//                       value={formData.insurance}
//                       onChange={(e) => handleNumberChange('insurance', e.target.value)}
//                       className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
//                       placeholder="800"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">HOA Fees</label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                     <input
//                       type="number"
//                       name="hoaFees"
//                       value={formData.hoaFees}
//                       onChange={(e) => handleNumberChange('hoaFees', e.target.value)}
//                       className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
//                       placeholder="0"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-sm font-medium text-gray-700">Utility Budget</label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                     <input
//                       type="number"
//                       name="utilityBudget"
//                       value={formData.utilityBudget || ''}
//                       onChange={(e) => handleNumberChange('utilityBudget', e.target.value)}
//                       className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
//                       placeholder="200"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-2 pt-2 border-t border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <label className="text-sm font-medium text-gray-700">Has Mortgage</label>
//                   <button
//                     type="button"
//                     onClick={() => setFormData(prev => ({ ...prev, hasMortgage: !prev.hasMortgage }))}
//                     className={`relative inline-flex h-6 w-11 items-center rounded-full ${
//                       formData.hasMortgage ? 'bg-blue-600' : 'bg-gray-200'
//                     }`}
//                   >
//                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
//                       formData.hasMortgage ? 'translate-x-6' : 'translate-x-1'
//                     }`} />
//                   </button>
//                 </div>

//                 {formData.hasMortgage && (
//                   <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
//                     <div className="space-y-1">
//                       <label className="text-sm font-medium text-gray-700">Lender</label>
//                       <input
//                         type="text"
//                         name="lender"
//                         value={formData.lender}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-200 rounded-lg"
//                         placeholder="Bank of America"
//                       />
//                     </div>

//                     <div className="grid grid-cols-2 gap-3">
//                       <div className="space-y-1">
//                         <label className="text-sm font-medium text-gray-700">Loan Amount</label>
//                         <div className="relative">
//                           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                           <input
//                             type="number"
//                             name="loanAmount"
//                             value={formData.loanAmount}
//                             onChange={(e) => handleNumberChange('loanAmount', e.target.value)}
//                             className="w-full pl-9 px-3 py-2 border border-gray-200 rounded-lg"
//                             placeholder="200000"
//                           />
//                         </div>
//                       </div>

//                       <div className="space-y-1">
//                         <label className="text-sm font-medium text-gray-700">Interest Rate</label>
//                         <div className="relative">
//                           <input
//                             type="number"
//                             name="interestRate"
//                             value={formData.interestRate}
//                             onChange={(e) => handleNumberChange('interestRate', e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-200 rounded-lg"
//                             placeholder="3.5"
//                             step="0.1"
//                           />
//                           <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {formData.rentalType === 'rooms' && (
//                 <div className="bg-green-50 border border-green-100 rounded-lg p-3">
//                   <h4 className="text-sm font-medium text-green-900 mb-2">Room Rental Financial Summary</h4>
//                   <div className="grid grid-cols-2 gap-3 text-xs">
//                     <div>
//                       <div className="text-green-700">Total Rooms</div>
//                       <div className="font-medium text-gray-900">{formData.rooms.length}</div>
//                     </div>
//                     <div>
//                       <div className="text-green-700">Total Monthly Income</div>
//                       <div className="font-medium text-gray-900">${calculateTotalMonthlyIncome().toLocaleString()}</div>
//                     </div>
//                     <div>
//                       <div className="text-green-700">Avg. Room Rent</div>
//                       <div className="font-medium text-gray-900">
//                         ${formData.rooms.length > 0 ? Math.round(calculateTotalMonthlyIncome() / formData.rooms.length) : 0}
//                       </div>
//                     </div>
//                     <div>
//                       <div className="text-green-700">Occupancy Rate Goal</div>
//                       <div className="font-medium text-gray-900">85%</div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         );

//       case 7: // Review (updated)
//         const totalIncome = formData.rentalType === 'rooms' 
//           ? calculateTotalMonthlyIncome()
//           : parseFloat(formData.marketRent) || 0;

//         return (
//           <div className="space-y-4">
//             <div className="text-center mb-3">
//               <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <CheckCircle className="w-5 h-5 text-emerald-600" />
//               </div>
//               <h3 className="text-base font-semibold text-gray-900">Review & Create</h3>
//               <p className="text-sm text-gray-500">Confirm all details are correct</p>
//             </div>

//             <div className="space-y-3">
//               {/* Basic Info */}
//               <div className="border border-gray-200 rounded-lg p-3">
//                 <div className="flex items-center mb-2">
//                   <Home className="w-4 h-4 text-blue-500 mr-2" />
//                   <h4 className="text-sm font-medium text-gray-900">Basic Information</h4>
//                 </div>
//                 <div className="text-xs space-y-1">
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Name:</span>
//                     <span className="font-medium">{formData.name || "—"}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Type:</span>
//                     <span className="font-medium capitalize">{formData.type}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Rental Type:</span>
//                     <span className="font-medium capitalize">
//                       {formData.rentalType === 'entire' ? 'Entire Property' : 'Individual Rooms'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Status:</span>
//                     <span className="font-medium capitalize">{formData.status.replace('_', ' ')}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Address */}
//               <div className="border border-gray-200 rounded-lg p-3">
//                 <div className="flex items-center mb-2">
//                   <MapPin className="w-4 h-4 text-green-500 mr-2" />
//                   <h4 className="text-sm font-medium text-gray-900">Address</h4>
//                 </div>
//                 <div className="text-xs space-y-1">
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Address:</span>
//                     <span className="font-medium text-right">{formData.street || "—"}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">City:</span>
//                     <span className="font-medium">{formData.city || "—"}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">State:</span>
//                     <span className="font-medium">{formData.state || "—"}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Details */}
//               <div className="border border-gray-200 rounded-lg p-3">
//                 <div className="flex items-center mb-2">
//                   <Layers className="w-4 h-4 text-purple-500 mr-2" />
//                   <h4 className="text-sm font-medium text-gray-900">Property Details</h4>
//                 </div>
//                 <div className="text-xs space-y-1">
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <div className="text-gray-500">Bedrooms</div>
//                       <div className="font-medium">{formData.bedrooms}</div>
//                     </div>
//                     <div>
//                       <div className="text-gray-500">Bathrooms</div>
//                       <div className="font-medium">{formData.bathrooms}</div>
//                     </div>
//                     <div>
//                       <div className="text-gray-500">Sq Ft</div>
//                       <div className="font-medium">{formData.squareFeet || "—"}</div>
//                     </div>
//                     <div>
//                       <div className="text-gray-500">Parking</div>
//                       <div className="font-medium">{formData.parkingSpaces} spaces</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Room Configuration */}
//               {formData.rentalType === 'rooms' && (
//                 <div className="border border-gray-200 rounded-lg p-3">
//                   <div className="flex items-center mb-2">
//                     <DoorOpen className="w-4 h-4 text-indigo-500 mr-2" />
//                     <h4 className="text-sm font-medium text-gray-900">Room Configuration</h4>
//                   </div>
//                   <div className="text-xs space-y-2">
//                     <div className="flex justify-between">
//                       <span className="text-gray-500">Total Rooms:</span>
//                       <span className="font-medium">{formData.rooms.length}</span>
//                     </div>
//                     {formData.rooms.slice(0, 3).map(room => (
//                       <div key={room.id} className="flex justify-between items-center">
//                         <div>
//                           <span className="font-medium">Room {room.roomNumber}</span>
//                           <span className="text-gray-500 ml-2">({room.type})</span>
//                         </div>
//                         <div className="font-medium">${room.monthlyRent || "0"}/month</div>
//                       </div>
//                     ))}
//                     {formData.rooms.length > 3 && (
//                       <div className="text-gray-500 text-center">
//                         + {formData.rooms.length - 3} more rooms
//                       </div>
//                     )}
//                     <div className="pt-2 border-t border-gray-100">
//                       <div className="flex justify-between">
//                         <span className="text-gray-500">Total Monthly Income:</span>
//                         <span className="font-bold text-green-600">
//                           ${calculateTotalMonthlyIncome().toLocaleString()}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Shared Facilities */}
//               {formData.rentalType === 'rooms' && formData.commonAreas.length > 0 && (
//                 <div className="border border-gray-200 rounded-lg p-3">
//                   <div className="flex items-center mb-2">
//                     <Users className="w-4 h-4 text-orange-500 mr-2" />
//                     <h4 className="text-sm font-medium text-gray-900">Shared Facilities</h4>
//                   </div>
//                   <div className="text-xs">
//                     <div className="text-gray-500 mb-1">Common Areas:</div>
//                     <div className="font-medium">
//                       {formData.commonAreas.map(area => 
//                         commonAreaOptions.find(a => a.value === area)?.label || area
//                       ).join(', ')}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Financial */}
//               <div className="border border-gray-200 rounded-lg p-3">
//                 <div className="flex items-center mb-2">
//                   <DollarSign className="w-4 h-4 text-yellow-500 mr-2" />
//                   <h4 className="text-sm font-medium text-gray-900">Financial Summary</h4>
//                 </div>
//                 <div className="text-xs space-y-1">
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Monthly Income:</span>
//                     <span className="font-medium text-green-600">
//                       ${totalIncome.toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Current Value:</span>
//                     <span className="font-medium">
//                       {formData.currentValue ? `$${parseFloat(formData.currentValue).toLocaleString()}` : "—"}
//                     </span>
//                   </div>
//                   {formData.hasMortgage && (
//                     <div className="flex justify-between">
//                       <span className="text-gray-500">Mortgage:</span>
//                       <span className="font-medium">
//                         {formData.loanAmount ? `$${parseFloat(formData.loanAmount).toLocaleString()}` : "—"}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   // Check if current step is valid
//   const isStepValid = () => {
//     switch (step) {
//       case 1:
//         return formData.name && formData.type && formData.rentalType;
//       case 2:
//         return formData.street && formData.city && formData.state && formData.zipCode;
//       case 3:
//         return true; // All fields optional
//       case 4:
//         // For room rental, need at least one valid room
//         if (formData.rentalType === 'rooms') {
//           return formData.rooms.length > 0 && 
//                  formData.rooms.every(room => room.roomNumber && room.monthlyRent);
//         }
//         return true;
//       case 5:
//         return true; // All fields optional
//       case 6:
//         if (formData.rentalType === 'entire') {
//           return formData.marketRent;
//         } else {
//           return true; // Room rental income is calculated from rooms
//         }
//       case 7:
//         return formData.name && formData.street && 
//                (formData.rentalType === 'entire' ? formData.marketRent : formData.rooms.length > 0);
//       default:
//         return false;
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       {/* Backdrop */}
//       <div 
//         className="fixed inset-0 bg-black/10 backdrop-blur-[1px]"
//         onClick={onClose}
//       />
      
//       {/* Modal */}
//       <div 
//         className="relative w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl 
//                    border border-gray-200/50 shadow-lg overflow-hidden mx-4"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="px-4 py-3 border-b border-gray-200/50 bg-white/90">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="flex items-center space-x-1">
//                 {steps.map(s => (
//                   <div
//                     key={s.number}
//                     className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
//                       ${step === s.number 
//                         ? `bg-${s.color}-600 text-white` 
//                         : step > s.number 
//                         ? 'bg-green-100 text-green-700'
//                         : 'bg-gray-100 text-gray-400'
//                       }`}
//                   >
//                     {step > s.number ? '✓' : s.number}
//                   </div>
//                 ))}
//               </div>
//               <div>
//                 <h2 className="text-sm font-semibold text-gray-900">Add Property</h2>
//                 <p className="text-xs text-gray-500">{steps[step-1]?.title}</p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-1 hover:bg-gray-100/50 rounded"
//               aria-label="Close"
//               disabled={loading}
//             >
//               <X className="w-4 h-4 text-gray-500" />
//             </button>
//           </div>
//         </div>
        
//         {/* Content */}
//         <div className="p-4 max-h-[calc(100vh-180px)] overflow-y-auto">
//           <form onSubmit={handleSubmit}>
//             {renderStep()}
//           </form>
//         </div>
        
//         {/* Footer */}
//         <div className="px-4 py-3 border-t border-gray-200/50 bg-white/90">
//           <div className="flex justify-between items-center">
//             <div>
//               {step > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => setStep(step - 1)}
//                   className="px-3 py-1.5 text-gray-700 hover:bg-gray-100/50 rounded-lg text-sm flex items-center"
//                   disabled={loading}
//                 >
//                   <ChevronLeft className="w-3 h-3 mr-1" />
//                   Back
//                 </button>
//               )}
//             </div>
            
//             <div className="flex gap-2">
//               {step < 7 ? (
//                 <>
//                   <button
//                     type="button"
//                     onClick={onClose}
//                     className="px-3 py-1.5 text-gray-700 hover:bg-gray-100/50 rounded-lg text-sm"
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setStep(step + 1)}
//                     disabled={!isStepValid() || loading}
//                     className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 
//                              disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//                   >
//                     Continue
//                     <ChevronRight className="w-3 h-3 ml-1" />
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   type="button"
//                   onClick={handleSubmit}
//                   disabled={loading || !isStepValid()}
//                   className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 
//                            disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//                 >
//                   {loading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
//                       Creating...
//                     </>
//                   ) : (
//                     <>
//                       <Home className="w-3 h-3 mr-1.5" />
//                       Create Property
//                     </>
//                   )}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }