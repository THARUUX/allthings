import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { parseMarkdownToHtml } from "@/lib/markdown";
import { ArrowLeft, Clock, BookOpen, User, Folder, Edit } from "lucide-react";
import { getSetting, getAdsterraSettings } from "@/lib/settings";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, summary: true, coverImage: true },
  });

  if (!article) return {};

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: article.coverImage ? [{ url: article.coverImage }] : [],
      type: "article",
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const session = await auth();

  // Retrieve the article
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, bio: true, id: true } },
      category: { select: { name: true, slug: true } },
      tags: { select: { name: true, slug: true } },
    },
  });

  if (!article) {
    return notFound();
  }

  // Handle Draft / Review status restriction
  if (article.status !== "PUBLISHED") {
    const canPreview =
      session?.user &&
      (session.user.role === "ADMIN" || session.user.id === article.authorId);

    if (!canPreview) {
      return notFound();
    }
  }

  // Increment views in background safely
  if (article.status === "PUBLISHED") {
    prisma.article
      .update({
        where: { id: article.id },
        data: { views: { increment: 1 } },
      })
      .catch((err) => console.error("[TRACK VIEW ERROR]", err));
  }

  // Fetch dynamic Adsterra ad codes
  const adCodes = await getAdsterraSettings();
  const platformName = await getSetting("platformName", "ALLTHINGS");

  // Format HTML body from markdown content safely
  const htmlContent = parseMarkdownToHtml(article.content);

  // Generate structured JSON-LD schema markup
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.summary,
    image: article.coverImage || "",
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: article.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: platformName,
      logo: {
        "@type": "ImageObject",
        url: `https://allthings.com/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://allthings.com/posts/${article.slug}`,
    },
  };

  return (
    <>
      {/* Inject Popunder and Social Bar ad scripts from Adsterra */}
      {adCodes.adsterra_popunder && (
        <div dangerouslySetInnerHTML={{ __html: adCodes.adsterra_popunder }} />
      )}
      {adCodes.adsterra_social_bar && (
        <div dangerouslySetInnerHTML={{ __html: adCodes.adsterra_social_bar }} />
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar
        showEdit={session?.user?.id === article.authorId}
        editUrl={`/dashboard/writer/articles/edit/${article.id}`}
        isLoggedIn={!!session?.user}
        userRole={session?.user?.role as "ADMIN" | "USER"}
        userName={session?.user?.name || ""}
      />

      <main className="min-h-screen bg-bg px-4 sm:px-8 pt-[76px] sm:pt-[92px] pb-20">
        <div className="max-w-[1100px] mx-auto">
          
          {/* Back button */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted hover:text-text no-underline text-sm transition-colors duration-200"
            >
              <ArrowLeft size={16} /> Back to stories
            </Link>
          </div>

          {/* Top Leaderboard Adsterra Banner */}
          {adCodes.adsterra_banner_728x90 && (
            <div
              className="w-full flex justify-center mb-10 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: adCodes.adsterra_banner_728x90 }}
            />
          )}

          {/* Article Header info */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none bg-primary/15 text-primary-light no-underline">
                {article.category.name}
              </span>
              <span className="text-xs text-subtle">
                {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight mb-5 text-text">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted border-b border-border pb-6">
              <div className="flex items-center gap-1.5">
                <User size={15} className="text-primary-light" />
                <span>Written by <strong className="text-text font-semibold">{article.author.name}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={15} />
                <span>{article.readTime} min read</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen size={15} />
                <span>{article.views.toLocaleString()} reads</span>
              </div>

              {session?.user?.id === article.authorId && (
                <Link
                  href={`/dashboard/writer/articles/edit/${article.id}`}
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-gradient-to-r from-primary to-accent hover:opacity-90 no-underline shadow-sm transition-all duration-200"
                >
                  <Edit size={13} /> Edit Story
                </Link>
              )}
            </div>
          </header>

          {/* Article Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14 items-start">
            
            {/* Left Content Area */}
            <div>
              {/* Optional Cover Image */}
              {article.coverImage && (
                <div className="mb-8 rounded-2xl overflow-hidden border border-border">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-auto max-h-[440px] object-cover block"
                  />
                </div>
              )}

              {/* Rendered HTML content */}
              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />

              {/* Tags Section */}
              {article.tags.length > 0 && (
                <div className="mt-12 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag.slug}
                      className="px-3 py-1 rounded-full bg-surface-2 border border-border text-xs text-muted font-medium"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="h-[1px] bg-border my-10" />

              {/* Native ads under article content */}
              {adCodes.adsterra_native_ad && (
                <div className="mt-8 overflow-hidden">
                  <h4 className="text-xs uppercase text-subtle tracking-wider mb-3 font-bold">
                    Sponsored Stories
                  </h4>
                  <div dangerouslySetInnerHTML={{ __html: adCodes.adsterra_native_ad }} />
                </div>
              )}

              {/* Writer Profile card */}
              <div className="mt-12 flex gap-5 p-6 bg-surface border border-border rounded-xl">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center font-bold text-xl text-white shrink-0">
                  {article.author.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold mb-1 text-text">{article.author.name}</h4>
                  <p className="text-sm text-muted leading-relaxed">
                    {article.author.bio || "Author on ALLTHINGS publishing stories on tech, finance, and marketing."}
                  </p>
                </div>
              </div>

            </div>

            {/* Right Sidebar Area (Banner Adsterra 300x250) */}
            <aside className="sticky top-24 flex flex-col gap-8">
              {adCodes.adsterra_banner_300x250 && (
                <div>
                  <h4 className="text-xs uppercase text-subtle tracking-wider mb-3 text-center font-bold">
                    Advertisement
                  </h4>
                  <div
                    className="w-[300px] h-[250px] bg-surface border border-border flex items-center justify-center rounded-lg overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: adCodes.adsterra_banner_300x250 }}
                  />
                </div>
              )}

              <div className="p-5 bg-surface border border-border rounded-xl">
                <h4 className="text-sm font-bold mb-2 text-text">Read next topic</h4>
                <Link
                  href={`/?category=${article.category.slug}`}
                  className="text-xs text-primary-light hover:text-primary no-underline flex items-center gap-1 transition-colors duration-200"
                >
                  More in {article.category.name} &rarr;
                </Link>
              </div>
            </aside>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
