import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createGoogleCalendarAuthUrl } from "@/lib/google/calendar";
import { requireVaultPlus } from "@/lib/auth/server-plan";

const stateCookieName = "domivault_google_calendar_state";

export async function GET() {
  const plan = await requireVaultPlus();

  if (!plan.ok) {
    const url = new URL("/plus", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    url.searchParams.set("feature", "google-calendar");
    return NextResponse.redirect(url);
  }

  try {
    const state = crypto.randomUUID();
    const cookieStore = await cookies();
    cookieStore.set(stateCookieName, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600,
    });

    return NextResponse.redirect(createGoogleCalendarAuthUrl(state));
  } catch (error) {
    const url = new URL("/settings", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    url.searchParams.set("calendar", "config-error");
    url.searchParams.set("message", error instanceof Error ? error.message : "Google Calendar connection failed.");
    return NextResponse.redirect(url);
  }
}
