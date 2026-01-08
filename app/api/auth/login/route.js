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