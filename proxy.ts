import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { isProtectedPath } from "@/lib/auth/security";

function createNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function createContentSecurityPolicy(nonce: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";
  const supabaseRealtimeOrigin = supabaseOrigin ? supabaseOrigin.replace("https://", "wss://") : "";

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'wasm-unsafe-eval'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    [
      "connect-src 'self'",
      supabaseOrigin,
      supabaseRealtimeOrigin,
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://*.revenuecat.com",
      "https://*.rev.cat",
      "https://oauth2.googleapis.com",
      "https://openidconnect.googleapis.com",
      "https://www.googleapis.com",
    ].filter(Boolean).join(" "),
    "worker-src 'self' blob:",
    "frame-src 'self' https://*.revenuecat.com https://*.rev.cat",
    "manifest-src 'self'",
  ].join("; ");
}

function setSecurityHeaders(response: NextResponse, nonce: string) {
  response.headers.set("Content-Security-Policy", createContentSecurityPolicy(nonce));
  response.headers.set("x-nonce", nonce);
  return response;
}

export async function proxy(request: NextRequest) {
  const nonce = createNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  setSecurityHeaders(response, nonce);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !isProtectedPath(request.nextUrl.pathname)) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        setSecurityHeaders(response, nonce);
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        setSecurityHeaders(response, nonce);
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return setSecurityHeaders(NextResponse.redirect(loginUrl), nonce);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/auth/:path*",
    "/oauth/:path*",
    "/plus",
    "/privacy",
    "/terms",
    "/faq",
    "/dashboard/:path*",
    "/expenses/:path*",
    "/maintenance/:path*",
    "/appliances/:path*",
    "/vendors/:path*",
    "/projects/:path*",
    "/vehicles/:path*",
    "/scanner/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
