import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // For debugging - temporarily allow all authenticated users to access dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      // If no user is trying to access dashboard, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // TEMPORARY: Skip admin check and allow any authenticated user to access dashboard
    // This helps us debug if the issue is with the admin check
    return supabaseResponse;

    /* Original code - commented out for debugging
    // Check if user is admin
    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error checking admin status:", error);
      // If there's an error, redirect to home
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (!data) {
      // If not admin, redirect to home
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // If admin, allow access
    return supabaseResponse;
    */
  }

  // For other protected routes
  if (
    !user &&
    !request.nextUrl.pathname.includes("/login") &&
    !request.nextUrl.pathname.includes("/register") &&
    !request.nextUrl.pathname.includes("/forgot-password") &&
    !request.nextUrl.pathname.includes("/reset-password") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    request.nextUrl.pathname !== "/" &&
    !request.nextUrl.pathname.includes("/catalog") &&
    !request.nextUrl.pathname.startsWith("/product/")
  ) {
    // no user, redirect to login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
