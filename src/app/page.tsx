import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Search, Flame, Clock, BookOpen, ChevronRight, PenTool } from "lucide-react";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const name = await getSetting("platformName", "ALLTHINGS");
  const desc = await getSetting("platformDescription", "Discover insights, stories, and expertise from writers around the world.");
  return {
    title: `${name} — Read Trending Stories & Articles`,
    description: desc,
    alternates: { canonical: "/" },
  };
}

export default async function HomePage({ searchParams }: HomeProps) {
  const session = await auth();
  const queryParams = await searchParams;
  const q = queryParams.q || "";
  const catSlug = queryParams.category || "";

  const platformName = await getSetting("platformName", "ALLTHINGS");
  const bannerAdScript = await getSetting("adsterra_banner_728x90", "");

  // Fetch all categories for filter list
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // Fetch trending articles (top views)
  const trendingArticles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { views: "desc" },
    take: 3,
  });

  // Build query where clause
  const whereClause: any = {
    status: "PUBLISHED",
  };

  if (q) {
    whereClause.OR = [
      { title: { contains: q } },
      { summary: { contains: q } },
      { content: { contains: q } },
    ];
  }

  if (catSlug) {
    whereClause.category = { slug: catSlug };
  }

  // Fetch filtered articles
  const articles = await prisma.article.findMany({
    where: whereClause,
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Navbar
        isLoggedIn={!!session?.user}
        userRole={session?.user?.role as "ADMIN" | "USER"}
        userName={session?.user?.name || ""}
      />

      <main className="min-h-screen bg-bg pb-20 pt-[76px] sm:pt-[92px]">
        {/* Top Banner Ad Container */}
        {bannerAdScript && (
          <div 
            className="w-full flex justify-center py-4 pb-8 bg-bg"
            dangerouslySetInnerHTML={{ __html: bannerAdScript }}
          />
        )}

        {/* Hero Area */}
        <section className="relative pt-10 sm:pt-16 px-4 sm:px-8 pb-14 sm:pb-20 overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="max-w-[1200px] mx-auto relative">
            <h1 className="text-[clamp(1.75rem,5vw,3.5rem)] font-extrabold tracking-tight leading-[1.1] mb-4">
              Explore <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Unlimited Knowledge</span>
            </h1>
            <p className="text-muted text-base sm:text-lg leading-relaxed max-w-[580px] mb-8 sm:mb-10">
              Read standard stories, tutorials, and insights across technology, marketing, design, and passive income.
            </p>

            {/* Search Box */}
            <form action="/" method="GET" className="max-w-[580px] flex flex-col sm:flex-row gap-2 relative">
              {catSlug && <input type="hidden" name="category" value={catSlug} />}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  className="w-full pl-11 pr-4 h-12 bg-surface border border-border rounded-full text-base text-text placeholder-subtle outline-none focus:border-primary transition-all duration-200"
                  placeholder="Search topic or article..."
                />
              </div>
              <button type="submit" className="h-12 px-7 rounded-full text-white bg-gradient-to-r from-primary to-accent hover:opacity-90 font-semibold cursor-pointer shadow-md hover:shadow-lg transition-all duration-200">
                Search
              </button>
            </form>
          </div>
        </section>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          {/* Trending Section (only show when not searching) */}
          {!q && !catSlug && trendingArticles.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center gap-2 mb-6">
                <Flame size={20} className="text-danger" />
                <h2 className="text-xl font-extrabold text-text">Trending Stories</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingArticles.map((article) => (
                  <div key={article.id} className="flex flex-col justify-between h-full p-6 bg-surface border border-border rounded-xl hover:border-border-hover hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.4)] shadow-[0_4px_20px_-2px_rgba(99,102,241,0.1)] transition-all duration-200">
                    <div>
                      <Link href={`/?category=${article.category.slug}`} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none bg-primary/15 text-primary-light no-underline mb-4">
                        {article.category.name}
                      </Link>
                      <h3 className="text-lg font-bold leading-snug mb-2">
                        <Link href={`/posts/${article.slug}`} className="text-text hover:text-primary no-underline transition-all duration-200">
                          {article.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted leading-relaxed mb-5">
                        {article.summary}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-xs text-subtle border-t border-border pt-4">
                      <span>By {article.author.name}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {article.readTime} min read
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Mobile: horizontal scrollable category pills */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none mb-8">
            <Link
              href={q ? `/?q=${q}` : "/"}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 no-underline ${
                !catSlug ? "text-white bg-gradient-to-r from-primary to-accent" : "text-muted bg-surface-2 hover:bg-surface-3"
              }`}
            >
              All Topics
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={q ? `/?category=${cat.slug}&q=${q}` : `/?category=${cat.slug}`}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 no-underline ${
                  catSlug === cat.slug ? "text-white bg-gradient-to-r from-primary to-accent" : "text-muted bg-surface-2 hover:bg-surface-3"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Desktop: sidebar + articles grid */}
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 md:gap-12 items-start">

            {/* Sidebar Topics — desktop only */}
            <aside className="hidden md:block sticky top-28">
              <h2 className="text-xs font-extrabold uppercase text-subtle tracking-wider mb-4">
                Topics
              </h2>
              
              <ul className="list-none flex flex-col gap-2 p-0">
                <li>
                  <Link
                    href={q ? `/?q=${q}` : "/"}
                    className={`flex justify-between items-center px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 no-underline ${
                      !catSlug 
                        ? "font-bold text-primary-light bg-primary/10" 
                        : "font-medium text-muted hover:text-text hover:bg-surface-2"
                    }`}
                  >
                    All Topics
                  </Link>
                </li>
                {categories.map((cat) => {
                  const isActive = catSlug === cat.slug;
                  return (
                    <li key={cat.id}>
                      <Link
                        href={q ? `/?category=${cat.slug}&q=${q}` : `/?category=${cat.slug}`}
                        className={`flex justify-between items-center px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 no-underline ${
                          isActive 
                            ? "font-bold text-primary-light bg-primary/10" 
                            : "font-medium text-muted hover:text-text hover:bg-surface-2"
                        }`}
                      >
                        {cat.name}
                        <ChevronRight size={14} className={isActive ? "text-primary-light opacity-100" : "opacity-40"} />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="h-[1px] bg-border my-8" />
              
              <div className="text-center p-5 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                <h4 className="text-sm font-bold mb-1.5">Are you a writer?</h4>
                <p className="text-xs text-muted mb-4">Publish and get your stories read globally.</p>
                <Link href="/register" className="inline-flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg text-white bg-gradient-to-r from-primary to-accent hover:opacity-90 no-underline shadow-sm w-full transition-all duration-200">
                  <PenTool size={13} /> Write stories
                </Link>
              </div>
            </aside>

            {/* Articles List */}
            <section>
              <div className="flex justify-between items-baseline mb-6">
                <h2 className="text-xl font-extrabold text-text">
                  {catSlug ? categories.find(c => c.slug === catSlug)?.name : "Latest Articles"}
                </h2>
                <span className="text-[13px] text-subtle font-medium">
                  Showing {articles.length} posts
                </span>
              </div>

              {articles.length === 0 ? (
                <div className="flex flex-col items-center text-center p-16 bg-surface border border-border rounded-xl">
                  <p className="text-lg font-bold text-text mb-1">No articles found</p>
                  <p className="text-sm text-muted mb-4">We couldn&apos;t find any published articles matching your criteria.</p>
                  <Link href="/" className="inline-flex items-center justify-center text-xs font-semibold px-4 py-2 rounded-lg bg-surface-2 border border-border text-muted hover:text-text hover:border-border-hover no-underline transition-all duration-200">
                    Clear Filters
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {articles.map((article) => (
                    <article key={article.id} className="p-5 sm:p-6 bg-surface border border-border rounded-xl hover:border-border-hover hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.4)] transition-all duration-200">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <Link href={`/?category=${article.category.slug}`} className="no-underline">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none bg-surface-2 text-muted hover:bg-surface-3 transition-colors duration-200">
                              {article.category.name}
                            </span>
                          </Link>
                          <span className="text-xs text-subtle">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold leading-snug mb-2">
                          <Link href={`/posts/${article.slug}`} className="text-text hover:text-primary no-underline transition-all duration-200">
                            {article.title}
                          </Link>
                        </h3>

                        <p className="text-[15px] text-muted leading-relaxed mb-5">
                          {article.summary}
                        </p>

                        <div className="flex justify-between items-center text-[13px] text-subtle">
                          <span>By <strong className="text-muted font-semibold">{article.author.name}</strong></span>
                          <span className="flex items-center gap-1">
                            <BookOpen size={13} /> {article.readTime} min read
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
