"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  PenTool,
  Users,
  CheckSquare,
  Settings,
  LogOut,
  FolderOpen,
} from "lucide-react";
import { Role } from "@/types";

interface SidebarProps {
  role: Role;
  userName: string;
  userEmail: string;
}

const writerLinks = [
  { href: "/dashboard/writer", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/writer/new", label: "Write Article", icon: PenTool },
  { href: "/dashboard/writer/articles", label: "My Articles", icon: FileText },
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/articles", label: "Review Queue", icon: CheckSquare },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  const renderNavSection = (title: string, items: typeof writerLinks) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "1.25rem" }}>
        <span className="sidebar-section-title" style={{ display: "block", marginBottom: "0.5rem" }}>
          {title}
        </span>
        {items.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/admin" && href !== "/dashboard/writer" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="sidebar">
      <Link href="/" className="sidebar-logo" style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
        <img
          src="/logo.svg"
          alt="ALLTHINGS Logo"
          style={{ width: 28, height: 28, borderRadius: "6px", objectFit: "contain" }}
        />
        <span className="sidebar-logo-text">ALLTHINGS</span>
      </Link>

      <nav className="sidebar-nav" style={{ gap: 0, overflowY: "auto" }}>
        {role === "ADMIN" && renderNavSection("Admin Panel", adminLinks)}
        {renderNavSection("Writer Console", writerLinks)}
      </nav>

      <div className="sidebar-footer">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0.625rem 0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userName}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userEmail}
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="sidebar-link"
          style={{ width: "100%", border: "none", background: "none", cursor: "pointer" }}
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
