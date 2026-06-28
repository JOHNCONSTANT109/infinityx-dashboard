import { MongoClient, Db } from "mongodb";

  const dbName = process.env.MONGODB_DB || "infinityx";

  let clientPromise: Promise<MongoClient> | null = null;

  declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
  }

  function getClientPromise(): Promise<MongoClient> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set. Add it in Vercel → Project → Settings → Environment Variables.");
    }
    if (process.env.NODE_ENV === "development") {
      if (!global._mongoClientPromise) {
        const client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
      }
      return global._mongoClientPromise!;
    }
    if (!clientPromise) {
      const client = new MongoClient(uri);
      clientPromise = client.connect();
    }
    return clientPromise;
  }

  export async function getDb(): Promise<Db> {
    const client = await getClientPromise();
    return client.db(dbName);
  }
  