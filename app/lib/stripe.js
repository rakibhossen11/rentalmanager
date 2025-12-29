import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Price IDs from Stripe Dashboard
const PRICES = {
    basic: {
        monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY,
        yearly: process.env.STRIPE_PRICE_BASIC_YEARLY
    },
    professional: {
        monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
        yearly: process.env.STRIPE_PRICE_PRO_YEARLY
    },
    enterprise: {
        monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
        yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY
    }
};

export async function createOrGetCustomer(user, email, name) {
    const { db } = await connectToDatabase();
    
    // Check if user already has a Stripe customer ID
    if (user.subscription?.stripeCustomerId) {
        try {
            const customer = await stripe.customers.retrieve(user.subscription.stripeCustomerId);
            return customer;
        } catch (error) {
            // Customer doesn't exist in Stripe, create new one
        }
    }
    
    // Create new customer
    const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
            userId: user._id.toString(),
            signupDate: new Date().toISOString()
        }
    });
    
    // Save customer ID to user
    await db.collection('users').updateOne(
        { _id: user._id },
        {
            $set: {
                'subscription.stripeCustomerId': customer.id,
                updatedAt: new Date()
            }
        }
    );
    
    return customer;
}

export async function createCheckoutSession(customerId, priceId, userId, plan) {
    return stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
            price: priceId,
            quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        metadata: {
            userId,
            plan
        },
        subscription_data: {
            trial_period_days: 14,
            metadata: {
                userId,
                plan
            }
        }
    });
}

export async function handleSubscriptionWebhook(event) {
    const { db } = await connectToDatabase();
    const subscription = event.data.object;
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
        throw new Error('No user ID in subscription metadata');
    }
    
    switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            await updateUserSubscription(userId, subscription);
            break;
            
        case 'customer.subscription.deleted':
            await cancelUserSubscription(userId);
            break;
            
        case 'invoice.payment_succeeded':
            await handleSuccessfulPayment(subscription);
            break;
            
        case 'invoice.payment_failed':
            await handleFailedPayment(subscription);
            break;
    }
}

async function updateUserSubscription(userId, subscription) {
    const { db } = await connectToDatabase();
    
    const planMap = {
        'price_basic_monthly': 'basic',
        'price_basic_yearly': 'basic',
        'price_pro_monthly': 'professional',
        'price_pro_yearly': 'professional',
        'price_enterprise_monthly': 'enterprise',
        'price_enterprise_yearly': 'enterprise'
    };
    
    const priceId = subscription.items.data[0].price.id;
    const plan = planMap[priceId] || 'basic';
    
    const updateData = {
        'subscription.plan': plan,
        'subscription.status': subscription.status,
        'subscription.stripeSubscriptionId': subscription.id,
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
        updatedAt: new Date()
    };
    
    // Update limits based on plan
    if (plan === 'basic') {
        updateData['limits.tenants'] = 100;
        updateData['limits.properties'] = 25;
        updateData['limits.users'] = 3;
        updateData['limits.storage'] = 1024; // 1GB
    } else if (plan === 'professional') {
        updateData['limits.tenants'] = 1000; // Practical unlimited
        updateData['limits.properties'] = 100;
        updateData['limits.users'] = 10;
        updateData['limits.storage'] = 10240; // 10GB
    } else if (plan === 'enterprise') {
        updateData['limits.tenants'] = 10000; // Unlimited
        updateData['limits.properties'] = 1000; // Unlimited
        updateData['limits.users'] = 25;
        updateData['limits.storage'] = 51200; // 50GB
    }
    
    await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateData }
    );
}

async function cancelUserSubscription(userId) {
    const { db } = await connectToDatabase();
    
    await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                'subscription.plan': 'free',
                'subscription.status': 'canceled',
                'subscription.stripeSubscriptionId': null,
                'subscription.currentPeriodEnd': null,
                'limits.tenants': 10,
                'limits.properties': 5,
                'limits.users': 1,
                'limits.storage': 100,
                updatedAt: new Date()
            }
        }
    );
}