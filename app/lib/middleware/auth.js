import { verifyToken } from '../auth';
import { connectToDatabase, ObjectId } from '../mongodb';

// Middleware to require authentication
export async function requireAuth(req) {
    try {
        const token = req.cookies?.token || 
                      req.headers.get('authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error('Authentication required');
        }
        
        const decoded = verifyToken(token);
        if (!decoded) {
            throw new Error('Invalid or expired token');
        }
        
        // Get user from database
        const { db } = await connectToDatabase();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(decoded.userId) },
            { projection: { password: 0 } }
        );
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return { user, token: decoded };
    } catch (error) {
        throw error;
    }
}

// Middleware to require admin role
export async function requireAdmin(req) {
    const { user } = await requireAuth(req);
    
    if (!user.isAdmin && user.role !== 'admin') {
        throw new Error('Admin access required');
    }
    
    return { user };
}

// Middleware to require specific role
export async function requireRole(req, requiredRole) {
    const { user } = await requireAuth(req);
    
    if (!user.isAdmin && user.role !== requiredRole) {
        throw new Error(`Role "${requiredRole}" required`);
    }
    
    return { user };
}

// Middleware to require specific permission
export async function requirePermission(req, permission) {
    const { user } = await requireAuth(req);
    
    if (user.isAdmin) {
        return { user };
    }
    
    if (!user.permissions || !user.permissions.includes(permission)) {
        throw new Error(`Permission "${permission}" required`);
    }
    
    return { user };
}