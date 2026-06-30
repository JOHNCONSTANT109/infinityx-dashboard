import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const POOL = [
  ...Array(24).fill("🍒"),
  ...Array(22).fill("🍋"),
  ...Array(18).fill("🍊"),
  ...Array(16).fill("🍇"),
  ...Array(12).fill("💎"),
  ...Array(10).fill("⭐"),
  ...Array(8).fill("7️⃣"),
];

const PAYOUTS: Record<string, number> = {
  "7️⃣": 50, "⭐": 20, "💎": 10, "🍇": 5, "🍊": 3, "🍋": 2, "🍒": 1.5,
};

function spinReel(): string {
  return POOL[Math.floor(Math.random() * POOL.length)];
}

interface EconomyDoc { _id: string; wallet?: number; bank?: number; }

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.botKey) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const bet = Math.floor(Number(body.bet));
    if (!bet || bet < 1) return NextResponse.json({ error: "Minimum bet is 1 gold." }, { status: 400 });
    if (bet > 1_000_000) return NextResponse.json({ error: "Maximum bet is 1,000,000 gold." }, { status: 400 });

    const db = await getDb();
    const economy = await db.collection<EconomyDoc>("economy").findOne({ _id: session.botKey });
    const currentWallet = economy?.wallet || 0;
    if (bet > currentWallet) return NextResponse.json({ error: "Not enough gold in your wallet." }, { status: 400 });

    const reels = [spinReel(), spinReel(), spinReel()];
    const [a, b, c] = reels;

    let netChange = 0;
    let won = false;
    let winAmount = 0;
    let message = "";

    if (a === b && b === c) {
      // 3-of-a-kind jackpot
      const mult = PAYOUTS[a] ?? 2;
      winAmount = Math.floor(bet * mult);
      netChange = winAmount - bet;
      won = true;
      if (a === "7️⃣")      message = "🎉 JACKPOT! Triple 7s! You hit the big one!";
      else if (a === "⭐")  message = "🌟 MEGA WIN! Triple Stars!";
      else if (a === "💎")  message = "💎 BIG WIN! Triple Diamonds!";
      else                  message = `🎊 Winner! Triple ${a}!`;
    } else if (a === b || b === c || a === c) {
      // 2-of-a-kind — return 3× bet (net profit = 2× bet)
      winAmount = bet * 3;
      netChange = bet * 2;
      won = true;
      message = "🎯 Two of a kind — you tripled your bet!";
    } else {
      // No match — 40% consolation refund so players only lose 60%
      const refund = Math.floor(bet * 0.4);
      netChange = -(bet - refund);
      winAmount = refund;
      won = false;
      message = `😤 No match — consolation refund of ${refund.toLocaleString()} gold!`;
    }

    const newWallet = currentWallet + netChange;
    await db.collection<EconomyDoc>("economy").updateOne(
      { _id: session.botKey },
      { $inc: { wallet: netChange } },
      { upsert: true }
    );

    return NextResponse.json({
      reels,
      won,
      winAmount,
      netChange,
      message,
      newWallet,
    });
  } catch (err) {
    console.error("Slots error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
