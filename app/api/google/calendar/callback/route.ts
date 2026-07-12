import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { exchangeGoogleCodeForTokens, fetchGoogleUserEmail, getGoogleTokenExpiry } from "@/lib/google/calendar";

const stateCookieName = "domivault_google_calendar_state";

function settingsRedirect(status: string, message?: string) {
  const url = new URL("/settings", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  url.searchParams.set("calendar", status);
  if (message) url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const oauthError = requestUrl.searchParams.get("error");

  if (oauthError) return settingsRedirect("error", oauthError);
  if (!code || !state) return settingsRedirect("error", "Google Calendar did not return an authorization code.");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(stateCookieName)?.value;
  cookieStore.set(stateCookieName, "", { path: "/", maxAge: 0 });

  if (!expectedState || expectedState !== state) {
    return settingsRedirect("error", "Google Calendar connection expired. Try connecting again.");
  }

  const supabase = await createClient();

  if (!supabase) return settingsRedirect("error", "Auth is not configured.");

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return settingsRedirect("error", "Login again before connecting Google Calendar.");
  }

  const admin = createAdminClient();
  if (!admin) return settingsRedirect("error", "Server token storage is not configured.");

  try {
    const tokens = await exchangeGoogleCodeForTokens(code);
    const googleEmail = await fetchGoogleUserEmail(tokens.access_token as string);
    const now = new Date().toISOString();

    const { error } = await admin
      .from("google_calendar_tokens")
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expires_at: getGoogleTokenExpiry(tokens.expires_in),
        scope: tokens.scope || null,
        token_type: tokens.token_type || "Bearer",
        google_email: googleEmail,
        created_at: now,
        updated_at: now,
      }, { onConflict: "user_id" });

    if (error) {
      console.error("Google Calendar token save failed:", error);
      return settingsRedirect("error", "Google Calendar connection could not be saved. Check setup and try again.");
    }

    return settingsRedirect("connected");
  } catch (error) {
    console.error("Google Calendar callback failed:", error);
    return settingsRedirect("error", "Google Calendar connection failed. Try again from Settings.");
  }
}
