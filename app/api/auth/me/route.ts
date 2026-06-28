import { NextResponse } from "next/server";
  import { getSession } from "@/lib/session";

  export const dynamic = "force-dynamic";

  export async function GET() {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ isLoggedIn: false }, { status: 401 });
    }
    return NextResponse.json({
      isLoggedIn: true,
      number: session.number,
      username: session.username,
    });
  }
  