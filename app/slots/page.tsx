import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import SlotsClient from "./SlotsClient";

export const dynamic = "force-dynamic";

export default async function SlotsPage() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/login");
  }
  return <SlotsClient username={session.username || "Trainer"} />;
}
