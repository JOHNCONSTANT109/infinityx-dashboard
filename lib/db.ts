import { MongoClient, MongoClientOptions, Db } from "mongodb";

  const dbName = process.env.MONGODB_DB || "infinityx";

  // Serverless-optimised options: short timeouts so functions fail fast
  // instead of hanging until the browser gives up.
  const MONGO_OPTIONS: MongoClientOptions = {
    connectTimeoutMS: 8000,
    socketTimeoutMS: 8000,
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 1,        // one connection per cold-start lambda
    minPoolSize: 0,
    maxIdleTimeMS: 10000,
  };

  declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
  }

  let clientPromise: Promise<MongoClient> | null = null;

  function getClientPromise(): Promise<MongoClient> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        "MONGODB_URI is not set. Add it in Vercel → Project → Settings → Environment Variables."
      );
    }

    // In development, reuse the global to survive HMR restarts.
    if (process.env.NODE_ENV === "development") {
      if (!global._mongoClientPromise) {
        global._mongoClientPromise = new MongoClient(uri, MONGO_OPTIONS).connect();
      }
      return global._mongoClientPromise;
    }

    // In production (serverless), one client per function instance is fine.
    if (!clientPromise) {
      clientPromise = new MongoClient(uri, MONGO_OPTIONS).connect();
    }
    return clientPromise;
  }

  export async function getDb(): Promise<Db> {
    const client = await getClientPromise();
    return client.db(dbName);
  }
  