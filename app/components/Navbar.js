'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { 
    Menu, 
    X, 
    Building2, 
    User, 
    ChevronDown,
    Home,
    Users,
    CreditCard,
    Settings,
    HelpCircle,
    LogOut,
    BarChart3,
    FileText,
    Calendar,
    MessageSquare,
    Bell,
    Search
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    const pathname = usePathname();
    const { user, logout } = useAuth();
    
    const isDashboard = pathname?.startsWith('/dashboard');
    const isAuthPage = pathname?.startsWith('/auth');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
    };

    // Marketing navigation (for non-dashboard pages)
    const marketingNav = [
        { name: 'Features', href: '/#features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Testimonials', href: '/#testimonials' },
        { name: 'FAQ', href: '/#faq' },
        { name: 'Contact', href: '/contact' },
    ];

    // Dashboard navigation
    const dashboardNav = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Tenants', href: '/dashboard/tenants', icon: Users },
        { name: 'Properties', href: '/dashboard/properties', icon: Building2 },
        { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
        { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
        { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
        { name: 'Documents', href: '/dashboard/documents', icon: FileText },
    ];

    if (isDashboard || isAuthPage) {
        return null; // Don't show navbar on dashboard/auth pages
    }

    return (
        <>
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled 
                    ? 'bg-white/90 backdrop-blur-md shadow-lg' 
                    : 'bg-white'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-xl text-gray-900">RentalPro</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                    PRO
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {marketingNav.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-700">
                                            {user.name}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>

                                    {userMenuOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-10"
                                                onClick={() => setUserMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                                <div className="p-4 border-b">
                                                    <p className="font-semibold text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                    <p className="text-xs text-gray-400 mt-1 capitalize">
                                                        {user.subscription?.plan} Plan
                                                    </p>
                                                </div>
                                                <div className="p-2">
                                                    <Link
                                                        href="/dashboard"
                                                        className="flex items-center px-3 py-2 text-sm rounded hover:bg-gray-100"
                                                    >
                                                        <Home className="w-4 h-4 mr-2 text-gray-400" />
                                                        Dashboard
                                                    </Link>
                                                    <Link
                                                        href="/dashboard/profile"
                                                        className="flex items-center px-3 py-2 text-sm rounded hover:bg-gray-100"
                                                    >
                                                        <User className="w-4 h-4 mr-2 text-gray-400" />
                                                        Profile
                                                    </Link>
                                                    <Link
                                                        href="/dashboard/settings"
                                                        className="flex items-center px-3 py-2 text-sm rounded hover:bg-gray-100"
                                                    >
                                                        <Settings className="w-4 h-4 mr-2 text-gray-400" />
                                                        Settings
                                                    </Link>
                                                    <Link
                                                        href="/help"
                                                        className="flex items-center px-3 py-2 text-sm rounded hover:bg-gray-100"
                                                    >
                                                        <HelpCircle className="w-4 h-4 mr-2 text-gray-400" />
                                                        Help & Support
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center w-full px-3 py-2 text-sm rounded hover:bg-gray-100 text-red-600 mt-2"
                                                    >
                                                        <LogOut className="w-4 h-4 mr-2" />
                                                        Logout
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-sm"
                                    >
                                        Get Started Free
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200">
                        <div className="px-4 py-6 space-y-4">
                            {marketingNav.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            
                            <div className="pt-4 border-t border-gray-200 space-y-3">
                                {user ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left py-2 text-red-600 hover:text-red-700 transition-colors font-medium"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/auth/login"
                                            className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Sign in
                                        </Link>
                                        <Link
                                            href="/auth/register"
                                            className="block py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-center font-medium"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Get Started Free
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Spacer for fixed navbar */}
            <div className="h-16"></div>
        </>
    );
}