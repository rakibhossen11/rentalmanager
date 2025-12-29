import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { connectToDatabase, ObjectId } from '@/app/lib/mongodb';

export async function GET(request) {
    try {
        const { companyId } = await requireAuth(request);
        
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;
        
        const { db } = await connectToDatabase();
        
        // Build query
        const query = { companyId: new ObjectId(companyId) };
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        // Get tenants with pagination
        const tenants = await db.collection('tenants')
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();
        
        // Get total count
        const total = await db.collection('tenants').countDocuments(query);
        
        // Format response
        const formattedTenants = tenants.map(tenant => ({
            id: tenant._id,
            name: tenant.name,
            email: tenant.email,
            phone: tenant.phone,
            status: tenant.status,
            rentAmount: tenant.rentAmount,
            leaseStart: tenant.leaseStart,
            leaseEnd: tenant.leaseEnd,
            address: tenant.address,
            createdAt: tenant.createdAt,
            updatedAt: tenant.updatedAt
        }));
        
        return NextResponse.json({
            tenants: formattedTenants,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Get tenants error:', error);
        
        if (error.message.includes('Authentication')) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to fetch tenants' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const { userId, companyId } = await requireAuth(request);
        
        const { db } = await connectToDatabase();
        
        // Check user's tenant limit
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) }
        );
        
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }
        
        // Check tenant limit for free plan
        if (user.subscription.plan === 'free') {
            const tenantCount = await db.collection('tenants').countDocuments({
                companyId: new ObjectId(companyId)
            });
            
            if (tenantCount >= user.limits.tenants) {
                return NextResponse.json(
                    { 
                        error: 'Tenant limit reached',
                        message: `Free plan is limited to ${user.limits.tenants} tenants. Upgrade to add more.`
                    },
                    { status: 403 }
                );
            }
        }
        
        // Get tenant data
        const tenantData = await request.json();
        
        // Validate required fields
        if (!tenantData.name || !tenantData.email) {
            return NextResponse.json(
                { error: 'Name and email are required' },
                { status: 400 }
            );
        }
        
        // Check for duplicate email in same company
        const existingTenant = await db.collection('tenants').findOne({
            email: tenantData.email.toLowerCase(),
            companyId: new ObjectId(companyId)
        });
        
        if (existingTenant) {
            return NextResponse.json(
                { error: 'A tenant with this email already exists' },
                { status: 409 }
            );
        }
        
        // Prepare tenant document
        const tenant = {
            // Tenant Information
            name: tenantData.name,
            email: tenantData.email.toLowerCase(),
            phone: tenantData.phone || null,
            alternatePhone: tenantData.alternatePhone || null,
            address: tenantData.address || null,
            
            // Lease Details
            propertyId: tenantData.propertyId ? new ObjectId(tenantData.propertyId) : null,
            unitNumber: tenantData.unitNumber || null,
            leaseStart: tenantData.leaseStart ? new Date(tenantData.leaseStart) : null,
            leaseEnd: tenantData.leaseEnd ? new Date(tenantData.leaseEnd) : null,
            rentAmount: parseFloat(tenantData.rentAmount) || 0,
            securityDeposit: tenantData.securityDeposit ? parseFloat(tenantData.securityDeposit) : 0,
            petDeposit: tenantData.petDeposit ? parseFloat(tenantData.petDeposit) : 0,
            rentDueDay: parseInt(tenantData.rentDueDay) || 1,
            
            // Status
            status: tenantData.status || 'active',
            
            // Emergency Contact
            emergencyContact: tenantData.emergencyContact || null,
            
            // Payment Information
            paymentMethod: tenantData.paymentMethod || null,
            
            // Documents
            documents: [],
            
            // Notes
            notes: tenantData.notes || null,
            
            // Meta
            createdBy: new ObjectId(userId),
            companyId: new ObjectId(companyId),
            
            // Audit Trail
            auditTrail: [{
                action: 'CREATE',
                userId: new ObjectId(userId),
                timestamp: new Date(),
                changes: tenantData,
                ip: request.headers.get('x-forwarded-for') || null
            }],
            
            // Timestamps
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            deletedBy: null
        };
        
        // Insert tenant
        const result = await db.collection('tenants').insertOne(tenant);
        
        // Update user stats
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { 
                $inc: { 'stats.totalTenants': 1 },
                $set: { updatedAt: new Date() }
            }
        );
        
        return NextResponse.json({
            success: true,
            message: 'Tenant created successfully',
            tenant: {
                id: result.insertedId,
                ...tenant
            }
        });
        
    } catch (error) {
        console.error('Create tenant error:', error);
        
        if (error.message.includes('Authentication')) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to create tenant' },
            { status: 500 }
        );
    }
}

// code this before saas product ok
// // app/api/tenants/route.js
// import { NextResponse } from 'next/server';
// import { connectToDatabase } from '@/app/lib/mongodb';

// export async function GET() {
//     try {
//         console.log('🔍 GET /api/tenants - Fetching tenants');
//         const { db } = await connectToDatabase();
//         console.log('✅ Connected to database');
        
//         const tenants = await db.collection('tenants')
//             .find({})
//             .sort({ createdAt: -1 })
//             .toArray();
        
//         console.log(`✅ Found ${tenants.length} tenants`);
//         return NextResponse.json(tenants);
        
//     } catch (error) {
//         console.error('❌ Error in GET /api/tenants:', error);
//         return NextResponse.json(
//             { 
//                 success: false,
//                 error: 'Failed to fetch tenants',
//                 message: error.message,
//                 stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//             },
//             { status: 500 }
//         );
//     }
// }

// export async function POST(request) {
//     console.log('📝 POST /api/tenants - Creating new tenant');
    
//     try {
//         // Parse request body first
//         let tenantData;
//         try {
//             tenantData = await request.json();
//             console.log('📦 Request body:', tenantData);
//         } catch (parseError) {
//             console.error('❌ Failed to parse JSON:', parseError);
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     error: 'Invalid JSON format',
//                     message: 'Request body must be valid JSON'
//                 },
//                 { status: 400 }
//             );
//         }
        
//         // Validate required fields
//         if (!tenantData.name || !tenantData.email || !tenantData.phone) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     error: 'Validation failed',
//                     message: 'Name, email, and phone are required fields' 
//                 },
//                 { status: 400 }
//             );
//         }
        
//         // Connect to database
//         const { db } = await connectToDatabase();
//         console.log('✅ Connected to database');
        
//         // Check for duplicate email
//         const existingTenant = await db.collection('tenants').findOne({
//             email: tenantData.email
//         });
        
//         if (existingTenant) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     error: 'Duplicate email',
//                     message: 'A tenant with this email already exists' 
//                 },
//                 { status: 409 }
//             );
//         }
        
//         // Prepare tenant data with defaults
//         const newTenant = {
//             name: tenantData.name,
//             email: tenantData.email,
//             phone: tenantData.phone,
//             address: tenantData.address || '',
//             propertyId: tenantData.propertyId || '',
//             leaseStart: tenantData.leaseStart ? new Date(tenantData.leaseStart) : null,
//             leaseEnd: tenantData.leaseEnd ? new Date(tenantData.leaseEnd) : null,
//             rentAmount: parseFloat(tenantData.rentAmount) || 0,
//             rentDueDay: parseInt(tenantData.rentDueDay) || 1,
//             securityDeposit: parseFloat(tenantData.securityDeposit) || 0,
//             emergencyContact: tenantData.emergencyContact || '',
//             emergencyPhone: tenantData.emergencyPhone || '',
//             notes: tenantData.notes || '',
//             status: tenantData.status || 'active',
//             createdAt: new Date(),
//             updatedAt: new Date()
//         };
        
//         console.log('📋 Prepared tenant data:', newTenant);
        
//         // Insert the new tenant
//         const result = await db.collection('tenants').insertOne(newTenant);
//         console.log('✅ Tenant inserted with ID:', result.insertedId);
        
//         // Get the inserted document
//         const insertedTenant = {
//             _id: result.insertedId,
//             ...newTenant
//         };
        
//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: 'Tenant created successfully',
//                 data: insertedTenant 
//             },
//             { status: 201 }
//         );
        
//     } catch (error) {
//         console.error('❌ Error in POST /api/tenants:', error);
//         console.error('Full error:', error.stack);
        
//         return NextResponse.json(
//             { 
//                 success: false,
//                 error: 'Server error',
//                 message: error.message,
//                 code: error.code || 'UNKNOWN_ERROR',
//                 stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//             },
//             { status: 500 }
//         );
//     }
// }