import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { articleSchema } from "@/lib/validations";

async function checkAuthor(articleId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const article = await prisma.article.findUnique({
    where: { id: articleId },
  });

  if (!article || article.authorId !== session.user.id) return null;
  return { session, article };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authContext = await checkAuthor(id);
  if (!authContext) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        tags: { select: { name: true } },
      },
    });
    return NextResponse.json(article);
  } catch (error) {
    console.error("[ARTICLE DETAIL GET]", error);
    return NextResponse.json({ error: "Failed to fetch article details" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authContext = await checkAuthor(id);
  if (!authContext) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = articleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { title, summary, content, coverImage, categoryId, tagNames } = parsed.data;

    // Recalculate reading time
    const wordsCount = content.trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordsCount / 200));

    // Handle tag connections
    const tagConnectOrCreate = tagNames?.map((name) => {
      const tagSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return {
        where: { slug: tagSlug },
        create: { name, slug: tagSlug },
      };
    }) || [];

    // Reset tags - first disconnect all existing tags
    await prisma.article.update({
      where: { id },
      data: {
        tags: {
          set: [],
        },
      },
    });

    const updated = await prisma.article.update({
      where: { id },
      data: {
        title,
        summary,
        content,
        coverImage: coverImage || null,
        categoryId,
        readTime,
        status: "PENDING_REVIEW", // Mark for re-review on update
        tags: {
          connectOrCreate: tagConnectOrCreate,
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[ARTICLE UPDATE]", error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authContext = await checkAuthor(id);
  if (!authContext) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.article.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ARTICLE DELETE]", error);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
export const runtime = "nodejs";
