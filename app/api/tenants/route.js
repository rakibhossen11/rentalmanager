// app/api/tenants/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getSession } from '@/app/lib/auth';

export async function GET(request) {
  try {
    console.log('GET /api/tenants - Checking session...');
    const session = await getSession(request);
    
    if (!session) {
      console.error('No session found in GET');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }
    
    // Handle different session structures
    if (!session.user) {
      if (session._id) {
        session.user = { id: session._id };
      } else if (session.id) {
        session.user = { id: session.id };
      } else if (session.user_id) {
        session.user = { id: session.user_id };
      }
    }
    
    if (!session.user || !session.user.id) {
      console.error('No user ID found in session');
      return NextResponse.json({ error: 'Unauthorized - Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const propertyId = searchParams.get('propertyId');
    const unit = searchParams.get('unit');
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    const userId = new ObjectId(session.user.id);

    // Build query with user isolation
    let query = { userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (propertyId && propertyId !== 'all') {
      try {
        query.propertyId = new ObjectId(propertyId);
      } catch (e) {
        console.warn('Invalid propertyId:', propertyId);
      }
    }
    
    if (unit && unit.trim()) {
      query.unit = { $regex: unit.trim(), $options: 'i' };
    }

    // Execute queries in parallel
    const [tenants, total] = await Promise.all([
      db.collection('tenants')
        .find(query)
        .project({
          'personalInfo.fullName': 1,
          'personalInfo.email': 1,
          'personalInfo.phone': 1,
          'propertyId': 1,
          'unit': 1,
          'lease.monthlyRent': 1,
          'lease.startDate': 1,
          'lease.endDate': 1,
          'status': 1,
          'rentStatus.currentBalance': 1,
          'rentStatus.nextPaymentDue': 1,
          'createdAt': 1
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('tenants').countDocuments(query)
    ]);

    // Transform ObjectId to string
    const transformedTenants = tenants.map(tenant => ({
      ...tenant,
      _id: tenant._id.toString(),
      userId: tenant.userId?.toString(),
      propertyId: tenant.propertyId?.toString()
    }));

    return NextResponse.json({
      tenants: transformedTenants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }
    
    // Handle different session structures
    if (!session.user) {
      if (session._id) {
        session.user = { id: session._id };
      } else if (session.id) {
        session.user = { id: session.id };
      } else if (session.user_id) {
        session.user = { id: session.user_id };
      }
    }
    
    if (!session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - Invalid session' }, { status: 401 });
    }

    const userId = new ObjectId(session.user.id);
    const body = await request.json();
    const { db } = await connectToDatabase();

    // Basic validation
    if (!body.personalInfo?.fullName?.trim()) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }
    
    if (!body.lease?.startDate) {
      return NextResponse.json(
        { error: 'Lease start date is required' },
        { status: 400 }
      );
    }
    
    if (!body.lease?.monthlyRent || isNaN(parseFloat(body.lease.monthlyRent))) {
      return NextResponse.json(
        { error: 'Valid monthly rent is required' },
        { status: 400 }
      );
    }
    
    // Calculate end date if not provided (3 months from start date)
    let endDate;
    const startDate = new Date(body.lease.startDate);
    
    if (body.lease?.endDate) {
      endDate = new Date(body.lease.endDate);
    } else {
      // Set end date to 3 months from start date
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3);
    }
    
    // Validate dates
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'Lease end date must be after start date' },
        { status: 400 }
      );
    }
    
    // Check if end date is too far in the future (optional: limit to 2 years)
    const maxEndDate = new Date(startDate);
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 2);
    
    if (endDate > maxEndDate) {
      return NextResponse.json(
        { error: 'Lease term cannot exceed 2 years' },
        { status: 400 }
      );
    }

    // Get user plan and limits
    const userPlan = session.subscription?.plan || 'free';
    const userLimits = session.limits || { tenants: 10 };
    
    if (userPlan === 'free') {
      const tenantCount = await db.collection('tenants').countDocuments({ userId });
      
      if (tenantCount >= userLimits.tenants) {
        return NextResponse.json(
          { error: `Free plan limited to ${userLimits.tenants} tenants. Please upgrade.` },
          { status: 403 }
        );
      }
    }

    // Validate property exists and belongs to user
    if (body.propertyId) {
      try {
        const propertyObjectId = new ObjectId(body.propertyId);
        const property = await db.collection('properties').findOne({
          _id: propertyObjectId,
          userId: userId
        });
        
        if (!property) {
          return NextResponse.json(
            { error: 'Property not found or access denied' },
            { status: 404 }
          );
        }
        
        // Check unit occupancy
        if (body.unit) {
          const existingTenant = await db.collection('tenants').findOne({
            userId,
            propertyId: propertyObjectId,
            unit: body.unit,
            status: 'active'
          });
          
          if (existingTenant) {
            return NextResponse.json(
              { error: `Unit ${body.unit} is already occupied` },
              { status: 400 }
            );
          }
        }
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid property ID' },
          { status: 400 }
        );
      }
    }

    // Calculate next payment due date
    const calculateNextDueDate = (startDate, dueDay = 1) => {
      const start = new Date(startDate);
      const now = new Date();
      
      if (now < start) {
        return start;
      }

      const nextDue = new Date(now.getFullYear(), now.getMonth(), dueDay);
      
      if (nextDue < now) {
        nextDue.setMonth(nextDue.getMonth() + 1);
      }
      
      return nextDue;
    };

    // Create tenant document
    const tenantData = {
      userId,
      personalInfo: {
        fullName: body.personalInfo.fullName.trim(),
        email: body.personalInfo.email?.trim() || '',
        phone: body.personalInfo.phone?.trim() || '',
        dateOfBirth: body.personalInfo.dateOfBirth || '',
        gender: body.personalInfo.gender || '',
        maritalStatus: body.personalInfo.maritalStatus || '',
        nationality: body.personalInfo.nationality || '',
        language: body.personalInfo.language || '',
        identification: body.personalInfo.identification || {
          type: '',
          number: '',
          issueDate: '',
          expiryDate: '',
          issuingAuthority: ''
        }
      },
      employment: body.employment || {
        occupation: '',
        employer: '',
        workAddress: '',
        workPhone: '',
        employmentType: '',
        employmentStartDate: '',
        monthlyIncome: '',
        annualIncome: '',
        payFrequency: '',
        educationLevel: '',
        schoolName: '',
        graduationYear: ''
      },
      propertyId: body.propertyId ? new ObjectId(body.propertyId) : null,
      unit: body.unit || '',
      lease: {
        startDate: startDate,
        endDate: endDate,
        monthlyRent: parseFloat(body.lease.monthlyRent),
        securityDeposit: body.lease.securityDeposit ? parseFloat(body.lease.securityDeposit) : 0,
        petDeposit: body.lease.petDeposit ? parseFloat(body.lease.petDeposit) : 0,
        dueDay: body.lease.dueDay || 1,
        lateFee: body.lease.lateFee ? parseFloat(body.lease.lateFee) : 0,
        gracePeriod: body.lease.gracePeriod || 5,
        utilitiesIncluded: body.lease.utilitiesIncluded || [],
        tenantPays: body.lease.tenantPays || [],
        durationMonths: Math.ceil((endDate - startDate) / (30 * 24 * 60 * 60 * 1000)) // Approximate months
      },
      pets: body.pets || [],
      vehicles: body.vehicles || [],
      familyMembers: body.familyMembers || [],
      financial: body.financial || {
        creditScore: '',
        paymentMethods: [],
        previousRentalHistory: [],
        monthlyDebtObligations: ''
      },
      insurance: body.insurance || {
        renterInsurance: {
          provider: '',
          policyNumber: '',
          coverageAmount: '',
          effectiveDate: '',
          monthlyPremium: ''
        }
      },
      emergencyContact: body.emergencyContact || { 
        primary: { name: '', relationship: '', phone: '' } 
      },
      notes: body.notes || '',
      status: body.status || 'active',
      tags: body.tags || [],
      rentStatus: {
        currentBalance: 0,
        lastPaymentDate: null,
        nextPaymentDue: calculateNextDueDate(body.lease.startDate, body.lease.dueDay || 1),
        paymentHistory: [],
        totalRentDue: parseFloat(body.lease.monthlyRent) * Math.ceil((endDate - startDate) / (30 * 24 * 60 * 60 * 1000))
      },
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert tenant
    const result = await db.collection('tenants').insertOne(tenantData);

    // Update user stats
    await db.collection('users').updateOne(
      { _id: userId },
      { 
        $inc: { 'stats.totalTenants': 1, 'stats.activeLeases': 1 },
        $set: { updatedAt: new Date() }
      }
    );

    // Update property stats
    if (body.propertyId) {
      await db.collection('properties').updateOne(
        { 
          _id: new ObjectId(body.propertyId),
          userId: userId
        },
        { 
          $inc: { 'stats.totalTenants': 1, 'stats.occupiedUnits': 1 },
          $set: { updatedAt: new Date() }
        }
      );
    }

    return NextResponse.json({
      message: 'Tenant added successfully',
      tenantId: result.insertedId.toString(),
      tenant: {
        ...tenantData,
        _id: result.insertedId.toString(),
        userId: userId.toString(),
        propertyId: tenantData.propertyId?.toString(),
        lease: {
          ...tenantData.lease,
          startDate: tenantData.lease.startDate.toISOString(),
          endDate: tenantData.lease.endDate.toISOString()
        }
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding tenant:', error);
    
    if (error.name === 'BSONError') {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// // app/api/tenants/route.js
// import { NextResponse } from 'next/server';
// import { connectToDatabase } from '@/app/lib/mongodb';
// import { ObjectId } from 'mongodb';
// import { getSession } from '@/app/lib/auth';

// export async function GET(request) {
//   try {
//     const session = await getServerSession();
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page')) || 1;
//     const limit = parseInt(searchParams.get('limit')) || 20;
//     const status = searchParams.get('status');
//     const skip = (page - 1) * limit;

//     const { db } = await connectToDatabase();
//     const userId = new ObjectId(session.user.id);

//     // Build query with user isolation
//     let query = { userId };
    
//     if (status && status !== 'all') {
//       query.status = status;
//     }

//     // Execute queries in parallel
//     const [tenants, total] = await Promise.all([
//       db.collection('tenants')
//         .find(query)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .toArray(),
//       db.collection('tenants').countDocuments(query)
//     ]);

//     // Transform ObjectId to string for JSON serialization
//     const transformedTenants = tenants.map(tenant => ({
//       ...tenant,
//       _id: tenant._id.toString(),
//       userId: tenant.userId.toString(),
//       propertyId: tenant.propertyId?.toString()
//     }));

//     return NextResponse.json({
//       tenants: transformedTenants,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching tenants:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// export async function POST(request) {
//   try {
//     await connectToDatabase();
//     // const session = await getSession(request);
//     // if (!session?.user?.id) {
//     //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     // }

//     // const userId = new ObjectId(session.user.id);
//     const body = await request.json();
//     console.log(body);
//     const { db } = await connectToDatabase();

//     // Check user limits
//     if (session.user.subscription?.plan === 'free') {
//       const tenantCount = await db.collection('tenants').countDocuments({ userId });
//       const userLimit = session.user.limits?.tenants || 10;
      
//       if (tenantCount >= userLimit) {
//         return NextResponse.json(
//           { error: `Free plan limited to ${userLimit} tenants. Please upgrade.` },
//           { status: 403 }
//         );
//       }
//     }

//     // Create tenant document with user isolation
//     const tenantData = {
//       userId,
//       ...body,
//       status: 'active',
//       rentStatus: {
//         currentBalance: 0,
//         lastPaymentDate: null,
//         nextPaymentDue: calculateNextDueDate(body.leaseStartDate, body.rentDueDay),
//         paymentHistory: []
//       },
//       documents: [],
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     // Insert into database
//     const result = await db.collection('tenants').insertOne(tenantData);

//     // Update user stats
//     await db.collection('users').updateOne(
//       { _id: userId },
//       { 
//         $inc: { 'stats.totalTenants': 1 },
//         $set: { updatedAt: new Date() }
//       }
//     );

//     return NextResponse.json({
//       message: 'Tenant added successfully',
//       tenantId: result.insertedId.toString()
//     }, { status: 201 });
//   } catch (error) {
//     console.error('Error adding tenant:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// // Helper function to calculate next payment due date
// function calculateNextDueDate(startDate, dueDay) {
//   const start = new Date(startDate);
//   const now = new Date();
  
//   // If lease hasn't started yet, first payment is on lease start day
//   if (now < start) {
//     return start;
//   }

//   // Calculate next due date based on due day
//   const nextDue = new Date(now.getFullYear(), now.getMonth(), dueDay);
  
//   // If due day has passed this month, go to next month
//   if (nextDue < now) {
//     nextDue.setMonth(nextDue.getMonth() + 1);
//   }
  
//   return nextDue;
// }

// import { NextResponse } from 'next/server';
// import { requireAuth } from '@/app/lib/auth';
// import { connectToDatabase, ObjectId } from '@/app/lib/mongodb';

// export async function GET(request) {
//     try {
//         const { companyId } = await requireAuth(request);
        
//         // Get query parameters
//         const { searchParams } = new URL(request.url);
//         const status = searchParams.get('status');
//         const page = parseInt(searchParams.get('page') || '1');
//         const limit = parseInt(searchParams.get('limit') || '20');
//         const skip = (page - 1) * limit;
        
//         const { db } = await connectToDatabase();
        
//         // Build query
//         const query = { companyId: new ObjectId(companyId) };
        
//         if (status && status !== 'all') {
//             query.status = status;
//         }
        
//         // Get tenants with pagination
//         const tenants = await db.collection('tenants')
//             .find(query)
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(limit)
//             .toArray();
        
//         // Get total count
//         const total = await db.collection('tenants').countDocuments(query);
        
//         // Format response
//         const formattedTenants = tenants.map(tenant => ({
//             id: tenant._id,
//             name: tenant.name,
//             email: tenant.email,
//             phone: tenant.phone,
//             status: tenant.status,
//             rentAmount: tenant.rentAmount,
//             leaseStart: tenant.leaseStart,
//             leaseEnd: tenant.leaseEnd,
//             address: tenant.address,
//             createdAt: tenant.createdAt,
//             updatedAt: tenant.updatedAt
//         }));
        
//         return NextResponse.json({
//             tenants: formattedTenants,
//             pagination: {
//                 page,
//                 limit,
//                 total,
//                 pages: Math.ceil(total / limit)
//             }
//         });
        
//     } catch (error) {
//         console.error('Get tenants error:', error);
        
//         if (error.message.includes('Authentication')) {
//             return NextResponse.json(
//                 { error: 'Authentication required' },
//                 { status: 401 }
//             );
//         }
        
//         return NextResponse.json(
//             { error: 'Failed to fetch tenants' },
//             { status: 500 }
//         );
//     }
// }

// export async function POST(request) {
//     try {
//         const { userId, companyId } = await requireAuth(request);
        
//         const { db } = await connectToDatabase();
        
//         // Check user's tenant limit
//         const user = await db.collection('users').findOne(
//             { _id: new ObjectId(userId) }
//         );
        
//         if (!user) {
//             return NextResponse.json(
//                 { error: 'User not found' },
//                 { status: 404 }
//             );
//         }
        
//         // Check tenant limit for free plan
//         if (user.subscription.plan === 'free') {
//             const tenantCount = await db.collection('tenants').countDocuments({
//                 companyId: new ObjectId(companyId)
//             });
            
//             if (tenantCount >= user.limits.tenants) {
//                 return NextResponse.json(
//                     { 
//                         error: 'Tenant limit reached',
//                         message: `Free plan is limited to ${user.limits.tenants} tenants. Upgrade to add more.`
//                     },
//                     { status: 403 }
//                 );
//             }
//         }
        
//         // Get tenant data
//         const tenantData = await request.json();
        
//         // Validate required fields
//         if (!tenantData.name || !tenantData.email) {
//             return NextResponse.json(
//                 { error: 'Name and email are required' },
//                 { status: 400 }
//             );
//         }
        
//         // Check for duplicate email in same company
//         const existingTenant = await db.collection('tenants').findOne({
//             email: tenantData.email.toLowerCase(),
//             companyId: new ObjectId(companyId)
//         });
        
//         if (existingTenant) {
//             return NextResponse.json(
//                 { error: 'A tenant with this email already exists' },
//                 { status: 409 }
//             );
//         }
        
//         // Prepare tenant document
//         const tenant = {
//             // Tenant Information
//             name: tenantData.name,
//             email: tenantData.email.toLowerCase(),
//             phone: tenantData.phone || null,
//             alternatePhone: tenantData.alternatePhone || null,
//             address: tenantData.address || null,
            
//             // Lease Details
//             propertyId: tenantData.propertyId ? new ObjectId(tenantData.propertyId) : null,
//             unitNumber: tenantData.unitNumber || null,
//             leaseStart: tenantData.leaseStart ? new Date(tenantData.leaseStart) : null,
//             leaseEnd: tenantData.leaseEnd ? new Date(tenantData.leaseEnd) : null,
//             rentAmount: parseFloat(tenantData.rentAmount) || 0,
//             securityDeposit: tenantData.securityDeposit ? parseFloat(tenantData.securityDeposit) : 0,
//             petDeposit: tenantData.petDeposit ? parseFloat(tenantData.petDeposit) : 0,
//             rentDueDay: parseInt(tenantData.rentDueDay) || 1,
            
//             // Status
//             status: tenantData.status || 'active',
            
//             // Emergency Contact
//             emergencyContact: tenantData.emergencyContact || null,
            
//             // Payment Information
//             paymentMethod: tenantData.paymentMethod || null,
            
//             // Documents
//             documents: [],
            
//             // Notes
//             notes: tenantData.notes || null,
            
//             // Meta
//             createdBy: new ObjectId(userId),
//             companyId: new ObjectId(companyId),
            
//             // Audit Trail
//             auditTrail: [{
//                 action: 'CREATE',
//                 userId: new ObjectId(userId),
//                 timestamp: new Date(),
//                 changes: tenantData,
//                 ip: request.headers.get('x-forwarded-for') || null
//             }],
            
//             // Timestamps
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             deletedAt: null,
//             deletedBy: null
//         };
        
//         // Insert tenant
//         const result = await db.collection('tenants').insertOne(tenant);
        
//         // Update user stats
//         await db.collection('users').updateOne(
//             { _id: new ObjectId(userId) },
//             { 
//                 $inc: { 'stats.totalTenants': 1 },
//                 $set: { updatedAt: new Date() }
//             }
//         );
        
//         return NextResponse.json({
//             success: true,
//             message: 'Tenant created successfully',
//             tenant: {
//                 id: result.insertedId,
//                 ...tenant
//             }
//         });
        
//     } catch (error) {
//         console.error('Create tenant error:', error);
        
//         if (error.message.includes('Authentication')) {
//             return NextResponse.json(
//                 { error: 'Authentication required' },
//                 { status: 401 }
//             );
//         }
        
//         return NextResponse.json(
//             { error: 'Failed to create tenant' },
//             { status: 500 }
//         );
//     }
// }

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