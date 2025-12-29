'use client';

import { 
    Plus, 
    CreditCard, 
    MessageSquare, 
    Settings,
    Calendar,
    FileText,
    Download,
    Users,
    Building2
} from 'lucide-react';

export default function QuickActions({ onAction }) {
    const actions = [
        {
            id: 'addTenant',
            title: 'Add Tenant',
            description: 'Add a new tenant to your property',
            icon: Users,
            color: 'blue'
        },
        {
            id: 'recordPayment',
            title: 'Record Payment',
            description: 'Record rent or other payments',
            icon: CreditCard,
            color: 'green'
        },
        {
            id: 'sendMessage',
            title: 'Send Message',
            description: 'Message tenants or contractors',
            icon: MessageSquare,
            color: 'purple'
        },
        {
            id: 'scheduleMaintenance',
            title: 'Schedule Maintenance',
            description: 'Create maintenance request',
            icon: Settings,
            color: 'yellow'
        },
        {
            id: 'addProperty',
            title: 'Add Property',
            description: 'Add a new property to manage',
            icon: Building2,
            color: 'indigo'
        },
        {
            id: 'generateReport',
            title: 'Generate Report',
            description: 'Create financial or occupancy report',
            icon: FileText,
            color: 'pink'
        }
    ];

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-3">
                {actions.map((action) => {
                    const Icon = action.icon;
                    
                    return (
                        <button
                            key={action.id}
                            onClick={() => onAction(action.id)}
                            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left group"
                        >
                            <div className={`p-2 rounded-lg inline-flex mb-2 bg-${action.color}-100`}>
                                <Icon className={`w-5 h-5 text-${action.color}-600`} />
                            </div>
                            <p className="font-medium text-gray-900 text-sm">{action.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}