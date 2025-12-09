import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get('auth_token')?.value
  const userRole = request.cookies.get('user_role')?.value

  // Public pages
  if (pathname === '/' || pathname === '/login' || pathname === '/unauthorized') {
    if (token && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Pas de token → login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin requis seulement pour /admin
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    console.log(`[Middleware] Refusé ${userRole} → ${pathname}`)
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
  
  // Dashboard accessible à tous les utilisateurs authentifiés
  console.log(`[Middleware] Accès autorisé ${userRole} → ${pathname}`)

  return NextResponse.next()
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}