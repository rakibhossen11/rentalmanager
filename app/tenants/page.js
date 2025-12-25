'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, User, Phone, Mail, Calendar, FileText } from 'lucide-react';
import { getTenants } from '../lib/storage/localStorage';
import { useToast } from '../contexts/ToastContext';

export default function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const { showBackendToast } = useToast();

    useEffect(() => {
        setTenants(getTenants());
    }, []);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Tenants</h1>
                    <p className="text-gray-600">Manage your rental tenants</p>
                </div>
                <button
                    onClick={showBackendToast}
                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Tenant
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tenants.map((tenant) => (
                    <div key={tenant.id} className="bg-white rounded-xl shadow-md p-6 border">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800">{tenant.name}</h3>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-sm">{tenant.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{tenant.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">Lease Period:</span>
                                </div>
                                <span className="text-sm font-medium text-gray-800">
                                    {new Date(tenant.leaseStart).toLocaleDateString()} - {new Date(tenant.leaseEnd).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-sm text-gray-600">Rent Due Day:</span>
                                <span className="font-bold text-gray-800">Day {tenant.rentDueDay}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <Link
                                href={`/tenants/${tenant.id}`}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <FileText className="w-4 h-4" />
                                View Details
                            </Link>
                            <button
                                onClick={showBackendToast}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Record Payment
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}