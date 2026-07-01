import { NextResponse } from "next/server";
  import { getDb } from "@/lib/db";

  export const dynamic = "force-dynamic";

  export async function GET() {
    const checks: Record<string, string> = {};

    // Check env vars
    checks.MONGODB_URI = process.env.MONGODB_URI ? "✅ set" : "❌ NOT SET";
    checks.DATABASE_URL = process.env.DATABASE_URL ? "✅ set" : "❌ not set";
    checks.SESSION_SECRET = process.env.SESSION_SECRET ? "✅ set" : "⚠️ using fallback";
    checks.MONGODB_DB = process.env.MONGODB_DB || "infinityx (default)";

    // Try to connect to MongoDB
    try {
      const db = await getDb();
      await db.command({ ping: 1 });
      checks.mongodb = "✅ connected";
    } catch (err) {
      checks.mongodb = "❌ " + (err instanceof Error ? err.message : String(err));
    }

    const allOk = !Object.values(checks).some((v) => v.startsWith("❌"));
    return NextResponse.json({ status: allOk ? "ok" : "error", checks }, { status: allOk ? 200 : 500 });
  }
  