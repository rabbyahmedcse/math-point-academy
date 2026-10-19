import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "coaching";
if (!uri) throw new Error("MONGODB_URI is not set (see .env.example)");

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

/** Mongoose connection (domain models). Cached across hot reloads / serverless invocations. */
export async function connectDB() {
  const cache = (globalThis._mongooseCache ??= { conn: null, promise: null });
  if (cache.conn) return cache.conn;
  cache.promise ??= mongoose.connect(uri!, { dbName, bufferCommands: false });
  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null; // allow a retry on the next request
    throw e;
  }
  return cache.conn;
}

/** Native driver handle used by the Better Auth MongoDB adapter. Same database as Mongoose. */
export const mongoClient = (globalThis._mongoClient ??= new MongoClient(uri));
export const authDb = mongoClient.db(dbName);
