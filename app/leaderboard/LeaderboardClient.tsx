"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trophy, Loader2 } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  value: number;
  tier: string;
}

const CATEGORIES = [
  { key: "gold", label: "💰 Gold", unit: "gold" },
  { key: "xp", label: "✨ XP", unit: "XP" },
  { key: "catches", label: "🎯 Catches", unit: "caught" },
  { key: "quiz", label: "🧠 Quiz", unit: "wins" },
  { key: "cards", label: "🃏 Cards", unit: "cards" },
];

const RANK_STYLES: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-slate-300",
  3: "text-orange-400",
};
const RANK_BG: Record<number, string> = {
  1: "border-yellow-500/30 bg-yellow-500/5",
  2: "border-slate-400/30 bg-slate-400/5",
  3: "border-orange-500/30 bg-orange-500/5",
};
const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

interface Props {
  isLoggedIn: boolean;
  username?: string;
}

export default function LeaderboardClient({ isLoggedIn, username }: Props) {
  const [category, setCategory] = useState("gold");
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?category=${category}`)
      .then((r) => r.json())
      .then((d) => setData(d.leaderboard || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [category]);

  const currentCat = CATEGORIES.find((c) => c.key === category)!;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} username={username} />

      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#1a1f2e] border border-[#2a2f45] rounded-full px-4 py-1.5 text-xs text-gray-400 mb-4">
              <Trophy className="w-3 h-3 text-[#ffd700]" />
              Global Rankings
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-2">
              Leaderboard
            </h1>
            <p className="text-gray-400">See how you stack up against other trainers</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat.key
                    ? "bg-[#00d4ff] text-[#0d0f1a]"
                    : "bg-[#1a1f2e] text-gray-400 border border-[#2a2f45] hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
            </div>
          )}

          {!loading && data.length === 0 && (
            <div className="glass-card p-16 text-center">
              <p className="text-4xl mb-3">🏆</p>
              <p className="text-gray-400">No data available yet</p>
            </div>
          )}

          {!loading && data.length > 0 && (
            <>
              <div className="flex gap-4 mb-6">
                {data.slice(0, 3).map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex-1 glass-card p-4 text-center border ${RANK_BG[entry.rank] || ""}`}
                  >
                    <div className="text-3xl mb-2">{MEDALS[entry.rank]}</div>
                    <p className="text-white font-semibold text-sm truncate">{entry.username}</p>
                    <p className={`font-bold text-lg ${RANK_STYLES[entry.rank] || "text-white"}`}>
                      {entry.value.toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs">{currentCat.unit}</p>
                  </div>
                ))}
              </div>

              <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-[#2a2f45] flex items-center justify-between">
                  <h2 className="text-white font-semibold text-sm">Full Rankings</h2>
                  <span className="text-gray-500 text-xs">{data.length} trainers</span>
                </div>
                <div className="divide-y divide-[#2a2f45]">
                  {data.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-4 px-6 py-4 hover:bg-[#1a1f2e]/50 transition-colors ${
                        entry.rank <= 3 ? "bg-[#1a1f2e]/30" : ""
                      }`}
                    >
                      <div className="w-10 flex-shrink-0 text-center">
                        {entry.rank <= 3 ? (
                          <span className="text-xl">{MEDALS[entry.rank]}</span>
                        ) : (
                          <span className={`font-bold text-sm ${RANK_STYLES[entry.rank] || "text-gray-400"}`}>
                            #{entry.rank}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{entry.username}</p>
                        <p className="text-gray-500 text-xs">{entry.tier}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-bold text-sm ${RANK_STYLES[entry.rank] || "text-[#00d4ff]"}`}>
                          {entry.value.toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-xs">{currentCat.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
