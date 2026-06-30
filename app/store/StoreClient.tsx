"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PACKAGES = [
  { id: "starter",  emoji: "🥈", label: "Starter Pack",  gold: 400_000_000,    naira: 500,   color: "border-slate-400/30 bg-slate-400/5",   badge: "text-slate-300"  },
  { id: "champion", emoji: "🥇", label: "Champion Pack", gold: 1_000_000_000,  naira: 1000,  color: "border-yellow-500/30 bg-yellow-500/5",  badge: "text-yellow-400" },
  { id: "diamond",  emoji: "💎", label: "Diamond Pack",  gold: 2_500_000_000,  naira: 2000,  color: "border-cyan-400/30 bg-cyan-400/5",      badge: "text-cyan-300"   },
  { id: "legend",   emoji: "👑", label: "Legend Pack",   gold: 5_000_000_000,  naira: 3500,  color: "border-purple-400/30 bg-purple-500/5",  badge: "text-purple-300" },
  { id: "hero",     emoji: "⚡", label: "Hero Pack",     gold: 10_000_000_000, naira: 6000,  color: "border-pink-400/30 bg-pink-500/5",      badge: "text-pink-300"   },
  { id: "deity",    emoji: "🌠", label: "Deity Pack",    gold: 25_000_000_000, naira: 12000, color: "border-amber-400/30 bg-amber-500/5",    badge: "text-amber-300"  },
];

function fmtGold(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(0) + "M";
  return n.toLocaleString();
}

interface PurchaseHistory {
  packageLabel: string;
  nairaAmount: number;
  goldAmount: number;
  status: "pending" | "approved" | "denied";
  createdAt: number;
}

export default function StoreClient({ username }: { username: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<PurchaseHistory[]>([]);
  const [copied, setCopied] = useState(false);

  const ACCOUNT = "9126325901";
  const BANK    = "PalmPay";
  const NAME    = "Mrdeeznuts";

  useEffect(() => {
    fetch("/api/store").then(r => r.json()).then(d => setHistory(d.requests || [])).catch(() => {});
  }, [success]);

  const pkg = PACKAGES.find(p => p.id === selected);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pkg) return;
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selected, reference, whatsappNumber: whatsapp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }
      setSuccess(`Request submitted! Your ${pkg.label} will be credited once payment is confirmed.`);
      setSelected(null); setReference(""); setWhatsapp("");
    } catch { setError("Connection error. Try again."); }
    finally { setLoading(false); }
  }

  function copyAccount() {
    navigator.clipboard.writeText(ACCOUNT).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn username={username} />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#1a1f2e] border border-[#2a2f45] rounded-full px-4 py-1.5 text-xs text-gray-400 mb-4">
              🛒 Gold Store
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-2">Buy Gold</h1>
            <p className="text-gray-400 text-sm">Purchase gold with Naira via PalmPay — credited within minutes</p>
          </div>

          {success && (
            <div className="glass-card p-5 mb-6 border border-green-500/30 bg-green-500/5 text-center">
              <p className="text-green-400 font-semibold">✅ {success}</p>
            </div>
          )}

          {/* Payment info banner */}
          <div className="glass-card p-5 mb-8 border border-[#ffd700]/30 bg-[#ffd700]/5">
            <p className="text-[#ffd700] font-semibold text-sm mb-3">💳 Payment Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#0d0f1a] rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs mb-1">Bank</p>
                <p className="text-white font-bold">{BANK}</p>
              </div>
              <div className="bg-[#0d0f1a] rounded-lg p-3 text-center cursor-pointer hover:border-[#ffd700]/40 border border-transparent transition-all" onClick={copyAccount}>
                <p className="text-gray-500 text-xs mb-1">Account Number</p>
                <p className="text-[#ffd700] font-bold font-mono">{ACCOUNT}</p>
                <p className="text-gray-600 text-xs mt-1">{copied ? "✅ Copied!" : "tap to copy"}</p>
              </div>
              <div className="bg-[#0d0f1a] rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs mb-1">Account Name</p>
                <p className="text-white font-bold">{NAME}</p>
              </div>
            </div>
          </div>

          {/* Packages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {PACKAGES.map(p => (
              <button key={p.id} onClick={() => { setSelected(p.id); setSuccess(""); setError(""); }}
                className={`glass-card p-5 text-left transition-all border-2 hover:scale-[1.02] ${selected === p.id ? p.color.replace("bg-", "!bg-").replace("/5", "/10") + " !border-opacity-60" : p.color} ${selected === p.id ? "ring-2 ring-[#00d4ff]/40" : ""}`}>
                <div className="text-3xl mb-2">{p.emoji}</div>
                <h3 className="text-white font-bold mb-1">{p.label}</h3>
                <p className={`font-bold text-lg mb-1 ${p.badge}`}>{fmtGold(p.gold)} gold</p>
                <p className="text-gray-400 text-sm">₦{p.naira.toLocaleString()}</p>
                {selected === p.id && (
                  <div className="mt-2 text-xs text-[#00d4ff] font-semibold">✓ Selected</div>
                )}
              </button>
            ))}
          </div>

          {/* Payment form */}
          {selected && pkg && (
            <div className="glass-card p-6 mb-8 border border-[#00d4ff]/20">
              <h3 className="text-white font-bold text-lg mb-1">Complete Purchase — {pkg.label}</h3>
              <p className="text-gray-400 text-sm mb-5">
                Send <span className="text-[#ffd700] font-bold">₦{pkg.naira.toLocaleString()}</span> to PalmPay <span className="text-[#ffd700] font-bold">{ACCOUNT}</span>, then fill in the details below.
              </p>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Your WhatsApp Number</label>
                  <div className="flex items-center gap-2 bg-[#0d0f1a] border border-[#2a2f45] rounded-xl px-4 py-3 focus-within:border-[#00d4ff] transition-colors">
                    <span className="text-gray-500">📱</span>
                    <input type="tel" placeholder="e.g. 2349012345678" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required
                      style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0, color: "white", width: "100%" }} />
                  </div>
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1.5">Payment Reference / Description sent</label>
                  <div className="flex items-center gap-2 bg-[#0d0f1a] border border-[#2a2f45] rounded-xl px-4 py-3 focus-within:border-[#00d4ff] transition-colors">
                    <span className="text-gray-500">🧾</span>
                    <input type="text" placeholder="e.g. your name or transaction ID" value={reference} onChange={e => setReference(e.target.value)} required
                      style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0, color: "white", width: "100%" }} />
                  </div>
                  <p className="text-gray-600 text-xs mt-1">Enter the name/reference you used when sending the payment</p>
                </div>
                {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{error}</p>}
                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : "✅ Submit Payment"}
                </button>
              </form>
            </div>
          )}

          {/* Purchase history */}
          {history.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2a2f45]">
                <h3 className="text-white font-semibold text-sm">Your Recent Orders</h3>
              </div>
              <div className="divide-y divide-[#2a2f45]">
                {history.map((h, i) => (
                  <div key={i} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{h.packageLabel}</p>
                      <p className="text-gray-500 text-xs">{fmtGold(h.goldAmount)} gold · ₦{h.nairaAmount.toLocaleString()} · {new Date(h.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      h.status === "approved" ? "bg-green-500/10 text-green-400 border-green-500/30" :
                      h.status === "denied"   ? "bg-red-500/10 text-red-400 border-red-500/30" :
                                                "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                    }`}>{h.status === "approved" ? "✅ Approved" : h.status === "denied" ? "❌ Denied" : "⏳ Pending"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
