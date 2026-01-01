// app/api/auth/me/route.js
import { connectToDatabase } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    // Get session token from request cookies
    const sessionToken = request.cookies.get('session_token')?.value;
    
    console.log('Session token from request:', sessionToken ? 'Found' : 'Not found');
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    // Find valid session
    const session = await db.collection('sessions').findOne({
      session_id: sessionToken,
      expires_at: { $gt: new Date() }
    });

    if (!session) {
      console.error('Session not found or expired');
      // Create a response and delete the cookie
      const response = NextResponse.json(
        { success: false, message: 'Session expired or invalid' },
        { status: 401 }
      );
      response.cookies.delete('session_token');
      return response;
    }

    // Get user data - FIXED PROJECTION
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(session.user_id) },
      {
        // Option 1: Specify fields to INCLUDE (recommended for sensitive data)
        projection: {
          name: 1,
          email: 1,
          user_account_no: 1,
          role: 1,
          isAdmin: 1,
          permissions: 1,
          status: 1,
          created_at: 1,
          updated_at: 1,
          avatar: 1,
          companyName: 1,
          subscription: 1,
          stats: 1,
          // _id is included by default, but you can explicitly include it
          _id: 1
        }
      }
    );

    // OR Option 2: Specify fields to EXCLUDE (less secure if new fields are added)
    // projection: {
    //   password_hash: 0,
    //   reset_token: 0,
    //   verification_token: 0,
    //   reset_token_expiry: 0
    //   // _id: 0 // If you don't want _id, but usually you need it
    // }

    if (!user) {
      // Delete orphaned session
      await db.collection('sessions').deleteOne({ session_id: sessionToken });
      
      const response = NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
      response.cookies.delete('session_token');
      return response;
    }

    // Check account status
    if (user.status && user.status !== 'active') {
      return NextResponse.json(
        { 
          success: false, 
          message: `Account is ${user.status}`,
          accountStatus: user.status
        },
        { status: 403 }
      );
    }

    // Refresh session expiry
    const newExpiry = new Date();
    newExpiry.setHours(newExpiry.getHours() + 24);
    
    await db.collection('sessions').updateOne(
      { session_id: sessionToken },
      { $set: { expires_at: newExpiry } }
    );

    // Prepare user data
    const userData = {
      id: user._id.toString(),
      user_id: user._id.toString(),
      name: user.name || '',
      email: user.email || '',
      user_account_no: user.user_account_no || '',
      role: user.role || 'user',
      isAdmin: user.isAdmin || false,
      permissions: user.permissions || [],
      status: user.status || 'active',
      created_at: user.created_at || new Date(),
      updated_at: user.updated_at || new Date(),
      avatar: user.avatar || '',
      companyName: user.companyName || '',
      subscription: user.subscription || { plan: 'free', status: 'active' },
      stats: user.stats || {}
    };

    // Create response with updated cookie
    const response = NextResponse.json({ 
      success: true, 
      data: userData 
    });

    // Update cookie expiry
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: newExpiry,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoServerError') {
      console.error('MongoDB error details:', error.message);
      
      if (error.code === 31254) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Database configuration error',
            error: process.env.NODE_ENV === 'development' ? 'Invalid projection in query' : undefined
          },
          { status: 500 }
        );
      }
    }
    
    // Handle ObjectId errors
    if (error.message.includes('ObjectId')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid user ID format'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}


// app/api/auth/me/route.js
// import { connectToDatabase } from '@/app/lib/mongodb';
// import { NextResponse } from 'next/server';
// import { ObjectId } from 'mongodb';
// import { cookies } from 'next/headers';

// export async function GET() {
//   try {
//     // Get token from cookies (using Next.js 13+ cookies() API)
//     const cookieStore = cookies();
//     console.log(cookieStore);
//     const sessionToken = cookieStore.get('session_token')?.value;
    
//     if (!sessionToken) {
//       console.error('No session token found in cookies');
//       return NextResponse.json(
//         { success: false, message: 'Not authenticated' },
//         { status: 401 }
//       );
//     }

//     // Connect to MongoDB
//     const { db } = await connectToDatabase();

//     // Find valid session
//     const session = await db.collection('sessions').findOne({
//       session_id: sessionToken,
//       expires_at: { $gt: new Date() }
//     });

//     if (!session) {
//       console.error('Session not found or expired');
//       // Clean up invalid session cookie
//       cookieStore.delete('session_token');
//       return NextResponse.json(
//         { success: false, message: 'Session expired or invalid' },
//         { status: 401 }
//       );
//     }

//     console.log('Session found:', {
//       session_id: session.session_id,
//       user_id: session.user_id,
//       expires_at: session.expires_at
//     });

//     // Validate user_id exists in session
//     if (!session.user_id) {
//       console.error('Session missing user_id:', session);
//       // Delete invalid session
//       await db.collection('sessions').deleteOne({ session_id: sessionToken });
//       return NextResponse.json(
//         { success: false, message: 'Invalid session format' },
//         { status: 401 }
//       );
//     }

//     try {
//       // Get user data with error handling
//       const user = await db.collection('users').findOne(
//         { _id: new ObjectId(session.user_id) },
//         {
//           projection: {
//             _id: 1,
//             name: 1,
//             email: 1,
//             user_account_no: 1,
//             role: 1,
//             isAdmin: 1,
//             permissions: 1,
//             status: 1,
//             created_at: 1,
//             updated_at: 1,
//             // Exclude sensitive fields
//             password_hash: 0,
//             reset_token: 0,
//             reset_token_expiry: 0,
//             verification_token: 0
//           }
//         }
//       );
      
//       console.log('Query results:', {
//         found: !!user,
//         user_id: session.user_id
//       });

//       if (!user) {
//         console.error('No user found with ID:', session.user_id);
//         // Delete orphaned session
//         await db.collection('sessions').deleteOne({ session_id: sessionToken });
//         return NextResponse.json(
//           { success: false, message: 'User not found' },
//           { status: 404 }
//         );
//       }

//       // Check if user account is active
//       if (user.status && user.status !== 'active') {
//         console.error('User account is not active:', user.status);
//         return NextResponse.json(
//           { 
//             success: false, 
//             message: 'Account is not active',
//             accountStatus: user.status
//           },
//           { status: 403 }
//         );
//       }

//       // Update session expiry (optional - refresh on access)
//       const newExpiry = new Date();
//       newExpiry.setHours(newExpiry.getHours() + 24); // 24 hours from now
      
//       await db.collection('sessions').updateOne(
//         { session_id: sessionToken },
//         { $set: { expires_at: newExpiry } }
//       );

//       // Update cookie with new expiry
//       cookieStore.set('session_token', sessionToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'lax',
//         expires: newExpiry,
//         path: '/',
//       });

//       // Format user data for response
//       const userData = {
//         user_id: user._id.toString(),
//         id: user._id.toString(),
//         name: user.name,
//         email: user.email,
//         user_account_no: user.user_account_no,
//         role: user.role || 'user',
//         isAdmin: user.isAdmin || false,
//         permissions: user.permissions || [],
//         status: user.status || 'active',
//         created_at: user.created_at,
//         updated_at: user.updated_at
//       };

//       console.log('Retrieved user data:', {
//         id: userData.id,
//         name: userData.name,
//         email: userData.email,
//         role: userData.role,
//         isAdmin: userData.isAdmin
//       });

//       return NextResponse.json({ 
//         success: true, 
//         data: userData,
//         session: {
//           expires_at: newExpiry,
//           token: sessionToken.substring(0, 10) + '...' // Partial token for debugging
//         }
//       });
//     } catch (queryError) {
//       console.error('Database query failed:', queryError);
//       return NextResponse.json(
//         { success: false, message: 'Database error' },
//         { status: 500 }
//       );
//     }
//   } catch (error) {
//     console.error('Unexpected error in /api/auth/me:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Server error',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       },
//       { status: 500 }
//     );
//   }
// }

// // Optional: POST method to update user session or validate without updating
// export async function POST(request) {
//   try {
//     const { action } = await request.json();
//     const cookieStore = cookies();
//     const sessionToken = cookieStore.get('session_token')?.value;
    
//     if (!sessionToken) {
//       return NextResponse.json(
//         { success: false, message: 'No session found' },
//         { status: 401 }
//       );
//     }

//     const { db } = await connectToDatabase();

//     if (action === 'validate') {
//       // Just validate without updating
//       const session = await db.collection('sessions').findOne({
//         session_id: sessionToken,
//         expires_at: { $gt: new Date() }
//       });

//       if (!session) {
//         return NextResponse.json(
//           { success: false, valid: false, message: 'Session invalid' }
//         );
//       }

//       return NextResponse.json({
//         success: true,
//         valid: true,
//         message: 'Session is valid'
//       });
//     }

//     if (action === 'refresh') {
//       // Refresh session expiry
//       const newExpiry = new Date();
//       newExpiry.setHours(newExpiry.getHours() + 24);

//       const result = await db.collection('sessions').updateOne(
//         { session_id: sessionToken },
//         { $set: { expires_at: newExpiry } }
//       );

//       if (result.modifiedCount === 0) {
//         return NextResponse.json(
//           { success: false, message: 'Session not found' },
//           { status: 404 }
//         );
//       }

//       // Update cookie
//       cookieStore.set('session_token', sessionToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'lax',
//         expires: newExpiry,
//         path: '/',
//       });

//       return NextResponse.json({
//         success: true,
//         message: 'Session refreshed',
//         expires_at: newExpiry
//       });
//     }

//     return NextResponse.json(
//       { success: false, message: 'Invalid action' },
//       { status: 400 }
//     );
//   } catch (error) {
//     console.error('Error in /api/auth/me POST:', error);
//     return NextResponse.json(
//       { success: false, message: 'Server error' },
//       { status: 500 }
//     );
//   }
// }

// // Optional: DELETE method to logout/invalidate session
// export async function DELETE() {
//   try {
//     const cookieStore = cookies();
//     const sessionToken = cookieStore.get('session_token')?.value;
    
//     if (!sessionToken) {
//       return NextResponse.json(
//         { success: false, message: 'No active session' },
//         { status: 400 }
//       );
//     }

//     const { db } = await connectToDatabase();

//     // Delete session from database
//     await db.collection('sessions').deleteOne({
//       session_id: sessionToken
//     });

//     // Clear cookie
//     cookieStore.delete('session_token');

//     return NextResponse.json({
//       success: true,
//       message: 'Session terminated successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting session:', error);
//     return NextResponse.json(
//       { success: false, message: 'Failed to logout' },
//       { status: 500 }
//     );
//   }
// }

// import { NextResponse } from 'next/server';
// import { requireAuth } from '@/app/lib/auth';
// import { connectToDatabase, ObjectId } from '@/app/lib/mongodb';

// export async function GET(request) {
//     try {
//         const { userId } = await requireAuth(request);
        
//         const { db } = await connectToDatabase();
        
//         const user = await db.collection('users').findOne(
//             { _id: new ObjectId(userId) },
//             { projection: { password: 0, verificationToken: 0, resetToken: 0 } }
//         );
        
//         if (!user) {
//             return NextResponse.json(
//                 { error: 'User not found' },
//                 { status: 404 }
//             );
//         }
        
//         return NextResponse.json({
//             user: {
//                 id: user._id,
//                 email: user.email,
//                 name: user.name,
//                 companyName: user.companyName,
//                 avatar: user.avatar,
//                 subscription: user.subscription,
//                 settings: user.settings,
//                 stats: user.stats,
//                 createdAt: user.createdAt,
//                 limits: user.limits
//             }
//         });
        
//     } catch (error) {
//         if (error.message.includes('Authentication')) {
//             return NextResponse.json(
//                 { user: null },
//                 { status: 200 }
//             );
//         }
        
//         console.error('Get user error:', error);
//         return NextResponse.json(
//             { error: 'Failed to get user' },
//             { status: 500 }
//         );
//     }
// }