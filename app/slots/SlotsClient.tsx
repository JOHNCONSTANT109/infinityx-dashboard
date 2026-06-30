"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "💎", "⭐", "7️⃣"];
const PAYOUTS: Record<string, number> = {
  "7️⃣": 50, "⭐": 20, "💎": 10, "🍇": 5, "🍊": 3, "🍋": 2, "🍒": 1.5,
};

const QUICK_BETS = [10_000, 100_000, 500_000, 1_000_000];

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toLocaleString();
}

export default function SlotsClient({ username }: { username: string }) {
  const [reels, setReels] = useState(["🍒", "🍋", "🍊"]);
  const [display, setDisplay] = useState(["🍒", "🍋", "🍊"]);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10_000);
  const [wallet, setWallet] = useState<number | null>(null);
  const [result, setResult] = useState<{ won: boolean; winAmount: number; netChange: number; message: string } | null>(null);
  const [error, setError] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { if (d.gold !== undefined) setWallet(d.gold); }).catch(() => {});
  }, []);

  async function spin() {
    if (spinning) return;
    if (bet < 1 || bet > 1_000_000) { setError("Bet must be 1 – 1,000,000 gold."); return; }
    if (wallet !== null && bet > wallet) { setError("Not enough gold!"); return; }
    setError(""); setResult(null); setSpinning(true);
    intervalRef.current = setInterval(() => {
      setDisplay([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
    }, 80);
    try {
      const res = await fetch("/api/slots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bet }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Spin failed"); return; }
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplay(data.reels); setReels(data.reels);
      setWallet(data.newWallet);
      setResult({ won: data.won, winAmount: data.winAmount, netChange: data.netChange, message: data.message });
    } catch { setError("Connection error."); }
    finally { if (intervalRef.current) clearInterval(intervalRef.current); setSpinning(false); }
  }

  const isWin = result?.won;
  const isJackpot = result?.won && result.winAmount >= bet * 3;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn username={username} />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#1a1f2e] border border-[#2a2f45] rounded-full px-4 py-1.5 text-xs text-gray-400 mb-4">
              🎰 Casino
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-2">Slot Machine</h1>
            <p className="text-gray-400 text-sm">Match 2 = 3× bet · Match 3 = up to 50× · No match = 40% refund</p>
          </div>

          <div className="glass-card p-6 mb-4">
            {/* Wallet */}
            <div className="flex items-center justify-between mb-5 bg-[#0d0f1a] rounded-xl px-4 py-3 border border-[#2a2f45]">
              <span className="text-gray-400 text-sm">💰 Wallet</span>
              <span className="text-white font-bold text-lg">{wallet !== null ? wallet.toLocaleString() + " gold" : "..."}</span>
            </div>

            {/* Reels */}
            <div className="flex justify-center gap-3 mb-6 p-4 rounded-2xl bg-[#0a0c15] border-2"
              style={{ borderColor: isJackpot ? "#ffd700" : isWin ? "#00d4ff" : "#2a2f45", boxShadow: isJackpot ? "0 0 40px rgba(255,215,0,0.5)" : isWin ? "0 0 20px rgba(0,212,255,0.3)" : "none", transition: "all 0.4s" }}>
              {display.map((sym, i) => (
                <div key={i} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 flex items-center justify-center"
                  style={{
                    background: "rgba(13,15,26,0.95)",
                    borderColor: spinning ? "#00d4ff" : (isJackpot ? "#ffd700" : isWin ? "#00d4ff" : "#2a2f45"),
                    boxShadow: spinning ? "0 0 15px rgba(0,212,255,0.4)" : (isJackpot ? "0 0 20px rgba(255,215,0,0.5)" : "none"),
                    transition: "all 0.3s",
                  }}>
                  <span className="text-5xl select-none">{sym}</span>
                </div>
              ))}
            </div>

            {/* Result */}
            {result && (
              <div className={`rounded-xl p-4 mb-5 text-center border ${isWin ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-300" : "bg-orange-500/10 border-orange-500/30 text-orange-300"}`}>
                <p className="font-bold text-lg">{result.message}</p>
                {result.netChange > 0 && (
                  <p className="text-sm mt-1 text-green-400">+{result.netChange.toLocaleString()} gold profit!</p>
                )}
                {result.netChange < 0 && result.winAmount > 0 && (
                  <p className="text-sm mt-1 text-orange-400">+{result.winAmount.toLocaleString()} gold refunded (only -{Math.abs(result.netChange).toLocaleString()} lost)</p>
                )}
              </div>
            )}
            {error && <div className="rounded-xl p-3 mb-5 text-center bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

            {/* Bet controls */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-[#0d0f1a] border border-[#2a2f45] rounded-xl px-4 py-3 focus-within:border-[#00d4ff] transition-colors">
                <span className="text-yellow-400 text-sm font-bold">💰</span>
                <input type="number" min={1} max={1_000_000} value={bet}
                  onChange={e => setBet(Math.min(1_000_000, Math.max(1, parseInt(e.target.value) || 1)))}
                  style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0, color: "white", fontWeight: "bold", fontSize: "1rem", width: "100%" }}
                  disabled={spinning} />
                <span className="text-gray-500 text-xs">max 1M</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {QUICK_BETS.map(q => (
                  <button key={q} onClick={() => setBet(q)} disabled={spinning}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all border ${bet === q ? "bg-[#00d4ff] text-[#0d0f1a] border-[#00d4ff]" : "bg-[#1a1f2e] text-gray-300 border-[#2a2f45] hover:border-[#00d4ff]/40"}`}>
                    {fmt(q)}
                  </button>
                ))}
              </div>

              <button onClick={spin} disabled={spinning}
                className="w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                style={{ background: spinning ? "rgba(26,31,46,0.8)" : "linear-gradient(135deg,#ffd700 0%,#ff8c00 100%)", color: spinning ? "white" : "#0d0f1a", boxShadow: spinning ? "none" : "0 4px 20px rgba(255,215,0,0.4)", border: "none" }}>
                {spinning
                  ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Spinning...</>
                  : <>🎰 SPIN — {fmt(bet)} gold</>}
              </button>
            </div>
          </div>

          {/* Pay table */}
          <div className="glass-card p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Pay Table</p>
            <div className="space-y-2">
              {Object.entries(PAYOUTS).map(([sym, mult]) => (
                <div key={sym} className="flex items-center justify-between">
                  <span className="text-xl">{sym} {sym} {sym}</span>
                  <span className={`font-bold text-sm ${mult >= 20 ? "text-yellow-400" : mult >= 5 ? "text-[#00d4ff]" : "text-gray-300"}`}>{mult}× bet</span>
                </div>
              ))}
              <div className="border-t border-[#2a2f45] pt-2 mt-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Any 2 matching</span>
                  <span className="text-green-400 font-bold text-sm">3× bet (profit 2×)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">No match</span>
                  <span className="text-orange-400 text-sm">40% consolation refund</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
