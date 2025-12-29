'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            
            if (res.ok) {
                setUser(data.user);
                toast.success('Welcome back!');
                router.push('/dashboard');
                return { success: true };
            } else {
                toast.error(data.error || 'Login failed');
                return { success: false, error: data.error };
            }
        } catch (error) {
            toast.error('Login failed. Please try again.');
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await res.json();
            
            if (res.ok) {
                setUser(data.user);
                toast.success('Account created successfully!');
                router.push('/dashboard');
                return { success: true };
            } else {
                toast.error(data.error || 'Registration failed');
                return { success: false, error: data.error };
            }
        } catch (error) {
            toast.error('Registration failed. Please try again.');
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            toast.success('Logged out successfully');
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const updateUser = (updates) => {
        setUser(prev => ({ ...prev, ...updates }));
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateUser,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);