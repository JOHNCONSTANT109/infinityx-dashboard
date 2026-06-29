"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Phone, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#00d4ff]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-[200px] h-[200px] bg-[#7c3aed]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-[#ffd700]" />
            <span className="font-display font-bold text-xl gradient-text tracking-wider">
              DEEZBOTS
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back, Trainer</h1>
          <p className="text-gray-400 text-sm">Sign in to access your dashboard</p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="flex items-center gap-2 bg-[rgba(26,31,46,0.8)] border border-[#2a2f45] rounded-lg px-3 focus-within:border-[#00d4ff] focus-within:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] transition-all">
                <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <input
                  type="tel"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="27XXXXXXXXX (no + or spaces)"
                  style={{ background: "transparent", border: "none", boxShadow: "none", padding: "0.75rem 0" }}
                  required
                />
              </div>
              <p className="text-gray-500 text-xs mt-1.5">
                Enter your number in international format without +
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="flex items-center gap-2 bg-[rgba(26,31,46,0.8)] border border-[#2a2f45] rounded-lg px-3 focus-within:border-[#00d4ff] focus-within:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] transition-all">
                <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your web password"
                  style={{ background: "transparent", border: "none", boxShadow: "none", padding: "0.75rem 0", flex: 1 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-gray-500 hover:text-gray-300 flex-shrink-0"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 glass-card p-5">
          <p className="text-sm font-medium text-gray-300 mb-3">First time? Set up via the bot:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs w-4">1.</span>
              <code className="text-[#00d4ff] bg-[#0d0f1a] px-2 py-1 rounded text-xs font-mono flex-1">
                !webpass yourpassword
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs w-4">2.</span>
              <code className="text-[#00d4ff] bg-[#0d0f1a] px-2 py-1 rounded text-xs font-mono flex-1">
                !addnumber 27XXXXXXXXX
              </code>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-3">
            To reset password:{" "}
            <code className="text-[#ffd700]">!webresetpassword newpassword</code>
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © {new Date().getFullYear()} Deezbots. All rights reserved.
        </p>
      </div>
    </div>
  );
}
