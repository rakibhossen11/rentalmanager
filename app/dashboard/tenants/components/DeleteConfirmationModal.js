// app/dashboard/tenants/components/DeleteConfirmationModal.jsx
'use client';

import { X, AlertTriangle, User } from 'lucide-react';

export default function DeleteConfirmationModal({ tenant, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-lg w-full max-w-md z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Tenant</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-red-100 rounded flex items-center justify-center">
                <User className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-800">
                  {tenant?.personalInfo?.fullName}
                </p>
                <p className="text-sm text-red-600">
                  {tenant?.property?.name || 'No Property'} • {tenant.unit || 'No Unit'}
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this tenant? This will permanently remove all their data including:
          </p>
          
          <ul className="space-y-2 mb-6 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-gray-400 rounded-full"></div>
              Personal information and contact details
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-gray-400 rounded-full"></div>
              Lease history and payment records
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-gray-400 rounded-full"></div>
              All associated documents and files
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-gray-400 rounded-full"></div>
              Maintenance requests and communications
            </li>
          </ul>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Tenant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}