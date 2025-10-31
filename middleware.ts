import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isProtectedPage = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/farm') ||
    pathname.startsWith('/wallet') ||
    pathname.startsWith('/friends') ||
    pathname.startsWith('/caro')

  // Nếu đã login và truy cập trang login/register, redirect về dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Nếu chưa login và truy cập trang protected, redirect về login
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
