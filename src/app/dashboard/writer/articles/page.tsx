import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PenTool } from "lucide-react";
import ArticlesTable from "./ArticlesTable";

export const dynamic = "force-dynamic";

export default async function WriterArticlesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch writer articles
  const dbArticles = await prisma.article.findMany({
    where: { authorId: session.user.id },
    include: {
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize to JSON-compatible types to prevent Next.js SSR complaints about Date objects
  const articles = dbArticles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    summary: a.summary,
    coverImage: a.coverImage,
    status: a.status,
    views: a.views,
    rejectReason: a.rejectReason,
    createdAt: a.createdAt.toISOString(),
    category: { name: a.category.name },
  }));

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Stories</h1>
          <p className="page-subtitle">Manage, edit, and track statuses of all your published and draft stories.</p>
        </div>
        <Link href="/dashboard/writer/new" className="btn btn-primary">
          <PenTool size={16} /> Write Article
        </Link>
      </div>

      <ArticlesTable initialArticles={articles} />
    </div>
  );
}

export const metadata = {
  title: "My Articles",
};
