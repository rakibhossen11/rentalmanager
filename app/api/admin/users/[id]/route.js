import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single user (without authentication)
export async function GET(request, { params }) {
  try {
    // Await the params to get the id
    const { id } = await params;
    console.log("Fetching user with ID:", id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    const connection = await connectToDatabase();
    const db = connection.db;
    const usersCollection = db.collection('users');
    
    // Convert string ID to ObjectId
    let queryId;
    try {
      queryId = new ObjectId(id);
    } catch (error) {
      console.error("Invalid ObjectId:", error);
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    const user = await usersCollection.findOne(
      { _id: queryId },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error.message },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(request, { params }) {
  try {
    // Await the params to get the id
    const { id } = await params;
    console.log("Updating user with ID:", id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    const connection = await connectToDatabase();
    const db = connection.db;
    const usersCollection = db.collection('users');
    
    // Convert string ID to ObjectId
    let queryId;
    try {
      queryId = new ObjectId(id);
    } catch (error) {
      console.error("Invalid ObjectId:", error);
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    // Remove password from update if present
    const { password, ...updateData } = data;
    
    // If password is being updated, hash it (you'll need bcryptjs)
    // if (password) {
    //   updateData.password = await bcrypt.hash(password, 10);
    // }
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: queryId },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      },
      { 
        returnDocument: 'after',
        projection: { password: 0 }
      }
    );
    
    if (!result) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(request, { params }) {
  try {
    // Await the params to get the id
    const { id } = await params;
    console.log("Deleting user with ID:", id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const connection = await connectToDatabase();
    const db = connection.db;
    const usersCollection = db.collection('users');
    
    // Convert string ID to ObjectId
    let queryId;
    try {
      queryId = new ObjectId(id);
    } catch (error) {
      console.error("Invalid ObjectId:", error);
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    const result = await usersCollection.deleteOne({ _id: queryId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'User deleted successfully' }
    );
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}