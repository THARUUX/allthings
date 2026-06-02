import Link from "next/link";

const footerLinks = {
  Platform: [
    { label: "Explore Stories", href: "/" },
    { label: "Publish Article", href: "/dashboard/writer/new" },
    { label: "Register as Writer", href: "/register" },
  ],
  Resources: [
    { label: "Write Guide", href: "/how-it-works" },
    { label: "Platform Overview", href: "/" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        padding: "4rem 2rem 2rem",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 md:gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="navbar-logo" style={{ marginBottom: "1rem", display: "inline-flex", alignItems: "center", gap: "0.625rem" }}>
              <img
                src="/logo.svg"
                alt="ALLTHINGS Logo"
                style={{ width: 28, height: 28, borderRadius: "6px", objectFit: "contain" }}
              />
              <span className="navbar-logo-text">ALLTHINGS</span>
            </Link>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.7, marginTop: "0.75rem" }}>
              A multi-author publishing platform for sharing stories, guides, and insights.
              Publish content, build readership, and monetize.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              <span className="badge badge-success">● Active</span>
              <span className="badge badge-neutral">SEO Optimized</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-text-subtle)",
                  marginBottom: "1rem",
                }}
              >
                {section}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="footer-link"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left"
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "1.5rem",
          }}
        >
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-subtle)" }}>
            © {new Date().getFullYear()} ALLTHINGS. All rights reserved.
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-subtle)" }}>
            Monetized with Adsterra integrations
          </p>
        </div>
      </div>
    </footer>
  );
}
