// app/api/properties/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
// import { getServerSession } from '@/app/lib/auth-helper';

export async function GET(request) {
  try {
    const user = await getServerSession();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    const userId = new ObjectId(user.id);

    // Build query with user isolation
    let query = { userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }

    // Execute queries in parallel
    const [properties, total] = await Promise.all([
      db.collection('properties')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('properties').countDocuments(query)
    ]);

    // Get tenant counts for each property
    const propertiesWithStats = await Promise.all(
      properties.map(async (property) => {
        const tenantCount = await db.collection('tenants').countDocuments({
          propertyId: property._id,
          status: 'active'
        });
        
        const totalRevenue = await db.collection('rent_transactions')
          .aggregate([
            {
              $match: {
                propertyId: property._id,
                status: 'paid',
                'period.year': new Date().getFullYear()
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount.total' }
              }
            }
          ])
          .toArray();

        return {
          ...property,
          _id: property._id.toString(),
          userId: property.userId.toString(),
          tenantCount,
          totalRevenue: totalRevenue[0]?.total || 0
        };
      })
    );

    return NextResponse.json({
      properties: propertiesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // const user = await getServerSession();
    // if (!user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // const userId = new ObjectId(user.id);
    const body = await request.json();
    console.log(body);
    // const { db } = await connectToDatabase();

    // // Check user limits
    // if (user.subscription?.plan === 'free') {
    //   const propertyCount = await db.collection('properties').countDocuments({ userId });
    //   const userLimit = user.limits?.properties || 5;
      
    //   if (propertyCount >= userLimit) {
    //     return NextResponse.json(
    //       { error: `Free plan limited to ${userLimit} properties. Please upgrade.` },
    //       { status: 403 }
    //     );
    //   }
    // }

    // // Validate required fields
    // if (!body.name || !body.address?.street || !body.address?.city) {
    //   return NextResponse.json(
    //     { error: 'Missing required fields: name, address.street, address.city' },
    //     { status: 400 }
    //   );
    // }

    // // Create property document
    // const propertyData = {
    //   userId,
    //   name: body.name,
    //   type: body.type || 'apartment',
    //   status: body.status || 'active',
    //   address: {
    //     street: body.address.street,
    //     unit: body.address.unit || '',
    //     city: body.address.city,
    //     state: body.address.state || '',
    //     zipCode: body.address.zipCode || '',
    //     country: body.address.country || 'US'
    //   },
    //   details: {
    //     bedrooms: body.details?.bedrooms || 0,
    //     bathrooms: body.details?.bathrooms || 0,
    //     squareFeet: body.details?.squareFeet || 0,
    //     yearBuilt: body.details?.yearBuilt || null,
    //     lotSize: body.details?.lotSize || 0,
    //     floors: body.details?.floors || 1,
    //     parkingSpaces: body.details?.parkingSpaces || 0,
    //     amenities: body.details?.amenities || []
    //   },
    //   financial: {
    //     purchasePrice: body.financial?.purchasePrice || 0,
    //     currentValue: body.financial?.currentValue || 0,
    //     marketRent: body.financial?.marketRent || 0,
    //     propertyTax: body.financial?.propertyTax || 0,
    //     insurance: body.financial?.insurance || 0,
    //     hoaFees: body.financial?.hoaFees || 0,
    //     mortgage: body.financial?.mortgage || {
    //       hasMortgage: false,
    //       lender: '',
    //       loanAmount: 0,
    //       interestRate: 0,
    //       monthlyPayment: 0,
    //       termYears: 30
    //     }
    //   },
    //   tenants: [],
    //   documents: [],
    //   images: body.images || [],
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // };

    // // Insert into database
    // const result = await db.collection('properties').insertOne(propertyData);

    // // Update user stats
    // await db.collection('users').updateOne(
    //   { _id: userId },
    //   { 
    //     $inc: { 'stats.totalProperties': 1 },
    //     $set: { updatedAt: new Date() }
    //   }
    // );

    // return NextResponse.json({
    //   message: 'Property added successfully',
    //   propertyId: result.insertedId.toString(),
    //   property: {
    //     ...propertyData,
    //     _id: result.insertedId.toString()
    //   }
    // }, { status: 201 });
  } catch (error) {
    console.error('Error adding property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}