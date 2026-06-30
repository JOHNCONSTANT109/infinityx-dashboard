import type { Metadata, Viewport } from "next";
  import "./globals.css";

  export const metadata: Metadata = {
    title: "Deezbots Dashboard",
    description: "Your WhatsApp Pokémon Dashboard — Track your Pokémon, monitor your economy, climb the leaderboards.",
    icons: { icon: "/favicon.ico" },
    openGraph: {
      title: "Deezbots Dashboard",
      description: "Your WhatsApp Pokémon Dashboard",
      siteName: "Deezbots",
    },
  };

  export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
  };

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body className="antialiased">{children}</body>
      </html>
    );
  }
  