// app/context/AuthContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    // console.log(user);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Check user's authentication status
    const checkSession = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/auth/me');
            // console.log(res);
            
            if (res.ok) {
                const data = await res.json();
                // console.log(data);
                setUser(data.data);
                
                // Redirect logic based on user role and current path
                handleRoleBasedRedirect(data.user, pathname);
            } else {
                setUser(null);
                
                // If user is on protected route, redirect to login
                const protectedRoutes = ['/dashboard', '/admin/dashboard', '/admin'];
                if (protectedRoutes.some(route => pathname.startsWith(route))) {
                    router.push('/auth/login');
                }
            }
        } catch (error) {
            console.error('Session check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Handle role-based redirection
    const handleRoleBasedRedirect = (user, currentPath) => {
        if (!user) return;

        const isAdmin = user.role === 'admin' || user.isAdmin;
        const loginPath = '/auth/login';
        const dashboardPath = '/dashboard';
        const adminDashboardPath = '/admin/dashboard';

        // If user is on login page and already logged in, redirect based on role
        if (currentPath === loginPath) {
            if (isAdmin) {
                router.push(adminDashboardPath);
            } else {
                router.push(dashboardPath);
            }
            return;
        }

        // Prevent non-admin users from accessing admin routes
        if (!isAdmin && currentPath.startsWith('/admin')) {
            toast.error('Access denied. Admin privileges required.');
            router.push(dashboardPath);
            return;
        }

        // Prevent admin users from accessing regular user dashboard if they try to
        if (isAdmin && currentPath === dashboardPath) {
            router.push(adminDashboardPath);
            return;
        }

        // If admin is logged in but not on admin route, redirect to admin dashboard
        if (isAdmin && !currentPath.startsWith('/admin')) {
            router.push(adminDashboardPath);
        }
    };

    // Login function
    const login = async (email, password) => {
        // console.log(email, password);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            // console.log(data);

            if (res.ok && data.user) {
                setUser(data.user);
                toast.success(`Welcome back, ${data.user.name || 'User'}!`);

                // Determine redirect path based on role
                const isAdmin = data.user.role === 'admin' || data.user.isAdmin;
                const redirectPath = isAdmin ? '/admin/dashboard' : '/dashboard';
                
                router.push(redirectPath);
                return { success: true, user: data.user };
            } else {
                toast.error(data.error || 'Login failed');
                return { success: false, error: data.error };
            }
        } catch (error) {
            toast.error('Login failed. Please try again.');
            return { success: false, error: error.message };
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await res.json();

            if (res.ok && data.user) {
                setUser(data.user);
                toast.success('Account created successfully!');
                
                // New users typically aren't admins, redirect to regular dashboard
                router.push('/dashboard');
                return { success: true, user: data.user };
            } else {
                toast.error(data.error || 'Registration failed');
                return { success: false, error: data.error };
            }
        } catch (error) {
            toast.error('Registration failed. Please try again.');
            return { success: false, error: error.message };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            setUser(null);
            toast.success('Logged out successfully');
            router.push('/auth/login');
        }
    };

    // Check if user is admin
    const isAdmin = () => {
        return user && (user.role === 'admin' || user.isAdmin);
    };

    // Check if user has specific role
    const hasRole = (role) => {
        if (!user) return false;
        if (isAdmin()) return true; // Admins have all roles
        return user.role === role;
    };

    // Check if user has specific permission
    const hasPermission = (permission) => {
        if (!user) return false;
        if (isAdmin()) return true; // Admins have all permissions
        
        // Check user's permissions array
        if (user.permissions && Array.isArray(user.permissions)) {
            return user.permissions.includes('all') || user.permissions.includes(permission);
        }
        
        return false;
    };

    // Update user data
    const updateUser = (updates) => {
        if (!user) return;
        
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        
        // If role changed, redirect appropriately
        if (updates.role !== user.role || updates.isAdmin !== user.isAdmin) {
            handleRoleBasedRedirect(updatedUser, pathname);
        }
    };

    // Check authentication on initial load and route changes
    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (user) {
            handleRoleBasedRedirect(user, pathname);
        }
    }, [pathname, user]);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateUser,
            isAdmin: isAdmin(),
            hasRole,
            hasPermission,
            checkSession
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};