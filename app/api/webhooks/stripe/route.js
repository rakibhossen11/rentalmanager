import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { connectToDatabase, ObjectId } from '@/lib/mongodb';
import { handleSubscriptionWebhook } from '@/lib/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
    try {
        const body = await request.text();
        const headersList = await headers();
        const signature = headersList.get('stripe-signature');
        
        let event;
        
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (error) {
            console.error('Webhook signature verification failed:', error.message);
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }
        
        // Handle the event
        await handleSubscriptionWebhook(event);
        
        return NextResponse.json({ received: true });
        
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}