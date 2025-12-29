import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { connectToDatabase, ObjectId } from '@/app/lib/mongodb';

export async function GET(request) {
    try {
        const { companyId } = await requireAuth(request);
        
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const type = searchParams.get('type');
        
        const { db } = await connectToDatabase();
        
        // Build query
        const query = { companyId: new ObjectId(companyId) };
        
        if (type) {
            query.type = type;
        }
        
        // Get activities
        const activities = await db.collection('activities')
            .find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();
        
        return NextResponse.json({
            activities,
            count: activities.length
        });
        
    } catch (error) {
        console.error('Get activities error:', error);
        
        if (error.message.includes('Authentication')) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to fetch activities' },
            { status: 500 }
        );
    }
}

// Create activity
export async function POST(request) {
    try {
        const { userId, companyId } = await requireAuth(request);
        const activityData = await request.json();
        
        const { db } = await connectToDatabase();
        
        const activity = {
            type: activityData.type,
            title: activityData.title,
            description: activityData.description,
            userId: new ObjectId(userId),
            companyId: new ObjectId(companyId),
            metadata: activityData.metadata || {},
            timestamp: new Date(),
            createdAt: new Date()
        };
        
        await db.collection('activities').insertOne(activity);
        
        return NextResponse.json({
            success: true,
            message: 'Activity recorded',
            activity
        });
        
    } catch (error) {
        console.error('Create activity error:', error);
        return NextResponse.json(
            { error: 'Failed to record activity' },
            { status: 500 }
        );
    }
}