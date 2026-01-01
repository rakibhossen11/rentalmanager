// app/lib/auth.js
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

// Password utilities
export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hashedPassword) {
    if (!password || !hashedPassword) {
        console.error('Missing password or hash for verification');
        return false;
    }
    return await bcrypt.compare(password, hashedPassword);
}

// Session management - UPDATED for async cookies()
export async function createSession(userId) {
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session
    
    const { db } = await connectToDatabase();
    
    try {
        // Insert session
        await db.collection('sessions').insertOne({
            session_id: sessionId,
            user_id: userId,
            expires_at: expiresAt,
            created_at: new Date(),
            ip_address: '', // You can add this from request headers
            user_agent: ''  // You can add this from request headers
        });
        
        // Get cookies store - IMPORTANT: cookies() is async in Server Components/Actions
        const cookieStore = await cookies(); // Use await here
        
        // Set cookie
        cookieStore.set('session_token', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: expiresAt,
            path: '/',
        });
        
        return sessionId;
    } catch (error) {
        console.error('Failed to create session:', error);
        throw new Error('Session creation failed');
    }
}

// Alternative method that accepts response object
export async function createSessionWithResponse(userId, response) {
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const { db } = await connectToDatabase();
    
    try {
        // Insert session
        await db.collection('sessions').insertOne({
            session_id: sessionId,
            user_id: userId,
            expires_at: expiresAt,
            created_at: new Date(),
        });
        
        // Set cookie on the response object
        response.cookies.set('session_token', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: expiresAt,
            path: '/',
        });
        
        return sessionId;
    } catch (error) {
        console.error('Failed to create session:', error);
        throw new Error('Session creation failed');
    }
}

// Get session - UPDATED
export async function getSession() {
    try {
        const cookieStore = await cookies(); // Use await here
        const sessionToken = cookieStore.get('session_token')?.value;
        
        if (!sessionToken) return null;

        const { db } = await connectToDatabase();
        
        // Find valid session
        const session = await db.collection('sessions').findOne({
            session_id: sessionToken,
            expires_at: { $gt: new Date() }
        });

        if (!session) {
            // Clean up expired session cookie
            cookieStore.delete('session_token');
            return null;
        }

        // Get user associated with session
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(session.user_id) },
            {
                projection: {
                    password_hash: 0, // Exclude password
                    reset_token: 0,
                    reset_token_expiry: 0
                }
            }
        );

        if (!user) {
            // User no longer exists, delete session
            await deleteSession(sessionToken);
            return null;
        }

        return {
            ...user,
            user_id: user._id.toString(),
            id: user._id.toString()
        };
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
}

// Delete session - UPDATED
export async function deleteSession(sessionId = null) {
    try {
        const cookieStore = await cookies(); // Use await here
        const tokenToDelete = sessionId || cookieStore.get('session_token')?.value;
        
        if (!tokenToDelete) return;

        const { db } = await connectToDatabase();
        
        // Delete session from database
        await db.collection('sessions').deleteOne({
            session_id: tokenToDelete
        });

        // Clear cookie
        cookieStore.delete('session_token');
    } catch (error) {
        console.error('Error deleting session:', error);
    }
}

// Alternative: JWT token generation
export function generateJWTToken(userId, userAccountNo) {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
        { 
            userId, 
            userAccountNo,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { algorithm: 'HS256' }
    );
}

// Cookie setter for JWT
export function setAuthCookie(response, token) {
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    
    response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expires,
        path: '/',
    });
}

// import { connectToDatabase } from './mongodb';
// import bcrypt from 'bcryptjs';
// import { v4 as uuidv4 } from 'uuid';
// import { cookies } from 'next/headers';
// import { ObjectId } from 'mongodb';

// const SESSION_EXPIRY_HOURS = 24;

// // Password hashing (same as before)
// export async function hashPassword(password) {
//   return await bcrypt.hash(password, 10);
// }

// export async function verifyPassword(password, hash) {
//   return await bcrypt.compare(password, hash);
// }

// // Session management for MongoDB
// export async function createSession(userId) {
//   const sessionId = uuidv4();
//   const expiresAt = new Date();
//   expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

//   const { db } = await connectToDatabase();
  
//   try {
//     // Insert session into sessions collection
//     await db.collection('sessions').insertOne({
//       session_id: sessionId,
//       user_id: userId,
//       expires_at: expiresAt,
//       created_at: new Date()
//     });

//     // Update user with current session (optional - for quick access)
//     await db.collection('users').updateOne(
//       { _id: new ObjectId(userId) },
//       { 
//         $set: { 
//           last_active: new Date(),
//           current_session_id: sessionId 
//         }
//       }
//     );

//     // Set cookie
//     cookies().set('session_token', sessionId, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       expires: expiresAt,
//       path: '/',
//     });

//     return sessionId;
//   } catch (error) {
//     console.error('Error creating session:', error);
//     throw error;
//   }
// }

// export async function getSession() {
//   try {
//     const sessionId = cookies().get('session_token')?.value;
//     if (!sessionId) return null;

//     const { db } = await connectToDatabase();
    
//     // Find valid session
//     const session = await db.collection('sessions').findOne({
//       session_id: sessionId,
//       expires_at: { $gt: new Date() }
//     });

//     if (!session) {
//       // Clean up expired session cookie
//       cookies().delete('session_token');
//       return null;
//     }

//     // Get user associated with session
//     const user = await db.collection('users').findOne(
//       { _id: new ObjectId(session.user_id) },
//       {
//         projection: {
//           password_hash: 0, // Exclude password
//           reset_token: 0,
//           reset_token_expiry: 0
//         }
//       }
//     );

//     if (!user) {
//       // User no longer exists, delete session
//       await deleteSession(sessionId);
//       return null;
//     }

//     // Update session expiry (optional - refresh on access)
//     const newExpiry = new Date();
//     newExpiry.setHours(newExpiry.getHours() + SESSION_EXPIRY_HOURS);
    
//     await db.collection('sessions').updateOne(
//       { session_id: sessionId },
//       { $set: { expires_at: newExpiry } }
//     );

//     // Update cookie expiry
//     cookies().set('session_token', sessionId, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       expires: newExpiry,
//       path: '/',
//     });

//     // Format user object with string ID
//     return {
//       ...user,
//       user_id: user._id.toString(),
//       id: user._id.toString()
//     };
//   } catch (error) {
//     console.error('Error getting session:', error);
//     return null;
//   }
// }

// export async function deleteSession(sessionId = null) {
//   try {
//     const tokenToDelete = sessionId || cookies().get('session_token')?.value;
    
//     if (!tokenToDelete) return;

//     const { db } = await connectToDatabase();
    
//     // Delete session from database
//     await db.collection('sessions').deleteOne({
//       session_id: tokenToDelete
//     });

//     // Clear cookie
//     cookies().delete('session_token');
//   } catch (error) {
//     console.error('Error deleting session:', error);
//   }
// }

// // Clean up expired sessions (can be run as a cron job)
// export async function cleanupExpiredSessions() {
//   try {
//     const { db } = await connectToDatabase();
    
//     const result = await db.collection('sessions').deleteMany({
//       expires_at: { $lt: new Date() }
//     });
    
//     console.log(`Cleaned up ${result.deletedCount} expired sessions`);
//     return result.deletedCount;
//   } catch (error) {
//     console.error('Error cleaning up sessions:', error);
//     return 0;
//   }
// }

// // Get user by ID (useful for API routes)
// export async function getUserById(userId) {
//   try {
//     const { db } = await connectToDatabase();
    
//     const user = await db.collection('users').findOne(
//       { _id: new ObjectId(userId) },
//       {
//         projection: {
//           password_hash: 0,
//           reset_token: 0,
//           reset_token_expiry: 0
//         }
//       }
//     );

//     if (user) {
//       return {
//         ...user,
//         user_id: user._id.toString(),
//         id: user._id.toString()
//       };
//     }
    
//     return null;
//   } catch (error) {
//     console.error('Error getting user by ID:', error);
//     return null;
//   }
// }

// // Optional: Verify user permissions
// export async function verifyUserPermission(userId, permission) {
//   try {
//     const user = await getUserById(userId);
    
//     if (!user) return false;
    
//     // Admin has all permissions
//     if (user.isAdmin || user.role === 'admin') return true;
    
//     // Check specific permissions array
//     if (user.permissions && user.permissions.includes('all')) return true;
    
//     return user.permissions && user.permissions.includes(permission);
//   } catch (error) {
//     console.error('Error verifying permission:', error);
//     return false;
//   }
// }


// // import jwt from 'jsonwebtoken';
// // import bcrypt from 'bcryptjs';
// // import { serialize } from 'cookie';
// // import { ObjectId } from 'mongodb';

// // const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// // const JWT_EXPIRY = '7d';

// // // Hash password
// // export async function hashPassword(password) {
// //     const salt = await bcrypt.genSalt(12);
// //     return bcrypt.hash(password, salt);
// // }

// // // Verify password
// // export async function verifyPassword(password, hashedPassword) {
// //     return bcrypt.compare(password, hashedPassword);
// // }

// // // Generate JWT token
// // export function generateToken(userId, companyId) {
// //     return jwt.sign(
// //         { 
// //             userId, 
// //             companyId,
// //             iat: Math.floor(Date.now() / 1000),
// //             exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
// //         },
// //         JWT_SECRET
// //     );
// // }

// // // Verify JWT token
// // export function verifyToken(token) {
// //     try {
// //         return jwt.verify(token, JWT_SECRET);
// //     } catch (error) {
// //         return null;
// //     }
// // }

// // // Set auth cookie
// // export function setAuthCookie(response, token) {
// //     // Using NextResponse.cookies API instead of setHeader
// //     response.cookies.set('token', token, {
// //         httpOnly: true,
// //         secure: process.env.NODE_ENV === 'production',
// //         sameSite: 'strict',
// //         maxAge: 60 * 60 * 24 * 7, // 1 week
// //         path: '/',
// //     });
// // }

// // // Set auth cookie
// // // export function setAuthCookie(res, token) {
// // //     res.setHeader('Set-Cookie', serialize('token', token, {
// // //         httpOnly: true,
// // //         secure: process.env.NODE_ENV === 'production',
// // //         sameSite: 'strict',
// // //         maxAge: 60 * 60 * 24 * 7,
// // //         path: '/',
// // //     }));
// // // }

// // // Clear auth cookie
// // export function clearAuthCookie(res) {
// //     res.setHeader('Set-Cookie', serialize('token', '', {
// //         httpOnly: true,
// //         secure: process.env.NODE_ENV === 'production',
// //         sameSite: 'strict',
// //         maxAge: -1,
// //         path: '/',
// //     }));
// // }

// // // Auth middleware for API routes
// // export async function requireAuth(req) {
// //     const token = req.cookies?.token || 
// //                   req.headers.get('authorization')?.replace('Bearer ', '');
    
// //     if (!token) {
// //         throw new Error('Authentication required');
// //     }
    
// //     const decoded = verifyToken(token);
// //     if (!decoded) {
// //         throw new Error('Invalid or expired token');
// //     }
    
// //     return decoded;
// // }

// // // Check if user exists
// // export async function getUserById(userId) {
// //     const { db } = await connectToDatabase();
// //     return db.collection('users').findOne({ _id: new ObjectId(userId) });
// // }

// // // Check if user exists by email
// // export async function getUserByEmail(email) {
// //     const { db } = await connectToDatabase();
// //     return db.collection('users').findOne({ email: email.toLowerCase() });
// // }