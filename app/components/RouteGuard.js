'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import LoadingSpinner from './LoadingSpinner';

// Define public routes (no authentication required)
const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/pricing',
    '/features',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/first-time-setup'
];

// Define admin routes
const adminRoutes = [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/settings',
    '/admin/analytics',
    '/admin/reports'
];

// Define user routes
const userRoutes = [
    '/dashboard',
    '/dashboard/tenants',
    '/dashboard/properties',
    '/dashboard/payments',
    '/dashboard/profile',
    '/dashboard/settings'
];

export default function RouteGuard({ children }) {
    const { user, loading, isAdmin } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            const isPublicRoute = publicRoutes.some(route => 
                pathname === route || pathname.startsWith(`${route}/`)
            );
            
            const isAdminRoute = adminRoutes.some(route => 
                pathname === route || pathname.startsWith(`${route}/`)
            );
            
            const isUserRoute = userRoutes.some(route => 
                pathname === route || pathname.startsWith(`${route}/`)
            );

            // If route requires authentication but user is not logged in
            if (!isPublicRoute && !user) {
                router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
                return;
            }

            // If user is logged in but trying to access auth pages
            if (user && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
                router.push(isAdmin ? '/admin/dashboard' : '/dashboard');
                return;
            }

            // Check admin routes
            if (isAdminRoute && !isAdmin) {
                router.push('/unauthorized');
                return;
            }

            // Check user routes (ensure they're not trying to access admin routes)
            if (isUserRoute && isAdmin && !pathname.startsWith('/admin')) {
                // Admin can access user routes, but maybe redirect to admin dashboard
                if (pathname === '/dashboard') {
                    router.push('/admin/dashboard');
                }
            }
        }
    }, [user, loading, pathname, router, isAdmin]);

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return children;
}