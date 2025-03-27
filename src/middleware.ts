import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  response.headers.set('x-pathname', request.nextUrl.pathname);

  const searchParam = request.nextUrl.searchParams;

  const category = searchParam.get('category');
  const page = searchParam.get('page');
  const minPrice = searchParam.get('minPrice');
  const maxPrice = searchParam.get('maxPrice');
  const availability = searchParam.get('availability');

  if (category) {
    response.headers.set('x-category', category);
  }
  if (page) {
    response.headers.set('x-page', page);
  }
  if (minPrice) {
    response.headers.set('x-minPrice', minPrice);
  }
  if (maxPrice) {
    response.headers.set('x-maxPrice', maxPrice);
  }
  if (availability) {
    response.headers.set('x-availability', availability);
  }
  return response;
}

export const config = {
  matcher: [
    // Also check session for other routes, but exclude static assets AND webhook
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|login|register|auth|api/webhook).*)',
  ],
};
