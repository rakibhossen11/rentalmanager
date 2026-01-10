// app/dashboard/tenants/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import TenantCard from './components/TenantCard';
import AddTenantModal from './components/AddTenantModal';
import TenantDetailsModal from './components/TenantDetailsModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import {
  Plus,
  Search,
  Grid,
  List,
  User,
  DollarSign,
  Users,
  Phone,
  Mail,
  Calendar,
  Building,
  Filter,
  Download,
  MapPin,
  FileText,
  BadgeCheck,
  Settings,
  Eye,
  Trash2,
  Edit,
  MessageCircle,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import SimpleApplicationForm from './components/ApplicationForm';

export default function TenantsPage() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    property: 'all'
  });
  const [properties, setProperties] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchProperties();
    fetchTenants();
  }, [pagination.page, filters.status, filters.property]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
        propertyId: filters.property
      }).toString();

      const res = await fetch(`/api/tenants?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setTenants(data.tenants || []);
        setPagination(data.pagination || pagination);
      } else {
        throw new Error('Failed to fetch tenants');
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewDetails = (tenant) => {
    setSelectedTenant(tenant);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (tenantId) => {
    const tenant = tenants.find(t => t._id === tenantId);
    setSelectedTenant(tenant);
    setDeletingId(tenantId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/tenants/${deletingId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Tenant deleted successfully');
        // Remove from local state
        setTenants(prev => prev.filter(t => t._id !== deletingId));
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setDeletingId(null);
      setSelectedTenant(null);
    }
  };

  const handleTenantUpdate = (updatedTenant) => {
    // Update in local state
    setTenants(prev =>
      prev.map(t => t._id === updatedTenant._id ? updatedTenant : t)
    );
    toast.success('Tenant updated successfully');
  };

  const filteredTenants = tenants.filter(tenant => {
    const searchLower = searchQuery.toLowerCase();
    return (
      tenant.personalInfo?.fullName?.toLowerCase().includes(searchLower) ||
      tenant.personalInfo?.email?.toLowerCase().includes(searchLower) ||
      tenant.personalInfo?.phone?.includes(searchQuery) ||
      tenant.unit?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    inactive: tenants.filter(t => t.status === 'inactive').length,
    past: tenants.filter(t => t.status === 'past').length,
    totalRent: tenants.reduce((sum, t) => sum + (t.lease?.monthlyRent || 0), 0),
    pendingPayments: tenants.reduce((sum, t) => sum + (t.rentStatus?.currentBalance || 0), 0)
  };

  if (loading && tenants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Arial' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold" style={{ fontSize: '17px' }}>Tenants</h1>
          <p className="text-gray-600" style={{ fontSize: '14px', fontWeight: 400 }}>
            Manage all your tenants in one place
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            disabled={user?.subscription?.plan === 'free' && stats.total >= (user?.limits?.tenants || 10)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}
          >
            <Plus className="w-4 h-4" />
            Add Tenant
          </button>

          {user?.subscription?.plan === 'free' && stats.total >= (user?.limits?.tenants || 10) && (
            <div
              className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg"
              style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}
            >
              Free plan limited to {user?.limits?.tenants || 10} tenants.
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600" style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}>
                Total Tenants
              </p>
              <p className="text-gray-900" style={{ fontSize: '17px', fontWeight: 700, fontFamily: 'Arial' }}>
                {stats.total}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-100 bg-blue-600 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600" style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}>
                Active
              </p>
              <p className="text-gray-900" style={{ fontSize: '17px', fontWeight: 700, fontFamily: 'Arial' }}>
                {stats.active}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600" style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}>
                Total Monthly Rent
              </p>
              <p className="text-gray-900" style={{ fontSize: '17px', fontWeight: 700, fontFamily: 'Arial' }}>
                ${stats.totalRent.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-100 bg-green-600 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600" style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}>
                Pending Payments
              </p>
              <p className="text-gray-900" style={{ fontSize: '17px', fontWeight: 700, fontFamily: 'Arial' }}>
                ${stats.pendingPayments.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-100 bg-red-600 p-2 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search tenants by name, email, phone, or unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label
              className="block text-gray-700 mb-1"
              style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}
            >
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="past">Past</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label
              className="block text-gray-700 mb-1"
              style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}
            >
              Property
            </label>
            <select
              value={filters.property}
              onChange={(e) => setFilters({ ...filters, property: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}
            >
              <option value="all">All Properties</option>
              {properties.map(property => (
                <option key={property._id} value={property._id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tenants Grid/List */}
      {filteredTenants.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((tenant) => (
              <div
                key={tenant._id}
                onClick={() => handleViewDetails(tenant)}
                className="cursor-pointer"
              >
                <TenantCard
                  tenant={tenant}
                  onDelete={handleDeleteClick}
                />
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ fontFamily: 'Arial' }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1024px]">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500">
                    <th className="px-6 py-4 text-left text-white uppercase tracking-wider"
                      style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Arial' }}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-100" />
                        <span>Tenant</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-white uppercase tracking-wider"
                      style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Arial' }}>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-100" />
                        <span>Property/Unit</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-white uppercase tracking-wider"
                      style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Arial' }}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-100" />
                        <span>Lease Details</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-white uppercase tracking-wider"
                      style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Arial' }}>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-100" />
                        <span>Rent Status</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-white uppercase tracking-wider"
                      style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Arial' }}>
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="w-4 h-4 text-blue-100" />
                        <span>Status</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-white uppercase tracking-wider"
                      style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Arial' }}>
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-blue-100" />
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTenants.map((tenant, index) => {
                    const property = properties.find(p => p._id === tenant.propertyId);
                    const balance = tenant.rentStatus?.currentBalance || 0;
                    const isEvenRow = index % 2 === 0;

                    return (
                      <tr
                        key={tenant._id}
                        className={`group transition-all duration-200 ${isEvenRow ? 'bg-white' : 'bg-gray-50'} hover:bg-gradient-to-r hover:from-blue-50 hover:via-white hover:to-blue-50`}
                      >
                        {/* Tenant Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="relative">
                              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm ring-2 ring-white ring-offset-2">
                                <User className="h-6 w-6 text-white" />
                              </div>
                              <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${tenant.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="text-gray-900"
                                  style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'Arial' }}
                                >
                                  {tenant.personalInfo?.fullName || 'N/A'}
                                </div>
                                {tenant.status === 'active' && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Active</span>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                {tenant.personalInfo?.email && (
                                  <div className="flex items-center group/email">
                                    <div className="p-1 bg-blue-50 rounded-md mr-2">
                                      <Mail className="w-3 h-3 text-blue-500" />
                                    </div>
                                    <a
                                      href={`mailto:${tenant.personalInfo.email}`}
                                      className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                                      style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Arial' }}
                                    >
                                      {tenant.personalInfo.email}
                                    </a>
                                  </div>
                                )}
                                {tenant.personalInfo?.phone && (
                                  <div className="flex items-center group/phone">
                                    <div className="p-1 bg-blue-50 rounded-md mr-2">
                                      <Phone className="w-3 h-3 text-blue-500" />
                                    </div>
                                    <a
                                      href={`tel:${tenant.personalInfo.phone}`}
                                      className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                                      style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Arial' }}
                                    >
                                      {tenant.personalInfo.phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Property/Unit Column */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className="p-1.5 bg-indigo-50 rounded-lg mr-3">
                                <Building className="w-4 h-4 text-indigo-600" />
                              </div>
                              <div>
                                <div
                                  className="text-gray-900"
                                  style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'Arial' }}
                                >
                                  {property?.name || 'No Property'}
                                </div>
                                {tenant.unit && (
                                  <div className="flex items-center mt-1">
                                    <div className="p-1 bg-blue-50 rounded-md mr-2">
                                      <MapPin className="w-3 h-3 text-blue-500" />
                                    </div>
                                    <div
                                      className="text-gray-600"
                                      style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'Arial' }}
                                    >
                                      Unit {tenant.unit}
                                      {tenant.lease?.unitType && (
                                        <span className="ml-2 text-gray-400 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                                          {tenant.lease.unitType}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            {property?.address?.city && (
                              <div className="flex items-center text-gray-500 text-xs ml-10">
                                <MapPin className="w-3 h-3 mr-1" />
                                {property.address.city}, {property.address.state}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Lease Details Column */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className="p-1.5 bg-amber-50 rounded-lg mr-3">
                                <FileText className="w-4 h-4 text-amber-600" />
                              </div>
                              <div>
                                <div
                                  className="text-gray-900 flex items-center gap-1"
                                  style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'Arial' }}
                                >
                                  <span className="text-green-600">${(tenant.lease?.monthlyRent || 0).toLocaleString()}</span>
                                  <span className="text-gray-400 text-xs">/mo</span>
                                </div>
                                <div className="flex items-center mt-2">
                                  <div className="p-1 bg-blue-50 rounded-md mr-2">
                                    <Calendar className="w-3 h-3 text-blue-500" />
                                  </div>
                                  <div
                                    className="text-gray-600"
                                    style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Arial' }}
                                  >
                                    {tenant.lease?.startDate ? new Date(tenant.lease.startDate).toLocaleDateString() : 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {tenant.lease?.endDate && (
                              <div className="text-xs text-gray-500 ml-10 flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Ends: {new Date(tenant.lease.endDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Rent Status Column */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className="p-1.5 bg-emerald-50 rounded-lg mr-3">
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div>
                                <div
                                  className={`px-3 py-1.5 rounded-full inline-flex items-center gap-1 font-medium shadow-sm ${balance > 0
                                    ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200'
                                    : 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200'
                                    }`}
                                  style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'Arial' }}
                                >
                                  {balance > 0 ? (
                                    <>
                                      <AlertCircle className="w-3 h-3" />
                                      <span>Overdue: ${balance}</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      <span>Current</span>
                                    </>
                                  )}
                                </div>
                                {tenant.rentStatus?.nextPaymentDue && (
                                  <div className="flex items-center mt-3">
                                    <div className="p-1 bg-blue-50 rounded-md mr-2">
                                      <Calendar className="w-3 h-3 text-blue-500" />
                                    </div>
                                    <div
                                      className="text-gray-600"
                                      style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'Arial' }}
                                    >
                                      Next: {new Date(tenant.rentStatus.nextPaymentDue).toLocaleDateString()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className="p-1.5 bg-purple-50 rounded-lg mr-3">
                                <BadgeCheck className="w-4 h-4 text-purple-600" />
                              </div>
                              <span
                                className={`px-3 py-1.5 rounded-full font-medium shadow-sm ${tenant.status === 'active'
                                  ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200'
                                  : tenant.status === 'inactive'
                                    ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200'
                                    : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200'
                                  } border`}
                                style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'Arial' }}
                              >
                                {tenant.status?.charAt(0).toUpperCase() + tenant.status?.slice(1)}
                              </span>
                            </div>
                            {tenant.lease?.leaseType && (
                              <div className="text-xs text-gray-500 ml-10 flex items-center">
                                <FileText className="w-3 h-3 mr-1" />
                                {tenant.lease.leaseType}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className="p-1.5 bg-slate-50 rounded-lg mr-3">
                                <Settings className="w-4 h-4 text-slate-600" />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleViewDetails(tenant)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all duration-200 group/action"
                                  style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'Arial' }}
                                >
                                  <Eye className="w-3.5 h-3.5 group-hover/action:text-white" />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(tenant._id);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-all duration-200 group/delete"
                                  style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'Arial' }}
                                >
                                  <Trash2 className="w-3.5 h-3.5 group-hover/delete:text-white" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                            <div className="flex gap-1 mt-2 ml-10">
                              <button
                                onClick={() => onEdit?.(tenant)}
                                className="text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => { }}
                                className="text-xs text-gray-500 hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                                title="Send Message"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3
            className="text-gray-900 mb-2"
            style={{ fontSize: '17px', fontWeight: 700, fontFamily: 'Arial' }}
          >
            No tenants found
          </h3>
          <p
            className="text-gray-600 mb-4"
            style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}
          >
            {searchQuery || filters.status !== 'all' || filters.property !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first tenant'
            }
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Tenant
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && filteredTenants.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div
            className="text-gray-700"
            style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}
          >
            Showing <span className="font-medium" style={{ fontWeight: 700 }}>{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium" style={{ fontWeight: 700 }}>
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span> of{' '}
            <span className="font-medium" style={{ fontWeight: 700 }}>{pagination.total}</span> tenants
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}
            >
              Previous
            </button>
            <span
              className="px-3 py-1 text-gray-700"
              style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}
            >
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Arial' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <SimpleApplicationForm />

      {/* Modals */}
      {showAddModal && (
        <AddTenantModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchTenants();
            setShowAddModal(false);
          }}
          user={user}
          properties={properties}
        />
      )}

      {showDetailsModal && selectedTenant && (
        <TenantDetailsModal
          tenant={selectedTenant}
          property={properties.find(p => p._id === selectedTenant.propertyId)}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTenant(null);
          }}
          onUpdate={handleTenantUpdate}
          onDelete={handleDeleteClick}
        />
      )}

      {showDeleteModal && selectedTenant && (
        <DeleteConfirmationModal
          tenant={selectedTenant}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedTenant(null);
            setDeletingId(null);
          }}
          onConfirm={handleDeleteConfirm}
          loading={loading}
        />
      )}
    </div>
  );
}