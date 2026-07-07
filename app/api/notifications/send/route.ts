import { NextResponse } from "next/server";
import webPush from "web-push";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type PushProfileRow = {
  push_enabled?: boolean | null;
  push_subscription?: webPush.PushSubscription | null;
};

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:support@domivault.app";

  if (!publicKey || !privateKey) {
    return false;
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase auth is not configured." }, { status: 501 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return NextResponse.json({ message: "Login is required to send push reminders." }, { status: 401 });
  }

  if (!configureWebPush()) {
    return NextResponse.json({ message: "VAPID keys are not configured." }, { status: 501 });
  }

  const body = await request.json().catch(() => null) as { title?: string; body?: string; url?: string; tag?: string } | null;
  const { data, error } = await supabase
    .from("profiles")
    .select("push_enabled,push_subscription")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const profile = data as PushProfileRow | null;

  if (!profile?.push_enabled || !profile.push_subscription) {
    return NextResponse.json({ message: "Push notifications are not enabled for this browser." }, { status: 409 });
  }

  const payload = JSON.stringify({
    title: body?.title || "DomiVault reminder",
    body: body?.body || "A home maintenance task is due.",
    tag: body?.tag || "domivault-maintenance",
    url: body?.url || "/maintenance",
  });

  try {
    await webPush.sendNotification(profile.push_subscription, payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const statusCode = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 500;

    if (statusCode === 404 || statusCode === 410) {
      await supabase
        .from("profiles")
        .update({
          push_enabled: false,
          push_subscription: null,
          push_subscription_saved_at: null,
        })
        .eq("id", user.id);
    }

    return NextResponse.json({
      message: error instanceof Error ? error.message : "Push notification failed.",
    }, { status: statusCode || 500 });
  }
}
