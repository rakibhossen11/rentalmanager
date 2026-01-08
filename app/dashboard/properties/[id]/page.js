// app/components/PropertyDetailsPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Home, MapPin, DollarSign, Bath, Bed, Square, 
  Car, Calendar, Building, Edit, Save, Trash2, 
  Users, ArrowLeft, Printer, Download, Settings,
  ChevronRight, ChevronDown, Phone, Mail, ExternalLink,
  CheckCircle, AlertCircle, Clock, Star, Layers,
  Plus, Minus, Copy, Share2, Heart, Eye, EyeOff,
  Building2, DollarSign as DollarIcon, PieChart,
  TrendingUp, TrendingDown, Calculator, Receipt,
  FileText, Shield, Wrench, AlertTriangle,
  Hammer, Upload, Image, Key, Lock, Unlock
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import PropertyPDFGenerator from '../components/PropertyPdf';

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  console.log(params);
  
  // Get propertyId from params
  const propertyId = params?.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [property, setProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    units: false,
    tenants: false,
    financial: false,
    documents: false
  });

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home, color: 'blue' },
    { id: 'units', label: 'Units', icon: Building, color: 'purple' },
    { id: 'tenants', label: 'Tenants', icon: Users, color: 'green' },
    { id: 'financial', label: 'Financial', icon: DollarIcon, color: 'amber' },
    { id: 'documents', label: 'Documents', icon: FileText, color: 'indigo' },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'red' },
  ];

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      // Since you're using server-side auth with getSession(),
      // the API will handle authentication automatically
      const response = await fetch(`/api/properties/${propertyId}`);
      console.log(response);

      // if (response.status === 401) {
      //   toast.error('Session expired. Please login again.');
      //   router.push('/login');
      //   return;
      // }

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || 'Failed to fetch property details');
      // }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch property');
      }

      setProperty(data.property);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error(error.message || 'Failed to load property details');
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(property)
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update property');
      }

      const data = await response.json();
      if (data.success) {
        setProperty(data.property);
        setEditMode(false);
        toast.success('Property updated successfully');
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE'
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete property');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Property deleted successfully');
        router.push('/dashboard/properties');
      } else {
        throw new Error(data.message || 'Delete failed');
      }
    } catch (error) {
      toast.error(error.message);
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProperty(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setProperty(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', label: 'Active', icon: CheckCircle },
      vacant: { color: 'yellow', label: 'Vacant', icon: AlertCircle },
      maintenance: { color: 'red', label: 'Maintenance', icon: Wrench },
      upcoming: { color: 'blue', label: 'Upcoming', icon: Clock },
      draft: { color: 'gray', label: 'Draft', icon: FileText }
    };

    const config = statusConfig[status] || statusConfig.vacant;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getPropertyTypeIcon = (type) => {
    const icons = {
      residential: Home,
      commercial: Building2,
      apartment: Layers,
      house: Home,
      condo: Building,
      townhouse: Building,
      villa: Home,
      'multi-family': Building2,
      'single-family': Home
    };
    return icons[type?.toLowerCase()] || Home;
  };

  const calculateOccupancyRate = () => {
    if (!property?.units || property.units.length === 0) return 0;
    const occupied = property.units.filter(unit => unit.status === 'occupied').length;
    return Math.round((occupied / property.units.length) * 100);
  };

  const calculateMonthlyRevenue = () => {
    if (!property?.units) return 0;
    return property.units.reduce((total, unit) => {
      if (unit.status === 'occupied' && unit.monthlyRent) {
        return total + unit.monthlyRent;
      }
      return total;
    }, 0);
  };

  const addNewUnit = () => {
    const newUnit = {
      id: `unit_${Date.now()}`,
      unitNumber: `Unit ${(property?.units?.length || 0) + 1}`,
      type: 'apartment',
      status: 'vacant',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 800,
      monthlyRent: 0,
      deposit: 0,
      features: [],
      amenities: []
    };

    setProperty(prev => ({
      ...prev,
      units: [...(prev.units || []), newUnit]
    }));
  };

  const updateUnit = (index, field, value) => {
    const updatedUnits = [...property.units];
    updatedUnits[index] = {
      ...updatedUnits[index],
      [field]: value
    };
    
    setProperty(prev => ({
      ...prev,
      units: updatedUnits
    }));
  };

  const deleteUnit = (index) => {
    if (confirm('Are you sure you want to delete this unit?')) {
      const updatedUnits = property.units.filter((_, i) => i !== index);
      setProperty(prev => ({
        ...prev,
        units: updatedUnits
      }));
    }
  };

  const renderBreadcrumb = () => (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </li>
        <li>
          <div className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            <Link href="/dashboard/properties" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Properties
            </Link>
          </div>
        </li>
        <li aria-current="page">
          <div className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            <span className="text-sm font-medium text-gray-500">
              {property?.name || 'Loading...'}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  );

  const renderHeader = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-blue-100`}>
                {property?.type && (
                  (() => {
                    const Icon = getPropertyTypeIcon(property.type);
                    return <Icon className="w-6 h-6 text-blue-600" />;
                  })()
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={property?.name || ''}
                      onChange={handleInputChange}
                      className="text-2xl font-bold border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent px-2"
                      placeholder="Property Name"
                    />
                  ) : (
                    property?.name
                  )}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {property?.status && getStatusBadge(property.status)}
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium capitalize">
                    {property?.type || 'Property'}
                  </span>
                  {property?.units && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {property.units.length} Unit{property.units.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>
                {property?.address?.street || 'No address'}, {property?.address?.city || ''}, {property?.address?.state || ''}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                Added: {property?.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {propertyId && <PropertyPDFGenerator propertyId={propertyId} />}
          
          {editMode && (
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          )}
          
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              editMode 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {editMode ? (
              <>
                <Eye className="w-4 h-4" />
                View
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Edit
              </>
            )}
          </button>
          
          <button
            onClick={handleDelete}
            disabled={saving}
            className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const renderStatsCards = () => {
    const occupancyRate = calculateOccupancyRate();
    const monthlyRevenue = calculateMonthlyRevenue();
    const openIssues = property?.maintenance?.openIssues || 0;

    const stats = [
      {
        title: 'Monthly Revenue',
        value: `$${monthlyRevenue.toLocaleString()}`,
        change: monthlyRevenue > 0 ? '+12%' : '+0%',
        trend: 'up',
        icon: TrendingUp,
        color: 'green',
        subtitle: 'From occupied units'
      },
      {
        title: 'Occupancy Rate',
        value: `${occupancyRate}%`,
        change: occupancyRate > 80 ? '+5%' : occupancyRate > 50 ? '+2%' : '-2%',
        trend: occupancyRate > 50 ? 'up' : 'down',
        icon: occupancyRate > 50 ? TrendingUp : TrendingDown,
        color: occupancyRate > 80 ? 'green' : occupancyRate > 50 ? 'yellow' : 'red',
        subtitle: `${property?.units?.filter(u => u.status === 'occupied').length || 0} of ${property?.units?.length || 0} units`
      },
      {
        title: 'Property Value',
        value: `$${property?.financial?.currentValue?.toLocaleString() || '0'}`,
        change: '+8.5%',
        trend: 'up',
        icon: DollarIcon,
        color: 'blue',
        subtitle: 'Current market value'
      },
      {
        title: 'Maintenance',
        value: openIssues,
        change: openIssues > 0 ? '+1' : '-2',
        trend: openIssues > 0 ? 'up' : 'down',
        icon: AlertTriangle,
        color: openIssues > 0 ? 'red' : 'green',
        subtitle: openIssues > 0 ? 'Open requests' : 'All good'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClass = `bg-${stat.color}-50 text-${stat.color}-600`;
          const trendClass = stat.trend === 'up' ? 'text-green-600' : 'text-red-600';
          
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center text-sm ${trendClass}`}>
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-gray-900 font-medium">{stat.title}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Address Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Property Address
              </h3>
              <button
                onClick={() => toggleSection('details')}
                className="text-gray-500 hover:text-gray-700"
              >
                {expandedSections.details ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {expandedSections.details && (
              <div className="space-y-4">
                {editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['street', 'city', 'state', 'zipCode', 'country'].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {field === 'zipCode' ? 'ZIP Code' : field}
                        </label>
                        <input
                          type="text"
                          value={property?.address?.[field] || ''}
                          onChange={(e) => handleNestedChange('address', field, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Enter ${field === 'zipCode' ? 'ZIP Code' : field}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">
                      {property?.address?.street || 'No address provided'}
                    </p>
                    <p className="text-gray-600">
                      {property?.address?.city && `${property.address.city}, `}
                      {property?.address?.state && `${property.address.state} `}
                      {property?.address?.zipCode}
                    </p>
                    <p className="text-gray-500">{property?.address?.country || 'United States'}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Property Features */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Bed, label: 'Bedrooms', value: property?.details?.totalBedrooms || 0, color: 'blue' },
                { icon: Bath, label: 'Bathrooms', value: property?.details?.totalBathrooms || 0, color: 'green' },
                { icon: Square, label: 'Square Feet', value: property?.details?.totalSquareFeet?.toLocaleString() || '0', color: 'purple' },
                { icon: Car, label: 'Parking', value: property?.details?.parkingSpaces || 0, color: 'amber' }
              ].map((item, index) => (
                <div key={index} className={`text-center p-4 bg-${item.color}-50 rounded-lg`}>
                  <item.icon className={`w-6 h-6 text-${item.color}-600 mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                  <div className="text-sm text-gray-600">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: Receipt, label: 'Record Payment', description: 'Add a new payment', color: 'blue' },
                { icon: Hammer, label: 'Request Maintenance', description: 'Report an issue', color: 'amber' },
                { icon: Users, label: 'Add Tenant', description: 'Assign to a unit', color: 'green' },
                { icon: PieChart, label: 'Generate Report', description: 'Financial summary', color: 'purple' }
              ].map((action, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                  <div>
                    <div className="font-medium text-gray-900">{action.label}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Property Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            {editMode ? (
              <textarea
                value={property?.notes || ''}
                onChange={(e) => handleInputChange({ target: { name: 'notes', value: e.target.value } })}
                name="notes"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add notes about this property..."
              />
            ) : (
              <p className="text-gray-600 whitespace-pre-wrap">
                {property?.notes || 'No notes added yet.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUnits = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Units & Rooms</h2>
        {editMode && (
          <button
            onClick={addNewUnit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Unit
          </button>
        )}
      </div>

      {property?.units && property.units.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {property.units.map((unit, index) => (
            <div key={unit.id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {editMode ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={unit.unitNumber || ''}
                        onChange={(e) => updateUnit(index, 'unitNumber', e.target.value)}
                        className="text-xl font-bold border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
                        placeholder="Unit Number"
                      />
                      <div className="text-right">
                        <input
                          type="number"
                          value={unit.monthlyRent || 0}
                          onChange={(e) => updateUnit(index, 'monthlyRent', parseFloat(e.target.value) || 0)}
                          className="text-2xl font-bold border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent text-right w-32"
                        />
                        <div className="text-sm text-gray-500">per month</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {['bedrooms', 'bathrooms', 'squareFeet', 'deposit'].map((field) => (
                        <div key={field}>
                          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                            {field === 'squareFeet' ? 'Square Feet' : field}
                          </label>
                          <input
                            type="number"
                            value={unit[field] || 0}
                            onChange={(e) => updateUnit(index, field, parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        value={unit.type || 'apartment'}
                        onChange={(e) => updateUnit(index, 'type', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="apartment">Apartment</option>
                        <option value="studio">Studio</option>
                        <option value="condo">Condo</option>
                        <option value="room">Room</option>
                      </select>
                      
                      <select
                        value={unit.status || 'vacant'}
                        onChange={(e) => updateUnit(index, 'status', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="occupied">Occupied</option>
                        <option value="vacant">Vacant</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={() => deleteUnit(index)}
                      className="w-full mt-4 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Unit
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{unit.unitNumber || `Unit ${index + 1}`}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
                            {unit.type || 'Standard'}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            unit.status === 'occupied' 
                              ? 'bg-green-100 text-green-800' 
                              : unit.status === 'maintenance'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {unit.status || 'vacant'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ${(unit.monthlyRent || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">per month</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Bedrooms</div>
                        <div className="font-medium">{unit.bedrooms || 0}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Bathrooms</div>
                        <div className="font-medium">{unit.bathrooms || 0}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Size</div>
                        <div className="font-medium">{unit.squareFeet || 0} sq ft</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Deposit</div>
                        <div className="font-medium">${(unit.deposit || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {!editMode && (
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                  <button 
                    onClick={() => router.push(`/dashboard/tenants?property=${propertyId}&unit=${unit.id || index}`)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Assign Tenant
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Units Yet</h3>
          <p className="text-gray-600 mb-6">Add units or rooms to start managing this property.</p>
          {editMode && (
            <button
              onClick={addNewUnit}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add Your First Unit
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'units':
        return renderUnits();
      case 'tenants':
        return (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tenant Management</h3>
            <p className="text-gray-600 mb-6">Manage tenants for this property.</p>
            <button
              onClick={() => router.push(`/dashboard/tenants/new?property=${propertyId}`)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add New Tenant
            </button>
          </div>
        );
      case 'financial':
        return (
          <div className="text-center py-12">
            <DollarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Details</h3>
            <p className="text-gray-600 mb-6">View financial information for this property.</p>
          </div>
        );
      case 'documents':
        return (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Property Documents</h3>
            <p className="text-gray-600 mb-6">Upload and manage property documents.</p>
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto">
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        );
      case 'maintenance':
        return (
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Maintenance Requests</h3>
            <p className="text-gray-600 mb-6">View and manage maintenance requests for this property.</p>
            <button
              onClick={() => router.push(`/dashboard/maintenance/new?property=${propertyId}`)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              New Maintenance Request
            </button>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
            <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link
              href="/dashboard/properties"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {renderBreadcrumb()}
        {renderHeader()}
        
        {renderStatsCards()}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const activeClasses = {
                  blue: 'border-blue-500 text-blue-600',
                  purple: 'border-purple-500 text-purple-600',
                  green: 'border-green-500 text-green-600',
                  amber: 'border-amber-500 text-amber-600',
                  indigo: 'border-indigo-500 text-indigo-600',
                  red: 'border-red-500 text-red-600'
                };
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? activeClasses[tab.color]
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}