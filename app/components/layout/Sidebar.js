'use client';

import { Home, Building, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/properties', label: 'Properties', icon: Building },
  { path: '/tenants', label: 'Tenants', icon: Users },
  { path: '/payments', label: 'Payments', icon: DollarSign },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-600">🏠 Rental Manager</h1>
        <p className="text-sm text-gray-500 mt-1">Client-Side Demo</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="px-4 py-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700 font-medium">💡 Local Mode</p>
          <p className="text-xs text-yellow-600 mt-1">Data stored in browser</p>
        </div>
      </div>
    </aside>
  );
}