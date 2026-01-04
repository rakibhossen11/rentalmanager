// app/api/tenants/[id]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getSession } from '@/app/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { db } = await connectToDatabase();
    const userId = new ObjectId(session.user.id);

    const tenant = await db.collection('tenants').findOne({
      _id: new ObjectId(id),
      userId: userId
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Transform ObjectId to string
    const transformedTenant = {
      ...tenant,
      _id: tenant._id.toString(),
      userId: tenant.userId?.toString(),
      propertyId: tenant.propertyId?.toString()
    };

    return NextResponse.json(transformedTenant);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userId = new ObjectId(session.user.id);
    const body = await request.json();
    const { db } = await connectToDatabase();

    // Check if tenant exists and belongs to user
    const existingTenant = await db.collection('tenants').findOne({
      _id: new ObjectId(id),
      userId: userId
    });

    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Update tenant
    const updateData = {
      ...body,
      updatedAt: new Date(),
      propertyId: body.propertyId ? new ObjectId(body.propertyId) : null
    };

    // Handle date conversions
    if (updateData.lease?.startDate) {
      updateData.lease.startDate = new Date(updateData.lease.startDate);
    }
    if (updateData.lease?.endDate) {
      updateData.lease.endDate = new Date(updateData.lease.endDate);
    }

    await db.collection('tenants').updateOne(
      { _id: new ObjectId(id), userId: userId },
      { $set: updateData }
    );

    // Get updated tenant
    const updatedTenant = await db.collection('tenants').findOne({
      _id: new ObjectId(id),
      userId: userId
    });

    // Transform ObjectId to string
    const transformedTenant = {
      ...updatedTenant,
      _id: updatedTenant._id.toString(),
      userId: updatedTenant.userId?.toString(),
      propertyId: updatedTenant.propertyId?.toString()
    };

    return NextResponse.json({
      message: 'Tenant updated successfully',
      tenant: transformedTenant
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userId = new ObjectId(session.user.id);
    const { db } = await connectToDatabase();

    // Check if tenant exists and belongs to user
    const tenant = await db.collection('tenants').findOne({
      _id: new ObjectId(id),
      userId: userId
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Delete tenant
    await db.collection('tenants').deleteOne({
      _id: new ObjectId(id),
      userId: userId
    });

    // Update user stats
    await db.collection('users').updateOne(
      { _id: userId },
      { 
        $inc: { 'stats.totalTenants': -1 },
        $set: { updatedAt: new Date() }
      }
    );

    // Update property stats if tenant was assigned to a property
    if (tenant.propertyId) {
      await db.collection('properties').updateOne(
        { 
          _id: tenant.propertyId,
          userId: userId
        },
        { 
          $inc: { 'stats.totalTenants': -1, 'stats.occupiedUnits': -1 },
          $set: { updatedAt: new Date() }
        }
      );
    }

    return NextResponse.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}