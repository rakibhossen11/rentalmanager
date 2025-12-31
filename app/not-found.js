// app/not-found.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  HomeIcon, 
  ArrowLeftIcon, 
  ExclamationTriangleIcon,
  WrenchIcon,
  HomeModernIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/dashboard');
    }
  }, [countdown, router]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
      router.push(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const suggestedPages = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Properties', href: '/properties', icon: HomeModernIcon },
    { name: 'Tenants', href: '/tenants', icon: WrenchIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header with Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <div className="inline-flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <HomeModernIcon className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-gray-900">
                  Rental<span className="text-blue-600">Manager</span>
                </h1>
                <p className="text-gray-500 text-sm">Professional Property Management</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Main Error Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 p-8 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/20 backdrop-blur-sm rounded-full">
              <ExclamationTriangleIcon className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-white mt-4">404</h1>
            <h2 className="text-2xl font-semibold text-white mt-2">Page Not Found</h2>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 space-y-8">
            {/* Error Message */}
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-600">
                We couldn't find the page you're looking for. It might have been moved, deleted, or doesn't exist.
              </p>
              
              {/* Countdown Timer */}
              <div className="inline-flex items-center space-x-4 bg-blue-50 rounded-full px-6 py-3">
                <div className="text-sm text-blue-800">
                  Redirecting in:
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {countdown}s
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for pages, properties, or tenants..."
                  className="w-full pl-12 pr-32 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-gray-700"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  Search
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              </form>
              <p className="text-center text-gray-500 text-sm mt-2">
                Try searching or use the navigation below
              </p>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 text-center">
                Quick Navigation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestedPages.map((page) => (
                  <Link
                    key={page.name}
                    href={page.href}
                    className="group p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 text-center"
                  >
                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                      <page.icon className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
                    </div>
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-700 text-lg">
                      {page.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-2">
                      Click to navigate
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={handleGoBack}
                className="flex-1 flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                Go Back
              </button>
              <Link
                href="/dashboard"
                className="flex-1 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl group"
              >
                <HomeIcon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                Back to Dashboard
              </Link>
            </div>

            {/* Support Section */}
            <div className="pt-8 border-t border-gray-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <PhoneIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Need Help?</h4>
                    <p className="text-sm text-gray-500">Our support team is here 24/7</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/support"
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Help Center
                  </Link>
                  <Link
                    href="/support/contact"
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Rental Manager • Error 404 • 
              {' '}<span className="font-medium text-gray-700">
                If this persists, clear your browser cache or{' '}
                <Link href="/support/report" className="text-blue-600 hover:underline">
                  report the issue
                </Link>
              </span>
            </p>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Common Issues</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check the URL for typos</li>
              <li>• Clear browser cache</li>
              <li>• Disable browser extensions</li>
            </ul>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">System Status</h4>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600">All Systems Operational</span>
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <Link href="/dashboard" className="block text-sm text-blue-600 hover:text-blue-800">
                Refresh Dashboard
              </Link>
              <Link href="/settings" className="block text-sm text-blue-600 hover:text-blue-800">
                Check Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}