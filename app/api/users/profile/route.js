import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { connectToDatabase, ObjectId } from '@/lib/mongodb';

export async function GET(request) {
    try {
        const { userId } = await requireAuth(request);
        
        const { db } = await connectToDatabase();
        
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0, verificationToken: 0, resetToken: 0 } }
        );
        
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                companyName: user.companyName,
                avatar: user.avatar,
                subscription: user.subscription,
                settings: user.settings,
                stats: user.stats,
                limits: user.limits,
                createdAt: user.createdAt
            }
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const { userId } = await requireAuth(request);
        const updates = await request.json();
        
        const { db } = await connectToDatabase();
        
        // Remove fields that shouldn't be updated
        delete updates._id;
        delete updates.password;
        delete updates.email;
        delete updates.subscription;
        delete updates.stats;
        
        const updateData = {
            $set: {
                ...updates,
                updatedAt: new Date()
            }
        };
        
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            updateData
        );
        
        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }
        
        // Get updated user
        const updatedUser = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0, verificationToken: 0, resetToken: 0 } }
        );
        
        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                name: updatedUser.name,
                companyName: updatedUser.companyName,
                avatar: updatedUser.avatar,
                subscription: updatedUser.subscription,
                settings: updatedUser.settings,
                stats: updatedUser.stats,
                limits: updatedUser.limits,
                createdAt: updatedUser.createdAt
            }
        });
        
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}