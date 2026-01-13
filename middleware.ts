import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APEX_HUB_TOKEN } from '@/lib/constants';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(APEX_HUB_TOKEN)?.value;
  const path = request.nextUrl.pathname;

  // Protect Dashboard or Profile routes
  if (!token && (path.startsWith('/profile') || path.startsWith('/settings'))) {
      return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/settings/:path*'],
};