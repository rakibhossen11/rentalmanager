import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/app/lib/mongodb';

// GET single tenant
export async function GET(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('property_management');
        
        const tenant = await db.collection('tenants').findOne({
            _id: new ObjectId(params.id)
        });
        
        if (!tenant) {
            return NextResponse.json(
                { error: 'Tenant not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(tenant);
    } catch (error) {
        console.error('Error fetching tenant:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tenant' },
            { status: 500 }
        );
    }
}

// PUT update tenant
export async function PUT(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('property_management');
        
        const updateData = await request.json();
        
        // Remove _id from update data if present
        delete updateData._id;
        
        const updateResult = await db.collection('tenants').updateOne(
            { _id: new ObjectId(params.id) },
            { 
                $set: {
                    ...updateData,
                    updatedAt: new Date()
                }
            }
        );
        
        if (updateResult.matchedCount === 0) {
            return NextResponse.json(
                { error: 'Tenant not found' },
                { status: 404 }
            );
        }
        
        // Fetch updated tenant
        const updatedTenant = await db.collection('tenants').findOne({
            _id: new ObjectId(params.id)
        });
        
        return NextResponse.json(updatedTenant);
        
    } catch (error) {
        console.error('Error updating tenant:', error);
        return NextResponse.json(
            { error: 'Failed to update tenant' },
            { status: 500 }
        );
    }
}

// DELETE tenant
export async function DELETE(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('property_management');
        
        const deleteResult = await db.collection('tenants').deleteOne({
            _id: new ObjectId(params.id)
        });
        
        if (deleteResult.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Tenant not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { message: 'Tenant deleted successfully' },
            { status: 200 }
        );
        
    } catch (error) {
        console.error('Error deleting tenant:', error);
        return NextResponse.json(
            { error: 'Failed to delete tenant' },
            { status: 500 }
        );
    }
}