// app/components/AddPropertyModal.js
'use client';

import { useState } from 'react';
import { 
  X, Home, MapPin, DollarSign, Bath, Bed, Square, 
  Car, Layers, Calendar, Shield, CheckCircle, ChevronLeft, 
  ChevronRight, Building, Ruler, Info, Image
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddPropertyModal({ onClose, onSuccess, user }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    type: 'apartment',
    status: 'active',
    
    // Step 2: Address
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    
    // Step 3: Details
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: '',
    yearBuilt: new Date().getFullYear(),
    parkingSpaces: 0,
    amenities: [],
    
    // Step 4: Financial
    purchasePrice: '',
    currentValue: '',
    marketRent: '',
    propertyTax: '',
    insurance: '',
    hoaFees: '',
    
    // Mortgage
    hasMortgage: false,
    lender: '',
    loanAmount: '',
    interestRate: '',
    monthlyPayment: '',
    termYears: 30,
    
    // Step 5: Images
    images: []
  });

  // Steps configuration
  const steps = [
    { number: 1, title: 'Basic', icon: Home, color: 'blue' },
    { number: 2, title: 'Address', icon: MapPin, color: 'green' },
    { number: 3, title: 'Details', icon: Layers, color: 'purple' },
    { number: 4, title: 'Financial', icon: DollarSign, color: 'yellow' },
    { number: 5, title: 'Review', icon: CheckCircle, color: 'emerald' }
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle number inputs
  const handleNumberChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value)
    }));
  };

  // Handle amenities selection
  const handleAmenityToggle = (amenity) => {
    setFormData(prev => {
      const currentAmenities = prev.amenities || [];
      const newAmenities = currentAmenities.includes(amenity)
        ? currentAmenities.filter(a => a !== amenity)
        : [...currentAmenities, amenity];
      return { ...prev, amenities: newAmenities };
    });
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

      // Prepare data for API
      const propertyData = {
        name: formData.name,
        type: formData.type,
        status: formData.status,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        details: {
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          squareFeet: parseFloat(formData.squareFeet) || 0,
          yearBuilt: parseInt(formData.yearBuilt) || new Date().getFullYear(),
          parkingSpaces: parseInt(formData.parkingSpaces) || 0,
          amenities: formData.amenities
        },
        financial: {
          purchasePrice: parseFloat(formData.purchasePrice) || 0,
          currentValue: parseFloat(formData.currentValue) || 0,
          marketRent: parseFloat(formData.marketRent) || 0,
          propertyTax: parseFloat(formData.propertyTax) || 0,
          insurance: parseFloat(formData.insurance) || 0,
          hoaFees: parseFloat(formData.hoaFees) || 0,
          mortgage: formData.hasMortgage ? {
            lender: formData.lender,
            loanAmount: parseFloat(formData.loanAmount) || 0,
            interestRate: parseFloat(formData.interestRate) || 0,
            monthlyPayment: parseFloat(formData.monthlyPayment) || 0,
            termYears: parseInt(formData.termYears) || 30
          } : null
        },
        images: formData.images
      };
      console.log(propertyData);

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

  // Common amenities
  const amenitiesList = [
    'parking', 'gym', 'pool', 'laundry', 'elevator', 
    'security', 'balcony', 'garden', 'garage', 'ac'
  ];

  // Property types
  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'commercial', label: 'Commercial' }
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'vacant', label: 'Vacant', color: 'yellow' },
    { value: 'under_maintenance', label: 'Maintenance', color: 'orange' }
  ];

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 1: // Basic Info
        return (
          <div className="space-y-4">
            <div className="text-center mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Property Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Property Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Status *</label>
                <div className="flex gap-2">
                  {statusOptions.map(status => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status: status.value }))}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                        formData.status === status.value
                          ? `border-${status.color}-500 bg-${status.color}-50 text-${status.color}-700`
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Address
        return (
          <div className="space-y-4">
            <div className="text-center mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Property Address</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Street Address *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="New York"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="NY"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="10001"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="US"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Details
        return (
          <div className="space-y-4">
            <div className="text-center mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Layers className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Property Details</h3>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Bedrooms</label>
                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={(e) => handleNumberChange('bedrooms', e.target.value)}
                      className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Bathrooms</label>
                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={(e) => handleNumberChange('bathrooms', e.target.value)}
                      className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Square Feet</label>
                  <div className="relative">
                    <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="squareFeet"
                      value={formData.squareFeet}
                      onChange={(e) => handleNumberChange('squareFeet', e.target.value)}
                      className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="850"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Year Built</label>
                  <input
                    type="number"
                    name="yearBuilt"
                    value={formData.yearBuilt}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Parking Spaces</label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    name="parkingSpaces"
                    value={formData.parkingSpaces}
                    onChange={(e) => handleNumberChange('parkingSpaces', e.target.value)}
                    className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Amenities</label>
                <div className="grid grid-cols-3 gap-2">
                  {amenitiesList.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`px-2 py-1.5 text-xs rounded-lg border ${
                        formData.amenities.includes(amenity)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Financial
        return (
          <div className="space-y-4">
            <div className="text-center mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Financial Details</h3>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Purchase Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={(e) => handleNumberChange('purchasePrice', e.target.value)}
                      className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      placeholder="250000"
                      step="1000"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Current Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="currentValue"
                      value={formData.currentValue}
                      onChange={(e) => handleNumberChange('currentValue', e.target.value)}
                      className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      placeholder="300000"
                      step="1000"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Market Rent *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="marketRent"
                      value={formData.marketRent}
                      onChange={(e) => handleNumberChange('marketRent', e.target.value)}
                      className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      placeholder="1500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Property Tax</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="propertyTax"
                      value={formData.propertyTax}
                      onChange={(e) => handleNumberChange('propertyTax', e.target.value)}
                      className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      placeholder="2500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Insurance</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="insurance"
                      value={formData.insurance}
                      onChange={(e) => handleNumberChange('insurance', e.target.value)}
                      className="w-full pl-10 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      placeholder="800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">HOA Fees</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="hoaFees"
                      value={formData.hoaFees}
                      onChange={(e) => handleNumberChange('hoaFees', e.target.value)}
                      className="w-full pl-9 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Has Mortgage</label>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, hasMortgage: !prev.hasMortgage }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      formData.hasMortgage ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      formData.hasMortgage ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {formData.hasMortgage && (
                  <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Lender</label>
                      <input
                        type="text"
                        name="lender"
                        value={formData.lender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        placeholder="Bank of America"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Loan Amount</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            name="loanAmount"
                            value={formData.loanAmount}
                            onChange={(e) => handleNumberChange('loanAmount', e.target.value)}
                            className="w-full pl-9 px-3 py-2 border border-gray-200 rounded-lg"
                            placeholder="200000"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Interest Rate</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="interestRate"
                            value={formData.interestRate}
                            onChange={(e) => handleNumberChange('interestRate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                            placeholder="3.5"
                            step="0.1"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 5: // Review
        return (
          <div className="space-y-4">
            <div className="text-center mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Review & Create</h3>
              <p className="text-sm text-gray-500">Confirm all details are correct</p>
            </div>

            <div className="space-y-3">
              {/* Basic Info */}
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <Home className="w-4 h-4 text-blue-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Basic Information</h4>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium">{formData.name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium capitalize">{formData.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-medium capitalize">{formData.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <MapPin className="w-4 h-4 text-green-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Address</h4>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Address:</span>
                    <span className="font-medium text-right">{formData.street || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">City:</span>
                    <span className="font-medium">{formData.city || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">State:</span>
                    <span className="font-medium">{formData.state || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <Layers className="w-4 h-4 text-purple-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Property Details</h4>
                </div>
                <div className="text-xs space-y-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-gray-500">Bedrooms</div>
                      <div className="font-medium">{formData.bedrooms}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Bathrooms</div>
                      <div className="font-medium">{formData.bathrooms}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Sq Ft</div>
                      <div className="font-medium">{formData.squareFeet || "—"}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Parking</div>
                      <div className="font-medium">{formData.parkingSpaces} spaces</div>
                    </div>
                  </div>
                  {formData.amenities.length > 0 && (
                    <div className="mt-2">
                      <div className="text-gray-500">Amenities</div>
                      <div className="font-medium text-xs">
                        {formData.amenities.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial */}
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <DollarSign className="w-4 h-4 text-yellow-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Financial</h4>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Market Rent:</span>
                    <span className="font-medium text-green-600">
                      {formData.marketRent ? `$${parseFloat(formData.marketRent).toLocaleString()}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Value:</span>
                    <span className="font-medium">
                      {formData.currentValue ? `$${parseFloat(formData.currentValue).toLocaleString()}` : "—"}
                    </span>
                  </div>
                  {formData.hasMortgage && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mortgage:</span>
                      <span className="font-medium">
                        {formData.loanAmount ? `$${parseFloat(formData.loanAmount).toLocaleString()}` : "—"}
                      </span>
                    </div>
                  )}
                </div>
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
        return formData.name && formData.type;
      case 2:
        return formData.street && formData.city && formData.state && formData.zipCode;
      case 3:
        return true; // All fields optional
      case 4:
        return formData.marketRent; // Only market rent is required
      case 5:
        return formData.name && formData.street && formData.marketRent;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Transparent backdrop */}
      <div 
        className="fixed inset-0 bg-black/10 backdrop-blur-[1px]"
        onClick={onClose}
      />
      
      {/* Compact modal */}
      <div 
        className="relative w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl 
                   border border-gray-200/50 shadow-lg overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200/50 bg-white/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {steps.map(s => (
                  <div
                    key={s.number}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
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
                <h2 className="text-sm font-semibold text-gray-900">Add Property</h2>
                <p className="text-xs text-gray-500">{steps[step-1]?.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100/50 rounded"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 max-h-[calc(100vh-180px)] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {renderStep()}
          </form>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200/50 bg-white/90">
          <div className="flex justify-between items-center">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-3 py-1.5 text-gray-700 hover:bg-gray-100/50 rounded-lg text-sm flex items-center"
                >
                  <ChevronLeft className="w-3 h-3 mr-1" />
                  Back
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              {step < 5 ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 text-gray-700 hover:bg-gray-100/50 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={!isStepValid()}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    Continue
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !isStepValid()}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Home className="w-3 h-3 mr-1.5" />
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

// // app/components/AddPropertyModal.jsx
// 'use client';

// import { useState } from 'react';
// import { 
//   X, 
//   Home, 
//   MapPin, 
//   DollarSign,
//   Bath,
//   Bed,
//   Square,
//   Car,
//   Layers,
//   Calendar,
//   Shield,
//   Upload,
//   CheckCircle
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// export default function AddPropertyModal({ onClose, onSuccess, user }) {
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     // Basic Information
//     name: '',
//     type: 'apartment',
//     status: 'active',
    
//     // Address
//     address: {
//       street: '',
//       unit: '',
//       city: '',
//       state: '',
//       zipCode: '',
//       country: 'US'
//     },
    
//     // Property Details
//     details: {
//       bedrooms: 1,
//       bathrooms: 1,
//       squareFeet: '',
//       yearBuilt: new Date().getFullYear(),
//       lotSize: '',
//       floors: 1,
//       parkingSpaces: 0,
//       amenities: []
//     },
    
//     // Financial Information
//     financial: {
//       purchasePrice: '',
//       currentValue: '',
//       marketRent: '',
//       propertyTax: '',
//       insurance: '',
//       hoaFees: '',
//       mortgage: {
//         hasMortgage: false,
//         lender: '',
//         loanAmount: '',
//         interestRate: '',
//         monthlyPayment: '',
//         termYears: 30
//       }
//     },
    
//     // Images
//     images: []
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
    
//     // Handle nested objects
//     if (name.includes('.')) {
//       const [parent, child, subChild] = name.split('.');
      
//       if (subChild) {
//         // Three-level deep (financial.mortgage.interestRate)
//         setFormData(prev => ({
//           ...prev,
//           [parent]: {
//             ...prev[parent],
//             [child]: {
//               ...prev[parent][child],
//               [subChild]: type === 'checkbox' ? checked : value
//             }
//           }
//         }));
//       } else {
//         // Two-level deep (address.street)
//         setFormData(prev => ({
//           ...prev,
//           [parent]: {
//             ...prev[parent],
//             [child]: type === 'checkbox' ? checked : value
//           }
//         }));
//       }
//     } else {
//       // Top-level field
//       setFormData(prev => ({
//         ...prev,
//         [name]: type === 'checkbox' ? checked : value
//       }));
//     }
//   };

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

//       const res = await fetch('/api/properties', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData)
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

//   const steps = [
//     { number: 1, title: 'Basic Info', icon: Home },
//     { number: 2, title: 'Address', icon: MapPin },
//     { number: 3, title: 'Details', icon: Layers },
//     { number: 4, title: 'Financial', icon: DollarSign },
//     { number: 5, title: 'Review', icon: CheckCircle }
//   ];

//   // Render methods for each step...
//   // (Due to length, I'll provide the complete modal in a follow-up)

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen p-4">
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
//           onClick={onClose}
//         />
        
//         <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
//           {/* Modal Header */}
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-xl font-bold text-white">Add New Property</h2>
//                 <p className="text-blue-100 text-sm">
//                   Step {step} of 5: {steps[step - 1]?.title}
//                 </p>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="p-2 text-white hover:bg-white/10 rounded-lg"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
            
//             {/* Progress Steps */}
//             <div className="flex justify-between mt-6">
//               {steps.map((stepItem) => {
//                 const Icon = stepItem.icon;
//                 const isActive = stepItem.number === step;
//                 const isCompleted = stepItem.number < step;
                
//                 return (
//                   <div key={stepItem.number} className="flex flex-col items-center">
//                     <div className={`
//                       flex items-center justify-center w-10 h-10 rounded-full mb-2
//                       ${isCompleted ? 'bg-green-500' : isActive ? 'bg-white' : 'bg-blue-400'}
//                     `}>
//                       <Icon className={`
//                         w-5 h-5
//                         ${isCompleted ? 'text-white' : isActive ? 'text-blue-600' : 'text-white'}
//                       `} />
//                     </div>
//                     <span className="text-xs font-medium text-white">
//                       {stepItem.title}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
          
//           {/* Form Content */}
//           <div className="p-6 overflow-y-auto max-h-[60vh]">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Step 1: Basic Information */}
//               {step === 1 && (
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Property Name *
//                       </label>
//                       <input
//                         type="text"
//                         name="name"
//                         value={formData.name}
//                         onChange={handleChange}
//                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                         placeholder="123 Main Street"
//                         required
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Property Type *
//                       </label>
//                       <select
//                         name="type"
//                         value={formData.type}
//                         onChange={handleChange}
//                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                       >
//                         <option value="apartment">Apartment</option>
//                         <option value="house">House</option>
//                         <option value="condo">Condo</option>
//                         <option value="commercial">Commercial</option>
//                       </select>
//                     </div>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Status *
//                     </label>
//                     <div className="flex gap-3">
//                       {['active', 'vacant', 'under_maintenance'].map((status) => (
//                         <button
//                           key={status}
//                           type="button"
//                           onClick={() => setFormData({...formData, status})}
//                           className={`flex-1 p-3 border rounded-lg text-center ${
//                             formData.status === status
//                               ? 'border-blue-500 bg-blue-50 text-blue-700'
//                               : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//                           }`}
//                         >
//                           {status.replace('_', ' ')}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}
              
//               {/* Additional steps for address, details, financial, and review */}
//               {/* (Implementation follows similar pattern) */}
//             </form>
//           </div>
          
//           {/* Footer Actions */}
//           <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
//             <div className="flex justify-between">
//               <div>
//                 {step > 1 && (
//                   <button
//                     type="button"
//                     onClick={() => setStep(step - 1)}
//                     className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
//                   >
//                     Back
//                   </button>
//                 )}
//               </div>
              
//               <div className="flex gap-3">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
                
//                 {step < 5 ? (
//                   <button
//                     type="button"
//                     onClick={() => setStep(step + 1)}
//                     className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                   >
//                     Next Step
//                   </button>
//                 ) : (
//                   <button
//                     type="submit"
//                     onClick={handleSubmit}
//                     disabled={loading}
//                     className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
//                   >
//                     {loading ? 'Adding...' : 'Add Property'}
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }