"use client";

import { useState } from "react";
import { Check, X, Search, FileText, AlertCircle, CheckCircle2, MessageCircle } from "lucide-react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage?: string | null;
  status: string;
  createdAt: string;
  author: { name: string; email: string };
  category: { name: string };
}

interface EditorialQueueProps {
  initialArticles: Article[];
}

export default function EditorialQueue({ initialArticles }: EditorialQueueProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING_REVIEW");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleApprove(id: string) {
    if (!confirm("Are you sure you want to approve this article and make it live?")) return;
    setUpdatingId(id);
    
    try {
      const res = await fetch("/api/admin/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: id, status: "PUBLISHED" }),
      });

      if (res.ok) {
        setArticles(
          articles.map((a) => (a.id === id ? { ...a, status: "PUBLISHED" } : a))
        );
      } else {
        alert("Failed to approve article");
      }
    } catch (err) {
      console.error(err);
      alert("Error approving article");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (!showRejectModal) return;
    setUpdatingId(showRejectModal);

    try {
      const res = await fetch("/api/admin/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: showRejectModal,
          status: "REJECTED",
          rejectReason,
        }),
      });

      if (res.ok) {
        setArticles(
          articles.map((a) =>
            a.id === showRejectModal
              ? { ...a, status: "REJECTED", rejectReason }
              : a
          )
        );
        setShowRejectModal(null);
        setRejectReason("");
      } else {
        alert("Failed to reject article");
      }
    } catch (err) {
      console.error(err);
      alert("Error rejecting article");
    } finally {
      setUpdatingId(null);
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
            placeholder="Search by title or writer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <select
            className="input"
            style={{ width: 180 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="PENDING_REVIEW">Needs Review</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
            <option value="ALL">All Articles</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={24} />
            </div>
            <p className="empty-state-title">No articles in queue</p>
            <p className="empty-state-desc">Excellent! The editorial queue is completely clear.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Category</th>
                  <th>Writer</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ maxWidth: 350 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{a.title}</div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--color-text-muted)",
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
                      <div style={{ fontWeight: 500 }}>{a.author.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>{a.author.email}</div>
                    </td>
                    <td>
                      {a.status === "PUBLISHED" && <span className="badge badge-success">Published</span>}
                      {a.status === "PENDING_REVIEW" && <span className="badge badge-warning">Needs Review</span>}
                      {a.status === "DRAFT" && <span className="badge badge-neutral">Draft</span>}
                      {a.status === "REJECTED" && <span className="badge badge-danger">Rejected</span>}
                    </td>
                    <td style={{ color: "var(--color-text-subtle)", fontSize: "0.8125rem" }}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                        {a.status === "PENDING_REVIEW" && (
                          <>
                            <button
                              disabled={updatingId === a.id}
                              onClick={() => handleApprove(a.id)}
                              className="btn btn-sm"
                              style={{
                                background: "rgba(34,197,94,0.1)",
                                color: "var(--color-success)",
                                border: "1px solid rgba(34,197,94,0.2)",
                                padding: "0.25rem 0.625rem",
                              }}
                              title="Approve & Publish"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              disabled={updatingId === a.id}
                              onClick={() => setShowRejectModal(a.id)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: "0.25rem 0.625rem" }}
                              title="Reject"
                            >
                              <X size={14} /> Reject
                            </button>
                          </>
                        )}
                        <Link
                          href={`/posts/${a.slug}`}
                          target="_blank"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "0.25rem 0.5rem" }}
                        >
                          Read Draft
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "1rem",
          }}
        >
          <div className="card" style={{ width: "100%", maxWidth: 440, padding: "1.75rem", animation: "slideUp 0.25s ease" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>Reject Article</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
              Provide a constructive feedback message so the writer can improve and resubmit their story.
            </p>

            <form onSubmit={handleReject}>
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="label">Rejection Reason</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="e.g. Please format your headings correctly and add more detail on the final section."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectReason("");
                  }}
                  className="btn btn-secondary"
                  disabled={updatingId !== null}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: "var(--color-danger)" }}
                  disabled={updatingId !== null}
                >
                  Submit Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
