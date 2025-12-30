import { NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/middleware/auth';
import { connectToDatabase, ObjectId } from '@/lib/mongodb';

// GET all users (Admin only)
export async function GET(request) {
    try {
        const { user } = await requireAdmin(request);
        
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const role = searchParams.get('role');
        const search = searchParams.get('search');
        
        const { db } = await connectToDatabase();
        
        // Build query
        const query = {};
        
        if (role && role !== 'all') {
            query.role = role;
        }
        
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Exclude current admin from list
        query._id = { $ne: new ObjectId(user._id) };
        
        // Get users with pagination
        const [users, total] = await Promise.all([
            db.collection('users')
                .find(query, { projection: { password: 0 } })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .toArray(),
            db.collection('users').countDocuments(query)
        ]);
        
        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Get users error:', error);
        
        if (error.message.includes('Authentication')) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
        
        if (error.message.includes('Admin access')) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// Create new user (Admin only)
export async function POST(request) {
    try {
        const { user: admin } = await requireAdmin(request);
        const userData = await request.json();
        
        const { db } = await connectToDatabase();
        
        // Validate email
        const existingUser = await db.collection('users').findOne({
            email: userData.email.toLowerCase()
        });
        
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }
        
        // Hash password
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(userData.password || 'password123', 12);
        
        // Create user
        const newUser = {
            email: userData.email.toLowerCase(),
            password: hashedPassword,
            name: userData.name,
            companyName: userData.companyName,
            role: userData.role || 'user',
            isAdmin: userData.role === 'admin',
            permissions: userData.permissions || [],
            subscription: {
                plan: userData.plan || 'free',
                status: 'active'
            },
            createdBy: new ObjectId(admin._id),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await db.collection('users').insertOne(newUser);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = newUser;
        
        return NextResponse.json({
            success: true,
            message: 'User created successfully',
            user: {
                id: result.insertedId,
                ...userWithoutPassword
            }
        });
        
    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}