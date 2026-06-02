"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Edit3, Trash2, Search, ExternalLink, PenTool, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage?: string | null;
  status: string;
  views: number;
  createdAt: string;
  rejectReason?: string | null;
  category: { name: string };
}

interface ArticlesTableProps {
  initialArticles: Article[];
}

export default function ArticlesTable({ initialArticles }: ArticlesTableProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/writer/articles/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setArticles(articles.filter((a) => a.id !== id));
        router.refresh();
      } else {
        alert("Failed to delete article. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting article");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div
        className="card"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          padding: "1rem 1.5rem",
        }}
      >
        <div style={{ display: "flex", flex: 1, minWidth: 260, gap: "0.75rem", position: "relative" }}>
          <Search
            size={16}
            color="var(--color-text-subtle)"
            style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: "2.5rem" }}
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <select
            className="input"
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="DRAFT">Draft</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={24} />
            </div>
            <p className="empty-state-title">No articles found</p>
            <p className="empty-state-desc">Try resetting your search query or filters.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{a.title}</div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--color-text-muted)",
                            maxWidth: 320,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginTop: "0.125rem",
                          }}
                        >
                          {a.summary}
                        </div>
                      </div>
                    </td>
                    <td>{a.category.name}</td>
                    <td>
                      {a.status === "PUBLISHED" && <span className="badge badge-success">Published</span>}
                      {a.status === "PENDING_REVIEW" && <span className="badge badge-warning">Pending Review</span>}
                      {a.status === "DRAFT" && <span className="badge badge-neutral">Draft</span>}
                      {a.status === "REJECTED" && (
                        <div>
                          <span className="badge badge-danger">Rejected</span>
                          {a.rejectReason && (
                            <div style={{ fontSize: "0.6875rem", color: "var(--color-danger)", marginTop: "0.25rem", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
                              Reason: {a.rejectReason}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>{a.views.toLocaleString()}</td>
                    <td style={{ color: "var(--color-text-subtle)", fontSize: "0.8125rem" }}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                        {a.status === "PUBLISHED" && (
                          <Link
                            href={`/posts/${a.slug}`}
                            target="_blank"
                            className="btn btn-ghost btn-sm"
                            title="View Public Post"
                            style={{ padding: "0.25rem 0.5rem" }}
                          >
                            <ExternalLink size={15} />
                          </Link>
                        )}
                        <Link
                          href={`/dashboard/writer/articles/edit/${a.id}`}
                          className="btn btn-secondary btn-sm"
                          title="Edit Article"
                          style={{ padding: "0.25rem 0.5rem" }}
                        >
                          <Edit3 size={15} />
                        </Link>
                        <button
                          disabled={deletingId === a.id}
                          onClick={() => handleDelete(a.id)}
                          className="btn btn-danger btn-sm"
                          title="Delete Article"
                          style={{ padding: "0.25rem 0.5rem" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
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
const FileText = ({ size }: { size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
