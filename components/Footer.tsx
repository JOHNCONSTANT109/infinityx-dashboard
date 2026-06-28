import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#2a2f45] bg-[#0a0c15] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-[#ffd700]" />
              <span className="font-display font-bold text-lg gradient-text tracking-wider">
                DEEZBOTS
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your WhatsApp Pokémon Dashboard. Track your progress, manage your
              team, and dominate the leaderboards.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-[#00d4ff] text-sm transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="text-gray-400 hover:text-[#00d4ff] text-sm transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-[#00d4ff] text-sm transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-gray-400 hover:text-[#00d4ff] text-sm transition-colors"
                >
                  Team
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Bot Commands
            </h4>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">
                <code className="text-[#00d4ff] bg-[#1a1f2e] px-2 py-0.5 rounded text-xs">
                  !webpass [password]
                </code>
                <span className="ml-2">Set web password</span>
              </li>
              <li className="text-gray-400 text-sm">
                <code className="text-[#00d4ff] bg-[#1a1f2e] px-2 py-0.5 rounded text-xs">
                  !addnumber [number]
                </code>
                <span className="ml-2">Register dashboard</span>
              </li>
              <li className="text-gray-400 text-sm">
                <code className="text-[#00d4ff] bg-[#1a1f2e] px-2 py-0.5 rounded text-xs">
                  !webresetpassword [new]
                </code>
                <span className="ml-2">Reset password</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2a2f45] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Deezbots. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Zap className="w-3 h-3 text-[#ffd700]" />
            Powered by Deezbots
          </div>
        </div>
      </div>
    </footer>
  );
}
