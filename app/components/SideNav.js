// app/components/SideNav.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  WalletIcon,
  CalendarIcon,
  ShieldCheckIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const SideNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && isMobile) {
      setMobileOpen(false);
    }
  }, [pathname, isMobile, mobileOpen]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileOpen && !event.target.closest('aside') && !event.target.closest('button[aria-label="Open menu"]')) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileOpen]);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'Overview and analytics'
    },
    {
      name: 'Users',
      href: '/users',
      icon: UsersIcon,
      description: 'Manage system users',
      count: 45
    },
    {
      name: 'Tenants',
      href: '/tenants',
      icon: BuildingOfficeIcon,
      description: 'Tenant management',
      count: 128,
      badge: 'New'
    },
    {
      name: 'Properties',
      href: '/properties',
      icon: HomeModernIcon,
      description: 'Property listings',
      count: 24
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      description: 'Reports & insights'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      description: 'System configuration'
    }
  ];

  const secondaryItems = [
    {
      name: 'Notifications',
      href: '/notifications',
      icon: BellIcon,
      count: 3
    },
    {
      name: 'Support',
      href: '/support',
      icon: QuestionMarkCircleIcon,
      description: 'Get help'
    }
  ];

  const quickActions = [
    {
      name: 'Add Tenant',
      href: '/tenants/new',
      icon: UsersIcon,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Add Property',
      href: '/properties/new',
      icon: HomeModernIcon,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'Collect Rent',
      href: '/payments/collect',
      icon: WalletIcon,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      name: 'Maintenance',
      href: '/maintenance',
      icon: Cog6ToothIcon,
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    if (href === '') return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logging out...');
    router.push('/login');
  };

  const handleQuickAction = (href) => {
    router.push(href);
    if (isMobile) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile menu button - Improved positioning */}
      <button
        onClick={toggleMobileSidebar}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg"
      >
        {mobileOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative inset-y-0 left-0 z-40
          bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
          text-white
          transition-all duration-300 ease-in-out
          flex flex-col
          h-screen
          overflow-y-auto
          shadow-2xl
        `}
        aria-label="Sidebar navigation"
      >
        {/* Logo and Collapse Button */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-900">
          <Link 
            href="/dashboard" 
            className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg shadow-lg">
              <HomeModernIcon className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-xl font-bold truncate">RentalManager</h1>
                <p className="text-xs text-gray-400 truncate">Professional Admin</p>
              </div>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <UserCircleIcon className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Rakib Hossen</p>
                <p className="text-xs text-gray-400 truncate">rakib@example.com</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Optimized for collapsed state */}
        <div className="p-4 border-b border-gray-700">
          <h3 className={`
            text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3
            ${collapsed ? 'text-center' : ''}
            truncate
          `}>
            {collapsed ? 'Actions' : 'Quick Actions'}
          </h3>
          <div className={`grid ${collapsed ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-2'}`}>
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={() => handleQuickAction(action.href)}
                className={`
                  flex ${collapsed ? 'flex-col items-center justify-center p-2' : 'items-center justify-center p-2.5'} 
                  ${action.color} hover:shadow-lg rounded-lg transition-all duration-200
                  group focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
                `}
                title={action.name}
                aria-label={action.name}
              >
                <action.icon className={`${collapsed ? 'h-4 w-4' : 'h-5 w-5 mr-2'} text-white`} />
                {!collapsed && (
                  <span className="text-xs font-medium text-white truncate">
                    {action.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-1" aria-label="Main navigation">
          <h3 className={`
            text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3
            ${collapsed ? 'text-center' : ''}
          `}>
            {collapsed ? 'Menu' : 'Main Menu'}
          </h3>
          
          {navItems.map((item) => {
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && setMobileOpen(false)}
                className={`
                  flex items-center ${collapsed ? 'justify-center' : 'justify-between'} 
                  p-3 rounded-lg transition-all duration-200 group
                  ${active 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                    : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                  }
                  focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
                `}
                title={collapsed ? item.name : ''}
                aria-current={active ? 'page' : undefined}
              >
                <div className="flex items-center min-w-0">
                  <div className={`
                    ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                    flex-shrink-0
                  `}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  {!collapsed && (
                    <div className="ml-3 min-w-0">
                      <span className="font-medium truncate block">{item.name}</span>
                      {item.description && (
                        <span className="text-xs text-gray-400 truncate block">
                          {item.description}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {!collapsed && (
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {item.count !== undefined && (
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full min-w-[2rem] text-center
                        ${active ? 'bg-white text-indigo-600' : 'bg-gray-600 text-gray-300'}
                      `}>
                        {item.count}
                      </span>
                    )}
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-600 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Show count badge in collapsed state */}
                {collapsed && item.count !== undefined && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-xs rounded-full flex items-center justify-center">
                    {item.count > 9 ? '9+' : item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Secondary Navigation */}
        <div className="p-4 border-t border-gray-700 space-y-1">
          {secondaryItems.map((item) => {
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && setMobileOpen(false)}
                className={`
                  flex items-center ${collapsed ? 'justify-center' : 'justify-between'} 
                  p-3 rounded-lg transition-colors group relative
                  ${active 
                    ? 'bg-gray-700 text-white' 
                    : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                  }
                  focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
                `}
                title={collapsed ? item.name : ''}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <item.icon className="h-5 w-5" />
                    {item.count !== undefined && !collapsed && (
                      <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-xs rounded-full flex items-center justify-center">
                        {item.count}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </div>
                
                {!collapsed && item.count !== undefined && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                    {item.count}
                  </span>
                )}
                
                {/* Show count badge in collapsed state */}
                {collapsed && item.count !== undefined && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-xs rounded-full flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`
              flex items-center ${collapsed ? 'justify-center' : 'justify-between'} 
              w-full p-3 rounded-lg transition-colors mt-4
              hover:bg-red-900/30 text-gray-300 hover:text-red-400
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
            `}
            title={collapsed ? "Logout" : ""}
            aria-label="Logout"
          >
            <div className="flex items-center">
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              {!collapsed && (
                <span className="ml-3 font-medium">Logout</span>
              )}
            </div>
            {!collapsed && (
              <span className="text-xs text-gray-400">Ctrl+L</span>
            )}
          </button>
        </div>

        {/* System Status - Always visible but collapsed */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/30">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <span className="text-xs text-gray-400">System Status</span>
            )}
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              {!collapsed && (
                <span className="text-xs text-green-400">Online</span>
              )}
            </div>
          </div>
          {!collapsed && (
            <>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-400 h-1 rounded-full transition-all duration-500" 
                  style={{ width: '85%' }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2 truncate">Last updated: Just now</p>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default SideNav;