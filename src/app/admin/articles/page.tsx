import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import EditorialQueue from "./EditorialQueue";

export const dynamic = "force-dynamic";

export default async function AdminEditorialPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  // Fetch articles
  const dbArticles = await prisma.article.findMany({
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize to prevent SSR issues
  const articles = dbArticles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    summary: a.summary,
    content: a.content,
    coverImage: a.coverImage,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
    author: { name: a.author.name, email: a.author.email },
    category: { name: a.category.name },
  }));

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Editorial Queue</h1>
          <p className="page-subtitle">Review, approve or reject articles submitted by authors.</p>
        </div>
      </div>

      <EditorialQueue initialArticles={articles} />
    </div>
  );
}

export const metadata = {
  title: "Review Queue",
};
