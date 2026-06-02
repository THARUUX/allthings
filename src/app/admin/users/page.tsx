"use client";

import { useEffect, useState } from "react";
import { Check, Ban, Search } from "lucide-react";
import { getStatusColor } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  _count: { articles: number; comments: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: "", status: "" });
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    const params = new URLSearchParams();
    if (filter.role) params.set("role", filter.role);
    if (filter.status) params.set("status", filter.status);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    if (Array.isArray(data)) setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function updateStatus(userId: string, status: string) {
    setUpdating(userId);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status }),
    });
    setUpdating(null);
    load();
  }

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-content" style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage multi-author user and administrator accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-subtle)",
            }}
          />
          <input
            className="input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.25rem" }}
          />
        </div>
        <select
          className="input"
          style={{ width: "auto" }}
          value={filter.role}
          onChange={(e) => setFilter({ ...filter, role: e.target.value })}
        >
          <option value="">All Roles</option>
          <option value="USER">Writers</option>
          <option value="ADMIN">Admins</option>
        </select>
        <select
          className="input"
          style={{ width: "auto" }}
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Stories / Comments</th>
              <th>Joined</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                  <div className="spinner" style={{ margin: "0 auto" }} />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{user.email}</div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{user.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusColor(user.status)}`}>{user.status}</span>
                  </td>
                  <td style={{ color: "var(--color-text-muted)" }}>
                    {user._count.articles} / {user._count.comments}
                  </td>
                  <td style={{ color: "var(--color-text-muted)" }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                      {user.status !== "ACTIVE" && (
                        <button
                          className="btn btn-sm"
                          style={{
                            background: "rgba(34,197,94,0.1)",
                            color: "var(--color-success)",
                            border: "1px solid rgba(34,197,94,0.2)",
                            padding: "0.25rem 0.625rem",
                          }}
                          onClick={() => updateStatus(user.id, "ACTIVE")}
                          disabled={updating === user.id}
                        >
                          <Check size={13} /> Activate
                        </button>
                      )}
                      {user.status !== "SUSPENDED" && user.role !== "ADMIN" && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => updateStatus(user.id, "SUSPENDED")}
                          disabled={updating === user.id}
                        >
                          <Ban size={13} /> Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
