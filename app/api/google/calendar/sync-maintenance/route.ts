import { NextResponse } from "next/server";
import { requireVaultPlus } from "@/lib/auth/server-plan";
import {
  isGoogleTokenExpired,
  refreshGoogleAccessToken,
  type GoogleCalendarTokenRow,
  upsertGoogleCalendarMaintenanceEvent,
  getGoogleTokenExpiry,
} from "@/lib/google/calendar";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MaintenanceTask } from "@/types/homey";

type SyncRequestBody = {
  task?: Partial<MaintenanceTask>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidTask(value: Partial<MaintenanceTask> | undefined): value is MaintenanceTask {
  return Boolean(
    value
    && typeof value.id === "string"
    && typeof value.title === "string"
    && typeof value.area === "string"
    && typeof value.cadence === "string"
    && typeof value.dueDate === "string"
    && typeof value.priority === "string"
    && typeof value.status === "string",
  );
}

export async function POST(request: Request) {
  const plan = await requireVaultPlus();

  if (!plan.ok) {
    return NextResponse.json({ message: plan.message }, { status: plan.status });
  }

  const body = await request.json().catch(() => null) as SyncRequestBody | null;

  if (!isValidTask(body?.task)) {
    return NextResponse.json({ message: "A valid maintenance task is required." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ message: "Server token storage is not configured." }, { status: 501 });
  }

  const { data, error } = await admin
    .from("google_calendar_tokens")
    .select("user_id,access_token,refresh_token,expires_at,scope,token_type,google_email")
    .eq("user_id", plan.user.id)
    .maybeSingle();

  if (error) {
    console.error("Google Calendar token lookup failed:", error);
    return NextResponse.json({ message: "Could not load Google Calendar connection. Check setup and try again." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ message: "Connect Google Calendar in Settings before syncing reminders." }, { status: 409 });
  }

  let token = data as GoogleCalendarTokenRow;

  if (isGoogleTokenExpired(token.expires_at)) {
    if (!token.refresh_token) {
      return NextResponse.json({ message: "Reconnect Google Calendar to refresh calendar access." }, { status: 409 });
    }

    const refreshed = await refreshGoogleAccessToken(token.refresh_token);
    const refreshedAt = new Date().toISOString();
    token = {
      ...token,
      access_token: refreshed.access_token as string,
      expires_at: getGoogleTokenExpiry(refreshed.expires_in),
      scope: refreshed.scope || token.scope,
      token_type: refreshed.token_type || token.token_type,
    };

    await admin
      .from("google_calendar_tokens")
      .update({
        access_token: token.access_token,
        expires_at: token.expires_at,
        scope: token.scope,
        token_type: token.token_type,
        updated_at: refreshedAt,
      })
      .eq("user_id", plan.user.id);
  }

  try {
    const synced = await upsertGoogleCalendarMaintenanceEvent({
      accessToken: token.access_token,
      task: body.task,
      eventId: body.task.googleCalendarEventId,
    });
    const syncedAt = new Date().toISOString();

    if (uuidPattern.test(body.task.id)) {
      await admin
        .from("maintenance_tasks")
        .update({
          google_calendar_event_id: synced.eventId,
          google_calendar_html_link: synced.htmlLink,
          google_calendar_synced_at: syncedAt,
          updated_at: syncedAt,
        })
        .eq("id", body.task.id)
        .eq("user_id", plan.user.id);
    }

    return NextResponse.json({
      ok: true,
      eventId: synced.eventId,
      htmlLink: synced.htmlLink,
      syncedAt,
    });
  } catch (error) {
    console.error("Google Calendar sync failed:", error);
    return NextResponse.json({ message: "Calendar sync failed. Reconnect Google Calendar and try again." }, { status: 502 });
  }
}
