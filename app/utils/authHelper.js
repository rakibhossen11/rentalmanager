// utils/authHelper.js

// Check if admin is authenticated
export const checkAdminAuth = () => {
  try {
    const adminData = localStorage.getItem('adminData');
    const token = localStorage.getItem('adminToken');
    const expiry = localStorage.getItem('adminTokenExpiry');

    // If any required item is missing, return false
    if (!adminData || !token || !expiry) {
      return false;
    }

    // Check if token is expired
    const now = new Date().getTime();
    if (now > parseInt(expiry)) {
      // Token expired, clear storage
      clearAdminAuth();
      return false;
    }

    // Refresh token if it's about to expire (within 1 hour)
    const timeLeft = parseInt(expiry) - now;
    if (timeLeft < 60 * 60 * 1000) {
      refreshToken();
    }

    return JSON.parse(adminData);
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

// Set admin authentication data
export const setAdminAuth = (adminData, rememberMe = false) => {
  try {
    // Generate a mock token (replace with actual JWT from your backend)
    const token = generateMockToken();
    
    // Set expiry time: 24 hours for normal login, 7 days for "remember me"
    const expiryTime = rememberMe 
      ? (7 * 24 * 60 * 60 * 1000)  // 7 days
      : (24 * 60 * 60 * 1000);     // 24 hours
    
    const expiryDate = new Date().getTime() + expiryTime;

    // Store in localStorage
    localStorage.setItem('adminData', JSON.stringify(adminData));
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminTokenExpiry', expiryDate.toString());

    // Store in sessionStorage for additional security check
    if (rememberMe) {
      sessionStorage.setItem('adminSession', 'active');
    }

    return true;
  } catch (error) {
    console.error('Error setting auth:', error);
    return false;
  }
};

// Clear all admin authentication data
export const clearAdminAuth = () => {
  try {
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTokenExpiry');
    sessionStorage.removeItem('adminSession');
    
    // Clear any other admin-related data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('admin_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return true;
  } catch (error) {
    console.error('Error clearing auth:', error);
    return false;
  }
};

// Refresh token (extend expiry)
const refreshToken = () => {
  try {
    const expiry = localStorage.getItem('adminTokenExpiry');
    if (expiry) {
      // Extend by 24 hours
      const newExpiry = new Date().getTime() + (24 * 60 * 60 * 1000);
      localStorage.setItem('adminTokenExpiry', newExpiry.toString());
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Generate mock token (replace with actual JWT from your backend)
const generateMockToken = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `admin_token_${timestamp}_${random}`;
};

// Get current admin token
export const getAdminToken = () => {
  try {
    const token = localStorage.getItem('adminToken');
    const expiry = localStorage.getItem('adminTokenExpiry');
    
    if (!token || !expiry) {
      return null;
    }

    // Check if token is expired
    const now = new Date().getTime();
    if (now > parseInt(expiry)) {
      clearAdminAuth();
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Check if admin has specific role
export const hasRole = (requiredRole) => {
  try {
    const adminData = checkAdminAuth();
    if (!adminData) return false;
    
    // If admin is super admin, they have all roles
    if (adminData.role === 'super_admin') return true;
    
    return adminData.role === requiredRole;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

// Check if admin has any of the specified roles
export const hasAnyRole = (requiredRoles) => {
  try {
    const adminData = checkAdminAuth();
    if (!adminData) return false;
    
    // If admin is super admin, they have all roles
    if (adminData.role === 'super_admin') return true;
    
    return requiredRoles.includes(adminData.role);
  } catch (error) {
    console.error('Error checking roles:', error);
    return false;
  }
};

// Validate admin credentials (mock function - replace with actual API call)
export const validateAdminCredentials = async (email, password) => {
  // This is a mock validation. Replace with actual API call to your backend
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock admin data for demonstration
      const mockAdmins = [
        {
          id: 1,
          name: 'Super Admin',
          email: 'admin@example.com',
          password: 'admin123', // In real app, this should be hashed
          role: 'super_admin',
          avatar: null,
          permissions: ['all']
        },
        {
          id: 2,
          name: 'Content Manager',
          email: 'content@example.com',
          password: 'content123',
          role: 'content_manager',
          avatar: null,
          permissions: ['content', 'users']
        }
      ];

      const admin = mockAdmins.find(
        admin => admin.email === email && admin.password === password
      );

      if (admin) {
        // Remove password from returned object
        const { password, ...adminData } = admin;
        resolve(adminData);
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 1000); // Simulate API delay
  });
};

// Update admin profile data
export const updateAdminProfile = (updatedData) => {
  try {
    const currentAdminData = localStorage.getItem('adminData');
    if (!currentAdminData) {
      throw new Error('No admin data found');
    }

    const adminData = JSON.parse(currentAdminData);
    const updatedAdmin = { ...adminData, ...updatedData };
    
    localStorage.setItem('adminData', JSON.stringify(updatedAdmin));
    
    return updatedAdmin;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Get admin permissions
export const getAdminPermissions = () => {
  try {
    const adminData = checkAdminAuth();
    if (!adminData) return [];
    
    // Define permissions based on role (customize based on your needs)
    const rolePermissions = {
      'super_admin': ['all'],
      'admin': ['users', 'products', 'orders', 'reports'],
      'content_manager': ['products', 'content'],
      'moderator': ['users', 'comments']
    };
    
    return adminData.permissions || rolePermissions[adminData.role] || [];
  } catch (error) {
    console.error('Error getting permissions:', error);
    return [];
  }
};

// Check if admin has specific permission
export const hasPermission = (requiredPermission) => {
  try {
    const adminData = checkAdminAuth();
    if (!adminData) return false;
    
    // Super admin has all permissions
    if (adminData.role === 'super_admin') return true;
    
    const permissions = getAdminPermissions();
    
    // Check for 'all' permission
    if (permissions.includes('all')) return true;
    
    return permissions.includes(requiredPermission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// Auto logout setup for security
export const setupAutoLogout = (logoutCallback, timeoutMinutes = 30) => {
  let timeout;
  
  const resetTimer = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      clearAdminAuth();
      if (logoutCallback) logoutCallback();
    }, timeoutMinutes * 60 * 1000);
  };

  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  events.forEach(event => {
    window.addEventListener(event, resetTimer);
  });

  resetTimer();

  // Return cleanup function
  return () => {
    clearTimeout(timeout);
    events.forEach(event => {
      window.removeEventListener(event, resetTimer);
    });
  };
};

// Verify admin session on page load
export const verifySessionOnLoad = () => {
  const adminData = checkAdminAuth();
  
  if (!adminData) {
    // Redirect to login if not on login page
    if (!window.location.pathname.includes('/admin/login')) {
      window.location.href = '/admin/login';
    }
    return false;
  }
  
  return adminData;
};

// Export all functions
export default {
  checkAdminAuth,
  setAdminAuth,
  clearAdminAuth,
  getAdminToken,
  hasRole,
  hasAnyRole,
  validateAdminCredentials,
  updateAdminProfile,
  getAdminPermissions,
  hasPermission,
  setupAutoLogout,
  verifySessionOnLoad
};