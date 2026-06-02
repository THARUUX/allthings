import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Role } from "@/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="dashboard-layout">
      <Sidebar role="ADMIN" userName={session.user.name || ""} userEmail={session.user.email || ""} />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
