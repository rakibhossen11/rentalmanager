'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import { 
    Users, 
    Building2, 
    CreditCard, 
    BarChart3, 
    TrendingUp,
    Activity,
    Shield,
    UserCheck,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalProperties: 0,
        totalRevenue: 0,
        recentSignups: [],
        systemHealth: 'healthy'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const fetchAdminStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            change: '+12%',
            icon: Users,
            color: 'blue'
        },
        {
            title: 'Active Users',
            value: stats.activeUsers,
            change: '+8%',
            icon: UserCheck,
            color: 'green'
        },
        {
            title: 'Properties',
            value: stats.totalProperties,
            change: '+15%',
            icon: Building2,
            color: 'purple'
        },
        {
            title: 'Monthly Revenue',
            value: `$${stats.totalRevenue?.toLocaleString() || '0'}`,
            change: '+22%',
            icon: CreditCard,
            color: 'orange'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {user?.name}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Administrator</span>
                </div>
            </div>

            {/* System Health */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold mb-2">System Status</h2>
                        <p className="text-blue-100">All systems operational</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="w-8 h-8" />
                        <span className="text-2xl font-bold">{stats.systemHealth === 'healthy' ? '🟢' : '🔴'}</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                            </div>
                            <div className="flex items-center text-sm text-green-600">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                {stat.change}
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-gray-500 text-sm mt-1">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Signups */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Signups</h3>
                    <div className="space-y-3">
                        {stats.recentSignups.length > 0 ? (
                            stats.recentSignups.map((signup, index) => (
                                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <Users className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{signup.name}</p>
                                            <p className="text-sm text-gray-500">{signup.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            signup.role === 'admin' 
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {signup.role}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">{signup.date}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No recent signups</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">Manage Users</p>
                                    <p className="text-sm text-gray-500">Add, edit, or remove users</p>
                                </div>
                            </div>
                            <span className="text-gray-400">→</span>
                        </button>
                        
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg mr-3">
                                    <BarChart3 className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">View Analytics</p>
                                    <p className="text-sm text-gray-500">System performance & metrics</p>
                                </div>
                            </div>
                            <span className="text-gray-400">→</span>
                        </button>
                        
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">System Settings</p>
                                    <p className="text-sm text-gray-500">Configure application settings</p>
                                </div>
                            </div>
                            <span className="text-gray-400">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}