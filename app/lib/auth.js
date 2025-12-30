import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

// Hash password
export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(userId, companyId) {
    return jwt.sign(
        { 
            userId, 
            companyId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
        },
        JWT_SECRET
    );
}

// Verify JWT token
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// Set auth cookie
export function setAuthCookie(response, token) {
    // Using NextResponse.cookies API instead of setHeader
    response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });
}

// Set auth cookie
// export function setAuthCookie(res, token) {
//     res.setHeader('Set-Cookie', serialize('token', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 60 * 60 * 24 * 7,
//         path: '/',
//     }));
// }

// Clear auth cookie
export function clearAuthCookie(res) {
    res.setHeader('Set-Cookie', serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: -1,
        path: '/',
    }));
}

// Auth middleware for API routes
export async function requireAuth(req) {
    const token = req.cookies?.token || 
                  req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
        throw new Error('Authentication required');
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
        throw new Error('Invalid or expired token');
    }
    
    return decoded;
}

// Check if user exists
export async function getUserById(userId) {
    const { db } = await connectToDatabase();
    return db.collection('users').findOne({ _id: new ObjectId(userId) });
}

// Check if user exists by email
export async function getUserByEmail(email) {
    const { db } = await connectToDatabase();
    return db.collection('users').findOne({ email: email.toLowerCase() });
}