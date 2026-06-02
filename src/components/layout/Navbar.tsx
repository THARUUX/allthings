"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";

interface NavbarProps {
  showEdit?: boolean;
  editUrl?: string;
  isLoggedIn?: boolean;
  userRole?: "ADMIN" | "USER";
  userName?: string;
}

export default function Navbar({ showEdit, editUrl, isLoggedIn, userRole, userName }: NavbarProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark";
    if (currentTheme) {
      setTheme(currentTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2.5rem)] max-w-[1200px] h-16 px-6 flex items-center justify-between bg-navbar-bg backdrop-blur-md border border-border rounded-[18px] shadow-navbar transition-all duration-200">
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <img
          src="/logo.svg"
          alt="ALLTHINGS Logo"
          className="w-8 h-8 rounded-lg object-contain"
        />
        <span className="font-extrabold text-[19px] tracking-tight text-text">
          ALLTHINGS
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <Link
          href="/"
          className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-200 hover:text-text hover:bg-surface-2 no-underline ${
            pathname === "/" ? "text-text" : "text-muted"
          }`}
        >
          Explore Stories
        </Link>
        <Link
          href="/dashboard/writer/new"
          className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-200 hover:text-text hover:bg-surface-2 no-underline ${
            pathname.startsWith("/dashboard") ? "text-text" : "text-muted"
          }`}
        >
          Write
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* {showEdit && editUrl && (
          <Link
            href={editUrl}
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white bg-gradient-to-r from-primary to-accent hover:opacity-90 no-underline shadow-md hover:shadow-lg transition-all duration-200 mr-2"
          >
            Edit Story
          </Link>
        )} */}

        <button
          onClick={toggleTheme}
          className="inline-flex items-center justify-center w-9 h-9 p-0 cursor-pointer rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-all duration-200 mr-1"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <Link
              href={userRole === "ADMIN" ? "/admin" : "/dashboard/writer"}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-muted hover:text-text hover:bg-surface-2 no-underline transition-all duration-200"
            >
              Dashboard
            </Link>
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center font-bold text-sm text-white"
              title={`Logged in as ${userName}`}
              style={{ cursor: "default" }}
            >
              {userName?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-semibold px-4 py-2 rounded-lg text-muted hover:text-text hover:bg-surface-2 no-underline transition-all duration-200"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center text-sm font-semibold px-4 py-2 rounded-lg text-white bg-gradient-to-r from-primary to-accent hover:opacity-90 no-underline shadow-md hover:shadow-lg transition-all duration-200"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
