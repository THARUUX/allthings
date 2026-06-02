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

  const { searchParams } = req.nextUrl;
  const role = searchParams.get("role");
  const status = searchParams.get("status");

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role: role as "USER" | "ADMIN" } : {}),
      ...(status ? { status: status as "PENDING" | "ACTIVE" | "SUSPENDED" } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { articles: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId, status } = await req.json();
  if (!userId || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  return NextResponse.json(user);
}
export const runtime = "nodejs";
