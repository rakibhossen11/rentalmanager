// components/UserModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const UserModal = ({ user, loggedInAdmin, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    password: '',
    confirmPassword: '',
    isActive: true
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
        password: '',
        confirmPassword: '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      // Reset form for new user
      setFormData({
        name: '',
        email: '',
        role: 'user',
        password: '',
        confirmPassword: '',
        isActive: true
      });
    }
    setErrors({});
    setSuccess(false);
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email must be less than 100 characters';
    }
    
    // Password validation (for new users or password change)
    if (!user || formData.password || formData.confirmPassword) {
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (formData.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    // Prevent changing own role to non-admin
    if (user?.isCurrentUser && formData.role !== 'admin') {
      newErrors.role = "You cannot change your own role from admin";
    }
    
    // If user is the logged-in admin, prevent deactivating own account
    if (user?.isCurrentUser && !formData.isActive) {
      newErrors.isActive = "You cannot deactivate your own account";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccess(false);
    
    try {
      // Prepare data for submission
      const submitData = { ...formData };
      
      // Don't send password if it's empty (for editing existing user)
      if (!submitData.password) {
        delete submitData.password;
        delete submitData.confirmPassword;
      }
      
      // Don't send email if editing current user (can't change email)
      if (user?.isCurrentUser) {
        delete submitData.email;
      }
      
      await onSave(submitData);
      setSuccess(true);
      
      // Close modal after successful save
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors({
        submit: error.message || 'Failed to save user. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      password: password,
      confirmPassword: password
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {user ? 'Edit User' : 'Add New User'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {user ? 'Update user information' : 'Create a new user account'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Current User Notice */}
          {user?.isCurrentUser && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Editing Your Account</p>
                  <p className="text-xs text-blue-600 mt-1">
                    You are editing your own account. Some restrictions apply.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  User saved successfully!
                </span>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-red-800">
                  {errors.submit}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.name 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="John Doe"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center">
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.email 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                } ${user?.isCurrentUser ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="john@example.com"
                disabled={isSubmitting || user?.isCurrentUser}
                readOnly={user?.isCurrentUser}
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center">
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
              {user?.isCurrentUser && (
                <p className="mt-1.5 text-sm text-gray-500">
                  Email cannot be changed for your own account
                </p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.role 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                } ${user?.isCurrentUser ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                disabled={isSubmitting || user?.isCurrentUser}
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
              {errors.role && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center">
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  {errors.role}
                </p>
              )}
            </div>

            {/* Account Status */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Account Status
                </label>
                {!formData.isActive && (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  id="isActive"
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  disabled={isSubmitting || user?.isCurrentUser}
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-600">
                  Account is active
                </label>
              </div>
              {errors.isActive && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center">
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  {errors.isActive}
                </p>
              )}
            </div>

            {/* Password Section */}
            {(!user || user.isCurrentUser) && (
              <div className="border-t pt-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {user ? 'Change Password' : 'Set Password'}
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    disabled={isSubmitting}
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    Generate Password
                  </button>
                </div>

                {/* Password Field */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors pr-10 ${
                      errors.password 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <i className="fas fa-eye-slash"></i>
                    ) : (
                      <i className="fas fa-eye"></i>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center">
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
                {!errors.password && formData.password && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    Password strength: {formData.password.length >= 12 ? 'Strong' : 
                      formData.password.length >= 8 ? 'Medium' : 'Weak'}
                  </p>
                )}

                {/* Confirm Password Field */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.confirmPassword 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Confirm password"
                    disabled={isSubmitting}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center">
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-5 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    {user ? 'Update User' : 'Create User'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;