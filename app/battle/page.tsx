import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import BattleClient from "./BattleClient";

export const dynamic = "force-dynamic";

export default async function BattlePage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/login");
  return <BattleClient username={session.username || "Trainer"} />;
}
