import { prisma } from "@/lib/prisma";
import ArticleForm from "../components/ArticleForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch all categories for the dropdown selector
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <ArticleForm categories={categories} />;
}
export const metadata = {
  title: "Write New Article",
};
