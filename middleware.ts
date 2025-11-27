import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isLoginPage = pathname === "/login"
  const isPublicPage = pathname === "/" || isLoginPage
  const isUnauthorizedPage = pathname === "/unauthorized"

  // Update Supabase session
  const supabaseResponse = await updateSession(request)

  // Check if user is authenticated via cookie
  const token = request.cookies.get("auth_token")?.value

  // Si l'utilisateur est connecté et essaie d'accéder à /login, rediriger vers /dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une page protégée
  if (!token && !isPublicPage && !isUnauthorizedPage) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si l'utilisateur est connecté, vérifier les permissions pour les pages protégées
  if (token && !isPublicPage && !isUnauthorizedPage && pathname.startsWith("/dashboard")) {
    // Get user role from cookie (should be set during login)
    const userRole = request.cookies.get("user_role")?.value

    if (userRole) {
      // Import permission check dynamically to avoid build issues
      const { canAccessPage } = await import("@/lib/permissions")

      if (!canAccessPage(userRole, pathname)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
