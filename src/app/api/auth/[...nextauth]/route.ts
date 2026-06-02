import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

export const GET = handlers.GET as (req: NextRequest) => Promise<Response>;
export const POST = handlers.POST as (req: NextRequest) => Promise<Response>;
