import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type PushSubscriptionPayload = {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: {
    auth?: string;
    p256dh?: string;
  };
};

function isValidSubscription(value: unknown): value is PushSubscriptionPayload {
  const subscription = value as PushSubscriptionPayload;
  return Boolean(
    subscription
    && typeof subscription.endpoint === "string"
    && subscription.endpoint.startsWith("https://")
    && typeof subscription.keys?.auth === "string"
    && typeof subscription.keys?.p256dh === "string",
  );
}

function isMissingPushSchema(error: { message?: string; code?: string }) {
  const message = error.message || "";
  return error.code === "PGRST204" || /push_enabled|push_subscription|schema cache/i.test(message);
}

function missingPushSchemaResponse() {
  return NextResponse.json({
    message: "Push notification columns are missing in Supabase. Run supabase/push-notifications.sql in the Supabase SQL Editor, then retry.",
  }, { status: 500 });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase auth is not configured." }, { status: 501 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return NextResponse.json({ message: "Login is required to save push notification settings." }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { subscription?: unknown } | null;

  if (!isValidSubscription(body?.subscription)) {
    return NextResponse.json({ message: "Invalid push subscription payload." }, { status: 400 });
  }

  const savedAt = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      notification_email: user.email,
      push_enabled: true,
      push_subscription: body.subscription,
      push_subscription_saved_at: savedAt,
      updated_at: savedAt,
    });

  if (error) {
    if (isMissingPushSchema(error)) return missingPushSchemaResponse();
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, savedAt });
}

export async function DELETE() {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase auth is not configured." }, { status: 501 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return NextResponse.json({ message: "Login is required to update push notification settings." }, { status: 401 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      push_enabled: false,
      push_subscription: null,
      push_subscription_saved_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    if (isMissingPushSchema(error)) return missingPushSchemaResponse();
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
