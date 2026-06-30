import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

const OWNER_NUMBER = "2349126325901";

export default async function AdminPaymentsPage() {
  const session = await getSession();
  const isAdmin = session.isLoggedIn && (
    session.number === OWNER_NUMBER ||
    session.username?.toLowerCase() === "mrdeeznuts"
  );
  if (!isAdmin) redirect("/dashboard");
  return <AdminClient />;
}
