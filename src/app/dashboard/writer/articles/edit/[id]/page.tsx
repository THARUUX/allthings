import { prisma } from "@/lib/prisma";
import ArticleForm from "../../../components/ArticleForm";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

interface EditArticleProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: EditArticleProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch the article details, ensuring author is the current user
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      tags: { select: { name: true } },
    },
  });

  if (!article || article.authorId !== session.user.id) {
    return notFound();
  }

  // Fetch all categories for selection
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <ArticleForm
      categories={categories}
      initialData={{
        id: article.id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        coverImage: article.coverImage,
        categoryId: article.categoryId,
        tags: article.tags,
      }}
    />
  );
}

export const metadata = {
  title: "Edit Article",
};
