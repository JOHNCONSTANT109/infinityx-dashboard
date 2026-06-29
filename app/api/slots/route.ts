import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "💎", "⭐", "7️⃣"];
// Weighted pool — higher count = higher probability
const POOL = [
  ...Array(30).fill("🍒"),
  ...Array(25).fill("🍋"),
  ...Array(20).fill("🍊"),
  ...Array(15).fill("🍇"),
  ...Array(6).fill("💎"),
  ...Array(3).fill("⭐"),
  ...Array(1).fill("7️⃣"),
];

const PAYOUTS: Record<string, number> = {
  "7️⃣": 50, "⭐": 20, "💎": 10, "🍇": 5, "🍊": 3, "🍋": 2, "🍒": 1.5,
};

function spin(): string[] {
  return [
    POOL[Math.floor(Math.random() * POOL.length)],
    POOL[Math.floor(Math.random() * POOL.length)],
    POOL[Math.floor(Math.random() * POOL.length)],
  ];
}

interface EconomyDoc {
  _id: string;
  wallet?: number;
  bank?: number;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.botKey) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const bet = Math.floor(Number(body.bet));

    if (!bet || bet < 1) {
      return NextResponse.json({ error: "Minimum bet is 1 gold." }, { status: 400 });
    }
    if (bet > 1_000_000) {
      return NextResponse.json({ error: "Maximum bet is 1,000,000 gold." }, { status: 400 });
    }

    const db = await getDb();
    const economy = await db.collection<EconomyDoc>("economy").findOne({ _id: session.botKey });
    const currentWallet = economy?.wallet || 0;

    if (bet > currentWallet) {
      return NextResponse.json({ error: "Not enough gold in your wallet." }, { status: 400 });
    }

    const reels = spin();
    const [a, b, c] = reels;

    let winAmount = 0;
    let won = false;
    let message = "";

    if (a === b && b === c) {
      // 3 of a kind
      const mult = PAYOUTS[a] ?? 2;
      winAmount = Math.floor(bet * mult);
      won = true;
      if (a === "7️⃣") message = "🎉 JACKPOT! Three 7s!";
      else if (a === "⭐") message = "🌟 Mega Win! Three Stars!";
      else if (a === "💎") message = "💎 Big Win! Three Diamonds!";
      else message = `🎊 Winner! Three ${a}`;
    } else if (a === b || b === c || a === c) {
      // 2 of a kind — break even (return bet)
      winAmount = bet;
      won = true;
      message = "😅 Two of a kind — bet returned!";
    } else {
      message = "😤 No match — try again!";
    }

    // Net change: winAmount (what player gets back) - bet (what they paid)
    const netChange = winAmount - bet;
    const newWallet = currentWallet + netChange;

    await db.collection<EconomyDoc>("economy").updateOne(
      { _id: session.botKey },
      { $inc: { wallet: netChange } },
      { upsert: true }
    );

    return NextResponse.json({
      reels,
      won,
      winAmount: winAmount > bet ? winAmount - bet : 0, // show actual profit
      message,
      newWallet,
    });
  } catch (err) {
    console.error("Slots error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
