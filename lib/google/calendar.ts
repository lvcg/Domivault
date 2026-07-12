import type { MaintenanceTask } from "@/types/homey";

export type GoogleCalendarTokenRow = {
  user_id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  scope: string | null;
  token_type: string | null;
  google_email: string | null;
};

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  email?: string;
};

type GoogleCalendarEventResponse = {
  id?: string;
  htmlLink?: string;
  error?: {
    message?: string;
  };
};

const calendarScope = "openid email https://www.googleapis.com/auth/calendar.events";

function requireGoogleEnv() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google Calendar OAuth needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
  }

  return { clientId, clientSecret };
}

export function getGoogleCalendarRedirectUri() {
  const explicitRedirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI;
  if (explicitRedirectUri) return explicitRedirectUri;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${appUrl.replace(/\/$/, "")}/api/google/calendar/callback`;
}

export function createGoogleCalendarAuthUrl(state: string) {
  const { clientId } = requireGoogleEnv();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleCalendarRedirectUri(),
    response_type: "code",
    scope: calendarScope,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCodeForTokens(code: string) {
  const { clientId, clientSecret } = requireGoogleEnv();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleCalendarRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  const payload = await response.json() as GoogleTokenResponse;

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || "Could not connect Google Calendar.");
  }

  return payload;
}

export async function refreshGoogleAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = requireGoogleEnv();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const payload = await response.json() as GoogleTokenResponse;

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || "Could not refresh Google Calendar access.");
  }

  return payload;
}

export async function fetchGoogleUserEmail(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return null;

  const payload = await response.json() as GoogleUserInfo;
  return payload.email || null;
}

function toDateOnly(value: string) {
  return value.slice(0, 10);
}

function addOneDay(date: string) {
  const parsed = new Date(`${toDateOnly(date)}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString().slice(0, 10);
}

function createMaintenanceEvent(task: MaintenanceTask) {
  const eventDate = toDateOnly(task.reminderDate || task.dueDate);

  return {
    summary: `DomiVault: ${task.title}`,
    location: task.area,
    description: [
      `Area: ${task.area}`,
      `Cadence: ${task.cadence}`,
      `Due date: ${task.dueDate}`,
      task.reminderDate ? `Reminder date: ${task.reminderDate}` : null,
      `Priority: ${task.priority}`,
      task.notes ? `Notes: ${task.notes}` : null,
      "Synced from DomiVault.",
    ].filter(Boolean).join("\n"),
    start: { date: eventDate },
    end: { date: addOneDay(eventDate) },
    reminders: {
      useDefault: true,
    },
  };
}

export async function upsertGoogleCalendarMaintenanceEvent({
  accessToken,
  task,
  eventId,
}: {
  accessToken: string;
  task: MaintenanceTask;
  eventId?: string | null;
}) {
  const encodedCalendarId = encodeURIComponent("primary");
  const encodedEventId = eventId ? encodeURIComponent(eventId) : null;
  const url = encodedEventId
    ? `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events/${encodedEventId}`
    : `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events`;

  const response = await fetch(url, {
    method: encodedEventId ? "PUT" : "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(createMaintenanceEvent(task)),
  });
  const payload = await response.json() as GoogleCalendarEventResponse;

  if (!response.ok || !payload.id) {
    throw new Error(payload.error?.message || "Could not sync this reminder to Google Calendar.");
  }

  return {
    eventId: payload.id,
    htmlLink: payload.htmlLink || null,
  };
}

export function getGoogleTokenExpiry(expiresIn?: number) {
  if (!expiresIn) return null;
  return new Date(Date.now() + expiresIn * 1000).toISOString();
}

export function isGoogleTokenExpired(expiresAt?: string | null) {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() <= Date.now() + 60_000;
}
