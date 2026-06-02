import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, description } = parsed.data;

    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    if (!baseSlug) baseSlug = "category";

    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.category.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const category = await prisma.category.create({
      data: { name, slug, description: description || null },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("[ADMIN CATEGORY CREATE]", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing category ID" }, { status: 400 });

    // Check if category has articles
    const articleCount = await prisma.article.count({
      where: { categoryId: id },
    });

    if (articleCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category that contains articles." },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN CATEGORY DELETE]", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
export const runtime = "nodejs";
