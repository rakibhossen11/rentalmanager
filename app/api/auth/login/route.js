import { NextResponse } from 'next/server';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';

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
        
        // Find user with password
        const user = await db.collection('users').findOne({ 
            email: email.toLowerCase() 
        });
        
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }
        
        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }
        
        // Update last login
        await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { lastLogin: new Date(), updatedAt: new Date() } }
        );
        
        // Generate token
        const token = generateToken(user._id.toString(), user._id.toString());
        
        // Remove sensitive data
        const { password: _, verificationToken, resetToken, ...userData } = user;
        
        // Set cookie
        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                companyName: user.companyName,
                plan: user.subscription.plan,
                trialEnds: user.subscription.trialEnds,
                avatar: user.avatar,
                stats: user.stats
            }
        });
        
        setAuthCookie(response, token);
        
        return response;
        
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed', details: error.message },
            { status: 500 }
        );
    }
}