import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicRoutes = [
    "/",
    "/explorar",
    "/login",
    "/registo",
    "/sobre",
    "/contactos",
    "/termos",
    "/privacidade",
  ];

  const isPublic =
    publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/imovel/") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".");

  // Sessão NextAuth (cookie)
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  const authRoutes = ["/login", "/registo"];
  if (isLoggedIn && authRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isPublic && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
