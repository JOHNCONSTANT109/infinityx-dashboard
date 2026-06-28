"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  TrendingUp, User, Loader2
} from "lucide-react";

interface Pokemon {
  name?: string;
  species?: string;
  level?: number;
  hp?: number;
  maxHp?: number;
  type?: string;
  types?: string[];
  rarity?: string;
  shiny?: boolean;
  iv?: number;
  sprite?: string;
}

interface DashboardData {
  username: string;
  number: string;
  party: Pokemon[];
  pc: Pokemon[];
  gold: number;
  bank: number;
  xp: number;
  rank: string;
  rankName: string;
  level: number;
  badges: number;
  cards: number;
  quizWins: number;
  quizLosses: number;
  totalCatches: number;
  wins: number;
  losses: number;
}

const RANK_COLORS: Record<string, string> = {
  Rookie:        "bg-gray-500/20 text-gray-400 border-gray-500/30",
  Trainer:       "bg-orange-900/20 text-orange-400 border-orange-700/30",
  Veteran:       "bg-slate-400/20 text-slate-300 border-slate-400/30",
  Expert:        "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Elite:         "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
  Ace:           "bg-blue-500/20 text-blue-300 border-blue-400/30",
  Master:        "bg-purple-600/20 text-purple-300 border-purple-500/30",
  Champion:      "bg-red-500/20 text-red-300 border-red-500/30",
  Legend:        "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Mythical I":  "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
  "Mythical II": "bg-indigo-600/20 text-indigo-400 border-indigo-500/30",
  "Mythical III":"bg-indigo-700/20 text-indigo-500 border-indigo-600/30",
  "Hero I":      "bg-pink-500/20 text-pink-300 border-pink-400/30",
  "Hero II":     "bg-pink-600/20 text-pink-400 border-pink-500/30",
  "Hero III":    "bg-pink-700/20 text-pink-500 border-pink-600/30",
  "Divine I":    "bg-violet-500/20 text-violet-300 border-violet-400/30",
  "Divine II":   "bg-violet-700/20 text-violet-500 border-violet-600/30",
  "Deity I":     "bg-amber-500/20 text-amber-300 border-amber-400/30",
  "Deity II":    "bg-amber-700/20 text-amber-500 border-amber-600/30",
};

const TYPE_COLORS: Record<string, string> = {
  fire: "bg-orange-500/20 text-orange-300",
  water: "bg-blue-500/20 text-blue-300",
  grass: "bg-green-500/20 text-green-300",
  electric: "bg-yellow-500/20 text-yellow-300",
  psychic: "bg-pink-500/20 text-pink-300",
  dark: "bg-gray-700/40 text-gray-300",
  steel: "bg-slate-500/20 text-slate-300",
  dragon: "bg-indigo-500/20 text-indigo-300",
  fairy: "bg-pink-400/20 text-pink-200",
  normal: "bg-gray-500/20 text-gray-300",
  fighting: "bg-red-700/20 text-red-300",
  flying: "bg-sky-400/20 text-sky-200",
  poison: "bg-purple-500/20 text-purple-300",
  ground: "bg-amber-600/20 text-amber-300",
  rock: "bg-yellow-700/20 text-yellow-600",
  bug: "bg-lime-500/20 text-lime-300",
  ghost: "bg-violet-700/20 text-violet-300",
  ice: "bg-cyan-400/20 text-cyan-200",
};

function PokemonCard({ pokemon, slot }: { pokemon: Pokemon; slot: number }) {
  const name = pokemon.name || pokemon.species || `Pokémon #${slot + 1}`;
  const level = pokemon.level || 1;
  const type = (pokemon.types?.[0] || pokemon.type || "normal").toLowerCase();
  const typeColor = TYPE_COLORS[type] || "bg-gray-500/20 text-gray-300";
  const hpPercent = pokemon.maxHp ? Math.round(((pokemon.hp || 0) / pokemon.maxHp) * 100) : 100;
  const isShiny = pokemon.shiny;

  return (
    <div className="pokemon-card p-4 relative overflow-hidden">
      {isShiny && (
        <div className="absolute top-2 right-2 text-xs text-yellow-400 font-bold">✨</div>
      )}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-[#0d0f1a] flex items-center justify-center text-2xl flex-shrink-0 border border-[#2a2f45]">
          {pokemon.sprite ? (
            <img src={pokemon.sprite} alt={name} className="w-10 h-10 object-contain" />
          ) : (
            "🔮"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-semibold text-sm capitalize truncate">{name}</h4>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-400 text-xs">Lv.{level}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${typeColor}`}>
              {type}
            </span>
          </div>
          {pokemon.maxHp && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>HP</span>
                <span>{pokemon.hp}/{pokemon.maxHp}</span>
              </div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill"
                  style={{
                    width: `${hpPercent}%`,
                    background: hpPercent > 50 ? "#00d4ff" : hpPercent > 25 ? "#ffd700" : "#ef4444",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="glass-card p-5 card-glow">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white font-bold text-2xl">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardClient({ username }: { username: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"party" | "pc">("party");
  const [pcPage, setPcPage] = useState(0);
  const PC_PER_PAGE = 18;

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  // Use rankName (e.g. "Rookie") for colour lookup, not full rank string with emoji
  const rankColor = data
    ? (RANK_COLORS[data.rankName] || RANK_COLORS.Rookie)
    : RANK_COLORS.Rookie;

  const quizTotal = data ? data.quizWins + data.quizLosses : 0;
  const quizRate = quizTotal > 0 && data ? Math.round((data.quizWins / quizTotal) * 100) : 0;

  const pcSlice = data ? data.pc.slice(pcPage * PC_PER_PAGE, (pcPage + 1) * PC_PER_PAGE) : [];
  const pcPages = data ? Math.ceil(data.pc.length / PC_PER_PAGE) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn username={username} />

      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 text-[#00d4ff] animate-spin" />
              <p className="text-gray-400">Loading your dashboard...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-32">
              <p className="text-red-400 text-lg mb-2">⚠️ {error}</p>
              <p className="text-gray-500 text-sm">Make sure you set up your account with the bot first.</p>
            </div>
          )}

          {data && !loading && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-full bg-[#1a1f2e] border border-[#2a2f45] flex items-center justify-center">
                      <User className="w-5 h-5 text-[#00d4ff]" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">{data.username}</h1>
                      <p className="text-gray-500 text-sm">Trainer Dashboard</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rank-badge border ${rankColor}`}>
                    {data.rank}
                  </span>
                  <span className="text-gray-400 text-sm">
                    Tier {data.level}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <StatCard
                  icon={<span className="text-xl">💰</span>}
                  label="Gold"
                  value={data.gold}
                  color="bg-yellow-500/10"
                />
                <StatCard
                  icon={<span className="text-xl">🏦</span>}
                  label="Bank"
                  value={data.bank}
                  color="bg-green-500/10"
                />
                <StatCard
                  icon={<TrendingUp className="w-5 h-5 text-[#00d4ff]" />}
                  label="Total XP"
                  value={data.xp}
                  color="bg-cyan-500/10"
                />
                <StatCard
                  icon={<span className="text-xl">🃏</span>}
                  label="Cards"
                  value={data.cards}
                  color="bg-purple-500/10"
                />
                <StatCard
                  icon={<span className="text-xl">🧠</span>}
                  label="Quiz Wins"
                  value={data.quizWins}
                  sub={quizTotal > 0 ? `${quizRate}% win rate` : undefined}
                  color="bg-pink-500/10"
                />
                <StatCard
                  icon={<span className="text-xl">🎯</span>}
                  label="Total Catches"
                  value={data.totalCatches}
                  color="bg-orange-500/10"
                />
              </div>

              {/* Battle record */}
              {(data.wins > 0 || data.losses > 0) && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <StatCard
                    icon={<span className="text-xl">⚔️</span>}
                    label="Battle Wins"
                    value={data.wins}
                    color="bg-green-500/10"
                  />
                  <StatCard
                    icon={<span className="text-xl">💀</span>}
                    label="Battle Losses"
                    value={data.losses}
                    color="bg-red-500/10"
                  />
                </div>
              )}

              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => setActiveTab("party")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      activeTab === "party"
                        ? "bg-[#00d4ff] text-[#0d0f1a]"
                        : "bg-[#1a1f2e] text-gray-400 hover:text-white border border-[#2a2f45]"
                    }`}
                  >
                    ⚔️ Party
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === "party" ? "bg-[#0099cc]" : "bg-[#2a2f45]"}`}>
                      {data.party.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("pc")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      activeTab === "pc"
                        ? "bg-[#00d4ff] text-[#0d0f1a]"
                        : "bg-[#1a1f2e] text-gray-400 hover:text-white border border-[#2a2f45]"
                    }`}
                  >
                    💾 PC Storage
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === "pc" ? "bg-[#0099cc]" : "bg-[#2a2f45]"}`}>
                      {data.pc.length}
                    </span>
                  </button>
                </div>

                {activeTab === "party" && (
                  <div>
                    {data.party.length === 0 ? (
                      <div className="glass-card p-12 text-center">
                        <p className="text-4xl mb-3">⚔️</p>
                        <p className="text-gray-400">No Pokémon in your party</p>
                        <p className="text-gray-600 text-sm mt-1">Catch some Pokémon in the bot!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.party.map((p, i) => (
                          <PokemonCard key={i} pokemon={p} slot={i} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "pc" && (
                  <div>
                    {data.pc.length === 0 ? (
                      <div className="glass-card p-12 text-center">
                        <p className="text-4xl mb-3">💾</p>
                        <p className="text-gray-400">Your PC is empty</p>
                        <p className="text-gray-600 text-sm mt-1">Catch more Pokémon to fill your box!</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                          {pcSlice.map((p, i) => (
                            <PokemonCard key={i} pokemon={p} slot={i} />
                          ))}
                        </div>
                        {pcPages > 1 && (
                          <div className="flex items-center justify-center gap-3 mt-6">
                            <button
                              onClick={() => setPcPage((p) => Math.max(0, p - 1))}
                              disabled={pcPage === 0}
                              className="px-4 py-2 rounded-lg text-sm bg-[#1a1f2e] border border-[#2a2f45] text-gray-300 hover:text-white disabled:opacity-40"
                            >
                              ← Prev
                            </button>
                            <span className="text-gray-400 text-sm">
                              Box {pcPage + 1} of {pcPages}
                            </span>
                            <button
                              onClick={() => setPcPage((p) => Math.min(pcPages - 1, p + 1))}
                              disabled={pcPage >= pcPages - 1}
                              className="px-4 py-2 rounded-lg text-sm bg-[#1a1f2e] border border-[#2a2f45] text-gray-300 hover:text-white disabled:opacity-40"
                            >
                              Next →
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="glass-card p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="text-lg">🧠</span> Quiz Stats
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{data.quizWins}</p>
                    <p className="text-gray-500 text-xs mt-1">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{data.quizLosses}</p>
                    <p className="text-gray-500 text-xs mt-1">Losses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#00d4ff]">{quizRate}%</p>
                    <p className="text-gray-500 text-xs mt-1">Win Rate</p>
                  </div>
                </div>
                {quizTotal > 0 && (
                  <div className="mt-4">
                    <div className="stat-bar">
                      <div
                        className="stat-bar-fill"
                        style={{ width: `${quizRate}%`, background: "linear-gradient(90deg, #22c55e, #00d4ff)" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
