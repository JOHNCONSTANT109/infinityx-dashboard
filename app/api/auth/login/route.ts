export const dynamic = 'force-dynamic';

  import { NextRequest, NextResponse } from "next/server";
  import { createHash } from "crypto";
  import { getDb } from "@/lib/db";
  import { getSession } from "@/lib/session";

  interface DashAccountDoc {
    _id: string;
    botKey?: string;
    passwordHash?: string;
    passwordSalt?: string;
  }

  interface UserDoc {
    _id: string;
    name?: string;
  }

  function hashPassword(password: string, salt: string): string {
    return createHash("sha256").update(password + salt).digest("hex");
  }

  export async function POST(req: NextRequest) {
    try {
      const { number, password } = await req.json();

      if (!number || !password) {
        return NextResponse.json(
          { error: "Number and password are required" },
          { status: 400 }
        );
      }

      const cleanNumber = number.toString().replace(/\D/g, "");

      const db = await getDb();

      const dashAccount = await db
        .collection<DashAccountDoc>("dashboard_accounts")
        .findOne({ _id: cleanNumber });

      if (!dashAccount) {
        return NextResponse.json(
          { error: "No dashboard account found. Use -addnumber in the bot first." },
          { status: 404 }
        );
      }

      if (!dashAccount.passwordHash || !dashAccount.passwordSalt) {
        return NextResponse.json(
          { error: "No password set. Use -webpass in the bot first." },
          { status: 401 }
        );
      }

      const hash = hashPassword(password, dashAccount.passwordSalt);
      if (hash !== dashAccount.passwordHash) {
        return NextResponse.json(
          { error: "Incorrect password" },
          { status: 401 }
        );
      }

      const botKey = dashAccount.botKey || cleanNumber;
      const userDoc = await db
        .collection<UserDoc>("users")
        .findOne({ _id: botKey });

      const username = userDoc?.name || `Player_${cleanNumber.slice(-4)}`;

      const session = await getSession();
      session.isLoggedIn = true;
      session.number = cleanNumber;
      session.botKey = botKey;
      session.username = username;
      await session.save();

      return NextResponse.json({ success: true, username });
    } catch (err) {
      console.error("Login error:", err);
      return NextResponse.json(
        { error: "Server error. Please try again." },
        { status: 500 }
      );
    }
  }
  