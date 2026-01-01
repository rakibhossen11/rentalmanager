// app/dashboard/properties/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import PropertyCard from '@/app/components/PropertyCard';
import AddPropertyModal from '@/app/components/AddPropertyModal';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Home,
  Building,
  DollarSign,
  Users,
  Grid,
  List,
  Download,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    minPrice: '',
    maxPrice: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchProperties();
  }, [pagination.page, filters.status, filters.type]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
        type: filters.type
      }).toString();
      
      const res = await fetch(`/api/properties?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
        setPagination(data.pagination || pagination);
      } else {
        throw new Error('Failed to fetch properties');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property? This will also remove all associated tenants.')) {
      return;
    }

    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Property deleted successfully');
        fetchProperties();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address?.street?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const stats = {
    total: properties.length,
    active: properties.filter(p => p.status === 'active').length,
    vacant: properties.filter(p => p.status === 'vacant').length,
    totalValue: properties.reduce((sum, p) => sum + (p.financial?.currentValue || 0), 0),
    totalRevenue: properties.reduce((sum, p) => sum + (p.totalRevenue || 0), 0),
    totalTenants: properties.reduce((sum, p) => sum + (p.tenantCount || 0), 0)
  };

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment', icon: Home },
    { value: 'house', label: 'House', icon: Home },
    { value: 'condo', label: 'Condo', icon: Building },
    { value: 'commercial', label: 'Commercial', icon: Building }
  ];

  if (loading && properties.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage your rental properties</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            disabled={user?.subscription?.plan === 'free' && stats.total >= user?.limits?.properties}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
          
          {user?.subscription?.plan === 'free' && stats.total >= user?.limits?.properties && (
            <div className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
              Free plan limited to {user?.limits?.properties} properties.{' '}
              <Link href="/pricing" className="font-medium underline">Upgrade</Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Home className="w-8 h-8 text-blue-100 bg-blue-600 p-2 rounded-lg" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(stats.totalValue / 1000).toFixed(0)}k
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-100 bg-green-600 p-2 rounded-lg" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Tenants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTenants}</p>
            </div>
            <Users className="w-8 h-8 text-purple-100 bg-purple-600 p-2 rounded-lg" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-100 bg-orange-600 p-2 rounded-lg" />
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
                placeholder="Search properties by name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        
        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
              <option value="vacant">Vacant</option>
              <option value="under_maintenance">Under Maintenance</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Rent
              </label>
              <input
                type="number"
                placeholder="$500"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Rent
              </label>
              <input
                type="number"
                placeholder="$5000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid/List */}
      {filteredProperties.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProperties.map((property) => (
                  <tr key={property._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{property.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {property.address.street}, {property.address.city}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                        {property.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{property.tenantCount || 0} tenants</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        ${property.financial?.marketRent?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        property.status === 'active' ? 'bg-green-100 text-green-800' :
                        property.status === 'vacant' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {property.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/properties/${property._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/properties/${property._id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(property._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filters.status !== 'all' || filters.type !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first property'
            }
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Property
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && filteredProperties.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span> of{' '}
            <span className="font-medium">{pagination.total}</span> properties
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

      {/* Add Property Modal */}
      {showAddModal && (
        <AddPropertyModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchProperties();
            setShowAddModal(false);
          }}
          user={user}
        />
      )}
    </div>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';
// import { Plus, Home, Edit, Trash2 } from 'lucide-react';
// import { useToast } from '../../contexts/ToastContext';

// export default function PropertiesPage() {
//   const [properties, setProperties] = useState([]);
//   const { showBackendToast } = useToast();

//   useEffect(() => {
//     setProperties(getProperties());
//   }, []);

//   const statusColors = {
//     occupied: 'bg-green-100 text-green-800',
//     vacant: 'bg-gray-100 text-gray-800',
//     maintenance: 'bg-yellow-100 text-yellow-800'
//   };

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Properties</h1>
//           <p className="text-gray-600">Manage your rental properties</p>
//         </div>
//         <button
//           onClick={showBackendToast}
//           className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="w-5 h-5" />
//           Add Property
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {properties.map((property) => (
//           <div key={property.id} className="bg-white rounded-xl shadow-md overflow-hidden border">
//             <div className="p-6">
//               <div className="flex items-start justify-between mb-4">
//                 <div className="p-3 bg-blue-50 rounded-lg">
//                   <Home className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[property.status]}`}>
//                   {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
//                 </span>
//               </div>
              
//               <h3 className="text-xl font-bold text-gray-800 mb-2">{property.name}</h3>
//               <p className="text-gray-600 mb-4">{property.address}</p>
              
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <p className="text-sm text-gray-500">Monthly Rent</p>
//                   <p className="text-2xl font-bold text-gray-800">${property.rentAmount.toLocaleString()}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm text-gray-500">Bedrooms</p>
//                   <p className="text-xl font-bold text-gray-800">{property.bedrooms}</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={showBackendToast}
//                   className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//                 >
//                   <Edit className="w-4 h-4" />
//                   Edit
//                 </button>
//                 <button
//                   onClick={showBackendToast}
//                   className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                   Remove
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }