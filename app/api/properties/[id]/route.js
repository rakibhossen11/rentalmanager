// app/api/properties/[id]/route.js
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { getSession } from '@/app/lib/auth';

// GET single property
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { db } = await connectToDatabase();

    const id = params.id;

    const session = await getSession();

    // Mock session
    // const session = {
    //   id: '6954b698341c568fccdc8acf'
    // };

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = new ObjectId(session.id);

    // Validate property ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      );
    }

    // Find property
    const property = await db.collection('properties').findOne({
      _id: new ObjectId(id),
      userId
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Format response
    const responseData = {
      success: true,
      property: {
        ...property,
        _id: property._id.toString(),
        userId: property.userId.toString()
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch property',
        message: error.message
      }, 
      { status: 500 }
    );
  }
}

// PUT update property
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { db } = await connectToDatabase();

    const id = params.id;
    const body = await request.json();

    const session = await getSession();

    // Mock session
    // const session = {
    //   id: '6954b698341c568fccdc8acf'
    // };

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = new ObjectId(session.id);

    // Validate property ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      );
    }

    // Find property
    const existingProperty = await db.collection('properties').findOne({
      _id: new ObjectId(id),
      userId
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      ...body,
      updatedAt: new Date()
    };

    // Update property
    const result = await db.collection('properties').updateOne(
      { _id: new ObjectId(id), userId },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update property' },
        { status: 400 }
      );
    }

    // Get updated property
    const updatedProperty = await db.collection('properties').findOne({
      _id: new ObjectId(id),
      userId
    });

    return NextResponse.json({
      success: true,
      message: 'Property updated successfully',
      property: {
        ...updatedProperty,
        _id: updatedProperty._id.toString(),
        userId: updatedProperty.userId.toString()
      }
    });

  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update property',
        message: error.message
      }, 
      { status: 500 }
    );
  }
}

// DELETE property
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { db } = await connectToDatabase();

    const id = params.id;

    const session = await getSession();

    // Mock session
    // const session = {
    //   id: '6954b698341c568fccdc8acf'
    // };

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = new ObjectId(session.id);

    // Validate property ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      );
    }

    // Check if property exists
    const property = await db.collection('properties').findOne({
      _id: new ObjectId(id),
      userId
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if property has tenants
    if (property.tenants && property.tenants.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete property with active tenants' },
        { status: 400 }
      );
    }

    // Delete property
    const result = await db.collection('properties').deleteOne({
      _id: new ObjectId(id),
      userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete property' },
        { status: 400 }
      );
    }

    // Update user stats
    await db.collection('users').updateOne(
      { _id: userId },
      { 
        $inc: { 'stats.totalProperties': -1 },
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete property',
        message: error.message
      }, 
      { status: 500 }
    );
  }
}