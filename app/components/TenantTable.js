'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
    MoreVertical, 
    Eye, 
    Edit, 
    Trash2, 
    Mail, 
    Phone,
    Calendar,
    DollarSign,
    MapPin,
    Building2,
    FileText,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TenantTable({ tenants, onDelete, onEdit }) {
    const [showActions, setShowActions] = useState(null);
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };
    
    const formatCurrency = (amount) => {
        if (!amount) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };
    
    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            inactive: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            past: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
            pending: { color: 'bg-blue-100 text-blue-800', icon: Clock },
            evicted: { color: 'bg-red-100 text-red-800', icon: XCircle },
            deleted: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
        };
        
        const config = statusConfig[status] || statusConfig.inactive;
        const Icon = config.icon;
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tenant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lease Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tenants.map((tenant) => (
                        <tr key={tenant._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-medium">
                                            {tenant.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {tenant.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {tenant.email}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                        {tenant.phone || 'N/A'}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                        {formatDate(tenant.leaseStart)} - {formatDate(tenant.leaseEnd)}
                                    </div>
                                    {tenant.address && (
                                        <div className="flex items-center mt-1">
                                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-500 truncate max-w-xs">
                                                {tenant.address}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                        {formatCurrency(tenant.rentAmount)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Due on day {tenant.rentDueDay || 1}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(tenant.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                    <Link
                                        href={`/dashboard/tenants/${tenant._id}`}
                                        className="text-blue-600 hover:text-blue-900 p-1"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => onEdit(tenant)}
                                        className="text-green-600 hover:text-green-900 p-1"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(tenant._id)}
                                        className="text-red-600 hover:text-red-900 p-1"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}