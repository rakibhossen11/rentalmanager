// app/api/properties/count/route.js
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { getSession } from '@/app/lib/auth';

export async function GET(request) {
  try {
    await connectToDatabase();
    const { db } = await connectToDatabase();

    const session = await getSession(request);
    

    // Mock session based on your data
    // const session = {
    //   id: '6954b698341c568fccdc8acf',
    //   subscription: { plan: 'free' },
    //   limits: { tenants: 10, properties: 5, users: 1, storage: 100 }
    // };

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = new ObjectId(session.id);

    // Count user's properties
    const count = await db.collection('properties')
      .countDocuments({ userId });

    // Get user data to check subscription
    const user = await db.collection('users').findOne(
      { _id: userId },
      { projection: { subscription: 1, limits: 1 } }
    );

    return NextResponse.json({
      success: true,
      count,
      user: {
        subscription: user?.subscription || session.subscription,
        limits: user?.limits || session.limits
      },
      usage: {
        current: count,
        max: user?.limits?.properties || session.limits.properties,
        percentage: Math.round((count / (user?.limits?.properties || session.limits.properties)) * 100)
      }
    });

  } catch (error) {
    console.error('Error counting properties:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to count properties',
        message: error.message
      }, 
      { status: 500 }
    );
  }
}


// // app/api/tenants/count/route.js
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { connectToDatabase } from '@/lib/mongodb';
// import { ObjectId } from 'mongodb';

// export async function GET(request) {
//   try {
//     const session = await getServerSession();
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const userId = new ObjectId(session.user.id);
//     const { db } = await connectToDatabase();

//     const count = await db.collection('tenants').countDocuments({
//       userId,
//       status: { $ne: 'deleted' } // Don't count deleted tenants
//     });

//     return NextResponse.json({ count });
//   } catch (error) {
//     console.error('Error counting tenants:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }