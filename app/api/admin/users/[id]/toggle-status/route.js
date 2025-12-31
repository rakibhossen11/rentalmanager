// api/admin/users/[id]/toggle-status/route.js
import { NextResponse } from 'next/server';
import { getCollection, toObjectId } from '@/utils/mongodb';
import { verifyToken } from '@/utils/auth';

export async function PATCH(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const admin = verifyToken(token);
    
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Don't allow toggling your own status
    if (id === admin.id) {
      return NextResponse.json(
        { error: 'Cannot change your own status' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection('users');
    
    // Get current user
    const user = await usersCollection.findOne({ _id: toObjectId(id) });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Toggle status
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { 
        $set: { 
          status: newStatus,
          updatedAt: new Date()
        } 
      },
      { 
        returnDocument: 'after',
        projection: { password: 0 }
      }
    );

    return NextResponse.json({
      message: `User ${newStatus} successfully`,
      user: result.value,
      status: newStatus
    });
    
  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle user status' },
      { status: 500 }
    );
  }
}