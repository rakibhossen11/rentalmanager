'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  GlobeAltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  KeyIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import {
  EyeIcon as EyeIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationCircleIcon as ExclamationCircleIconSolid
} from '@heroicons/react/24/solid';

const UserManagement = ({ adminData }) => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loggedInAdmin, setLoggedInAdmin] = useState(adminData);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    newThisMonth: 0,
    onlineNow: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalData, setModalData] = useState({
    name: '',
    email: '',
    role: 'user',
    emailVerified: false,
    password: '',
    confirmPassword: ''
  });
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from MongoDB
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', usersPerPage);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/users?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      
      // Transform API data
      const transformedUsers = data.users.map(user => ({
        ...user,
        status: user.emailVerified ? 'active' : 'inactive',
        role: user.role || 'user',
        name: user.name || user.email?.split('@')[0] || 'Unknown User',
        email: user.email || 'No email',
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isCurrentUser: false
      }));
      
      setUsers(transformedUsers);
      calculateStats(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (usersData = users) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = {
      total: usersData.length,
      active: usersData.filter(u => u.emailVerified).length,
      admins: usersData.filter(u => u.role === 'admin').length,
      newThisMonth: usersData.filter(u => {
        if (!u.createdAt) return false;
        const created = new Date(u.createdAt);
        return created >= startOfMonth;
      }).length,
      onlineNow: usersData.filter(u => {
        if (!u.lastLogin) return false;
        const lastLogin = new Date(u.lastLogin);
        return (now - lastLogin) < 15 * 60 * 1000;
      }).length
    };
    
    setStats(stats);
  };

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle pagination
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.name?.toLowerCase() || '').includes(searchLower) ||
      (user.email?.toLowerCase() || '').includes(searchLower) ||
      (user.role?.toLowerCase() || '').includes(searchLower) ||
      (user.companyName?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle view details
  const handleViewDetails = (userId) => {
    router.push(`/admin/users/${userId}`);
  };

  // Edit user
  const handleEdit = (user) => {
    setEditingUser(user);
    setModalData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      emailVerified: user.emailVerified || false,
      password: '',
      confirmPassword: ''
    });
    setShowModal(true);
  };

  // Delete user
  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const userToDelete = users.find(u => u._id === userId);
      if (userToDelete?.isCurrentUser) {
        alert('You cannot delete your own account!');
        return;
      }
      
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete user');
        }

        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        setSuccess('User deleted successfully!');
        calculateStats(users.filter(user => user._id !== userId));
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting user:', error);
        setError(`Failed to delete user: ${error.message}`);
      }
    }
  };

  // Toggle user status
  const handleStatusToggle = async (userId) => {
    const userToToggle = users.find(u => u._id === userId);
    if (userToToggle?.isCurrentUser) {
      alert('You cannot deactivate your own account!');
      return;
    }

    try {
      const newStatus = !userToToggle.emailVerified;
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailVerified: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user status');
      }

      const data = await response.json();
      
      setUsers(prevUsers => prevUsers.map(user =>
        user._id === userId ? { 
          ...user, 
          emailVerified: newStatus,
          status: newStatus ? 'active' : 'inactive'
        } : user
      ));
      
      setSuccess(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError(`Failed to update user status: ${error.message}`);
    }
  };

  // Handle modal input changes
  const handleModalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setModalData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Save user
  const handleSaveUser = async (e) => {
    e.preventDefault();
    
    // Validate passwords if creating new user or changing password
    if (!editingUser && (!modalData.password || modalData.password !== modalData.confirmPassword)) {
      setError(editingUser ? 'Passwords do not match' : 'Password is required for new users');
      return;
    }

    try {
      setError('');
      
      // Prepare data for API
      const userData = {
        name: modalData.name,
        email: modalData.email,
        role: modalData.role,
        emailVerified: modalData.emailVerified
      };
      
      // Only include password if provided
      if (modalData.password) {
        userData.password = modalData.password;
      }
      
      const url = editingUser 
        ? `/api/admin/users/${editingUser._id}`
        : '/api/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${editingUser ? 'update' : 'create'} user`);
      }

      if (editingUser) {
        setUsers(prevUsers => prevUsers.map(user =>
          user._id === editingUser._id ? { 
            ...data, 
            isCurrentUser: user.isCurrentUser,
            status: data.emailVerified ? 'active' : 'inactive'
          } : user
        ));
        setSuccess('User updated successfully!');
      } else {
        const newUser = { 
          ...data, 
          isCurrentUser: false,
          status: data.emailVerified ? 'active' : 'inactive'
        };
        setUsers(prevUsers => [newUser, ...prevUsers]);
        setSuccess('User created successfully!');
      }
      
      // Close modal and reset form
      setShowModal(false);
      setEditingUser(null);
      setModalData({
        name: '',
        email: '',
        role: 'user',
        emailVerified: false,
        password: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.message);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setError('');
    setSuccess('');
    fetchUsers();
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setModalData({
      name: '',
      email: '',
      role: 'user',
      emailVerified: false,
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Success Alert */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-700">{success}</span>
          </div>
          <button
            onClick={() => setSuccess('')}
            className="text-green-500 hover:text-green-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-500 hover:text-red-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Header with admin info */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, <span className="font-semibold text-indigo-600">{loggedInAdmin?.name}</span>!
              Managing {stats.total} users in the system.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              disabled={loading}
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => {
                setEditingUser(null);
                setModalData({
                  name: '',
                  email: '',
                  role: 'user',
                  emailVerified: false,
                  password: '',
                  confirmPassword: ''
                });
                setShowModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add New User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users by name, email, role, or company..."
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="text-green-500">
              <UsersIcon className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <div className="text-green-500">
              <UserCircleIcon className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.admins}
              </p>
            </div>
            <div className="text-purple-500">
              <ShieldCheckIcon className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.newThisMonth}
              </p>
            </div>
            <div className="text-blue-500">
              <UserPlusIcon className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Online Now</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.onlineNow}
              </p>
            </div>
            <div className="text-orange-500">
              <GlobeAltIcon className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <ArrowPathIcon className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-gray-600">Loading users from database...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => {
                      const userId = user._id;
                      const userName = user.name || 'Unknown User';
                      const userEmail = user.email || 'No email';
                      const userRole = user.role || 'user';
                      const isActive = user.status === 'active' || user.emailVerified;
                      const isCurrentUser = user.isCurrentUser || false;

                      return (
                        <tr
                          key={userId}
                          className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-indigo-50' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  isCurrentUser ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  <span className="font-bold text-lg">
                                    {userName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <button
                                  onClick={() => handleViewDetails(userId)}
                                  className="text-sm font-medium text-gray-900 hover:text-indigo-600 hover:underline text-left flex items-center"
                                  title="View user details"
                                >
                                  {userName}
                                  <EyeIcon className="h-4 w-4 ml-1 opacity-70" />
                                </button>
                                <div className="text-sm text-gray-500">{userEmail}</div>
                                {isCurrentUser && (
                                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full flex items-center w-fit">
                                    <UserIcon className="h-3 w-3 mr-1" />
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              userRole === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : userRole === 'moderator'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleStatusToggle(userId)}
                              disabled={isCurrentUser}
                              className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                                isActive
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              } ${isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={isCurrentUser ? "Can't change your own status" : "Click to toggle status"}
                            >
                              {user.emailVerified ? (
                                <>
                                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                                  Verified
                                </>
                              ) : (
                                <>
                                  <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                                  {(user.status || 'inactive').charAt(0).toUpperCase() + (user.status || 'inactive').slice(1)}
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {formatDate(user.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {formatDate(user.lastLogin)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {/* View Details Button */}
                              <button
                                onClick={() => handleViewDetails(userId)}
                                className="inline-flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              
                              {/* Edit Button */}
                              <button
                                onClick={() => handleEdit(user)}
                                className="inline-flex items-center justify-center p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                                title="Edit User"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              
                              {/* Delete Button */}
                              <button
                                onClick={() => handleDelete(userId)}
                                disabled={isCurrentUser}
                                className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                                  isCurrentUser
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                                }`}
                                title={isCurrentUser ? "Can't delete yourself" : "Delete user"}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                          <UsersIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-500">Try adjusting your search criteria</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastUser, filteredUsers.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredUsers.length}</span> users
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || loading}
                      className={`px-3 py-1 rounded-md flex items-center ${
                        currentPage === 1 || loading
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <ChevronLeftIcon className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          disabled={loading}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || loading}
                      className={`px-3 py-1 rounded-md flex items-center ${
                        currentPage === totalPages || loading
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Next
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={modalData.name}
                    onChange={handleModalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={modalData.email}
                    onChange={handleModalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <ShieldCheckIcon className="h-4 w-4 mr-2 text-gray-400" />
                    Role
                  </label>
                  <select
                    name="role"
                    value={modalData.role}
                    onChange={handleModalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailVerified"
                    name="emailVerified"
                    checked={modalData.emailVerified}
                    onChange={handleModalInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailVerified" className="ml-2 block text-sm text-gray-700 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Email Verified
                  </label>
                </div>

                {(!editingUser || modalData.password) && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <KeyIcon className="h-4 w-4 mr-2 text-gray-400" />
                        Password {!editingUser && '(Required)'}
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={modalData.password}
                        onChange={handleModalInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={editingUser ? 'Leave blank to keep current password' : ''}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <KeyIcon className="h-4 w-4 mr-2 text-gray-400" />
                        Confirm Password {!editingUser && '(Required)'}
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={modalData.confirmPassword}
                        onChange={handleModalInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      {editingUser ? 'Update User' : 'Create User'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;