import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function WriterLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="dashboard-layout">
      <Sidebar
        role={session.user.role}
        userName={session.user.name || "Writer"}
        userEmail={session.user.email || ""}
      />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
