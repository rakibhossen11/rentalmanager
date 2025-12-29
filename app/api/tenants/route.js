import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

// GET all tenants
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('property_management');
        const tenants = await db.collection('tenants').find({}).toArray();
        
        return NextResponse.json(tenants);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tenants' },
            { status: 500 }
        );
    }
}

// POST create new tenant
export async function POST(request) {
    try {
        const client = await clientPromise;
        const db = client.db('property_management');
        
        const tenantData = await request.json();
        
        // Validate required fields
        if (!tenantData.name || !tenantData.email || !tenantData.phone) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }
        
        // Add timestamps
        const tenantWithTimestamps = {
            ...tenantData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await db.collection('tenants').insertOne(tenantWithTimestamps);
        
        return NextResponse.json({
            _id: result.insertedId,
            ...tenantWithTimestamps
        }, { status: 201 });
        
    } catch (error) {
        console.error('Error creating tenant:', error);
        return NextResponse.json(
            { error: 'Failed to create tenant' },
            { status: 500 }
        );
    }
}