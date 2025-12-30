import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { connectToDatabase, ObjectId } from '@/app/lib/mongodb';

export async function GET(request) {
    try {
        const { userId } = await requireAuth(request);
        
        const { db } = await connectToDatabase();
        
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0, verificationToken: 0, resetToken: 0 } }
        );
        
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                companyName: user.companyName,
                avatar: user.avatar,
                subscription: user.subscription,
                settings: user.settings,
                stats: user.stats,
                createdAt: user.createdAt,
                limits: user.limits
            }
        });
        
    } catch (error) {
        if (error.message.includes('Authentication')) {
            return NextResponse.json(
                { user: null },
                { status: 200 }
            );
        }
        
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Failed to get user' },
            { status: 500 }
        );
    }
}