import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'rentalManagerDB';

if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI environment variable');
}

// In Next.js, use a global variable to preserve the connection across HMR.
let cached = global.mongo;

if (!cached) {
    cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            maxPoolSize: 100, // SaaS often needs higher pools for multiple users
            minPoolSize: 10,
            maxIdleTimeMS: 60000,
            connectTimeoutMS: 10000,
            family: 4, 
        };

        // Standard MongoClient instantiation
        const client = new MongoClient(MONGODB_URI, opts);

        cached.promise = client.connect().then(async (client) => {
            const db = client.db(MONGODB_DB);
            
            // Log connection only once
            console.log(`🚀 SaaS DB Connected: ${MONGODB_DB}`);

            // Ensure critical SaaS indexes exist
            const users = db.collection('users');
            await users.createIndex({ email: 1 }, { unique: true });
            
            // Index by companyId/tenantId for multi-tenant performance
            const tenants = db.collection('tenants');
            await tenants.createIndex({ companyId: 1 }); 

            return { client, db };
        }).catch((err) => {
            cached.promise = null; // Important: reset promise on error
            throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

/**
 * Helper: Use this inside your API routes
 * Usage: const db = await getDatabase();
 */
export async function getDatabase() {
    const { db } = await connectToDatabase();
    return db;
}

export { ObjectId };


// import { MongoClient, ObjectId } from 'mongodb';

// const MONGODB_URI = process.env.MONGODB_URI;
// const MONGODB_DB = process.env.MONGODB_DB || 'rentalManagerDB';

// if (!MONGODB_URI) {
//     throw new Error('Please define MONGODB_URI environment variable');
// }

// let cached = global.mongo;

// if (!cached) {
//     cached = global.mongo = { conn: null, promise: null };
// }

// export async function connectToDatabase() {
//     if (cached.conn) {
//         return cached.conn;
//     }

//     if (!cached.promise) {
//         // Remove deprecated options - these are the default in newer MongoDB drivers
//         const opts = {
//             maxPoolSize: 50, // Increased for SaaS
//             minPoolSize: 10,
//             maxIdleTimeMS: 30000,
//             serverSelectionTimeoutMS: 10000, // Increased timeout
//             socketTimeoutMS: 45000,
//             connectTimeoutMS: 10000,
//             family: 4, // Use IPv4, skip trying IPv6
//             // TLS/SSL options for production
//             ...(process.env.NODE_ENV === 'production' && {
//                 ssl: true,
//                 tlsAllowInvalidCertificates: false,
//                 replicaSet: process.env.MONGODB_REPLICA_SET,
//                 retryWrites: true,
//                 w: 'majority'
//             })
//         };

//         console.log("mongoclicent");
//         console.log("mongoclicent",MongoClient);
//         cached.promise = MongoClient.connect(MONGODB_URI, opts)
//             .then(async (client) => {
//                 const db = client.db(MONGODB_DB);
                
//                 console.log('✅ MongoDB connected successfully');
                
//                 // Create indexes with better error handling
//                 try {
//                     // Users collection indexes
//                     await db.collection('users').createIndex({ email: 1 }, { unique: true });
//                     await db.collection('users').createIndex({ 'subscription.plan': 1 });
//                     await db.collection('users').createIndex({ 'subscription.status': 1 });
//                     await db.collection('users').createIndex({ createdAt: -1 });
                    
//                     // Tenants collection indexes
//                     await db.collection('tenants').createIndex(
//                         { email: 1, companyId: 1 }, 
//                         { unique: true, partialFilterExpression: { email: { $exists: true } } }
//                     );
//                     await db.collection('tenants').createIndex({ companyId: 1, status: 1 });
//                     await db.collection('tenants').createIndex({ companyId: 1, createdAt: -1 });
//                     await db.collection('tenants').createIndex({ phone: 1 });
//                     await db.collection('tenants').createIndex({ 'leaseEnd': 1 });
                    
//                     // Properties collection indexes
//                     await db.collection('properties').createIndex({ companyId: 1 });
//                     await db.collection('properties').createIndex({ companyId: 1, status: 1 });
                    
//                     // Subscriptions collection indexes
//                     await db.collection('subscriptions').createIndex({ userId: 1 }, { unique: true });
//                     await db.collection('subscriptions').createIndex({ stripeCustomerId: 1 });
//                     await db.collection('subscriptions').createIndex({ stripeSubscriptionId: 1 });
//                     await db.collection('subscriptions').createIndex({ status: 1 });
                    
//                     // Payments collection indexes
//                     await db.collection('payments').createIndex({ tenantId: 1, date: -1 });
//                     await db.collection('payments').createIndex({ companyId: 1, status: 1 });
                    
//                     // Maintenance requests indexes
//                     await db.collection('maintenance').createIndex({ companyId: 1, status: 1 });
//                     await db.collection('maintenance').createIndex({ createdAt: -1 });
                    
//                     // Audit logs indexes
//                     await db.collection('audit_logs').createIndex({ companyId: 1, timestamp: -1 });
//                     await db.collection('audit_logs').createIndex({ userId: 1, action: 1 });
                    
//                     console.log('✅ Database indexes created/verified');
//                 } catch (indexError) {
//                     console.error('Error creating indexes:', indexError);
//                     // Don't throw, continue with connection
//                 }
                
//                 return { client, db };
//             })
//             .catch((error) => {
//                 console.error('❌ MongoDB connection error:', error);
//                 cached.promise = null; // Reset promise on error
//                 throw error;
//             });
//     }

//     cached.conn = await cached.promise;
//     return cached.conn;
// }

// export { ObjectId };

// // Helper function to get database instance
// export async function getDatabase() {
//     const { db } = await connectToDatabase();
//     return db;
// }

// // Helper function to get collection
// export async function getCollection(collectionName) {
//     const { db } = await connectToDatabase();
//     return db.collection(collectionName);
// }

// // Helper function for pagination
// export async function paginateCollection(collectionName, query = {}, options = {}) {
//     const collection = await getCollection(collectionName);
    
//     const {
//         page = 1,
//         limit = 20,
//         sort = { _id: -1 },
//         projection = {}
//     } = options;
    
//     const skip = (page - 1) * limit;
    
//     const [data, total] = await Promise.all([
//         collection
//             .find(query, { projection })
//             .sort(sort)
//             .skip(skip)
//             .limit(limit)
//             .toArray(),
//         collection.countDocuments(query)
//     ]);
    
//     return {
//         data,
//         pagination: {
//             page,
//             limit,
//             total,
//             pages: Math.ceil(total / limit)
//         }
//     };
// }

// // Helper function for atomic operations
// export async function withTransaction(callback) {
//     const { client } = await connectToDatabase();
//     const session = client.startSession();
    
//     try {
//         let result;
//         await session.withTransaction(async () => {
//             result = await callback(session);
//         });
//         return result;
//     } finally {
//         await session.endSession();
//     }
// }


// import { MongoClient } from 'mongodb';

// const uri = process.env.MONGODB_URI;
// // console.log(uri);
// const options = {};

// let client;
// let clientPromise;

// if (!process.env.MONGODB_URI) {
//   throw new Error('Please add your MongoDB URI to .env.local');
// }

// if (process.env.NODE_ENV === 'development') {
//   // In development mode, use a global variable so the database connection
//   // is preserved across module reloads caused by HMR (Hot Module Replacement)
//   if (!global._mongoClientPromise) {
//     client = new MongoClient(uri, options);
//     global._mongoClientPromise = client.connect();
//   }
//   clientPromise = global._mongoClientPromise;
// } else {
//   // In production mode, it's best to not use a global variable
//   client = new MongoClient(uri, options);
//   clientPromise = client.connect();
// }

// // Export a module-scoped MongoClient promise. By doing this in a
// // separate module, the client can be shared across functions.
// export { clientPromise };

// // Also export connectToDatabase for your other API routes
// export async function connectToDatabase() {
//   const client = await clientPromise;
//   const db = client.db(process.env.MONGODB_DATABASE || 'rentalManagerDB');
//   return { client, db };
// }