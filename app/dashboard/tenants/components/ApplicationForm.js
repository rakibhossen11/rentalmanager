// app/components/SimpleApplicationForm.js
'use client';

import React, { useState } from 'react';

const SimpleApplicationForm = () => {
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantNameThai: 'จุฬาลงแพทย์อัตโนมัติ (จุฬาลงแพทย์)',
    fatherName: '',
    fatherNameThai: 'กุ้งอุตสาหกรรม (จุฬาลงแพทย์)',
    motherName: '',
    motherNameThai: 'พุธยศาสตร (จุฬาลงแพทย์)',
    dateOfBirth: '',
    nationality: '',
    religion: '',
    gender: '',
    nationalId: '',
    birthRegistration: '',
    passportId: '',
    maritalStatus: '',
    mobileNumber: '',
    confirmMobileNumber: '',
    email: '',
    quota: '',
    departmentalStatus: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.applicantName.trim()) newErrors.applicantName = 'This field is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = 'This field is required';
    if (!formData.motherName.trim()) newErrors.motherName = 'This field is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.nationality) newErrors.nationality = 'Please select nationality';
    if (!formData.religion) newErrors.religion = 'Please select religion';
    if (!formData.gender) newErrors.gender = 'Please select gender';
    if (!formData.nationalId.trim()) newErrors.nationalId = 'National ID is required';
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Please select marital status';
    
    const mobileRegex = /^[0-9]{10,15}$/;
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!mobileRegex.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid mobile number';
    }
    
    if (!formData.confirmMobileNumber.trim()) {
      newErrors.confirmMobileNumber = 'Please confirm mobile number';
    } else if (formData.mobileNumber !== formData.confirmMobileNumber) {
      newErrors.confirmMobileNumber = 'Mobile numbers do not match';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.quota) newErrors.quota = 'Please select quota';
    if (!formData.departmentalStatus) newErrors.departmentalStatus = 'Please select departmental status';
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      console.log('Form submitted:', formData);
      alert('Form submitted successfully!');
      // You can add form submission logic here
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Junior Operator GSE (Casual) 
            <span className="text-lg text-gray-600 block mt-1">
              (จุฬาลงแพทย์อัตโนมัติ (ชุมนครราชสีมา))
            </span>
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mt-4">Formation</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Applicant's Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Applicant's Name
              </label>
              <input
                type="text"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name"
              />
              {errors.applicantName && (
                <p className="text-red-500 text-xs mt-1">{errors.applicantName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Applicant's Name (Thai)
              </label>
              <input
                type="text"
                name="applicantNameThai"
                value={formData.applicantNameThai}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="จุฬาลงแพทย์อัตโนมัติ"
              />
            </div>
          </div>

          {/* Father's Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Father's Name
              </label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter father's name"
              />
              {errors.fatherName && (
                <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Father's Name (Thai)
              </label>
              <input
                type="text"
                name="fatherNameThai"
                value={formData.fatherNameThai}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="กุ้งอุตสาหกรรม"
              />
            </div>
          </div>

          {/* Mother's Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mother's Name
              </label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter mother's name"
              />
              {errors.motherName && (
                <p className="text-red-500 text-xs mt-1">{errors.motherName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mother's Name (Thai)
              </label>
              <input
                type="text"
                name="motherNameThai"
                value={formData.motherNameThai}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="พุธยศาสตร"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Single Row Fields - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Nationality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality
              </label>
              <select
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="bangladeshi">Bangladeshi</option>
                <option value="thai">Thai</option>
                <option value="indian">Indian</option>
                <option value="other">Other</option>
              </select>
              {errors.nationality && (
                <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>
              )}
            </div>

            {/* Religion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Religion
              </label>
              <select
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="islam">Islam</option>
                <option value="hinduism">Hinduism</option>
                <option value="buddhism">Buddhism</option>
                <option value="christianity">Christianity</option>
                <option value="other">Other</option>
              </select>
              {errors.religion && (
                <p className="text-red-500 text-xs mt-1">{errors.religion}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}
            </div>

            {/* National ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National ID
              </label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter national ID"
              />
              {errors.nationalId && (
                <p className="text-red-500 text-xs mt-1">{errors.nationalId}</p>
              )}
            </div>

            {/* Birth Registration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birth Registration
              </label>
              <input
                type="text"
                name="birthRegistration"
                value={formData.birthRegistration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter birth registration"
              />
            </div>

            {/* Passport ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passport ID
              </label>
              <input
                type="text"
                name="passportId"
                value={formData.passportId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter passport ID"
              />
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
              {errors.maritalStatus && (
                <p className="text-red-500 text-xs mt-1">{errors.maritalStatus}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter mobile number"
              />
              {errors.mobileNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
              )}
            </div>

            {/* Confirm Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Mobile Number
              </label>
              <input
                type="tel"
                name="confirmMobileNumber"
                value={formData.confirmMobileNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm mobile number"
              />
              {errors.confirmMobileNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmMobileNumber}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Quota */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quota
              </label>
              <select
                name="quota"
                value={formData.quota}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="general">General</option>
                <option value="freedom-fighter">Freedom Fighter</option>
                <option value="tribal">Tribal</option>
                <option value="disabled">Disabled</option>
                <option value="other">Other</option>
              </select>
              {errors.quota && (
                <p className="text-red-500 text-xs mt-1">{errors.quota}</p>
              )}
            </div>

            {/* Departmental Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departmental Status
              </label>
              <select
                name="departmentalStatus"
                value={formData.departmentalStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="internal">Internal</option>
                <option value="external">External</option>
                <option value="contractual">Contractual</option>
                <option value="casual">Casual</option>
              </select>
              {errors.departmentalStatus && (
                <p className="text-red-500 text-xs mt-1">{errors.departmentalStatus}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t">
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleApplicationForm;