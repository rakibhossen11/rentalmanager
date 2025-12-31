// app/api/tenants/count/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = new ObjectId(session.user.id);
    const { db } = await connectToDatabase();

    const count = await db.collection('tenants').countDocuments({
      userId,
      status: { $ne: 'deleted' } // Don't count deleted tenants
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting tenants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}