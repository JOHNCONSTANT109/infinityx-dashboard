import { getIronSession, IronSession, SessionOptions } from "iron-session";
  import { cookies } from "next/headers";

  export const dynamic = "force-dynamic";

  export interface SessionData {
    number?: string;
    botKey?: string;
    username?: string;
    isLoggedIn: boolean;
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    console.error("[session] WARNING: SESSION_SECRET is not set. Add it in Vercel → Project → Settings → Environment Variables.");
  }

  export const sessionOptions: SessionOptions = {
    password: secret || "fallback-dev-secret-set-SESSION_SECRET-in-vercel",
    cookieName: "deezbots-session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    },
  };

  export async function getSession(): Promise<IronSession<SessionData>> {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );
    if (!session.isLoggedIn) {
      session.isLoggedIn = false;
    }
    return session;
  }
  