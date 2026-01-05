// app/api/tenants/[id]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getSession } from '@/app/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getSession(request);
    // console.log(session);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const  { id }  = await params;
    // console.log("update id",id);
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

// export async function PUT(request, { params }) {
//   try {
//     const session = await getSession(request);
    
//     if (!session?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { id } = params;
//     const userId = new ObjectId(session.user_id);
//     const body = await request.json();
//     const { db } = await connectToDatabase();

//     // Check if tenant exists and belongs to user
//     const existingTenant = await db.collection('tenants').findOne({
//       _id: new ObjectId(id),
//       userId: userId
//     });

//     if (!existingTenant) {
//       return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
//     }

//     // Remove _id and other immutable fields from body
//     const { _id, userId: bodyUserId, createdAt, ...updateBody } = body;

//     // Prepare update data
//     const updateData = {
//       ...updateBody,
//       updatedAt: new Date(),
//       propertyId: updateBody.propertyId ? new ObjectId(updateBody.propertyId) : null
//     };

//     // Handle date conversions for lease dates
//     if (updateData.lease?.startDate) {
//       updateData.lease.startDate = new Date(updateData.lease.startDate);
//     }
//     if (updateData.lease?.endDate) {
//       updateData.lease.endDate = new Date(updateData.lease.endDate);
//     }

//     // Handle date conversions for financial dates (if any)
//     if (updateData.financial?.lastPaymentDate) {
//       updateData.financial.lastPaymentDate = new Date(updateData.financial.lastPaymentDate);
//     }
//     if (updateData.financial?.nextPaymentDate) {
//       updateData.financial.nextPaymentDate = new Date(updateData.financial.nextPaymentDate);
//     }

//     // Handle date conversions for insurance dates (if any)
//     if (updateData.insurance?.effectiveDate) {
//       updateData.insurance.effectiveDate = new Date(updateData.insurance.effectiveDate);
//     }
//     if (updateData.insurance?.expirationDate) {
//       updateData.insurance.expirationDate = new Date(updateData.insurance.expirationDate);
//     }

//     // Handle date conversions in rentStatus (if any)
//     if (updateData.rentStatus?.lastUpdated) {
//       updateData.rentStatus.lastUpdated = new Date(updateData.rentStatus.lastUpdated);
//     }
//     if (updateData.rentStatus?.nextDueDate) {
//       updateData.rentStatus.nextDueDate = new Date(updateData.rentStatus.nextDueDate);
//     }

//     // Ensure arrays are properly handled
//     if (updateData.pets && !Array.isArray(updateData.pets)) {
//       updateData.pets = [];
//     }
//     if (updateData.vehicles && !Array.isArray(updateData.vehicles)) {
//       updateData.vehicles = [];
//     }
//     if (updateData.familyMembers && !Array.isArray(updateData.familyMembers)) {
//       updateData.familyMembers = [];
//     }
//     if (updateData.tags && !Array.isArray(updateData.tags)) {
//       updateData.tags = [];
//     }
//     if (updateData.documents && !Array.isArray(updateData.documents)) {
//       updateData.documents = [];
//     }

//     // Update the tenant
//     await db.collection('tenants').updateOne(
//       { _id: new ObjectId(id), userId: userId },
//       { $set: updateData }
//     );

//     // Get the updated tenant
//     const updatedTenant = await db.collection('tenants').findOne({
//       _id: new ObjectId(id),
//       userId: userId
//     });

//     // Transform ObjectId to string for response
//     const transformedTenant = {
//       ...updatedTenant,
//       _id: updatedTenant._id.toString(),
//       userId: updatedTenant.userId?.toString(),
//       propertyId: updatedTenant.propertyId?.toString(),
//       createdAt: updatedTenant.createdAt.toISOString(),
//       updatedAt: updatedTenant.updatedAt.toISOString()
//     };

//     // Transform nested ObjectId fields if they exist
//     if (updatedTenant.lease?.propertyId) {
//       transformedTenant.lease.propertyId = updatedTenant.lease.propertyId.toString();
//     }

//     return NextResponse.json({
//       message: 'Tenant updated successfully',
//       tenant: transformedTenant
//     });

//   } catch (error) {
//     console.error('Error updating tenant:', error);
    
//     // Specific error handling for common issues
//     if (error.code === 66) {
//       return NextResponse.json({ 
//         error: 'Cannot update immutable fields' 
//       }, { status: 400 });
//     }
    
//     if (error.name === 'BSONError') {
//       return NextResponse.json({ 
//         error: 'Invalid ID format' 
//       }, { status: 400 });
//     }
    
//     return NextResponse.json({ 
//       error: error.message || 'Internal server error' 
//     }, { status: 500 });
//   }
// }

export async function PUT(request, { params }) {
  try {
    const session = await getSession(request);
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // Remove 'await' - params is not a promise
    
    const userId = new ObjectId(session.user_id);
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

    // Remove _id from body before creating updateData
    const { _id, ...bodyWithoutId } = body;

    // Update tenant
    const updateData = {
      ...bodyWithoutId,
      updatedAt: new Date(),
      propertyId: bodyWithoutId.propertyId ? new ObjectId(bodyWithoutId.propertyId) : null
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
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

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