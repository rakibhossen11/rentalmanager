import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { connectToDatabase, ObjectId } from '@/lib/mongodb';
import { createOrGetCustomer, createCheckoutSession, PRICES } from '@/lib/stripe';

export async function POST(request) {
    try {
        const { userId } = await requireAuth(request);
        const { plan, billingCycle = 'monthly' } = await request.json();
        
        const { db } = await connectToDatabase();
        
        // Get user
        const user = await db.collection('users').findOne({ 
            _id: new ObjectId(userId) 
        });
        
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }
        
        // Check if user already has this plan
        if (user.subscription.plan === plan && user.subscription.status === 'active') {
            return NextResponse.json(
                { error: 'You are already on this plan' },
                { status: 400 }
            );
        }
        
        // Get price ID
        const priceId = PRICES[plan]?.[billingCycle];
        if (!priceId) {
            return NextResponse.json(
                { error: 'Invalid plan or billing cycle' },
                { status: 400 }
            );
        }
        
        // Create or get Stripe customer
        const customer = await createOrGetCustomer(
            user,
            user.email,
            user.name
        );
        
        // Create checkout session
        const session = await createCheckoutSession(
            customer.id,
            priceId,
            userId,
            plan
        );
        
        return NextResponse.json({
            url: session.url
        });
        
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}