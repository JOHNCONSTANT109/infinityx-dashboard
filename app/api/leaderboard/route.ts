import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface EconomyDoc {
  _id: string;
  wallet?: number;
}

interface UserDoc {
  _id: string;
  name?: string;
  xp?: number;
  catches?: number;
  quizWins?: number;
  cards?: number;
}

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

function getRankLabel(xp: number): string {
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (xp >= TIERS[i].min) idx = i;
  }
  return `${TIERS[idx].emoji} ${TIERS[idx].name}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "gold";

    const db = await getDb();

    // Gold is stored in the 'economy' collection, everything else in 'users'
    if (category === "gold") {
      const economies = await db
        .collection<EconomyDoc>("economy")
        .find({}, { projection: { _id: 1, wallet: 1 } })
        .sort({ wallet: -1 })
        .limit(50)
        .toArray();

      const botKeys = economies.map((e) => e._id);
      const users = await db
        .collection<UserDoc>("users")
        .find({ _id: { $in: botKeys } }, { projection: { _id: 1, name: 1, xp: 1 } })
        .toArray();

      const userMap: Record<string, { name?: string; xp?: number }> = {};
      for (const u of users) userMap[String(u._id)] = u;

      const leaderboard = economies.map((e, i) => {
        const u = userMap[String(e._id)] || {};
        return {
          rank: i + 1,
          username: u.name || `Player_${String(e._id).slice(-4)}`,
          value: e.wallet || 0,
          tier: getRankLabel(u.xp || 0),
        };
      });

      return NextResponse.json({ leaderboard, category });
    }

    // XP, catches, cards, quiz — all in users collection
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      xp: { xp: -1 },
      catches: { catches: -1 },
      quiz: { quizWins: -1 },
      cards: { cards: -1 },
    };

    const sortField = sortMap[category] || sortMap.xp;

    const users = await db
      .collection<UserDoc>("users")
      .find(
        {},
        { projection: { _id: 1, name: 1, xp: 1, catches: 1, quizWins: 1, cards: 1 } }
      )
      .sort(sortField)
      .limit(50)
      .toArray();

    const leaderboard = users.map((u, i) => {
      let value = 0;
      if (category === "xp") value = u.xp || 0;
      else if (category === "catches") value = u.catches || 0;
      else if (category === "quiz") value = u.quizWins || 0;
      else if (category === "cards") value = u.cards || 0;

      return {
        rank: i + 1,
        username: u.name || `Player_${String(u._id).slice(-4)}`,
        value,
        tier: getRankLabel(u.xp || 0),
      };
    });

    return NextResponse.json({ leaderboard, category });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
