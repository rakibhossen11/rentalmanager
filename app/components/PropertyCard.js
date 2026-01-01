// app/components/PropertyCard.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Home, 
  Users, 
  DollarSign, 
  Bath, 
  Bed, 
  Square,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

export default function PropertyCard({ property, onDelete }) {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'vacant': return 'bg-yellow-100 text-yellow-800';
      case 'under_maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'house': return Home;
      case 'apartment': return Home;
      case 'condo': return Home;
      case 'commercial': return Home;
      default: return Home;
    }
  };

  const TypeIcon = getTypeIcon(property.type);

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden group">
      {/* Property Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
        {property.images?.[0] ? (
          <img
            src={property.images[0].url}
            alt={property.images[0].alt || property.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Home className="w-16 h-16 text-blue-300" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(property.status)}`}>
            {property.status.replace('_', ' ')}
          </span>
        </div>
        
        {/* Actions Menu */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
            
            {showActions && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <Link
                    href={`/dashboard/properties/${property._id}`}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowActions(false)}
                  >
                    <Eye className="w-3 h-3 mr-2" />
                    View
                  </Link>
                  <Link
                    href={`/dashboard/properties/${property._id}/edit`}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowActions(false)}
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      setShowActions(false);
                      onDelete(property._id);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Property Details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-900 truncate">{property.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                {property.address.street}, {property.address.city}
              </span>
            </div>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <TypeIcon className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        
        {/* Property Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center">
            <Bed className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {property.details?.bedrooms || 0} beds
            </span>
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {property.details?.bathrooms || 0} baths
            </span>
          </div>
          <div className="flex items-center">
            <Square className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {property.details?.squareFeet?.toLocaleString() || '0'} sqft
            </span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {property.tenantCount || 0} tenants
            </span>
          </div>
        </div>
        
        {/* Financial Info */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Monthly Rent</div>
              <div className="text-lg font-bold text-gray-900">
                ${property.financial?.marketRent?.toLocaleString() || '0'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Property Value</div>
              <div className="text-lg font-bold text-gray-900">
                ${(property.financial?.currentValue / 1000).toFixed(0)}k
              </div>
            </div>
          </div>
        </div>
        
        {/* View Button */}
        <Link
          href={`/dashboard/properties/${property._id}`}
          className="mt-4 block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}