
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'rentalManagerDB';

if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI environment variable');
}

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
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        cached.promise = MongoClient.connect(MONGODB_URI, opts)
            .then((client) => {
                const db = client.db(MONGODB_DB);
                
                // Create indexes
                db.collection('users').createIndex({ email: 1 }, { unique: true });
                db.collection('tenants').createIndex({ email: 1, companyId: 1 }, { unique: true });
                db.collection('tenants').createIndex({ companyId: 1, status: 1 });
                db.collection('tenants').createIndex({ companyId: 1, createdAt: -1 });
                db.collection('subscriptions').createIndex({ userId: 1 }, { unique: true });
                db.collection('subscriptions').createIndex({ stripeSubscriptionId: 1 });
                
                return { client, db };
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export { ObjectId };

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