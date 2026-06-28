import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

interface UserDoc {
  _id: string;
  name?: string;
  xp?: number;
  party?: unknown[];
  pc?: unknown[];
  cards?: number;
  quizWins?: number;
  catches?: number;
  wins?: number;
  losses?: number;
  badges?: number;
}

interface EconomyDoc {
  _id: string;
  wallet?: number;
  bank?: number;
}

// Rank tiers — matches the bot's TIERS array exactly
const TIERS = [
  { name: "Rookie",       emoji: "🌱",  min: 0 },
  { name: "Trainer",      emoji: "🎒",  min: 25_000 },
  { name: "Veteran",      emoji: "🛡",  min: 100_000 },
  { name: "Expert",       emoji: "🎯",  min: 300_000 },
  { name: "Elite",        emoji: "✨",  min: 750_000 },
  { name: "Ace",          emoji: "🔶",  min: 1_500_000 },
  { name: "Master",       emoji: "🌀",  min: 3_000_000 },
  { name: "Champion",     emoji: "☣️",  min: 6_000_000 },
  { name: "Legend",       emoji: "👑",  min: 12_000_000 },
  { name: "Mythical I",   emoji: "🌌",  min: 25_000_000 },
  { name: "Mythical II",  emoji: "🌌",  min: 50_000_000 },
  { name: "Mythical III", emoji: "🌌",  min: 100_000_000 },
  { name: "Hero I",       emoji: "⚡",  min: 200_000_000 },
  { name: "Hero II",      emoji: "⚡",  min: 400_000_000 },
  { name: "Hero III",     emoji: "⚡",  min: 750_000_000 },
  { name: "Divine I",     emoji: "💫",  min: 1_500_000_000 },
  { name: "Divine II",    emoji: "💫",  min: 3_000_000_000 },
  { name: "Deity I",      emoji: "🌠",  min: 6_000_000_000 },
  { name: "Deity II",     emoji: "🌠",  min: 12_000_000_000 },
];

function getRankTier(xp: number) {
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (xp >= TIERS[i].min) idx = i;
  }
  return { ...TIERS[idx], level: idx + 1 };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.botKey) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = await getDb();
    const botKey = session.botKey;

    // Users collection: party, pc, xp, catches, cards, quizWins, name
    const user = await db.collection<UserDoc>("users").findOne({ _id: botKey });

    // Economy collection: wallet (gold), bank
    const economy = await db.collection<EconomyDoc>("economy").findOne({ _id: botKey });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const xp: number = user.xp || 0;
    const tier = getRankTier(xp);

    return NextResponse.json({
      username: user.name || session.username || `Player_${session.number?.slice(-4)}`,
      number: session.number,
      party: user.party || [],
      pc: user.pc || [],
      gold: economy?.wallet || 0,
      bank: economy?.bank || 0,
      xp,
      rank: `${tier.emoji} ${tier.name}`,
      rankName: tier.name,
      level: tier.level,
      badges: user.badges || 0,
      cards: user.cards || 0,
      quizWins: user.quizWins || 0,
      quizLosses: 0,
      totalCatches: user.catches || 0,
      wins: user.wins || 0,
      losses: user.losses || 0,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
