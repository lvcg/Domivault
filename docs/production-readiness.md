# DomiVault Production Readiness

DomiVault is a home command center and records vault for organizing expenses, bills, projects, appliances, warranties, documents, maintenance tasks, vendors, vehicles, reminders, and exportable home records.

Live production site: https://www.domivaultapp.com  
Primary app domain: `domivaultapp.com`  
Android package name: `com.domivaultapp.mobile`  
Plus entitlement ID: `premium_access`  
Current monetization provider: RevenueCat Web Billing

## Current Status

### Web App

- Next.js App Router app is deployed on Vercel production.
- The public home page explains the purpose of DomiVault for OAuth and Play review.
- Login, signup, password recovery, profile settings, dashboard, expenses, projects, maintenance, appliances, vendors, vehicles, scanner, reports, Plus, FAQ, Privacy Policy, and Terms pages are implemented.
- User-facing references to Supabase are hidden from dashboard and app copy.
- Favicon, PWA icons, and manifest branding use the DomiVault logo.
- Service worker and PWA manifest are present for installability and PWABuilder checks.
- Public legal pages are available for Google OAuth, Google Play, and billing review:
  - `/privacy`
  - `/terms`

### Supabase

- Supabase Auth is the source of signed-in user identity.
- Supabase Postgres stores app records.
- Supabase Storage stores uploaded receipts, warranties, and documents.
- Row Level Security is enabled for user-owned data.
- RLS policies use `(select auth.uid())` patterns where practical to avoid per-row auth function re-evaluation warnings.
- Billing-sensitive fields are intended to be updated only by trusted server routes or service role workflows.
- The schema includes Plus-related fields such as `plan_tier`, billing metadata, push notification preferences, Google Calendar token tables, vehicles, vehicle service events, vault documents, reminders, and maintenance history support.

### Plus Gating

Free users can use the core home tracker features.

DomiVault Plus gates:

- Receipt and warranty vault uploads
- OCR scan extraction
- Appliance warranty expiration alerts
- Vehicle maintenance records
- Google Calendar sync
- Renewal reminders
- Export reports

Important: client-side UI locks are only the first layer. Server routes and Supabase RLS must continue enforcing Plus access for paid records and exports.

### RevenueCat

- RevenueCat Web SDK integration is present.
- Entitlement checked by `premium_access`.
- Paywall/checkout UI uses the DomiVault Plus plans:
  - Monthly: `$9.99`
  - Yearly: `$79.99`
  - Lifetime: `$99.99`
- Plus state should be read from trusted billing/customer info and persisted to Supabase profile billing fields.
- Local storage may be used only as a loading hint, not as an authorization source.

### Google Calendar

- Calendar sync is treated as a Plus feature.
- Google Calendar token storage should stay server-side.
- `google_calendar_tokens` must have RLS allowing users to access only their own tokens and allowing service role management.
- Calendar event creation/update should happen through server routes after checking:
  - signed-in user
  - active Plus entitlement/profile tier
  - connected Google Calendar token

### OCR And Document Scanning

- Image upload and camera capture OCR use Tesseract.js.
- PDF OCR support requires converting PDF pages to images before OCR.
- Uploads should reject unsupported MIME types before storage.
- Strict size limits should be enforced before OCR:
  - images: 10 MB maximum
  - text-like files: 5 MB maximum
- OCR errors should return user-friendly messages while detailed errors are logged server-side.

## Required Production Environment Variables

Set these in Vercel Production, not only in local `.env.local`.

```text
NEXT_PUBLIC_APP_URL=https://www.domivaultapp.com
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

RevenueCat:

```text
NEXT_PUBLIC_REVENUECAT_API_KEY
NEXT_PUBLIC_REVENUECAT_ENTITLEMENT_ID=premium_access
REVENUECAT_WEBHOOK_SIGNING_SECRET
```

Google Calendar:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALENDAR_REDIRECT_URI=https://www.domivaultapp.com/api/google/calendar/callback
```

Optional monitoring:

```text
SENTRY_DSN
```

## Supabase Release Checklist

Run the latest SQL files in the Supabase SQL Editor before production testing:

1. Run `supabase/schema.sql`.
2. Run any focused patch files that exist for current features, such as:
   - `supabase/google-calendar.sql`
   - `supabase/push-notifications.sql`
   - `supabase/rls-performance-fixes.sql`
3. Confirm these tables exist:
   - `profiles`
   - `projects`
   - `expenses`
   - `bills`
   - `vendors`
   - `appliances`
   - `maintenance_tasks`
   - `service_events`
   - `reminders`
   - `vault_documents`
   - `vehicles`
   - `vehicle_service_events`
   - `google_calendar_tokens`
4. Confirm `profiles.plan_tier` exists and defaults to `free`.
5. Confirm profile settings columns exist, including:
   - `calendar_sync`
   - `receipt_scan`
   - `settings_saved_at`
   - `push_enabled`
   - `push_subscription`
6. Confirm the private document storage bucket exists.
7. Confirm free users cannot write Plus-only records.
8. Confirm Plus users can write Plus-only records.
9. Confirm user A cannot select, update, or delete user B records.

## Security Checklist

- Do not expose service role keys in browser bundles or network calls.
- Keep all `SUPABASE_SERVICE_ROLE_KEY`, RevenueCat webhook secrets, Google client secrets, and signing credentials server-only.
- Verify RevenueCat webhooks require a valid HMAC signature whenever `REVENUECAT_WEBHOOK_SIGNING_SECRET` is set.
- Reject RevenueCat upgrade events unless `premium_access` is explicitly present.
- Return generic user-facing API errors and log detailed server-side diagnostics.
- Keep Content Security Policy headers active in production.
- Keep `.env*`, signing keys, generated keystores, `.next`, build outputs, and local logs out of Git.
- Review Privacy Policy and Terms before public launch, especially for subscriptions, refunds, document storage, and US-only availability.

## PWA And Google Play Checklist

### PWA

- `manifest.json` includes:
  - `id`
  - `name`
  - `short_name`
  - `description`
  - `start_url`
  - `display`
  - `display_override`
  - `orientation`
  - `theme_color`
  - `background_color`
  - icons
  - screenshots
  - shortcuts
  - categories
  - `lang`
- Service worker is deployed and detectable by PWABuilder.
- Offline fallback exists for failed navigation.
- Icons include 192x192 and 512x512 PNG assets.
- Screenshots and feature graphic are prepared for Google Play upload.

### Android TWA

Android project path:

```text
C:\Users\Liv\domivault-twa-v3
```

Current release bundle path:

```text
C:\Users\Liv\domivault-twa-v3\app\release\app-release.aab
```

Required Android config:

```text
packageId / applicationId: com.domivaultapp.mobile
host: www.domivaultapp.com
startUrl: /
targetSdkVersion: 36 or higher
```

Important source files must exist under the matching Java package:

```text
C:\Users\Liv\domivault-twa-v3\app\src\main\java\com\domivaultapp\mobile\Application.java
C:\Users\Liv\domivault-twa-v3\app\src\main\java\com\domivaultapp\mobile\LauncherActivity.java
C:\Users\Liv\domivault-twa-v3\app\src\main\java\com\domivaultapp\mobile\DelegationService.java
```

Each file must declare:

```java
package com.domivaultapp.mobile;
```

If the app crashes on open with `ClassNotFoundException`, check for a package mismatch between:

- `app/build.gradle`
- `app/src/main/AndroidManifest.xml`
- `twa-manifest.json`
- Java source folder path and package declarations

### Digital Asset Links

The web app must serve:

```text
https://www.domivaultapp.com/.well-known/assetlinks.json
```

It must include:

- `package_name`: `com.domivaultapp.mobile`
- SHA-256 fingerprint for the signing certificate used by the uploaded Android App Bundle

Current tracked file:

```text
public/.well-known/assetlinks.json
```

## Google Play Release Checklist

1. Build a fresh signed `.aab`.
2. Confirm the version code has never been used in Google Play.
3. Upload the `.aab` to Internal Testing or Closed Testing.
4. Confirm the uploaded package is `com.domivaultapp.mobile`.
5. Confirm the signing certificate matches Google Play expectations.
6. Add release notes.
7. Test install from the Play testing link.
8. Confirm the app opens and does not hang.
9. Test login, dashboard, expenses, maintenance, vendors, appliances, vehicles, scanner, reports, Plus page, and legal links.
10. Collect tester feedback before production rollout.

## QA Checklist

- Sign up and log in with email.
- Test password recovery redirect to the DomiVault domain.
- Test Google login after OAuth redirect URI approval.
- Confirm username persists and dashboard greeting does not flash stale names.
- Create, edit, delete, and refresh records for:
  - expenses
  - projects
  - maintenance tasks
  - appliances
  - vendors
  - vehicles
- Confirm deleted sample/demo records do not reappear after refresh.
- Test receipt and warranty uploads as a Plus user.
- Test OCR on sharp image receipts.
- Test PDF OCR on a scanned PDF if the PDF-to-image path is enabled.
- Confirm free users see Plus locks instead of broken actions.
- Confirm Plus users can access exports, document vault, warranty alerts, vehicles, calendar sync, and renewal reminders.
- Test CSV and PDF export downloads.
- Test push notification registration after enabling browser permissions.
- Test responsive layouts on small phone, large phone, tablet, desktop, and Android TWA.
- Run Playwright E2E after local browser launch permissions are fixed.
- Run `npm run build`.
- Review `npm audit` output before store release.

## Known Watch Items

- Google Play signing key mismatches block release uploads. Keep the final upload keystore and certificate fingerprint documented.
- AAB version codes cannot be reused.
- RevenueCat checkout depends on correct Web Billing API key, current offering, package identifiers, and `premium_access` entitlement mapping.
- OCR quality depends heavily on image sharpness, contrast, lighting, and document angle.
- PDF OCR can be slower than image OCR and should show progress/loading states.
- Mobile QA is required before expanding the Google Play rollout.
