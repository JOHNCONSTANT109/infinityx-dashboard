"use client";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";

interface PayReq {
  _id: string;
  username: string;
  whatsappNumber: string;
  packageLabel: string;
  goldAmount: number;
  nairaAmount: number;
  reference: string;
  status: "pending" | "approved" | "denied";
  createdAt: number;
}

function fmtGold(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(0) + "M";
  return n.toLocaleString();
}

export default function AdminClient() {
  const [requests, setRequests] = useState<PayReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending">("pending");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/payments").then(r => r.json()).then(d => setRequests(d.requests || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handle(id: string, action: "approve" | "deny") {
    setProcessing(id);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, action }),
      });
      if (res.ok) load();
    } catch (_) {}
    finally { setProcessing(null); }
  }

  const filtered = filter === "pending" ? requests.filter(r => r.status === "pending") : requests;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn username="Admin" />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-2xl font-bold gradient-text mb-2">Payment Approvals</h1>
          <p className="text-gray-400 text-sm mb-6">Approve or deny gold purchase requests</p>

          <div className="flex gap-2 mb-6">
            {(["pending", "all"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${filter === f ? "bg-[#00d4ff] text-[#0d0f1a]" : "bg-[#1a1f2e] text-gray-400 border border-[#2a2f45]"}`}>
                {f} {f === "pending" ? `(${requests.filter(r => r.status === "pending").length})` : `(${requests.length})`}
              </button>
            ))}
            <button onClick={load} className="ml-auto px-4 py-2 rounded-full text-sm text-gray-400 bg-[#1a1f2e] border border-[#2a2f45] hover:text-white">↻ Refresh</button>
          </div>

          {loading && <div className="text-center py-16 text-gray-400">Loading...</div>}
          {!loading && filtered.length === 0 && (
            <div className="glass-card p-16 text-center"><p className="text-4xl mb-3">✅</p><p className="text-gray-400">No {filter === "pending" ? "pending" : ""} requests</p></div>
          )}

          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r._id} className="glass-card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        r.status === "approved" ? "bg-green-500/10 text-green-400 border-green-500/30" :
                        r.status === "denied"   ? "bg-red-500/10 text-red-400 border-red-500/30" :
                                                  "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                      }`}>{r.status}</span>
                      <span className="text-gray-500 text-xs">{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-white font-semibold">{r.username} — {r.packageLabel}</p>
                    <p className="text-[#ffd700] text-sm font-bold">₦{r.nairaAmount.toLocaleString()} → {fmtGold(r.goldAmount)} gold</p>
                    <p className="text-gray-400 text-xs mt-1">WA: {r.whatsappNumber} · Ref: <span className="text-[#00d4ff]">{r.reference}</span></p>
                  </div>
                  {r.status === "pending" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handle(r._id, "approve")} disabled={processing === r._id}
                        className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-semibold hover:bg-green-500/30 disabled:opacity-50">
                        ✅ Approve
                      </button>
                      <button onClick={() => handle(r._id, "deny")} disabled={processing === r._id}
                        className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-semibold hover:bg-red-500/30 disabled:opacity-50">
                        ❌ Deny
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
