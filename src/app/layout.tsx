import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_PLATFORM_URL || "https://allthings.com"),
  title: {
    default: "ALLTHINGS — Earn With Ads | Ad Network Platform",
    template: "%s | ALLTHINGS",
  },
  description:
    "ALLTHINGS is a high-performance ad network platform. Publishers earn with CPM & CPC ads. Advertisers reach millions. Join thousands of websites monetizing with ALLTHINGS.",
  keywords: [
    "ad network",
    "earn with ads",
    "adsense alternative",
    "publisher monetization",
    "advertise online",
    "CPM ads",
    "CPC ads",
    "display advertising",
    "ALLTHINGS",
  ],
  authors: [{ name: "ALLTHINGS" }],
  creator: "ALLTHINGS",
  openGraph: {
    type: "website",
    siteName: "ALLTHINGS",
    title: "ALLTHINGS — Earn With Ads | Ad Network Platform",
    description:
      "Join ALLTHINGS and start monetizing your website traffic today. Competitive CPM/CPC rates, real-time analytics, and instant payouts.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ALLTHINGS — Earn With Ads",
    description:
      "The premium ad network platform for publishers and advertisers. Earn more, reach more.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

const themeScript = `
  (function() {
    var storedTheme = localStorage.getItem('theme');
    var theme = storedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
