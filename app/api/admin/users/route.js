import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    // Connect to database - this returns an object with client and db
    const connection = await connectToDatabase();
    
    // Access the client and get the specific database
    const client = connection.client;
    const db = client.db('rentalManagerDB'); // Use your database name here
    
    // Now get the users collection
    const usersCollection = db.collection('users');
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) query.role = role;
    if (status) query.status = status;

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get users (exclude password field)
    const users = await usersCollection
      .find(query)
      .project({ password: 0 }) // Exclude password for security
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count
    const total = await usersCollection.countDocuments(query);

    return NextResponse.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}

// // api/admin/users/route.js (Next.js App Router) OR server.js (Express)

// import { NextResponse } from 'next/server';
// import { connectToDatabase } from '@/app/lib/mongodb';
// import bcrypt from 'bcryptjs';
// import { verifyToken } from '@/app/lib/auth';

// // GET all users
// export async function GET(request) {
//   try {
//     // Verify admin token
//     // const token = request.headers.get('authorization')?.replace('Bearer ', '');
//     // const admin = verifyToken(token);
//     // console.log(admin);
    
//     // if (!admin || admin.role !== 'admin') {
//     //   return NextResponse.json(
//     //     { error: 'Unauthorized' },
//     //     { status: 401 }
//     //   );
//     // }

//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page')) || 1;
//     const limit = parseInt(searchParams.get('limit')) || 10;
//     const search = searchParams.get('search') || '';
//     const role = searchParams.get('role');
//     const status = searchParams.get('status');

//     const usersCollection = await connectToDatabase('users');
    
//     // Build query
//     // const query = {};
    
//     // if (search) {
//     //   query.$or = [
//     //     { name: { $regex: search, $options: 'i' } },
//     //     { email: { $regex: search, $options: 'i' } }
//     //   ];
//     // }
    
//     // if (role) query.role = role;
//     // if (status) query.status = status;

//     // // Calculate pagination
//     // const skip = (page - 1) * limit;
    
//     // Get users (exclude password field)
//     const users = await usersCollection.find();
//     //   .find(query)
//     //   .project({ password: 0 }) // Exclude password
//     //   .sort({ createdAt: -1 })
//     //   .skip(skip)
//     //   .limit(limit)
//     //   .toArray();

//     // Get total count
//     const total = await usersCollection.countDocuments(query);

//     return NextResponse.json({
//       users,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       total
//     });
    
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch users' },
//       { status: 500 }
//     );
//   }
// }