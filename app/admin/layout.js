'use client';

import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import { AdminRoute } from '../components/ProtectedRoute';

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <AdminRoute>
            <div className="min-h-screen bg-gray-50">
                <AdminNavbar 
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
                
                <div className="flex">
                    <AdminSidebar 
                        open={sidebarOpen}
                        setOpen={setSidebarOpen}
                    />
                    
                    <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
                        <div className="p-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AdminRoute>
    );
}