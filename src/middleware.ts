import { type NextRequest, NextResponse } from 'next/server';

// Auth-based middleware redirect logic will be implemented here.
// Currently a no-op — auth guarding is handled client-side in layout.tsx.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
