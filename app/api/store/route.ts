import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const PACKAGES = [
  { id: "starter",  label: "Starter Pack",  gold: 400_000_000,    naira: 500   },
  { id: "champion", label: "Champion Pack", gold: 1_000_000_000,  naira: 1000  },
  { id: "diamond",  label: "Diamond Pack",  gold: 2_500_000_000,  naira: 2000  },
  { id: "legend",   label: "Legend Pack",   gold: 5_000_000_000,  naira: 3500  },
  { id: "hero",     label: "Hero Pack",     gold: 10_000_000_000, naira: 6000  },
  { id: "deity",    label: "Deity Pack",    gold: 25_000_000_000, naira: 12000 },
];

interface PaymentRequest {
  _id: string;
  userId: string;
  username: string;
  whatsappNumber: string;
  packageId: string;
  packageLabel: string;
  goldAmount: number;
  nairaAmount: number;
  reference: string;
  status: "pending" | "approved" | "denied";
  createdAt: number;
  processedAt?: number;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.botKey) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { packageId, reference, whatsappNumber } = body;

    if (!packageId || !reference || !whatsappNumber) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const pkg = PACKAGES.find(p => p.id === packageId);
    if (!pkg) return NextResponse.json({ error: "Invalid package" }, { status: 400 });

    const cleanRef = String(reference).trim().slice(0, 100);
    if (cleanRef.length < 4) {
      return NextResponse.json({ error: "Please enter a valid payment reference." }, { status: 400 });
    }

    const db = await getDb();

    // Check for duplicate reference
    const existing = await db.collection("payment_requests").findOne({ reference: cleanRef });
    if (existing) {
      return NextResponse.json({ error: "This reference has already been submitted." }, { status: 400 });
    }

    const doc: PaymentRequest = {
      _id: `${session.botKey}-${Date.now()}`,
      userId: session.botKey!,
      username: session.username || "Unknown",
      whatsappNumber: String(whatsappNumber).replace(/\D/g, "").slice(0, 15),
      packageId: pkg.id,
      packageLabel: pkg.label,
      goldAmount: pkg.gold,
      nairaAmount: pkg.naira,
      reference: cleanRef,
      status: "pending",
      createdAt: Date.now(),
    };

    await db.collection("payment_requests").insertOne(doc);

    return NextResponse.json({ success: true, message: "Payment submitted! It will be reviewed shortly." });
  } catch (err) {
    console.error("Store error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.botKey) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const db = await getDb();
    const requests = await db
      .collection("payment_requests")
      .find({ userId: session.botKey })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ requests: [] });
  }
}
