import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, FileText, CheckCircle2, AlertCircle, ArrowRight, PenTool } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WriterDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const authorId = session.user.id;

  // Fetch writer statistics
  const articlesCount = await prisma.article.count({ where: { authorId } });
  const publishedCount = await prisma.article.count({ where: { authorId, status: "PUBLISHED" } });
  const pendingCount = await prisma.article.count({ where: { authorId, status: "PENDING_REVIEW" } });
  
  const viewsSum = await prisma.article.aggregate({
    where: { authorId },
    _sum: { views: true },
  });
  const totalViews = viewsSum._sum.views || 0;

  // Fetch recent articles
  const recentArticles = await prisma.article.findMany({
    where: { authorId },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="dashboard-content" style={{ animation: "fadeIn 0.4s ease" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {session.user.name}</h1>
          <p className="page-subtitle">Track your content views and manage your stories.</p>
        </div>
        <Link href="/dashboard/writer/new" className="btn btn-primary">
          <PenTool size={16} /> Write Article
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Articles</div>
          <div className="stat-value">{articlesCount}</div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>
            <FileText size={14} /> Drafts and Published
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Published Articles</div>
          <div className="stat-value" style={{ color: "var(--color-success)" }}>{publishedCount}</div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--color-success)" }}>
            <CheckCircle2 size={14} /> Live on platform
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value" style={{ color: "var(--color-warning)" }}>{pendingCount}</div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--color-warning)" }}>
            <AlertCircle size={14} /> Waiting for approval
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Content Views</div>
          <div className="stat-value" style={{ color: "var(--color-primary-light)" }}>{totalViews}</div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--color-primary-light)" }}>
            <Eye size={14} /> Organic readership views
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="card" style={{ marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Your Recent Stories</h2>
          <Link href="/dashboard/writer/articles" style={{ fontSize: "0.875rem", color: "var(--color-primary-light)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentArticles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={24} />
            </div>
            <p className="empty-state-title">No articles yet</p>
            <p className="empty-state-desc">Write your first story to get organic views and monetized clicks!</p>
            <Link href="/dashboard/writer/new" className="btn btn-secondary btn-sm" style={{ marginTop: "0.5rem" }}>
              Start writing
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentArticles.map((article) => (
                  <tr key={article.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link href={`/dashboard/writer/articles/edit/${article.id}`} style={{ color: "var(--color-text)", textDecoration: "none" }} className="hover:text-primary">
                        {article.title}
                      </Link>
                    </td>
                    <td>{article.category.name}</td>
                    <td>
                      {article.status === "PUBLISHED" && <span className="badge badge-success">Published</span>}
                      {article.status === "PENDING_REVIEW" && <span className="badge badge-warning">Pending Review</span>}
                      {article.status === "DRAFT" && <span className="badge badge-neutral">Draft</span>}
                      {article.status === "REJECTED" && (
                        <span className="badge badge-danger" title={article.rejectReason || "No reason given"}>
                          Rejected
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>{article.views.toLocaleString()}</td>
                    <td style={{ color: "var(--color-text-subtle)", fontSize: "0.8125rem" }}>
                      {new Date(article.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
