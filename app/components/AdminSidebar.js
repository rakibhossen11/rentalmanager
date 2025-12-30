'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard,
    Users,
    Building2,
    CreditCard,
    BarChart3,
    Settings,
    Shield,
    FileText,
    Database,
    Server,
    Bell,
    HelpCircle,
    LogOut
} from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function AdminSidebar({ open, setOpen }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const adminMenuItems = [
        {
            title: 'Dashboard',
            icon: LayoutDashboard,
            href: '/admin/dashboard',
            roles: ['admin']
        },
        {
            title: 'User Management',
            icon: Users,
            href: '/admin/users',
            roles: ['admin']
        },
        {
            title: 'Properties',
            icon: Building2,
            href: '/admin/properties',
            roles: ['admin']
        },
        {
            title: 'Billing & Payments',
            icon: CreditCard,
            href: '/admin/billing',
            roles: ['admin']
        },
        {
            title: 'Analytics',
            icon: BarChart3,
            href: '/admin/analytics',
            roles: ['admin']
        },
        {
            title: 'System Logs',
            icon: Database,
            href: '/admin/logs',
            roles: ['admin']
        },
        {
            title: 'Server Status',
            icon: Server,
            href: '/admin/server',
            roles: ['admin']
        },
        {
            title: 'Notifications',
            icon: Bell,
            href: '/admin/notifications',
            roles: ['admin']
        },
        {
            title: 'Settings',
            icon: Settings,
            href: '/admin/settings',
            roles: ['admin']
        },
        {
            title: 'Security',
            icon: Shield,
            href: '/admin/security',
            roles: ['admin']
        },
        {
            title: 'Documentation',
            icon: FileText,
            href: '/admin/docs',
            roles: ['admin']
        },
        {
            title: 'Support',
            icon: HelpCircle,
            href: '/admin/support',
            roles: ['admin']
        },
    ];

    return (
        <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform bg-gray-900 text-white ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex lg:flex-col lg:w-64`}>
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
                <Link href="/admin/dashboard" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl">Admin Panel</span>
                </Link>
                
                <button
                    onClick={() => setOpen(false)}
                    className="lg:hidden p-1 rounded-lg hover:bg-gray-800"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-2">
                    {adminMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-3 py-3 text-sm rounded-lg mb-1 transition-colors ${
                                    isActive 
                                        ? 'bg-blue-600 text-white font-medium' 
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom section */}
            <div className="border-t border-gray-800 p-4">
                <div className="space-y-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center px-3 py-2 text-sm rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        User Dashboard
                    </Link>
                    
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-3 py-2 text-sm rounded-lg text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
}