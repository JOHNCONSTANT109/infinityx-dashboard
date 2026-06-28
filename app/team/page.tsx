import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/session";
import { Code2, Zap, Star } from "lucide-react";

const TEAM = [
  {
    name: "DeeZ",
    role: "Owner & Sole Developer",
    isOwner: true,
    avatar: "👑",
    description:
      "Founder of Deezbots and the creative force behind the platform. Built the entire bot and dashboard from the ground up — from the Pokémon engine to the web platform.",
    skills: ["Bot Development", "Web Design", "Database Architecture", "Game Design"],
    badge: "🏆 Founder",
  },
];

export default async function TeamPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={session.isLoggedIn} username={session.username} />

      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#1a1f2e] border border-[#2a2f45] rounded-full px-4 py-1.5 text-xs text-gray-400 mb-4">
              <Zap className="w-3 h-3 text-[#ffd700]" />
              Deezbots Team
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-3">
              The Team
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              The people behind the Deezbots ecosystem
            </p>
          </div>

          <div className="flex justify-center mb-12">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="glass-card p-8 text-center max-w-md w-full border-[#2a2f45] relative overflow-hidden"
              >
                {member.isOwner && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00d4ff] to-[#ffd700]" />
                )}

                <div className="relative inline-block mb-5">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00d4ff]/20 to-[#ffd700]/20 border-2 border-[#00d4ff]/30 flex items-center justify-center text-5xl mx-auto">
                    {member.avatar}
                  </div>
                  {member.isOwner && (
                    <div className="absolute -bottom-1 -right-1 bg-[#ffd700] rounded-full w-7 h-7 flex items-center justify-center text-sm border-2 border-[#0d0f1a]">
                      👑
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white mb-1">{member.name}</h2>
                  <p className="text-[#00d4ff] font-medium text-sm mb-2">{member.role}</p>
                  <span className="inline-flex items-center gap-1 text-xs bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/20 rounded-full px-3 py-1">
                    {member.badge}
                  </span>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {member.description}
                </p>

                <div className="flex flex-wrap gap-2 justify-center">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-[#1a1f2e] border border-[#2a2f45] text-gray-300 rounded-full px-3 py-1"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#00d4ff]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Deezbots Bot</h3>
                  <p className="text-gray-500 text-xs">WhatsApp Pokémon Game</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                A full-featured Pokémon game running on WhatsApp. Catch, battle,
                trade, and compete with players worldwide. Built and maintained
                by DeeZ.
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#ffd700]/10 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-[#ffd700]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Deezbots</h3>
                  <p className="text-gray-500 text-xs">Bot Development Studio</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The company behind Deezbots and other WhatsApp bots. Focused on
                creating fun, engaging, and technically excellent bot experiences.
              </p>
            </div>
          </div>

          <div className="glass-card p-8 text-center border border-[#2a2f45]">
            <Star className="w-8 h-8 text-[#ffd700] mx-auto mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">Join the Community</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
              Play on WhatsApp, climb the leaderboards, and be part of the
              growing Deezbots community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/login">
                <button className="btn-primary px-6 py-2.5">
                  Access Dashboard
                </button>
              </a>
              <a href="/leaderboard">
                <button className="btn-outline px-6 py-2.5">
                  View Leaderboard
                </button>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
