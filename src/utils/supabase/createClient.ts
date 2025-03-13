import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server';

export async function createClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string): string | undefined {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions): void {
          try {
            // Set cookie in request
            request.cookies.set({ name, value });

            // Set cookie in response
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie errors in development
            console.warn('Error setting cookie:', error);
          }
        },
        remove(name: string): void {
          try {
            // Remove cookie from request
            request.cookies.delete(name);

            // Remove cookie from response
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.delete(name);
          } catch (error) {
            // Handle cookie errors in development
            console.warn('Error removing cookie:', error);
          }
        },
      },
    }
  );

  return { supabase, response };
}
