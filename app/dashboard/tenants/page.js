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
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600">Manage all your tenants in one place</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            disabled={user?.subscription?.plan === 'free' && stats.total >= (user?.limits?.tenants || 10)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Tenant
          </button>
          
          {user?.subscription?.plan === 'free' && stats.total >= (user?.limits?.tenants || 10) && (
            <div className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
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
              <p className="text-sm text-gray-600">Total Tenants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-100 bg-blue-600 p-2 rounded-lg" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Monthly Rent</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalRent.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-100 bg-green-600 p-2 rounded-lg" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="past">Past</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property
            </label>
            <select
              value={filters.property}
              onChange={(e) => setFilters({...filters, property: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg"
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
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property/Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lease Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rent Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTenants.map((tenant) => {
                  const property = properties.find(p => p._id === tenant.propertyId);
                  const balance = tenant.rentStatus?.currentBalance || 0;
                  
                  return (
                    <tr key={tenant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {tenant.personalInfo?.fullName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <div className="flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {tenant.personalInfo?.email || 'No email'}
                              </div>
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {tenant.personalInfo?.phone || 'No phone'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {property?.name || 'No Property'}
                        </div>
                        {tenant.unit && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            Unit {tenant.unit}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          ${(tenant.lease?.monthlyRent || 0).toLocaleString()}/mo
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {tenant.lease?.startDate ? new Date(tenant.lease.startDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className={`px-2 py-1 text-xs rounded-full inline-block ${
                          balance > 0 
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {balance > 0 ? `Overdue: $${balance}` : 'Current'}
                        </div>
                        {tenant.rentStatus?.nextPaymentDue && (
                          <div className="text-xs text-gray-500 mt-1">
                            Next: {new Date(tenant.rentStatus.nextPaymentDue).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          tenant.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                          tenant.status === 'inactive' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        } border`}>
                          {tenant.status?.charAt(0).toUpperCase() + tenant.status?.slice(1)}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(tenant)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(tenant._id);
                            }}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filters.status !== 'all' || filters.property !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first tenant'
            }
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Tenant
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && filteredTenants.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span> of{' '}
            <span className="font-medium">{pagination.total}</span> tenants
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

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