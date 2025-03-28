import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  return response;
}

export const config = {
  matcher: [
    // Also check session for other routes, but exclude static assets AND webhook
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|login|register|auth|api/webhook|api/translations).*)',
  ],
};
