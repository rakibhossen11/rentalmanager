'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
    Menu, 
    Bell, 
    Search, 
    User,
    Settings,
    HelpCircle
} from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function AdminNavbar({ sidebarOpen, setSidebarOpen }) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { user } = useAuth();

    const notifications = [
        { id: 1, text: 'New user registration', time: '5 min ago', type: 'user' },
        { id: 2, text: 'System backup completed', time: '1 hour ago', type: 'system' },
        { id: 3, text: 'High server load detected', time: '2 hours ago', type: 'alert' },
    ];

    return (
        <nav className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
                {/* Left side */}
                <div className="flex items-center">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    
                    <div className="ml-4 flex items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search admin panel..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 rounded-lg hover:bg-gray-100 relative"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        
                        {showNotifications && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold">Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map((notification) => (
                                            <div key={notification.id} className="p-4 hover:bg-gray-50 border-b last:border-b-0">
                                                <div className="flex items-start">
                                                    <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                                                        notification.type === 'alert' ? 'bg-red-500' :
                                                        notification.type === 'system' ? 'bg-blue-500' :
                                                        'bg-green-500'
                                                    }`}></div>
                                                    <div>
                                                        <p className="text-sm">{notification.text}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t">
                                        <Link 
                                            href="/admin/notifications" 
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            View all notifications
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Help */}
                    <Link
                        href="/admin/support"
                        className="p-2 rounded-lg hover:bg-gray-100"
                        title="Help & Support"
                    >
                        <HelpCircle className="w-5 h-5" />
                    </Link>

                    {/* Settings */}
                    <Link
                        href="/admin/settings"
                        className="p-2 rounded-lg hover:bg-gray-100"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </Link>

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium">{user?.name}</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                        </button>

                        {showUserMenu && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                    <div className="p-4 border-b">
                                        <p className="font-semibold">{user?.name}</p>
                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                        <div className="mt-1">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <User className="w-3 h-3 mr-1" />
                                                Admin
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <Link
                                            href="/admin/profile"
                                            className="flex items-center px-3 py-2 text-sm rounded hover:bg-gray-100"
                                        >
                                            <User className="w-4 h-4 mr-2" />
                                            Profile
                                        </Link>
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center px-3 py-2 text-sm rounded hover:bg-gray-100"
                                        >
                                            <LayoutDashboard className="w-4 h-4 mr-2" />
                                            User Dashboard
                                        </Link>
                                        <Link
                                            href="/admin/settings"
                                            className="flex items-center px-3 py-2 text-sm rounded hover:bg-gray-100"
                                        >
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </Link>
                                        <div className="border-t my-2"></div>
                                        <button
                                            onClick={() => {
                                                fetch('/api/auth/logout', { method: 'POST' });
                                                window.location.href = '/auth/login';
                                            }}
                                            className="flex items-center w-full px-3 py-2 text-sm rounded hover:bg-gray-100 text-red-600"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}