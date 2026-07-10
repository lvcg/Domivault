import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json({ connected: false, message: "Auth is not configured." }, { status: 501 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return NextResponse.json({ connected: false, message: "Login is required." }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ connected: false, message: "Server token storage is not configured." }, { status: 501 });
  }

  const { data, error } = await admin
    .from("google_calendar_tokens")
    .select("google_email,updated_at,expires_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({
      connected: false,
      message: `${error.message}. Run the latest Supabase schema if google_calendar_tokens is missing.`,
    }, { status: 500 });
  }

  return NextResponse.json({
    connected: Boolean(data),
    googleEmail: data?.google_email || null,
    connectedAt: data?.updated_at || null,
    expiresAt: data?.expires_at || null,
  });
}
