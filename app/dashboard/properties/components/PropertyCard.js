// app/components/PropertyCard.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Home, MapPin, DollarSign, Users, Bed, Bath,
  MoreVertical, Eye, Edit, Trash2, ChevronRight
} from 'lucide-react';
import PropertyDetailsModal from './PropertyDetailsModal';

export default function PropertyCard({ property, onDelete }) {
  const [showOptions, setShowOptions] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalIncome = property.financial?.totalMonthlyIncome || property.financial?.marketRent || 0;
  const tenantCount = property.tenants?.length || 0;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        {/* Property Image/Header */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
          {property.images?.[0] ? (
            <img 
              src={property.images[0]} 
              alt={property.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="w-16 h-16 text-white/50" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              property.status === 'active' ? 'bg-green-100 text-green-800' :
              property.status === 'vacant' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {property.status.replace('_', ' ')}
            </span>
          </div>

          {/* Options Menu */}
          <div className="absolute top-4 right-4">
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1.5 bg-white/90 rounded-lg hover:bg-white"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => {
                      setShowDetailsModal(true);
                      setShowOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  <Link
                    href={`/dashboard/properties/${property._id}/edit`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Property
                  </Link>
                  <button
                    onClick={() => onDelete(property._id)}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Property
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Property Type */}
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-gray-800">
              {property.type}
            </span>
          </div>
        </div>

        {/* Property Info */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{property.name}</h3>
          
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {property.address?.street ? (
                `${property.address.street}, ${property.address.city}`
              ) : (
                'Address not set'
              )}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-green-600 mr-2" />
              <div>
                <div className="text-sm text-gray-600">Monthly Income</div>
                <div className="font-bold text-gray-900">{formatCurrency(totalIncome)}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Users className="w-4 h-4 text-blue-600 mr-2" />
              <div>
                <div className="text-sm text-gray-600">Tenants</div>
                <div className="font-bold text-gray-900">{tenantCount}</div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span>{property.details?.totalBedrooms || 0} bed</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.details?.totalBathrooms || 0} bath</span>
            </div>
            <div>
              <span>{property.details?.totalSquareFeet?.toLocaleString() || '0'} sq ft</span>
            </div>
          </div>

          {/* View Button */}
          <Link
            href={`/dashboard/properties/${property._id}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Property
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <PropertyDetailsModal
          property={property}
          onClose={() => setShowDetailsModal(false)}
          onUpdate={(updatedProperty) => {
            // Handle update in parent if needed
          }}
          onDelete={onDelete}
        />
      )}
    </>
  );
}