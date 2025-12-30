'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ 
    children, 
    requireAuth = true, 
    roles = [], 
    permissions = [],
    redirectTo = '/auth/login' 
}) {
    const { user, loading, isAdmin, hasRole, hasPermission } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            // Check authentication
            if (requireAuth && !user) {
                router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
                return;
            }

            // Check roles
            if (roles.length > 0 && user) {
                const hasRequiredRole = roles.some(role => 
                    isAdmin || hasRole(role) || role === 'any'
                );
                
                if (!hasRequiredRole) {
                    router.push('/unauthorized');
                    return;
                }
            }

            // Check permissions
            if (permissions.length > 0 && user) {
                const hasRequiredPermission = permissions.some(permission => 
                    isAdmin || hasPermission(permission)
                );
                
                if (!hasRequiredPermission) {
                    router.push('/unauthorized');
                    return;
                }
            }
        }
    }, [user, loading, pathname, requireAuth, roles, permissions, router, isAdmin, hasRole, hasPermission]);

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (requireAuth && !user) {
        return null;
    }

    // Check authorization after loading
    if (roles.length > 0 && user) {
        const hasRequiredRole = roles.some(role => 
            isAdmin || hasRole(role) || role === 'any'
        );
        
        if (!hasRequiredRole) {
            return null;
        }
    }

    if (permissions.length > 0 && user) {
        const hasRequiredPermission = permissions.some(permission => 
            isAdmin || hasPermission(permission)
        );
        
        if (!hasRequiredPermission) {
            return null;
        }
    }

    return children;
}

// Quick helper components
export function UserRoute({ children }) {
    return (
        <ProtectedRoute roles={['user', 'admin']}>
            {children}
        </ProtectedRoute>
    );
}

export function AdminRoute({ children }) {
    return (
        <ProtectedRoute roles={['admin']}>
            {children}
        </ProtectedRoute>
    );
}

export function GuestRoute({ children }) {
    return (
        <ProtectedRoute requireAuth={false}>
            {children}
        </ProtectedRoute>
    );
}