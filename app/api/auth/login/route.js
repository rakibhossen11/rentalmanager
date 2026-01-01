// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { verifyPassword, createSession } from '@/app/lib/auth';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
    try {
        const { email, password } = await request.json();
        
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }
        
        const { db } = await connectToDatabase();
        
        // Find user
        const user = await db.collection('users').findOne({ 
            email: email.toLowerCase().trim()
        });
        
        console.log('Login attempt for:', email, 'User found:', !!user);
        
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }
        
        // Check account status
        if (user.status && user.status !== 'active') {
            return NextResponse.json(
                { 
                    error: `Account is ${user.status}. Please contact support.`,
                    accountStatus: user.status 
                },
                { status: 403 }
            );
        }
        
        // Verify password
        const passwordField = user.password_hash || user.password;
        if (!passwordField) {
            console.error('User has no password field:', user._id);
            return NextResponse.json(
                { error: 'Account configuration error' },
                { status: 500 }
            );
        }
        
        const isValidPassword = await verifyPassword(password, passwordField);
        if (!isValidPassword) {
            console.log('Invalid password for user:', user.email);
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }
        
        // Create session
        const sessionToken = await createSession(user._id.toString());
        
        // Update user stats
        await db.collection('users').updateOne(
            { _id: user._id },
            { 
                $set: {
                    last_login: new Date(),
                    updated_at: new Date()
                },
                $inc: { login_count: 1 }
            }
        );
        
        // Prepare user response
        const userResponse = {
            id: user._id.toString(),
            user_id: user._id.toString(),
            name: user.name || '',
            email: user.email,
            user_account_no: user.user_account_no || '',
            companyName: user.companyName || user.company_name || '',
            role: user.role || 'user',
            isAdmin: user.isAdmin || user.role === 'admin' || false,
            permissions: user.permissions || [],
            status: user.status || 'active',
            avatar: user.avatar || '',
            created_at: user.created_at,
            subscription: {
                plan: user.plan || user.subscription?.plan || 'free',
                trialEnds: user.trialEnds || user.subscription?.trialEnds,
                status: user.subscription?.status || 'active'
            }
        };
        
        return NextResponse.json({
            success: true,
            message: 'Login successful',
            user: userResponse,
            session: {
                token: sessionToken.substring(0, 10) + '...',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        
        return NextResponse.json(
            { 
                error: 'Login failed',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// import { NextResponse } from 'next/server';
// import { verifyPassword, createSession } from '@/app/lib/auth';
// import { connectToDatabase } from '@/app/lib/mongodb';
// import { ObjectId } from 'mongodb';

// export async function POST(request) {
//     try {
//         const { email, password } = await request.json();
        
//         if (!email || !password) {
//             return NextResponse.json(
//                 { error: 'Email and password are required' },
//                 { status: 400 }
//             );
//         }
        
//         const { db } = await connectToDatabase();
        
//         // Find user with proper field names (assuming password_hash is the field)
//         const user = await db.collection('users').findOne({ 
//             email: email.toLowerCase().trim()
//         });
        
//         console.log('Login attempt for:', email, 'User found:', !!user);
        
//         if (!user) {
//             return NextResponse.json(
//                 { error: 'Invalid email or password' },
//                 { status: 401 }
//             );
//         }
        
//         // Check if user account is active
//         if (user.status && user.status !== 'active') {
//             return NextResponse.json(
//                 { 
//                     error: `Account is ${user.status}. Please contact support.`,
//                     accountStatus: user.status 
//                 },
//                 { status: 403 }
//             );
//         }
        
//         // Verify password - assuming password is stored in 'password_hash' field
//         const passwordField = user.password_hash || user.password;
//         if (!passwordField) {
//             console.error('User has no password field:', user._id);
//             return NextResponse.json(
//                 { error: 'Account configuration error' },
//                 { status: 500 }
//             );
//         }
        
//         const isValidPassword = await verifyPassword(password, passwordField);
//         if (!isValidPassword) {
//             console.log('Invalid password for user:', user.email);
//             return NextResponse.json(
//                 { error: 'Invalid email or password' },
//                 { status: 401 }
//             );
//         }
        
//         console.log('Password verified for user:', user.email);
        
//         // Create session in database and set cookie
//         const sessionToken = await createSession(user._id.toString());
        
//         // Update user login stats
//         const updateData = {
//             last_login: new Date(),
//             updated_at: new Date(),
//             login_count: (user.login_count || 0) + 1,
//             current_session_id: sessionToken
//         };
        
//         await db.collection('users').updateOne(
//             { _id: user._id },
//             { $set: updateData }
//         );
        
//         // Prepare user data for response
//         const userResponse = {
//             id: user._id.toString(),
//             user_id: user._id.toString(),
//             name: user.name || '',
//             email: user.email,
//             user_account_no: user.user_account_no || '',
//             companyName: user.companyName || user.company_name || '',
//             role: user.role || 'user',
//             isAdmin: user.isAdmin || user.role === 'admin' || false,
//             permissions: user.permissions || [],
//             status: user.status || 'active',
//             avatar: user.avatar || '',
//             created_at: user.created_at,
//             subscription: {
//                 plan: user.plan || user.subscription?.plan || 'free',
//                 trialEnds: user.trialEnds || user.subscription?.trialEnds,
//                 status: user.subscription?.status || 'active'
//             },
//             stats: {
//                 login_count: (user.login_count || 0) + 1,
//                 last_login: new Date(),
//                 projects: user.stats?.projects || 0,
//                 storage_used: user.stats?.storage_used || 0
//             }
//         };
        
//         // Create response
//         const response = NextResponse.json({
//             success: true,
//             message: 'Login successful',
//             user: userResponse,
//             session: {
//                 token: sessionToken.substring(0, 10) + '...', // Partial for debugging
//                 expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
//             }
//         });
        
//         // Add security headers
//         response.headers.set('X-Content-Type-Options', 'nosniff');
//         response.headers.set('X-Frame-Options', 'DENY');
//         response.headers.set('X-XSS-Protection', '1; mode=block');
        
//         return response;
        
//     } catch (error) {
//         console.error('Login error:', error);
        
//         // Don't expose internal errors in production
//         const errorMessage = process.env.NODE_ENV === 'development' 
//             ? error.message 
//             : 'Login failed. Please try again.';
        
//         return NextResponse.json(
//             { 
//                 error: 'Login failed',
//                 details: process.env.NODE_ENV === 'development' ? error.message : undefined
//             },
//             { status: 500 }
//         );
//     }
// }

// // Optional: Add GET method to check login status (for pre-validation)
// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url);
//         const email = searchParams.get('email');
        
//         if (!email) {
//             return NextResponse.json(
//                 { error: 'Email parameter is required' },
//                 { status: 400 }
//             );
//         }
        
//         const { db } = await connectToDatabase();
        
//         const user = await db.collection('users').findOne(
//             { email: email.toLowerCase().trim() },
//             {
//                 projection: {
//                     _id: 1,
//                     email: 1,
//                     status: 1,
//                     name: 1,
//                     role: 1
//                 }
//             }
//         );
        
//         if (!user) {
//             return NextResponse.json({
//                 exists: false,
//                 message: 'User not found'
//             });
//         }
        
//         return NextResponse.json({
//             exists: true,
//             userId: user._id.toString(),
//             email: user.email,
//             name: user.name,
//             role: user.role,
//             status: user.status || 'active',
//             canLogin: user.status === 'active'
//         });
        
//     } catch (error) {
//         console.error('Login pre-check error:', error);
//         return NextResponse.json(
//             { error: 'Check failed' },
//             { status: 500 }
//         );
//     }
// }

// import { NextResponse } from 'next/server';
// import { verifyPassword, generateToken, setAuthCookie } from '@/app/lib/auth';
// import { connectToDatabase } from '@/app/lib/mongodb';

// export async function POST(request) {
//     try {
//         const { email, password } = await request.json();
        
//         if (!email || !password) {
//             return NextResponse.json(
//                 { error: 'Email and password are required' },
//                 { status: 400 }
//             );
//         }
        
//         const { db } = await connectToDatabase();
        
//         // Find user with password
//         const user = await db.collection('users').findOne({ 
//             email: email.toLowerCase() 
//         });
        
//         if (!user) {
//             return NextResponse.json(
//                 { error: 'Invalid credentials' },
//                 { status: 401 }
//             );
//         }
        
//         // Verify password
//         const isValidPassword = await verifyPassword(password, user.password);
//         if (!isValidPassword) {
//             return NextResponse.json(
//                 { error: 'Invalid credentials' },
//                 { status: 401 }
//             );
//         }
        
//         // Update last login
//         await db.collection('users').updateOne(
//             { _id: user._id },
//             { $set: { lastLogin: new Date(), updatedAt: new Date() } }
//         );
        
//         // Generate token
//         const token = generateToken(user._id.toString(), user._id.toString());
        
//         // Remove sensitive data
//         const { password: _, verificationToken, resetToken, ...userData } = user;
        
//         // Set cookie
//         const response = NextResponse.json({
//             success: true,
//             message: 'Login successful',
//             user: {
//                 id: user._id,
//                 email: user.email,
//                 name: user.name,
//                 companyName: user.companyName,
//                 plan: user.subscription.plan,
//                 trialEnds: user.subscription.trialEnds,
//                 avatar: user.avatar,
//                 stats: user.stats,
//                 role: user.role
//             }
//         });
        
//         setAuthCookie(response, token);
        
//         return response;
        
//     } catch (error) {
//         console.error('Login error:', error);
//         return NextResponse.json(
//             { error: 'Login failed', details: error.message },
//             { status: 500 }
//         );
//     }
// }