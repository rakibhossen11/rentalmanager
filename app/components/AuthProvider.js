'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, []);

    // Check authentication status
    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setIsAdmin(data.user?.role === 'admin' || data.user?.isAdmin);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Login function
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
                console.log(data.user);
                setIsAdmin(data.user?.role === 'admin' || data.user?.isAdmin);
                toast.success('Welcome back!');
                
                // Redirect based on role
                if (data.user?.role === 'admin' || data.user?.isAdmin) {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/dashboard');
                }
                
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

    // Register function
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
                setIsAdmin(false); // New users are not admins
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

    // Logout function
    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            setIsAdmin(false);
            toast.success('Logged out successfully');
            router.push('/auth/login');
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Logout failed');
        }
    };

    // Update user data
    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        setIsAdmin(updatedUser?.role === 'admin' || updatedUser?.isAdmin);
    };

    // Check if user has specific role
    const hasRole = (role) => {
        if (!user) return false;
        return user.role === role || user.isAdmin;
    };

    // Check if user has permission
    const hasPermission = (permission) => {
        if (!user) return false;
        if (user.isAdmin) return true;
        if (user.permissions && user.permissions.includes('all')) return true;
        return user.permissions && user.permissions.includes(permission);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAdmin,
            login,
            register,
            logout,
            updateUser,
            checkAuth,
            hasRole,
            hasPermission
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);


// 'use client';

// import { createContext, useContext, useState, useEffect } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import toast from 'react-hot-toast';


// const AuthContext = createContext({});

// export default function AuthProvider({ children }) {
//     const [user, setUser] = useState(null);
//     console.log(user);
//     const [loading, setLoading] = useState(true);
//     const router = useRouter();
//     const pathname = usePathname();

//     useEffect(() => {
//         checkAuth();
//     }, []);

//     const checkAuth = async () => {
//         try {
//             const res = await fetch('/api/auth/me');
//             if (res.ok) {
//                 const data = await res.json();
//                 setUser(data.user);
//             }
//         } catch (error) {
//             console.error('Auth check failed:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const login = async (email, password) => {
//         console.log(email, password);
//         try {
//             const res = await fetch('/api/auth/login', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email, password })
//             });

//             const data = await res.json();
            
//             if (res.ok) {
//                 setUser(data.user);
//                 toast.success('Welcome back!');
//                 router.push('/dashboard');
//                 return { success: true };
//             } else {
//                 toast.error(data.error || 'Login failed');
//                 return { success: false, error: data.error };
//             }
//         } catch (error) {
//             toast.error('Login failed. Please try again.');
//             return { success: false, error: error.message };
//         }
//     };

//     const register = async (userData) => {
//         try {
//             const res = await fetch('/api/auth/register', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(userData)
//             });

//             const data = await res.json();
            
//             if (res.ok) {
//                 setUser(data.user);
//                 toast.success('Account created successfully!');
//                 router.push('/dashboard');
//                 return { success: true };
//             } else {
//                 toast.error(data.error || 'Registration failed');
//                 return { success: false, error: data.error };
//             }
//         } catch (error) {
//             toast.error('Registration failed. Please try again.');
//             return { success: false, error: error.message };
//         }
//     };

//     const logout = async () => {
//         try {
//             await fetch('/api/auth/logout', { method: 'POST' });
//             setUser(null);
//             toast.success('Logged out successfully');
//             router.push('/');
//         } catch (error) {
//             console.error('Logout failed:', error);
//         }
//     };

//     const updateUser = (updates) => {
//         setUser(prev => ({ ...prev, ...updates }));
//     };

//     return (
//         <AuthContext.Provider value={{
//             user,
//             loading,
//             login,
//             register,
//             logout,
//             updateUser,
//             checkAuth
//         }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }

// export const useAuth = () => useContext(AuthContext);