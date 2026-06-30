"use client";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface WildPokemon {
  species: string; name: string; types: string[]; rarity: string;
  level: number; maxHp: number; hp: number; atk: number; def: number;
  iv: number; shiny: boolean; sprite: string;
}

interface PartyMon { name?: string; species?: string; level?: number; hp?: number; maxHp?: number; types?: string[]; sprite?: string; }

const TYPE_COLORS: Record<string, string> = {
  fire:"bg-orange-500/20 text-orange-300", water:"bg-blue-500/20 text-blue-300",
  grass:"bg-green-500/20 text-green-300", electric:"bg-yellow-500/20 text-yellow-300",
  psychic:"bg-pink-500/20 text-pink-300", dark:"bg-gray-700/40 text-gray-300",
  steel:"bg-slate-500/20 text-slate-300", dragon:"bg-indigo-500/20 text-indigo-300",
  fairy:"bg-pink-400/20 text-pink-200", normal:"bg-gray-500/20 text-gray-300",
  fighting:"bg-red-700/20 text-red-300", flying:"bg-sky-400/20 text-sky-200",
  poison:"bg-purple-500/20 text-purple-300", ground:"bg-amber-600/20 text-amber-300",
  rock:"bg-yellow-700/20 text-yellow-600", bug:"bg-lime-500/20 text-lime-300",
  ghost:"bg-violet-700/20 text-violet-300", ice:"bg-cyan-400/20 text-cyan-200",
};

const RARITY_COLOR: Record<string, string> = {
  Common:"text-gray-400", Uncommon:"text-green-400", Rare:"text-blue-400", Epic:"text-purple-400",
};

function HpBar({ hp, maxHp, size = "md" }: { hp: number; maxHp: number; size?: "sm" | "md" }) {
  const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;
  const color = pct > 50 ? "#00d4ff" : pct > 25 ? "#ffd700" : "#ef4444";
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>HP</span><span>{Math.max(0, hp)}/{maxHp}</span>
      </div>
      <div className={`${size === "sm" ? "h-1.5" : "h-3"} bg-[#1a1f2e] rounded-full overflow-hidden`}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

type Phase = "idle" | "spawning" | "battle" | "caught" | "fled" | "fainted";

export default function BattleClient({ username }: { username: string }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [wild, setWild] = useState<WildPokemon | null>(null);
  const [party, setParty] = useState<PartyMon[]>([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [playerHp, setPlayerHp] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [catchResult, setCatchResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => {
      if (d.party?.length) { setParty(d.party); setPlayerHp(d.party[0].hp || d.party[0].maxHp || 60); }
    }).catch(() => {});
  }, []);

  const addLog = useCallback((msg: string) => setLog(l => [msg, ...l].slice(0, 8)), []);

  const player = party[playerIdx];
  const playerMaxHp = player?.maxHp || player?.hp || 60;

  async function spawnWild() {
    setPhase("spawning"); setBusy(true); setLog([]); setCatchResult(null);
    try {
      const res = await fetch("/api/battle/spawn");
      const data = await res.json();
      if (!res.ok) { setPhase("idle"); return; }
      setWild({ ...data });
      setPhase("battle");
      addLog(`A wild ${data.name} (Lv.${data.level}) appeared!${data.shiny ? " ✨ It's shiny!" : ""}`);
    } finally { setBusy(false); }
  }

  function calcDmg(atk: number, def: number, level: number) {
    const base = Math.max(1, Math.floor((2 * level / 5 + 2) * atk / (def * 50 + 2) * 50 + 2));
    return Math.floor(base * (0.85 + Math.random() * 0.15));
  }

  async function attack() {
    if (!wild || phase !== "battle" || busy) return;
    setBusy(true);
    const playerAtk = Math.floor((player?.level || 5) * 3 + 20);
    const dmgToWild = calcDmg(playerAtk, wild.def, player?.level || 5);
    const newWildHp = Math.max(0, wild.hp - dmgToWild);
    setWild(w => w ? { ...w, hp: newWildHp } : w);
    addLog(`${player?.name || "Your Pokémon"} attacked! Dealt ${dmgToWild} damage.`);

    if (newWildHp <= 0) {
      addLog(`${wild.name} fainted!`);
      setPhase("fled"); setBusy(false); return;
    }

    // Wild counter-attack
    await new Promise(r => setTimeout(r, 600));
    const wildDmg = calcDmg(wild.atk, Math.floor((player?.level || 5) * 2 + 15), wild.level);
    const newPlayerHp = Math.max(0, playerHp - wildDmg);
    setPlayerHp(newPlayerHp);
    addLog(`${wild.name} used Tackle! Dealt ${wildDmg} damage.`);

    if (newPlayerHp <= 0) {
      addLog(`${player?.name || "Your Pokémon"} fainted! You lost.`);
      setPhase("fainted");
    }
    setBusy(false);
  }

  async function throwBall() {
    if (!wild || phase !== "battle" || busy) return;
    setBusy(true);
    addLog(`You threw a Pokéball at ${wild.name}...`);
    await new Promise(r => setTimeout(r, 800));
    try {
      const res = await fetch("/api/battle/catch", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...wild }),
      });
      const data = await res.json();
      if (data.caught) {
        addLog(`🎉 ${data.message}`);
        setCatchResult(data.message);
        setPhase("caught");
      } else {
        addLog(data.message || "The Pokémon broke free!");
        // Wild counter-attacks after failed catch
        const wildDmg = calcDmg(wild.atk, Math.floor((player?.level || 5) * 2 + 15), wild.level);
        const newHp = Math.max(0, playerHp - wildDmg);
        setPlayerHp(newHp);
        addLog(`${wild.name} broke free and attacked! Dealt ${wildDmg} damage.`);
        if (newHp <= 0) { addLog(`${player?.name || "Your Pokémon"} fainted!`); setPhase("fainted"); }
      }
    } catch { addLog("Failed to throw ball. Try again."); }
    finally { setBusy(false); }
  }

  function flee() { addLog("You fled safely!"); setPhase("fled"); }

  const canCatch = wild ? wild.hp / wild.maxHp <= 0.5 : false;
  const wildHpPct = wild ? wild.hp / wild.maxHp : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn username={username} />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#1a1f2e] border border-[#2a2f45] rounded-full px-4 py-1.5 text-xs text-gray-400 mb-4">⚔️ Wild Battle</div>
            <h1 className="font-display text-3xl font-bold gradient-text mb-2">Wild Pokémon Battle</h1>
            <p className="text-gray-400 text-sm">Weaken wild Pokémon and throw a ball to catch them — they go straight to your PC!</p>
          </div>

          {/* No party warning */}
          {party.length === 0 && (
            <div className="glass-card p-8 text-center mb-6">
              <p className="text-4xl mb-3">⚠️</p>
              <p className="text-gray-300 font-semibold mb-1">No Pokémon in your party</p>
              <p className="text-gray-500 text-sm">Start your Pokémon journey in the bot first, then come back to battle!</p>
            </div>
          )}

          {/* Idle */}
          {(phase === "idle" || phase === "fled" || phase === "fainted" || phase === "caught") && party.length > 0 && (
            <div className="glass-card p-8 text-center mb-6">
              {phase === "caught" && catchResult && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 font-bold text-lg">🎉 {catchResult}</p>
                  <p className="text-gray-400 text-sm mt-1">Check your PC Storage on the Dashboard!</p>
                </div>
              )}
              {phase === "fainted" && <p className="text-red-400 font-bold mb-4">Your Pokémon fainted! Heal up in the bot first.</p>}
              {phase === "fled"    && <p className="text-gray-400 mb-4">You got away safely.</p>}
              <p className="text-5xl mb-4">🌿</p>
              <p className="text-white font-bold text-lg mb-2">Ready to battle?</p>
              <p className="text-gray-400 text-sm mb-6">Walk into the tall grass and encounter a wild Pokémon</p>
              <button onClick={spawnWild} disabled={busy || phase === "fainted"}
                className="btn-primary px-8 py-3 text-base flex items-center gap-2 mx-auto">
                {busy ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Finding...</> : "🌿 Enter Tall Grass"}
              </button>
            </div>
          )}

          {/* Battle UI */}
          {phase === "battle" && wild && (
            <div className="space-y-4 mb-6">
              {/* Battle arena */}
              <div className="glass-card p-5" style={{ background: "linear-gradient(135deg, #0d0f1a 0%, #0a1020 100%)" }}>
                {/* Wild Pokémon */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold capitalize">{wild.name}</span>
                      {wild.shiny && <span className="text-yellow-400 text-xs">✨</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${RARITY_COLOR[wild.rarity] || "text-gray-400"}`}>{wild.rarity}</span>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">Lv.{wild.level} · IV {wild.iv}</p>
                    <div className="flex gap-1 mb-3">
                      {wild.types.map(t => <span key={t} className={`text-xs px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[t] || "bg-gray-500/20 text-gray-300"}`}>{t}</span>)}
                    </div>
                    <HpBar hp={wild.hp} maxHp={wild.maxHp} />
                    {wildHpPct <= 0.5 && <p className="text-yellow-400 text-xs mt-1">🎯 Can throw ball now!</p>}
                  </div>
                  <div className="w-24 h-24 flex items-center justify-center flex-shrink-0 ml-4">
                    {wild.sprite
                      ? <img src={wild.sprite} alt={wild.name} className="w-20 h-20 object-contain" onError={e => { (e.target as HTMLImageElement).src = ""; (e.target as HTMLImageElement).style.display = "none"; }} />
                      : <span className="text-5xl">🔮</span>}
                  </div>
                </div>

                {/* VS divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-[#2a2f45]" />
                  <span className="text-gray-500 text-xs font-bold">VS</span>
                  <div className="flex-1 h-px bg-[#2a2f45]" />
                </div>

                {/* Player's Pokémon */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                    {player?.sprite
                      ? <img src={player.sprite} alt={player.name} className="w-14 h-14 object-contain" />
                      : <span className="text-4xl">🔮</span>}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold capitalize mb-1">{player?.name || "Your Pokémon"}</p>
                    <p className="text-gray-400 text-xs mb-2">Lv.{player?.level || "?"}</p>
                    <HpBar hp={playerHp} maxHp={playerMaxHp} />
                  </div>
                </div>

                {/* Party select */}
                {party.length > 1 && phase === "battle" && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {party.map((p, i) => (
                      <button key={i} onClick={() => { setPlayerIdx(i); setPlayerHp(p.hp || p.maxHp || 60); addLog(`Go, ${p.name || "Pokémon"}!`); }}
                        disabled={busy || i === playerIdx}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all capitalize ${i === playerIdx ? "bg-[#00d4ff]/20 border-[#00d4ff]/50 text-[#00d4ff]" : "bg-[#1a1f2e] border-[#2a2f45] text-gray-400 hover:text-white"}`}>
                        {p.name || `Slot ${i+1}`} Lv.{p.level}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button onClick={attack} disabled={busy}
                  className="py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-50 border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20">
                  ⚔️ Attack
                </button>
                <button onClick={throwBall} disabled={busy || !canCatch}
                  className={`py-4 rounded-xl font-bold text-sm transition-all border ${canCatch ? "border-[#ffd700]/40 bg-[#ffd700]/10 text-yellow-300 hover:bg-[#ffd700]/20" : "border-[#2a2f45] bg-[#1a1f2e] text-gray-600 cursor-not-allowed"}`}>
                  🔴 Throw Ball{!canCatch ? "\n(weaken first)" : ""}
                </button>
                <button onClick={flee} disabled={busy}
                  className="py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-50 border border-[#2a2f45] bg-[#1a1f2e] text-gray-400 hover:text-white">
                  🏃 Run
                </button>
              </div>

              {/* Battle log */}
              <div className="glass-card p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Battle Log</p>
                {log.length === 0
                  ? <p className="text-gray-600 text-sm">The battle has begun!</p>
                  : log.map((l, i) => <p key={i} className={`text-sm ${i === 0 ? "text-white" : "text-gray-400"} mb-1`}>{l}</p>)}
              </div>
            </div>
          )}

          {/* Tips */}
          {phase === "idle" && (
            <div className="glass-card p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">How It Works</p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>⚔️ <span className="text-white">Attack</span> — deal damage to the wild Pokémon</p>
                <p>🔴 <span className="text-white">Throw Ball</span> — unlocks when wild HP drops below 50%</p>
                <p>🏃 <span className="text-white">Run</span> — escape safely at any time</p>
                <p>📦 Caught Pokémon are sent directly to your PC storage</p>
                <p>✨ <span className="text-yellow-400">1% chance of encountering a shiny!</span></p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
