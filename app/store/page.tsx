import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import StoreClient from "./StoreClient";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/login");
  return <StoreClient username={session.username || "Trainer"} />;
}
