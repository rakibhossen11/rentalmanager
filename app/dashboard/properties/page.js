'use client';

import { useState, useEffect } from 'react';
import { Plus, Home, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const { showBackendToast } = useToast();

  useEffect(() => {
    setProperties(getProperties());
  }, []);

  const statusColors = {
    occupied: 'bg-green-100 text-green-800',
    vacant: 'bg-gray-100 text-gray-800',
    maintenance: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Properties</h1>
          <p className="text-gray-600">Manage your rental properties</p>
        </div>
        <button
          onClick={showBackendToast}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-xl shadow-md overflow-hidden border">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[property.status]}`}>
                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{property.name}</h3>
              <p className="text-gray-600 mb-4">{property.address}</p>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500">Monthly Rent</p>
                  <p className="text-2xl font-bold text-gray-800">${property.rentAmount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="text-xl font-bold text-gray-800">{property.bedrooms}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={showBackendToast}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={showBackendToast}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}