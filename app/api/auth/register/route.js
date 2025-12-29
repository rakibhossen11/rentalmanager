import { NextResponse } from 'next/server';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { connectToDatabase, ObjectId } from '@/lib/mongodb';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const { email, password, name, companyName } = await request.json();
        
        // Validate input
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }
        
        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }
        
        const { db } = await connectToDatabase();
        
        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ 
            email: email.toLowerCase() 
        });
        
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 409 }
            );
        }
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        // Trial ends date (14 days from now)
        const trialEnds = new Date();
        trialEnds.setDate(trialEnds.getDate() + 14);
        
        // Create user
        const user = {
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            companyName: companyName || `${name}'s Properties`,
            avatar: null,
            
            // Subscription
            subscription: {
                plan: 'free',
                status: 'trialing',
                trialEnds: trialEnds,
                currentPeriodEnd: null,
                stripeCustomerId: null,
                stripeSubscriptionId: null,
                cancelAtPeriodEnd: false
            },
            
            // Usage Limits
            limits: {
                tenants: 10,
                properties: 5,
                users: 1,
                storage: 100 // MB
            },
            
            // Settings
            settings: {
                currency: 'USD',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                notifications: {
                    email: true,
                    sms: false,
                    paymentReminders: true,
                    maintenanceAlerts: true
                }
            },
            
            // Stats
            stats: {
                totalTenants: 0,
                totalProperties: 0,
                totalRevenue: 0,
                activeLeases: 0
            },
            
            // Meta
            emailVerified: false,
            verificationToken,
            resetToken: null,
            resetTokenExpiry: null,
            
            // Timestamps
            lastLogin: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await db.collection('users').insertOne(user);
        const userId = result.insertedId;
        
        // Generate JWT token
        const token = generateToken(userId.toString(), userId.toString());
        
        // Set cookie
        const response = NextResponse.json({
            success: true,
            message: 'Registration successful',
            user: {
                id: userId,
                email: user.email,
                name: user.name,
                companyName: user.companyName,
                plan: user.subscription.plan,
                trialEnds: user.subscription.trialEnds,
                stats: user.stats
            }
        });
        
        setAuthCookie(response, token);
        
        return response;
        
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Registration failed', details: error.message },
            { status: 500 }
        );
    }
}