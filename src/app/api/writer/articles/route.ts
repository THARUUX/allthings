import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { articleSchema } from "@/lib/validations";

async function checkWriter() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

export async function GET() {
  const session = await checkWriter();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const articles = await prisma.article.findMany({
      where: { authorId: session.user.id },
      include: {
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(articles);
  } catch (error) {
    console.error("[WRITER ARTICLES GET]", error);
    return NextResponse.json({ error: "Failed to load articles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await checkWriter();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = articleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { title, summary, content, coverImage, categoryId, tagNames } = parsed.data;

    // Generate unique slug
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    if (!baseSlug) baseSlug = "article";
    
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.article.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Calculate reading time
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

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        summary,
        content,
        coverImage: coverImage || null,
        categoryId,
        authorId: session.user.id,
        readTime,
        status: "PENDING_REVIEW", // Submit for review directly
        tags: {
          connectOrCreate: tagConnectOrCreate,
        },
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("[WRITER ARTICLE CREATE]", error);
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
export const runtime = "nodejs";
