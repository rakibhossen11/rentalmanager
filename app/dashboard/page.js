'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import QuickActions from '../components/QuickActions';
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
    Home,
    Bell,
    Wrench,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    const { user, updateUser } = useAuth();
    console.log('in dashboard page',user);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const [statsRes, activitiesRes] = await Promise.all([
                fetch('/api/dashboard/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }),
                fetch('/api/dashboard/activities?limit=5', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            ]);
            
            if (!statsRes.ok) {
                throw new Error('Failed to fetch stats');
            }
            
            if (!activitiesRes.ok) {
                throw new Error('Failed to fetch activities');
            }
            
            const statsData = await statsRes.json();
            const activitiesData = await activitiesRes.json();
            
            setStats(statsData);
            setRecentActivities(activitiesData.activities || []);
            
            // Update user stats if available
            if (statsData.userStats) {
                updateUser({ stats: statsData.userStats });
            }
            
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard data. Please try again.');
            
            // Set default fallback data
            setStats({
                totalRevenue: 0,
                activeTenants: 0,
                totalProperties: 0,
                vacancyRate: 0,
                totalTenants: 0,
                upcomingRents: [],
                openMaintenance: 0,
                maintenanceRequests: []
            });
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = async (action) => {
        switch (action) {
            case 'addProperty':
                window.location.href = '/dashboard/properties/new';
                break;
            case 'addTenant':
                window.location.href = '/dashboard/tenants/new';
                break;
            case 'recordPayment':
                window.location.href = '/dashboard/payments/record';
                break;
            case 'sendMessage':
                window.location.href = '/dashboard/messages/compose';
                break;
            case 'scheduleMaintenance':
                window.location.href = '/dashboard/maintenance/new';
                break;
            case 'generateReport':
                toast.success('Generating report...');
                break;
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'tenant_added':
                return <Users className="w-4 h-4" />;
            case 'payment_received':
                return <CreditCard className="w-4 h-4" />;
            case 'maintenance_request':
                return <Wrench className="w-4 h-4" />;
            case 'property_added':
                return <Home className="w-4 h-4" />;
            case 'message_received':
                return <Bell className="w-4 h-4" />;
            default:
                return <CheckCircle className="w-4 h-4" />;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'tenant_added':
                return 'blue';
            case 'payment_received':
                return 'green';
            case 'maintenance_request':
                return 'yellow';
            case 'property_added':
                return 'purple';
            case 'message_received':
                return 'indigo';
            default:
                return 'gray';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
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
            color: 'green',
            subtitle: 'From all properties'
        },
        {
            title: 'Active Tenants',
            value: stats?.activeTenants || 0,
            change: '+3',
            trend: 'up',
            icon: Users,
            color: 'blue',
            subtitle: 'Out of ' + (stats?.totalTenants || 0)
        },
        {
            title: 'Properties',
            value: stats?.totalProperties || 0,
            change: '+1',
            trend: 'up',
            icon: Building2,
            color: 'purple',
            subtitle: 'Managed'
        },
        {
            title: 'Vacancy Rate',
            value: `${stats?.vacancyRate || 0}%`,
            change: '-2.1%',
            trend: 'down',
            icon: Home,
            color: stats?.vacancyRate > 10 ? 'red' : 'green',
            subtitle: 'Available units'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Banner with Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <nav className="flex mb-2" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                                    <Home className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <span className="mx-2 text-gray-400">/</span>
                                    <span className="text-sm font-medium text-gray-500">Overview</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                    
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-600">Welcome back, {user?.name || 'User'}! Here's your property management summary.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchDashboardData}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Refresh
                    </button>
                    <Link 
                        href="/dashboard/settings"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        Settings
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
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
                        <p className="text-gray-900 font-medium">{stat.title}</p>
                        <p className="text-gray-500 text-sm mt-1">{stat.subtitle}</p>
                    </div>
                ))}
            </div>

            {/* Trial Warning Banner */}
            {user?.subscription?.plan === 'free' && daysUntilTrialEnd > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-amber-600 mr-3" />
                            <div>
                                <h3 className="font-semibold text-amber-800">
                                    {daysUntilTrialEnd === 1 
                                        ? 'Your trial ends tomorrow!' 
                                        : `Your trial ends in ${daysUntilTrialEnd} days`
                                    }
                                </h3>
                                <p className="text-amber-700 text-sm">
                                    Upgrade to continue accessing all premium features.
                                </p>
                            </div>
                        </div>
                        <Link 
                            href="/pricing" 
                            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            Upgrade Now
                        </Link>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Stats Summary */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Property Summary</h2>
                            <Link 
                                href="/dashboard/properties" 
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                View Details →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{stats?.totalProperties || 0}</p>
                                <p className="text-sm text-gray-600">Total Properties</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{stats?.occupiedUnits || 0}</p>
                                <p className="text-sm text-gray-600">Occupied Units</p>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{stats?.vacantUnits || 0}</p>
                                <p className="text-sm text-gray-600">Vacant Units</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">
                                    ${stats?.totalRevenue?.toLocaleString() || '0'}
                                </p>
                                <p className="text-sm text-gray-600">Monthly Revenue</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                            <Link 
                                href="/dashboard/activities" 
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                View all →
                            </Link>
                        </div>
                        
                        {recentActivities.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivities.map((activity, index) => {
                                    const color = getActivityColor(activity.type);
                                    return (
                                        <div key={index} className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors group">
                                            <div className={`p-2 rounded-lg mr-4 bg-${color}-100`}>
                                                <div className={`text-${color}-600`}>
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900 truncate">{activity.title}</p>
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{activity.description}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">
                                                        {new Date(activity.timestamp).toLocaleTimeString([], { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(activity.timestamp).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No recent activity to display</p>
                                <p className="text-sm text-gray-400 mt-1">Activities will appear here as they happen</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                    <QuickActions onAction={handleQuickAction} />
                    
                    {/* Upcoming Rent Due */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-gray-900">Upcoming Rent Due</h3>
                            <Link 
                                href="/dashboard/payments" 
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                View all
                            </Link>
                        </div>
                        
                        <div className="space-y-4">
                            {stats?.upcomingRents?.length > 0 ? (
                                stats.upcomingRents.slice(0, 4).map((rent, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                                <DollarSign className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{rent.tenantName}</p>
                                                <p className="text-sm text-gray-500">{rent.propertyName || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">${rent.amount}</p>
                                            <p className="text-sm text-gray-500">{rent.dueDate}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500">No upcoming rent due</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Maintenance Requests */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-gray-900">Maintenance Requests</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    {stats?.openMaintenance || 0} open
                                </span>
                                <Link 
                                    href="/dashboard/maintenance" 
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                >
                                    View all
                                </Link>
                            </div>
                        </div>
                        
                        {stats?.maintenanceRequests?.length > 0 ? (
                            <div className="space-y-4">
                                {stats.maintenanceRequests.map((request, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-medium text-gray-900 line-clamp-1">{request.title}</p>
                                            <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                                                request.priority === 'high' 
                                                    ? 'bg-red-100 text-red-800'
                                                    : request.priority === 'medium'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {request.priority}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{request.description}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{request.property}</span>
                                            <span>{request.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-2" />
                                <p className="text-gray-500">No open maintenance requests</p>
                                <p className="text-sm text-gray-400 mt-1">All caught up!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}