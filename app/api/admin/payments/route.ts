import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const OWNER_NUMBER = "2349126325901";

async function isAdmin(session: Awaited<ReturnType<typeof getSession>>) {
  return session.isLoggedIn && (
    session.number === OWNER_NUMBER ||
    session.username?.toLowerCase() === "mrdeeznuts"
  );
}

export async function GET() {
  try {
    const session = await getSession();
    if (!await isAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const db = await getDb();
    const requests = await db
      .collection("payment_requests")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    return NextResponse.json({ requests });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!await isAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { requestId, action } = await req.json();
    if (!requestId || !["approve", "deny"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const db = await getDb();
    const payReq = await db.collection("payment_requests").findOne({ _id: requestId });
    if (!payReq) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (payReq.status !== "pending") {
      return NextResponse.json({ error: "Already processed" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "approved" : "denied";

    if (action === "approve") {
      // Credit gold to wallet
      await (db.collection("economy") as any).updateOne(
        { _id: payReq.userId },
        { $inc: { wallet: payReq.goldAmount } },
        { upsert: true }
      );
    }

    await (db.collection("payment_requests") as any).updateOne(
      { _id: requestId },
      { $set: { status: newStatus, processedAt: Date.now() } }
    );

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
