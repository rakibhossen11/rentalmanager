// api/admin/users/stats/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { verifyToken } from '@/app/lib/auth';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const admin = verifyToken(token);
    
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usersCollection = await connectToDatabase('users');

    // Get all stats in parallel for better performance
    const [
      total,
      active,
      admins,
      newThisMonth,
      onlineNow
    ] = await Promise.all([
      // Total users
      usersCollection.countDocuments({}),
      
      // Active users
      usersCollection.countDocuments({ status: 'active' }),
      
      // Admins
      usersCollection.countDocuments({ role: 'admin' }),
      
      // New this month
      (async () => {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        return usersCollection.countDocuments({
          createdAt: { $gte: startOfMonth }
        });
      })(),
      
      // Online now (last 5 minutes)
      (async () => {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        return usersCollection.countDocuments({
          lastLogin: { $gte: fiveMinutesAgo }
        });
      })()
    ]);

    return NextResponse.json({
      total,
      active,
      admins,
      newThisMonth,
      onlineNow
    });
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}