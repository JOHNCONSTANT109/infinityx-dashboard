import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// More balanced weights — 7️⃣ is 9% (was 1%), 🍒 is 20% (was 30%)
// House edge ≈ 10% with generous 2-of-a-kind payout
const POOL = [
  ...Array(20).fill("🍒"),
  ...Array(18).fill("🍋"),
  ...Array(16).fill("🍊"),
  ...Array(14).fill("🍇"),
  ...Array(12).fill("💎"),
  ...Array(11).fill("⭐"),
  ...Array(9).fill("7️⃣"),
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

    let netChange = -bet;
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
      // 2-of-a-kind — return 2× bet (player profit = 1× bet)
      winAmount = bet * 2;
      netChange = bet; // profit = bet
      won = true;
      message = "🎯 Two of a kind — you doubled your bet!";
    } else {
      message = "😤 No match — spin again!";
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
      winAmount: won ? (a === b && b === c ? winAmount - bet : bet) : 0,
      message,
      newWallet,
    });
  } catch (err) {
    console.error("Slots error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
