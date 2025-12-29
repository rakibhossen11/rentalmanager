'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
// import DashboardStats from '@/components/DashboardStats';
// import RecentActivity from '@/components/RecentActivity';
import QuickActions from '../components/QuickActions';
// import PropertiesOverview from '@/components/PropertiesOverview';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
    TrendingUp, 
    Users, 
    Building2, 
    CreditCard,
    Calendar,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    FileText,
    MessageSquare,
    Settings
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    const { user, updateUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, activitiesRes] = await Promise.all([
                fetch('/api/dashboard/stats'),
                fetch('/api/dashboard/activities?limit=5')
            ]);
            
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
                if (statsData.userStats) {
                    updateUser({ stats: statsData.userStats });
                }
            }
            
            if (activitiesRes.ok) {
                const activitiesData = await activitiesRes.json();
                setRecentActivities(activitiesData.activities || []);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = async (action) => {
        switch (action) {
            case 'addTenant':
                window.location.href = '/dashboard/tenants/new';
                break;
            case 'recordPayment':
                toast.success('Opening payment form...');
                break;
            case 'sendMessage':
                toast.success('Opening message composer...');
                break;
            case 'scheduleMaintenance':
                toast.success('Opening maintenance scheduler...');
                break;
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    // Calculate days until trial ends
    const daysUntilTrialEnd = user?.subscription?.trialEnds 
        ? Math.ceil((new Date(user.subscription.trialEnds) - new Date()) / (1000 * 60 * 60 * 24))
        : 0;

    const statCards = [
        {
            title: 'Monthly Revenue',
            value: `$${stats?.totalRevenue?.toLocaleString() || '0'}`,
            change: '+12.5%',
            trend: 'up',
            icon: DollarSign,
            color: 'green'
        },
        {
            title: 'Active Tenants',
            value: stats?.activeTenants || 0,
            change: '+3',
            trend: 'up',
            icon: Users,
            color: 'blue'
        },
        {
            title: 'Properties',
            value: stats?.totalProperties || 0,
            change: '+1',
            trend: 'up',
            icon: Building2,
            color: 'purple'
        },
        {
            title: 'Vacancy Rate',
            value: `${stats?.vacancyRate || 0}%`,
            change: '-2.1%',
            trend: 'down',
            icon: Building2,
            color: stats?.vacancyRate > 10 ? 'red' : 'green'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                            Welcome back, {user?.name}!
                        </h1>
                        <p className="text-blue-100">
                            Here's what's happening with your properties today.
                        </p>
                        
                        {user?.subscription?.plan === 'free' && daysUntilTrialEnd > 0 && (
                            <div className="mt-4 inline-flex items-center px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                <span className="text-sm">
                                    {daysUntilTrialEnd === 1 
                                        ? 'Trial ends tomorrow' 
                                        : `Trial ends in ${daysUntilTrialEnd} days`
                                    }
                                </span>
                                <Link 
                                    href="/pricing" 
                                    className="ml-4 text-sm font-medium bg-white text-blue-600 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Upgrade Now
                                </Link>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                        <div className="text-right">
                            <p className="text-blue-200">Today's Date</p>
                            <p className="text-xl font-bold">
                                {new Date().toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                        </div>
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
                            <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.trend === 'up' ? (
                                    <ArrowUpRight className="w-4 h-4 mr-1" />
                                ) : (
                                    <ArrowDownRight className="w-4 h-4 mr-1" />
                                )}
                                {stat.change}
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-gray-500 text-sm mt-1">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Stats */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{stats?.totalTenants || 0}</p>
                                <p className="text-sm text-gray-600">Total Tenants</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{stats?.activeTenants || 0}</p>
                                <p className="text-sm text-gray-600">Active</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{stats?.totalProperties || 0}</p>
                                <p className="text-sm text-gray-600">Properties</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">
                                    ${stats?.totalRevenue?.toLocaleString() || '0'}
                                </p>
                                <p className="text-sm text-gray-600">Monthly Revenue</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                            <Link 
                                href="/dashboard/activities" 
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                View all
                            </Link>
                        </div>
                        
                        {recentActivities.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivities.map((activity, index) => (
                                    <div key={index} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className={`p-2 rounded-lg mr-3 ${
                                            activity.type === 'tenant_added' ? 'bg-blue-100' :
                                            activity.type === 'payment_received' ? 'bg-green-100' :
                                            activity.type === 'maintenance_request' ? 'bg-yellow-100' :
                                            'bg-gray-100'
                                        }`}>
                                            {activity.type === 'tenant_added' && <Users className="w-4 h-4 text-blue-600" />}
                                            {activity.type === 'payment_received' && <CreditCard className="w-4 h-4 text-green-600" />}
                                            {activity.type === 'maintenance_request' && <Settings className="w-4 h-4 text-yellow-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{activity.title}</p>
                                            <p className="text-sm text-gray-600">{activity.description}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(activity.timestamp).toLocaleDateString()} at {' '}
                                                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <QuickActions onAction={handleQuickAction} />
                    
                    {/* Upcoming Rent Due */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Upcoming Rent Due</h3>
                            <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        <div className="space-y-4">
                            {stats?.upcomingRents?.length > 0 ? (
                                stats.upcomingRents.slice(0, 3).map((rent, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{rent.tenantName}</p>
                                            <p className="text-sm text-gray-500">{rent.propertyName || 'N/A'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">${rent.amount}</p>
                                            <p className="text-sm text-gray-500">{rent.dueDate}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No upcoming rent due</p>
                            )}
                            
                            {stats?.upcomingRents?.length > 3 && (
                                <Link 
                                    href="/dashboard/payments" 
                                    className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    View all {stats.upcomingRents.length} payments →
                                </Link>
                            )}
                        </div>
                    </div>
                    
                    {/* Maintenance Requests */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Open Maintenance</h3>
                            <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                                {stats?.openMaintenance || 0}
                            </div>
                        </div>
                        
                        {stats?.maintenanceRequests?.length > 0 ? (
                            <div className="space-y-3">
                                {stats.maintenanceRequests.map((request, index) => (
                                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">{request.title}</p>
                                                <p className="text-sm text-gray-500">{request.property}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                request.priority === 'high' 
                                                    ? 'bg-red-100 text-red-800'
                                                    : request.priority === 'medium'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {request.priority}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">{request.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No open maintenance requests</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}