import Link from "next/link";
import { Zap, Shield, BarChart2, Trophy, CreditCard, HelpCircle, Gamepad2, Star, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  const features = [
    {
      icon: "⚔️",
      title: "Pokémon Party",
      desc: "View your active battle team with live stats and HP",
    },
    {
      icon: "💾",
      title: "PC Storage",
      desc: "Browse every Pokémon you've ever caught in your PC box",
    },
    {
      icon: "💰",
      title: "Economy Stats",
      desc: "Track your wallet, bank balance and total gold wealth",
    },
    {
      icon: "🏆",
      title: "Rank & XP",
      desc: "See your rank tier and XP progress toward the next rank",
    },
    {
      icon: "🃏",
      title: "Cards",
      desc: "Your total card collection from the bot",
    },
    {
      icon: "📊",
      title: "Leaderboards",
      desc: "Compete globally — gold, XP, catches, quiz wins & cards",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={session.isLoggedIn} username={session.username} />

      <main className="flex-1">
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00d4ff]/5 rounded-full blur-3xl" />
            <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-[#ffd700]/5 rounded-full blur-3xl" />
            <div className="absolute top-1/4 right-1/4 w-[250px] h-[250px] bg-[#7c3aed]/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 border border-[#2a2f45] bg-[#1a1f2e]/80 rounded-full px-4 py-1.5 text-xs text-gray-300 mb-8">
              <Zap className="w-3 h-3 text-[#ffd700]" />
              Powered by Deezbots
            </div>

            <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl tracking-wider mb-6 animate-glow">
              <span className="gradient-text">DEEZBOTS</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 font-light mb-4">
              Your WhatsApp Pokémon Dashboard
            </p>

            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10">
              Track your Pokémon, monitor your economy, climb the leaderboards,
              and manage your trainer profile — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={session.isLoggedIn ? "/dashboard" : "/login"}>
                <button className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
                  → Access Dashboard
                </button>
              </Link>
              <Link href="/leaderboard">
                <button className="btn-outline flex items-center gap-2 px-8 py-3 text-base">
                  View Leaderboard
                </button>
              </Link>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-[#2a2f45] flex items-start justify-center p-1.5">
              <div className="w-1 h-2 rounded-full bg-[#00d4ff]" />
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                What's in Your Dashboard
              </h2>
              <p className="text-gray-400">
                Everything you need to track your journey
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="glass-card p-6 card-glow cursor-default"
                >
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {f.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 border-t border-[#2a2f45]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
              How to Get Started
            </h2>
            <p className="text-gray-400 mb-10">
              Set up your dashboard in 2 simple bot commands
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] font-bold text-sm">
                    1
                  </div>
                  <h3 className="font-semibold text-white">Set a Password</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  In the bot chat, type:
                </p>
                <code className="block bg-[#0d0f1a] text-[#00d4ff] px-4 py-3 rounded-lg text-sm font-mono border border-[#2a2f45]">
                  !webpass yourpassword
                </code>
                <p className="text-gray-500 text-xs mt-2">
                  Password must be at least 6 characters
                </p>
              </div>

              <div className="glass-card p-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#ffd700]/20 flex items-center justify-center text-[#ffd700] font-bold text-sm">
                    2
                  </div>
                  <h3 className="font-semibold text-white">Register Your Number</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Then register with:
                </p>
                <code className="block bg-[#0d0f1a] text-[#00d4ff] px-4 py-3 rounded-lg text-sm font-mono border border-[#2a2f45]">
                  !addnumber 27XXXXXXXXX
                </code>
                <p className="text-gray-500 text-xs mt-2">
                  Use your full international number (no +)
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/login">
                <button className="btn-primary flex items-center gap-2 mx-auto px-8 py-3">
                  Login to Dashboard <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
