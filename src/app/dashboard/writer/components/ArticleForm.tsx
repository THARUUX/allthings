"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface ArticleFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    title: string;
    summary: string;
    content: string;
    coverImage?: string | null;
    categoryId: string;
    tags?: { name: string }[];
  };
}

export default function ArticleForm({ categories, initialData }: ArticleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    title: initialData?.title || "",
    summary: initialData?.summary || "",
    content: initialData?.content || "",
    coverImage: initialData?.coverImage || "",
    categoryId: initialData?.categoryId || (categories[0]?.id || ""),
    tagsString: initialData?.tags?.map((t) => t.name).join(", ") || "",
  });

  const [readTime, setReadTime] = useState(1);

  // Compute reading time dynamically
  useEffect(() => {
    const wordsCount = form.content.trim().split(/\s+/).filter(Boolean).length;
    const time = Math.max(1, Math.ceil(wordsCount / 200));
    setReadTime(time);
  }, [form.content]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const tagNames = form.tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const payload = {
      title: form.title,
      summary: form.summary,
      content: form.content,
      coverImage: form.coverImage,
      categoryId: form.categoryId,
      tagNames,
    };

    try {
      const url = initialData
        ? `/api/writer/articles/${initialData.id}`
        : "/api/writer/articles";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Failed to save article");
      } else {
        router.push("/dashboard/writer/articles");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/dashboard/writer/articles"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--color-text-muted)",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          <ArrowLeft size={16} /> Back to My Articles
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">
            {initialData ? "Edit Article" : "Write a New Story"}
          </h1>
          <p className="page-subtitle">
            Create high-quality, engaging content.
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "var(--radius)",
            padding: "1rem",
            color: "var(--color-danger)",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="form-group">
            <label className="label">Article Title</label>
            <input
              type="text"
              className="input"
              style={{ fontSize: "1.125rem", fontWeight: 600 }}
              placeholder="Enter a catchy title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Short Summary (SEO Meta Description)</label>
            <textarea
              className="input"
              rows={2}
              style={{ resize: "vertical" }}
              placeholder="Write a brief, engaging summary of your article for Google search..."
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="label">Category</label>
              <select
                className="input"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Tags (comma separated)</label>
              <input
                type="text"
                className="input"
                placeholder="seo, writing, technology"
                value={form.tagsString}
                onChange={(e) => setForm({ ...form, tagsString: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Cover Image URL</label>
            <div style={{ position: "relative" }}>
              <input
                type="url"
                className="input"
                style={{ paddingLeft: "2.5rem" }}
                placeholder="https://images.unsplash.com/photo-..."
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              />
              <ImageIcon
                size={16}
                color="var(--color-text-subtle)"
                style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="label" style={{ marginBottom: 0 }}>Article Body (Markdown Supported)</label>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Sparkles size={12} /> Est. read time: {readTime} min
            </span>
          </div>

          <textarea
            className="input"
            rows={15}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9375rem",
              lineHeight: 1.6,
              resize: "vertical",
            }}
            placeholder="Tell your story. Markdown headers (##), bold (**text**), lists (- item) are supported..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <Link href="/dashboard/writer/articles" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ padding: "0.75rem 2rem" }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16 }} />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Submit for Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
