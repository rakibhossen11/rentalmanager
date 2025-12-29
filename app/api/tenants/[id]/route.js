import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/app/lib/mongodb';

// GET single tenant
export async function GET(request, { params }) {
    try {
        // Await the params promise
        const { id } = await params;
        console.log(`🔍 GET /api/tenants/${id}`);
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Invalid tenant ID format' 
                },
                { status: 400 }
            );
        }
        
        const { db } = await connectToDatabase();
        
        const tenant = await db.collection('tenants').findOne({
            _id: new ObjectId(id)
        });
        
        if (!tenant) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Tenant not found' 
                },
                { status: 404 }
            );
        }
        
        return NextResponse.json(tenant);
        
    } catch (error) {
        console.error('Error fetching tenant:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to fetch tenant',
                message: error.message 
            },
            { status: 500 }
        );
    }
}

// PUT update tenant
export async function PUT(request, { params }) {
    try {
        // Await the params promise
        const { id } = await params;
        console.log(`✏️ PUT /api/tenants/${id}`);
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Invalid tenant ID format' 
                },
                { status: 400 }
            );
        }
        
        const updateData = await request.json();
        
        // Remove _id from update data if present
        delete updateData._id;
        
        const { db } = await connectToDatabase();
        
        // Check if tenant exists
        const existingTenant = await db.collection('tenants').findOne({
            _id: new ObjectId(id)
        });
        
        if (!existingTenant) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Tenant not found' 
                },
                { status: 404 }
            );
        }
        
        // If email is being updated, check for duplicates
        if (updateData.email && updateData.email !== existingTenant.email) {
            const duplicateTenant = await db.collection('tenants').findOne({
                email: updateData.email,
                _id: { $ne: new ObjectId(id) }
            });
            
            if (duplicateTenant) {
                return NextResponse.json(
                    { 
                        success: false,
                        error: 'Duplicate email' 
                    },
                    { status: 409 }
                );
            }
        }
        
        // Prepare update object
        const updateObject = {
            $set: {
                ...updateData,
                updatedAt: new Date()
            }
        };
        
        // Convert numeric fields if present
        if (updateData.rentAmount) {
            updateObject.$set.rentAmount = parseFloat(updateData.rentAmount);
        }
        if (updateData.securityDeposit) {
            updateObject.$set.securityDeposit = parseFloat(updateData.securityDeposit);
        }
        if (updateData.rentDueDay) {
            updateObject.$set.rentDueDay = parseInt(updateData.rentDueDay);
        }
        
        // Update tenant
        const updateResult = await db.collection('tenants').updateOne(
            { _id: new ObjectId(id) },
            updateObject
        );
        
        if (updateResult.matchedCount === 0) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Update failed' 
                },
                { status: 400 }
            );
        }
        
        // Get updated tenant
        const updatedTenant = await db.collection('tenants').findOne({
            _id: new ObjectId(id)
        });
        
        return NextResponse.json({
            success: true,
            message: 'Tenant updated successfully',
            data: updatedTenant
        });
        
    } catch (error) {
        console.error('Error updating tenant:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to update tenant',
                message: error.message 
            },
            { status: 500 }
        );
    }
}

// DELETE tenant
export async function DELETE(request, { params }) {
    try {
        // Await the params promise
        const { id } = await params;
        console.log(`🗑️ DELETE /api/tenants/${id}`);
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Invalid tenant ID format' 
                },
                { status: 400 }
            );
        }
        
        const { db } = await connectToDatabase();
        
        // Check if tenant exists
        const existingTenant = await db.collection('tenants').findOne({
            _id: new ObjectId(id)
        });
        
        if (!existingTenant) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Tenant not found' 
                },
                { status: 404 }
            );
        }
        
        // Option 1: Soft delete (recommended)
        const deleteResult = await db.collection('tenants').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: 'deleted',
                    deletedAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );
        
        // Option 2: Hard delete (permanent)
        // const deleteResult = await db.collection('tenants').deleteOne({
        //     _id: new ObjectId(id)
        // });
        
        if (deleteResult.matchedCount === 0) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Delete failed' 
                },
                { status: 400 }
            );
        }
        
        return NextResponse.json({
            success: true,
            message: 'Tenant deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting tenant:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to delete tenant',
                message: error.message 
            },
            { status: 500 }
        );
    }
}