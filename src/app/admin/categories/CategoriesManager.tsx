"use client";

import { useState } from "react";
import { Plus, Trash2, FolderOpen, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count: { articles: number };
}

interface CategoriesManagerProps {
  initialCategories: Category[];
}

export default function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Failed to create category");
      } else {
        setCategories([...categories, { ...data, _count: { articles: 0 } }]);
        setName("");
        setDescription("");
        setSuccess(`Category "${data.name}" created successfully!`);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  async function handleDelete(id: string, catName: string) {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete category");
      } else {
        setCategories(categories.filter((c) => c.id !== id));
        setSuccess(`Category "${catName}" deleted.`);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete category");
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "2rem", alignItems: "start", animation: "fadeIn 0.3s ease" }}>
      {/* Create Category */}
      <div className="card">
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={18} /> Add New Topic
        </h2>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--color-danger)", padding: "0.75rem 1rem", borderRadius: "var(--radius)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "var(--color-success)", padding: "0.75rem 1rem", borderRadius: "var(--radius)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="label">Category Name</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. SEO & Marketing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Provide a short description of topics discussed in this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Creating..." : "Create Category"}
          </button>
        </form>
      </div>

      {/* Category List */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FolderOpen size={18} /> Active Topics ({categories.length})
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={24} color="var(--color-text-subtle)" />
            <p className="empty-state-title">No categories created</p>
            <p className="empty-state-desc">Create your first category topic on the left form.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name & Slug</th>
                  <th>Description</th>
                  <th style={{ textAlign: "center" }}>Articles</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>slug: {c.slug}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.description || "No description provided."}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>{c._count.articles}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={c._count.articles > 0}
                        onClick={() => handleDelete(c.id, c.name)}
                        title={c._count.articles > 0 ? "Cannot delete category containing articles" : "Delete category"}
                        style={{ opacity: c._count.articles > 0 ? 0.35 : 1, padding: "0.25rem 0.5rem" }}
                      >
                        <Trash2 size={14} />
                      </button>
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
