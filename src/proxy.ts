import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
  const isWriterPage = nextUrl.pathname.startsWith("/dashboard/writer");
  const isAdminPage = nextUrl.pathname.startsWith("/admin");

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthPage) {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", nextUrl));
    return NextResponse.redirect(new URL("/dashboard/writer", nextUrl));
  }

  // Protect dashboard routes
  if (!isLoggedIn && (isWriterPage || isAdminPage)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Role-based access
  if (isLoggedIn && isAdminPage && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/writer", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|api/auth|api/serve|api/track|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
