// app/api/tenants/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET() {
    try {
        console.log('🔍 GET /api/tenants - Fetching tenants');
        const { db } = await connectToDatabase();
        console.log('✅ Connected to database');
        
        const tenants = await db.collection('tenants')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log(`✅ Found ${tenants.length} tenants`);
        return NextResponse.json(tenants);
        
    } catch (error) {
        console.error('❌ Error in GET /api/tenants:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to fetch tenants',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    console.log('📝 POST /api/tenants - Creating new tenant');
    
    try {
        // Parse request body first
        let tenantData;
        try {
            tenantData = await request.json();
            console.log('📦 Request body:', tenantData);
        } catch (parseError) {
            console.error('❌ Failed to parse JSON:', parseError);
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Invalid JSON format',
                    message: 'Request body must be valid JSON'
                },
                { status: 400 }
            );
        }
        
        // Validate required fields
        if (!tenantData.name || !tenantData.email || !tenantData.phone) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Validation failed',
                    message: 'Name, email, and phone are required fields' 
                },
                { status: 400 }
            );
        }
        
        // Connect to database
        const { db } = await connectToDatabase();
        console.log('✅ Connected to database');
        
        // Check for duplicate email
        const existingTenant = await db.collection('tenants').findOne({
            email: tenantData.email
        });
        
        if (existingTenant) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Duplicate email',
                    message: 'A tenant with this email already exists' 
                },
                { status: 409 }
            );
        }
        
        // Prepare tenant data with defaults
        const newTenant = {
            name: tenantData.name,
            email: tenantData.email,
            phone: tenantData.phone,
            address: tenantData.address || '',
            propertyId: tenantData.propertyId || '',
            leaseStart: tenantData.leaseStart ? new Date(tenantData.leaseStart) : null,
            leaseEnd: tenantData.leaseEnd ? new Date(tenantData.leaseEnd) : null,
            rentAmount: parseFloat(tenantData.rentAmount) || 0,
            rentDueDay: parseInt(tenantData.rentDueDay) || 1,
            securityDeposit: parseFloat(tenantData.securityDeposit) || 0,
            emergencyContact: tenantData.emergencyContact || '',
            emergencyPhone: tenantData.emergencyPhone || '',
            notes: tenantData.notes || '',
            status: tenantData.status || 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        console.log('📋 Prepared tenant data:', newTenant);
        
        // Insert the new tenant
        const result = await db.collection('tenants').insertOne(newTenant);
        console.log('✅ Tenant inserted with ID:', result.insertedId);
        
        // Get the inserted document
        const insertedTenant = {
            _id: result.insertedId,
            ...newTenant
        };
        
        return NextResponse.json(
            { 
                success: true,
                message: 'Tenant created successfully',
                data: insertedTenant 
            },
            { status: 201 }
        );
        
    } catch (error) {
        console.error('❌ Error in POST /api/tenants:', error);
        console.error('Full error:', error.stack);
        
        return NextResponse.json(
            { 
                success: false,
                error: 'Server error',
                message: error.message,
                code: error.code || 'UNKNOWN_ERROR',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}