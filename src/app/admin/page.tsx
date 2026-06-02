import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  FileText,
  Eye,
  CheckSquare,
  ArrowUpRight,
  Clock,
  FolderOpen,
  Settings,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getAdminStats() {
  const [
    totalUsers,
    totalArticles,
    pendingArticles,
    publishedArticles,
    categoriesCount,
    viewsSum,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.article.count(),
    prisma.article.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.category.count(),
    prisma.article.aggregate({ _sum: { views: true } }),
  ]);

  const totalViews = viewsSum._sum.views || 0;

  return {
    totalUsers,
    totalArticles,
    pendingArticles,
    publishedArticles,
    categoriesCount,
    totalViews,
  };
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const stats = await getAdminStats();

  const kpiCards = [
    { label: "Total Articles", value: stats.totalArticles.toLocaleString(), sub: `${stats.publishedArticles} published`, color: "var(--color-primary-light)", icon: FileText },
    { label: "Total Reads / Views", value: stats.totalViews.toLocaleString(), sub: "Across all stories", color: "var(--color-success)", icon: Eye },
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), sub: "Authors and Admins", color: "var(--color-accent-light)", icon: Users },
    { label: "Review Queue", value: stats.pendingArticles.toLocaleString(), sub: "Needs action", color: "var(--color-warning)", icon: CheckSquare },
  ];

  const quickLinks = [
    { label: "Editorial Queue", value: stats.pendingArticles, total: stats.totalArticles, href: "/admin/articles", color: "var(--color-warning)", icon: CheckSquare, subLabel: "Pending review" },
    { label: "User Accounts", value: stats.totalUsers, href: "/admin/users", color: "var(--color-accent-light)", icon: Users, subLabel: "Active users" },
    { label: "Topic Categories", value: stats.categoriesCount, href: "/admin/categories", color: "var(--color-info)", icon: FolderOpen, subLabel: "Active topics" },
    { label: "Adsterra settings", href: "/admin/settings", color: "var(--color-success)", icon: Settings, subLabel: "Ad codes config" },
  ];

  return (
    <div className="dashboard-content" style={{ animation: "fadeIn 0.4s ease" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Editorial overview and monetize controls</p>
        </div>
        <Link href="/admin/settings" className="btn btn-secondary btn-sm">
          Platform Settings
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: "2.5rem" }}>
        {kpiCards.map(({ label, value, sub, color, icon: Icon }) => (
          <div key={label} className="stat-card">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.875rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={18} color={color} />
              </div>
            </div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)", marginTop: "0.25rem" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Action Panels */}
      <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.25rem" }}>Console Sections</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        {quickLinks.map(({ label, value, href, color, icon: Icon, subLabel }) => {
          const wrapper = (children: React.ReactNode) => 
            href ? <Link href={href} style={{ textDecoration: "none" }}>{children}</Link> : <div>{children}</div>;
          
          return wrapper(
            <div className="stat-card" style={{ cursor: href ? "pointer" : "default", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <Icon size={18} color={color} />
                {href && <ArrowUpRight size={15} color="var(--color-text-subtle)" />}
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "0.25rem" }}>{label}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>{subLabel}</div>
              
              {value !== undefined && (
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.375rem", marginTop: "0.5rem" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: value > 0 && color !== "var(--color-accent-light)" ? color : "var(--color-text)" }}>
                    {value}
                  </span>
                </div>
              )}
              
              {label === "Editorial Queue" && value !== undefined && value > 0 && (
                <span className="badge badge-warning" style={{ marginTop: "0.5rem" }}>
                  <Clock size={11} /> Needs action
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const metadata = {
  title: "Admin Dashboard",
};
