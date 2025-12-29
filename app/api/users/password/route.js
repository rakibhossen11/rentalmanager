import { NextResponse } from 'next/server';
import { requireAuth, verifyPassword, hashPassword } from '@/lib/auth';
import { connectToDatabase, ObjectId } from '@/lib/mongodb';

export async function PUT(request) {
    try {
        const { userId } = await requireAuth(request);
        const { currentPassword, newPassword } = await request.json();
        
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current password and new password are required' },
                { status: 400 }
            );
        }
        
        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'New password must be at least 8 characters' },
                { status: 400 }
            );
        }
        
        const { db } = await connectToDatabase();
        
        // Get user with password
        const user = await db.collection('users').findOne({ 
            _id: new ObjectId(userId) 
        });
        
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }
        
        // Verify current password
        const isValidPassword = await verifyPassword(currentPassword, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 401 }
            );
        }
        
        // Hash new password
        const hashedPassword = await hashPassword(newPassword);
        
        // Update password
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    password: hashedPassword,
                    updatedAt: new Date()
                }
            }
        );
        
        return NextResponse.json({
            success: true,
            message: 'Password updated successfully'
        });
        
    } catch (error) {
        console.error('Update password error:', error);
        return NextResponse.json(
            { error: 'Failed to update password' },
            { status: 500 }
        );
    }
}