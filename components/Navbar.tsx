"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Zap, LogOut } from "lucide-react";

interface NavbarProps {
  isLoggedIn?: boolean;
  username?: string;
}

export default function Navbar({ isLoggedIn, username }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a2f45] bg-[#0d0f1a]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <Zap className="w-5 h-5 text-[#ffd700]" />
            <span className="font-display font-bold text-lg gradient-text tracking-wider">
              DEEZBOTS
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/leaderboard"
              className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/team"
              className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
            >
              Team
            </Link>
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-[#00d4ff] text-sm font-medium transition-colors"
                >
                  {username || "Dashboard"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="btn-primary text-sm py-2 px-5">Login</button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#2a2f45] bg-[#0d0f1a]/95 px-4 py-4 flex flex-col gap-4">
          <Link
            href="/leaderboard"
            className="text-gray-300 hover:text-white text-sm font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Leaderboard
          </Link>
          <Link
            href="/team"
            className="text-gray-300 hover:text-white text-sm font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Team
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-[#00d4ff] text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-left text-sm text-red-400 hover:text-red-300 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <button className="btn-primary text-sm w-full">Login</button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
