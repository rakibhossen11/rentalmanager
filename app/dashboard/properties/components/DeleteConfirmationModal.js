// app/components/DeleteConfirmationModal.jsx
'use client';

import { AlertTriangle, X, Trash2, Home } from 'lucide-react';

export default function DeleteConfirmationModal({
  property,
  onClose,
  onConfirm,
  loading = false
}) {
  const hasTenants = property?.tenants?.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <div 
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Delete Property</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
              <button
                onClick={onClose}
                className="ml-auto p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      {hasTenants ? 'Warning: This property has active tenants' : 'Are you sure you want to delete this property?'}
                    </p>
                    {hasTenants && (
                      <p className="text-sm text-red-700 mt-1">
                        Deleting will also remove all tenant records associated with this property.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Home className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">{property?.name}</h4>
                    <p className="text-sm text-gray-600">
                      {property?.address?.street}, {property?.address?.city}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Type</div>
                    <div className="font-medium capitalize">{property?.type}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Status</div>
                    <div className="font-medium capitalize">{property?.status?.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Monthly Income</div>
                    <div className="font-medium">
                      ${property?.financial?.totalMonthlyIncome?.toLocaleString() || 
                         property?.financial?.marketRent?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Tenants</div>
                    <div className="font-medium">{property?.tenants?.length || 0}</div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>All data including financial records, documents, and tenant information will be permanently deleted.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {hasTenants ? 'Delete with Tenants' : 'Delete Property'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}