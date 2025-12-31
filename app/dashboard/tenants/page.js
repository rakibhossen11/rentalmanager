'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import TenantTable from '@/app/components/TenantTable';
import AddTenantModal from '@/app/components/AddTenantModal';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { 
    Plus, 
    Download, 
    Filter,
    Search,
    MoreVertical,
    Users,
    AlertCircle,
    Upload,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function TenantsPage() {
    const { user } = useAuth();
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
    });

    useEffect(() => {
        fetchTenants();
    }, [pagination.page, statusFilter]);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                status: statusFilter
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

    const handleDelete = async (tenantId) => {
        if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch(`/api/tenants/${tenantId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Tenant deleted successfully');
                fetchTenants(); // Refresh list
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Delete failed');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEdit = (tenant) => {
        // Navigate to edit page or open modal
        window.location.href = `/dashboard/tenants/${tenant._id}/edit`;
    };

    const handleExport = () => {
        toast.success('Exporting tenants data...');
        // Implement export logic here
    };

    const handleImport = () => {
        toast.info('Import feature coming soon!');
    };

    const filteredTenants = tenants.filter(tenant => {
        const matchesSearch = 
            tenant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tenant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tenant.phone?.includes(searchQuery);
        
        return matchesSearch;
    });

    const stats = {
        total: tenants.length,
        active: tenants.filter(t => t.status === 'active').length,
        inactive: tenants.filter(t => t.status === 'inactive').length,
        past: tenants.filter(t => t.status === 'past').length,
    };

    if (loading && tenants.length === 0) {
        return <LoadingSpinner />;
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
                    <button
                        onClick={handleImport}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">Import</span>
                    </button>
                    
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    
                    <button
                        onClick={() => setShowAddModal(true)}
                        disabled={user?.subscription?.plan === 'free' && stats.total >= user?.limits?.tenants}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" />
                        Add Tenant
                    </button>
                    
                    {user?.subscription?.plan === 'free' && stats.total >= user?.limits?.tenants && (
                        <div className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Free plan limited to {user?.limits?.tenants} tenants. <Link href="/pricing" className="font-medium underline">Upgrade</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Inactive</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                        </div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Past</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.past}</p>
                        </div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search tenants by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    
                    {/* Status Filter */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                statusFilter === 'all' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter('active')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                statusFilter === 'active' 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setStatusFilter('inactive')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                statusFilter === 'inactive' 
                                    ? 'bg-yellow-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Inactive
                        </button>
                    </div>
                </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
                {filteredTenants.length > 0 ? (
                    <>
                        <TenantTable 
                            tenants={filteredTenants}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                        
                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
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
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery || statusFilter !== 'all' 
                                ? 'Try adjusting your search or filter'
                                : 'Get started by adding your first tenant'
                            }
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 inline mr-2" />
                            Add Tenant
                        </button>
                    </div>
                )}
            </div>

            {/* Add Tenant Modal */}
            {showAddModal && (
                <AddTenantModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        fetchTenants();
                        setShowAddModal(false);
                    }}
                    user={user}
                />
            )}
        </div>
    );
}