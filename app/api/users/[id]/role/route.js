import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/auth';
import { connectToDatabase, ObjectId } from '@/lib/mongodb';

// Update user role (Admin only)
export async function PUT(request, { params }) {
    try {
        const { user: admin } = await requireAdmin(request);
        const { id } = await params;
        const { role, permissions } = await request.json();
        
        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }
        
        // Prevent admin from modifying their own role
        if (id === admin._id.toString()) {
            return NextResponse.json(
                { error: 'Cannot modify your own role' },
                { status: 400 }
            );
        }
        
        const { db } = await connectToDatabase();
        
        // Update user role and permissions
        const updateData = {
            $set: {
                role: role,
                isAdmin: role === 'admin',
                permissions: permissions || [],
                updatedAt: new Date(),
                updatedBy: new ObjectId(admin._id)
            }
        };
        
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
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
            { _id: new ObjectId(id) },
            { projection: { password: 0 } }
        );
        
        return NextResponse.json({
            success: true,
            message: 'User role updated successfully',
            user: updatedUser
        });
        
    } catch (error) {
        console.error('Update role error:', error);
        
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
            { error: 'Failed to update user role' },
            { status: 500 }
        );
    }
}