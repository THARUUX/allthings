import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");

    const articles = await prisma.article.findMany({
      where: status ? { status: status as any } : {},
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("[ADMIN ARTICLES GET]", error);
    return NextResponse.json({ error: "Failed to load articles" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { articleId, status, rejectReason } = await req.json();
    if (!articleId || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: {
        status,
        rejectReason: status === "REJECTED" ? rejectReason : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[ADMIN ARTICLE PATCH]", error);
    return NextResponse.json({ error: "Failed to update article status" }, { status: 500 });
  }
}
export const runtime = "nodejs";
