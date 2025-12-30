'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import DashboardNav from '@/components/DashboardNav';
import DashboardSidebar from '@/components/DashboardSidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function DashboardLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!user) {
        return null;
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50">
                <DashboardNav 
                    user={user} 
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
                
                <div className="flex">
                    <DashboardSidebar 
                        open={sidebarOpen} 
                        setOpen={setSidebarOpen}
                        user={user}
                    />
                    
                    <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
                        <div className="p-4 md:p-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </ErrorBoundary>
    );
}