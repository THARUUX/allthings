import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CategoriesManager from "./CategoriesManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  // Fetch categories with counts
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories & Topics</h1>
          <p className="page-subtitle">Add or remove platform content topics to categorize articles.</p>
        </div>
      </div>

      <CategoriesManager initialCategories={categories} />
    </div>
  );
}

export const metadata = {
  title: "Topic Categories",
};
