"use client";
  import { useState, useEffect, useCallback } from "react";
  import Navbar from "@/components/Navbar";
  import Footer from "@/components/Footer";

  // ─── Types ────────────────────────────────────────────────────────────────────
  interface Move {
    name: string;
    type: string;
    power: number;
    pp: number;
    maxPp: number;
  }
  interface WildPokemon {
    species: string;
    name: string;
    types: string[];
    rarity: string;
    level: number;
    maxHp: number;
    hp: number;
    atk: number;
    def: number;
    iv: number;
    shiny: boolean;
    sprite: string;
  }
  interface PartyMon {
    name?: string;
    species?: string;
    level?: number;
    hp?: number;
    maxHp?: number;
    types?: string[];
    sprite?: string;
  }

  // ─── Constants ────────────────────────────────────────────────────────────────
  const TYPE_COLORS: Record<string, string> = {
    fire: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    water: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    grass: "bg-green-500/20 text-green-300 border-green-500/30",
    electric: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    psychic: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    dark: "bg-gray-700/40 text-gray-300 border-gray-600/30",
    steel: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    dragon: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    fairy: "bg-pink-400/20 text-pink-200 border-pink-400/30",
    normal: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    fighting: "bg-red-700/20 text-red-300 border-red-700/30",
    flying: "bg-sky-400/20 text-sky-200 border-sky-400/30",
    poison: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    ground: "bg-amber-600/20 text-amber-300 border-amber-600/30",
    rock: "bg-yellow-700/20 text-yellow-600 border-yellow-700/30",
    bug: "bg-lime-500/20 text-lime-300 border-lime-500/30",
    ghost: "bg-violet-700/20 text-violet-300 border-violet-700/30",
    ice: "bg-cyan-400/20 text-cyan-200 border-cyan-400/30",
  };

  const RARITY_COLOR: Record<string, string> = {
    Common: "text-gray-400",
    Uncommon: "text-green-400",
    Rare: "text-blue-400",
    Epic: "text-purple-400",
  };

  // Super-effective attacking matchups
  const SUPER: Record<string, string[]> = {
    fire: ["grass","bug","ice","steel"],
    water: ["fire","ground","rock"],
    grass: ["water","ground","rock"],
    electric: ["water","flying"],
    psychic: ["fighting","poison"],
    ice: ["grass","ground","flying","dragon"],
    fighting: ["normal","rock","steel","dark","ice"],
    poison: ["grass","fairy"],
    ground: ["fire","electric","poison","rock","steel"],
    flying: ["grass","fighting","bug"],
    rock: ["fire","ice","flying","bug"],
    bug: ["grass","psychic","dark"],
    ghost: ["psychic","ghost"],
    dragon: ["dragon"],
    dark: ["psychic","ghost"],
    steel: ["ice","rock","fairy"],
    fairy: ["fighting","dragon","dark"],
  };
  // Not-very-effective attacking matchups
  const WEAK: Record<string, string[]> = {
    fire: ["fire","water","rock","dragon"],
    water: ["water","grass","dragon"],
    grass: ["fire","grass","poison","flying","bug","dragon","steel"],
    electric: ["electric","grass","dragon"],
    psychic: ["psychic","steel"],
    ice: ["fire","water","ice","steel"],
    fighting: ["poison","flying","psychic","bug","fairy"],
    poison: ["poison","ground","rock","ghost"],
    ground: ["grass","bug"],
    flying: ["electric","rock","steel"],
    rock: ["fighting","ground","steel"],
    bug: ["fire","fighting","flying","ghost","steel","fairy"],
    ghost: ["dark"],
    dragon: ["steel"],
    dark: ["fighting","dark","fairy"],
    steel: ["fire","water","electric","steel"],
    fairy: ["fire","poison","steel"],
    normal: ["rock","steel"],
  };

  const MOVE_POOL: Record<string, string[]> = {
    fire: ["Ember","Flamethrower","Fire Blast","Fire Spin","Heat Wave"],
    water: ["Water Gun","Surf","Hydro Pump","Aqua Tail","Bubble Beam"],
    grass: ["Vine Whip","Razor Leaf","Solar Beam","Leaf Storm","Bullet Seed"],
    electric: ["ThunderShock","Thunderbolt","Thunder","Spark","Volt Tackle"],
    psychic: ["Confusion","Psybeam","Psychic","Zen Headbutt","Future Sight"],
    normal: ["Tackle","Scratch","Quick Attack","Body Slam","Hyper Beam"],
    fighting: ["Karate Chop","Low Kick","Dynamic Punch","Close Combat","Submission"],
    poison: ["Poison Sting","Sludge","Sludge Bomb","Acid","Toxic"],
    ground: ["Dig","Earthquake","Mud Shot","Bulldoze","Sand Tomb"],
    flying: ["Gust","Wing Attack","Aerial Ace","Air Slash","Brave Bird"],
    rock: ["Rock Throw","Rock Slide","Stone Edge","Rollout","Power Gem"],
    bug: ["Bug Bite","X-Scissor","Signal Beam","String Shot","Leech Life"],
    ghost: ["Night Shade","Shadow Punch","Shadow Ball","Hex","Phantom Force"],
    ice: ["Powder Snow","Ice Shard","Blizzard","Ice Beam","Aurora Beam"],
    dragon: ["Dragon Rage","Dragon Tail","Dragon Claw","Outrage","Draco Meteor"],
    dark: ["Bite","Crunch","Dark Pulse","Night Slash","Foul Play"],
    steel: ["Metal Claw","Iron Tail","Flash Cannon","Steel Wing","Gyro Ball"],
    fairy: ["Disarming Voice","Moonblast","Draining Kiss","Dazzling Gleam","Play Rough"],
  };

  function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getMoves(types: string[]): Move[] {
    const moves: Move[] = [];
    for (const t of types.slice(0, 2)) {
      const pool = MOVE_POOL[t] ?? MOVE_POOL.normal;
      moves.push({ name: pick(pool), type: t, power: 50 + Math.floor(Math.random() * 50), pp: 15, maxPp: 15 });
    }
    while (moves.length < 4) {
      moves.push({ name: pick(MOVE_POOL.normal), type: "normal", power: 35 + Math.floor(Math.random() * 20), pp: 20, maxPp: 20 });
    }
    return moves.slice(0, 4);
  }

  function effectiveness(moveType: string, defTypes: string[]): number {
    let mult = 1;
    for (const dt of defTypes) {
      if ((SUPER[moveType] ?? []).includes(dt)) mult *= 2;
      if ((WEAK[moveType] ?? []).includes(dt)) mult *= 0.5;
    }
    return mult;
  }

  function calcDamage(
    movePow: number,
    moveType: string,
    atk: number,
    def: number,
    level: number,
    defTypes: string[]
  ): { dmg: number; eff: number } {
    const base = Math.max(1, Math.floor(((2 * level) / 5 + 2) * movePow * atk / (def * 50 + 2) * 50 + 2));
    const eff = effectiveness(moveType, defTypes);
    const roll = 0.85 + Math.random() * 0.15;
    return { dmg: Math.floor(base * eff * roll), eff };
  }

  // ─── HP Bar ───────────────────────────────────────────────────────────────────
  function HpBar({ hp, maxHp }: { hp: number; maxHp: number }) {
    const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;
    const color = pct > 50 ? "#22c55e" : pct > 25 ? "#ffd700" : "#ef4444";
    return (
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>HP</span>
          <span>{Math.max(0, hp)}/{maxHp}</span>
        </div>
        <div className="h-3 bg-[#1a1f2e] rounded-full overflow-hidden border border-[#2a2f45]">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    );
  }

  // ─── Main Component ───────────────────────────────────────────────────────────
  type Phase = "idle" | "spawning" | "battle" | "caught" | "fled" | "fainted";

  export default function BattleClient({ username }: { username: string }) {
    const [phase, setPhase] = useState<Phase>("idle");
    const [wild, setWild] = useState<WildPokemon | null>(null);
    const [party, setParty] = useState<PartyMon[]>([]);
    const [playerIdx, setPlayerIdx] = useState(0);
    const [playerHp, setPlayerHp] = useState(0);
    const [moves, setMoves] = useState<Move[]>([]);
    const [log, setLog] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);
    const [catchResult, setCatchResult] = useState<string | null>(null);
    const [effMsg, setEffMsg] = useState<"super" | "weak" | null>(null);

    useEffect(() => {
      fetch("/api/dashboard")
        .then((r) => r.json())
        .then((d) => {
          if (d.party?.length) {
            setParty(d.party);
            const p = d.party[0] as PartyMon;
            setPlayerHp(p.hp ?? p.maxHp ?? 60);
            setMoves(getMoves(p.types ?? ["normal"]));
          }
        })
        .catch(() => {});
    }, []);

    const addLog = useCallback((msg: string) => setLog((l) => [msg, ...l].slice(0, 10)), []);
    const player = party[playerIdx] as PartyMon | undefined;
    const playerMaxHp = player?.maxHp ?? player?.hp ?? 60;

    // ── Spawn ──────────────────────────────────────────────────────────────────
    async function spawnWild() {
      setPhase("spawning");
      setBusy(true);
      setLog([]);
      setCatchResult(null);
      setEffMsg(null);
      try {
        const res = await fetch("/api/battle/spawn");
        const data = (await res.json()) as WildPokemon;
        if (!res.ok) { setPhase("idle"); return; }
        setWild(data);
        setPhase("battle");
        addLog("A wild " + data.name + " (Lv." + data.level + ") appeared!" + (data.shiny ? " ✨ Shiny!" : ""));
      } finally {
        setBusy(false);
      }
    }

    // ── Use Move ───────────────────────────────────────────────────────────────
    async function useMove(idx: number) {
      if (!wild || phase !== "battle" || busy) return;
      const mv = moves[idx];
      if (!mv || mv.pp <= 0) { addLog("No PP left for that move!"); return; }
      setBusy(true);
      setEffMsg(null);

      // Deduct PP
      const newMoves = moves.map((m, i) => i === idx ? { ...m, pp: m.pp - 1 } : m);
      setMoves(newMoves);

      const pAtk = Math.floor((player?.level ?? 5) * 3 + 20);
      const { dmg, eff } = calcDamage(mv.power, mv.type, pAtk, wild.def, player?.level ?? 5, wild.types);
      const newWildHp = Math.max(0, wild.hp - dmg);
      setWild((w) => (w ? { ...w, hp: newWildHp } : w));

      let effNote = "";
      if (eff >= 2) { effNote = " Super effective! 🔥"; setEffMsg("super"); }
      else if (eff <= 0.5) { effNote = " Not very effective..."; setEffMsg("weak"); }
      const pName = player?.name ?? "Your Pokémon";
      addLog(pName + " used " + mv.name + "! (" + dmg + " dmg)" + effNote);

      if (newWildHp <= 0) {
        addLog(wild.name + " fainted! You won! 🏆");
        setPhase("fled");
        setBusy(false);
        return;
      }

      await new Promise<void>((r) => setTimeout(r, 700));

      // Wild counter-attack
      const wType = wild.types[0] ?? "normal";
      const wMoveName = pick(MOVE_POOL[wType] ?? MOVE_POOL.normal);
      const pDef = Math.floor((player?.level ?? 5) * 2 + 15);
      const { dmg: wDmg } = calcDamage(40 + Math.floor(Math.random() * 20), wType, wild.atk, pDef, wild.level, player?.types ?? ["normal"]);
      const newPlayerHp = Math.max(0, playerHp - wDmg);
      setPlayerHp(newPlayerHp);
      addLog(wild.name + " used " + wMoveName + "! (" + wDmg + " dmg)");

      if (newPlayerHp <= 0) {
        addLog((player?.name ?? "Your Pokémon") + " fainted! ⚫");
        setPhase("fainted");
      }
      setBusy(false);
    }

    // ── Throw Ball ─────────────────────────────────────────────────────────────
    async function throwBall() {
      if (!wild || phase !== "battle" || busy) return;
      setBusy(true);
      addLog("You threw a Pokéball at " + wild.name + "... 🎯");
      await new Promise<void>((r) => setTimeout(r, 900));
      try {
        const res = await fetch("/api/battle/catch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...wild }),
        });
        const data = await res.json() as { caught: boolean; message: string };
        if (data.caught) {
          addLog("🎉 " + data.message);
          setCatchResult(data.message);
          setPhase("caught");
        } else {
          addLog(data.message ?? (wild.name + " broke free!"));
          const wType = wild.types[0] ?? "normal";
          const wMoveName = pick(MOVE_POOL[wType] ?? MOVE_POOL.normal);
          const pDef = Math.floor((player?.level ?? 5) * 2 + 15);
          const { dmg: wDmg } = calcDamage(40, wType, wild.atk, pDef, wild.level, player?.types ?? ["normal"]);
          const newHp = Math.max(0, playerHp - wDmg);
          setPlayerHp(newHp);
          addLog(wild.name + " used " + wMoveName + "! (" + wDmg + " dmg)");
          if (newHp <= 0) { addLog("Your Pokémon fainted! ⚫"); setPhase("fainted"); }
        }
      } catch {
        addLog("Failed to throw ball. Try again.");
      } finally {
        setBusy(false);
      }
    }

    function flee() { addLog("You fled safely! 🏃"); setPhase("fled"); }

    const canCatch = wild ? wild.hp / wild.maxHp <= 0.6 : false;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn username={username} />
        <main className="flex-1 pt-20 pb-12 px-3">
          <div className="max-w-2xl mx-auto">

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-[#1a1f2e] border border-[#2a2f45] rounded-full px-4 py-1.5 text-xs text-gray-400 mb-3">
                ⚔️ Wild Battle
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold gradient-text mb-1">Wild Pokémon Battle</h1>
              <p className="text-gray-400 text-sm">Weaken wild Pokémon and throw a ball — caught Pokémon go straight to your PC!</p>
            </div>

            {/* No party */}
            {party.length === 0 && (
              <div className="glass-card p-8 text-center mb-4">
                <p className="text-4xl mb-3">⚠️</p>
                <p className="text-gray-300 font-semibold mb-1">No Pokémon in your party</p>
                <p className="text-gray-500 text-sm">Start your journey in the bot first, then come back to battle!</p>
              </div>
            )}

            {/* Idle / end screen */}
            {(phase === "idle" || phase === "fled" || phase === "fainted" || phase === "caught") && party.length > 0 && (
              <div className="glass-card p-8 text-center mb-4">
                {phase === "caught" && catchResult && (
                  <div className="mb-5 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <p className="text-green-400 font-bold text-lg">🎉 {catchResult}</p>
                    <p className="text-gray-400 text-sm mt-1">Check your PC Storage on the Dashboard!</p>
                  </div>
                )}
                {phase === "fainted" && <p className="text-red-400 font-bold mb-4">Your Pokémon fainted! Heal up in the bot first.</p>}
                {phase === "fled" && <p className="text-gray-400 mb-4">You escaped safely. 🏃</p>}
                <p className="text-5xl mb-4">🌿</p>
                <p className="text-white font-bold text-lg mb-2">Ready to battle?</p>
                <p className="text-gray-400 text-sm mb-6">Walk into the tall grass to find a wild Pokémon</p>
                <button
                  onClick={spawnWild}
                  disabled={busy || phase === "fainted"}
                  className="btn-primary px-8 py-3 text-base flex items-center gap-2 mx-auto"
                >
                  {busy ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Finding...</>
                  ) : "🌿 Enter Tall Grass"}
                </button>
              </div>
            )}

            {/* Battle UI */}
            {phase === "battle" && wild && (
              <div className="space-y-3 mb-4">

                {/* Arena card */}
                <div className="glass-card p-4 sm:p-5" style={{ background: "linear-gradient(135deg,#0d0f1a 0%,#0a1020 100%)" }}>

                  {/* Effectiveness banner */}
                  {effMsg && (
                    <div className={"text-center text-xs font-bold mb-3 py-1 rounded-lg " + (effMsg === "super" ? "bg-orange-500/20 text-orange-300" : "bg-gray-500/10 text-gray-400")}>
                      {effMsg === "super" ? "⚡ Super effective!" : "💨 Not very effective..."}
                    </div>
                  )}

                  {/* Wild Pokémon info */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-white font-bold capitalize text-lg">{wild.name}</span>
                        {wild.shiny && <span className="text-yellow-400 text-xs">✨ Shiny</span>}
                        <span className={"text-xs font-semibold " + (RARITY_COLOR[wild.rarity] ?? "text-gray-400")}>{wild.rarity}</span>
                      </div>
                      <p className="text-gray-400 text-xs mb-2">Lv.{wild.level} · IV {wild.iv}</p>
                      <div className="flex gap-1 flex-wrap mb-3">
                        {wild.types.map((t) => (
                          <span key={t} className={"text-xs px-2 py-0.5 rounded-full capitalize border " + (TYPE_COLORS[t] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30")}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <HpBar hp={wild.hp} maxHp={wild.maxHp} />
                      {canCatch && <p className="text-yellow-400 text-xs mt-1.5 font-semibold animate-pulse">🎯 HP low enough — throw a ball!</p>}
                    </div>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 ml-3">
                      {wild.sprite ? (
                        <img
                          src={wild.sprite}
                          alt={wild.name}
                          className="w-full h-full object-contain drop-shadow-lg"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <span className="text-5xl flex items-center justify-center h-full">🔮</span>
                      )}
                    </div>
                  </div>

                  {/* VS divider */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-[#2a2f45]" />
                    <span className="text-gray-500 text-xs font-bold">VS</span>
                    <div className="flex-1 h-px bg-[#2a2f45]" />
                  </div>

                  {/* Player Pokémon */}
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
                      {player?.sprite ? (
                        <img src={player.sprite} alt={player.name ?? "Pokémon"} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-3xl">🔮</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold capitalize mb-0.5">{player?.name ?? "Your Pokémon"}</p>
                      <p className="text-gray-400 text-xs mb-2">Lv.{player?.level ?? "?"}</p>
                      <HpBar hp={playerHp} maxHp={playerMaxHp} />
                    </div>
                  </div>

                  {/* Party switch */}
                  {party.length > 1 && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                      {party.map((p, i) => (
                        <button
                          key={i}
                          disabled={busy || i === playerIdx}
                          onClick={() => {
                            setPlayerIdx(i);
                            setPlayerHp(p.hp ?? p.maxHp ?? 60);
                            setMoves(getMoves(p.types ?? ["normal"]));
                            addLog("Go, " + (p.name ?? "Pokémon") + "!");
                          }}
                          className={"text-xs px-3 py-1.5 rounded-lg border transition-all capitalize " + (i === playerIdx ? "bg-[#00d4ff]/20 border-[#00d4ff]/50 text-[#00d4ff]" : "bg-[#1a1f2e] border-[#2a2f45] text-gray-400 hover:text-white")}
                        >
                          {p.name ?? ("Slot " + (i + 1))} Lv.{p.level}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Move grid — like the bot's move list */}
                <div className="glass-card p-3">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Choose a Move</p>
                  <div className="grid grid-cols-2 gap-2">
                    {moves.map((mv, i) => (
                      <button
                        key={i}
                        disabled={busy || mv.pp <= 0}
                        onClick={() => useMove(i)}
                        className={"p-3 rounded-xl text-left border transition-all " + (mv.pp > 0 ? "hover:brightness-110 active:scale-95" : "opacity-40 cursor-not-allowed") + " " + (TYPE_COLORS[mv.type] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30")}
                      >
                        <p className="font-bold text-sm">{mv.name}</p>
                        <p className="text-xs opacity-70 capitalize">{mv.type} · Pwr {mv.power}</p>
                        <p className="text-xs opacity-60 mt-0.5">PP {mv.pp}/{mv.maxPp}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ball + Run */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={busy || !canCatch}
                    onClick={throwBall}
                    className={"py-4 rounded-xl font-bold text-sm border transition-all " + (canCatch ? "border-[#ffd700]/40 bg-[#ffd700]/10 text-yellow-300 hover:bg-[#ffd700]/20 active:scale-95" : "border-[#2a2f45] bg-[#1a1f2e] text-gray-600 cursor-not-allowed")}
                  >
                    🔴 Throw Ball{canCatch ? "" : " (weaken first)"}
                  </button>
                  <button
                    disabled={busy}
                    onClick={flee}
                    className="py-4 rounded-xl font-bold text-sm border border-[#2a2f45] bg-[#1a1f2e] text-gray-400 hover:text-white active:scale-95 transition-all"
                  >
                    🏃 Run Away
                  </button>
                </div>

                {/* Battle log */}
                <div className="glass-card p-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Battle Log</p>
                  {log.length === 0 ? (
                    <p className="text-gray-600 text-sm">The battle has begun!</p>
                  ) : (
                    log.map((entry, i) => (
                      <p key={i} className={"text-sm mb-1 " + (i === 0 ? "text-white font-medium" : "text-gray-500")}>
                        {entry}
                      </p>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* How it works */}
            {phase === "idle" && (
              <div className="glass-card p-5">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">How It Works</p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>🌿 <span className="text-white">Enter Tall Grass</span> — encounter a random wild Pokémon</p>
                  <p>⚔️ <span className="text-white">Choose a Move</span> — 4 typed moves with PP, just like the bot</p>
                  <p>🔥 <span className="text-white">Type Matchups</span> — super effective deals 2× damage</p>
                  <p>🔴 <span className="text-white">Throw Ball</span> — unlocks when wild HP drops below 60%</p>
                  <p>📦 <span className="text-white">Caught Pokémon</span> — sent straight to your PC Storage</p>
                  <p>✨ <span className="text-yellow-400 font-medium">1% chance to encounter a shiny!</span></p>
                </div>
              </div>
            )}

          </div>
        </main>
        <Footer />
      </div>
    );
  }
  