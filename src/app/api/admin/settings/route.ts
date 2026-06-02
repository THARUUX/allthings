import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const settings = await req.json(); // expected: { [key: string]: string }

    if (typeof settings !== "object" || settings === null) {
      return NextResponse.json({ error: "Invalid settings format" }, { status: 400 });
    }

    const updates = Object.entries(settings).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN SETTINGS UPDATE]", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
export const runtime = "nodejs";
