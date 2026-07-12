# DomiVault

**DomiVault is a premium home command center and secure records vault for homeowners.**

It centralizes the operational side of home ownership: improvement expenses, utility bills, project planning, maintenance reminders, appliance warranties, vendor contacts, vehicle service records, receipts, and exportable reports. The application is built as a production-oriented SaaS foundation with authentication, user-scoped data, document storage, OCR scanning, premium feature gates, and deployment-ready configuration.

## Live Product

| Resource | URL |
| --- | --- |
| Live app | https://domivaultapp.com |
| Privacy policy | https://domivaultapp.com/privacy |
| Terms of service | https://domivaultapp.com/terms |

> DomiVault helps homeowners keep receipts, warranties, maintenance records, and repair history organized before they need them.

## Screenshots

![DomiVault dashboard](public/screenshots/domivault-dashboard.png)

![Expense organizer](public/screenshots/domivault-expenses.png)

![Appliance tracker](public/screenshots/domivault-appliances.png)

![Vehicle repair vault](public/screenshots/domivault-vehicles.png)

![Report exports](public/screenshots/domivault-reports.png)

![Login and signup](public/screenshots/domivault-login.png)



<video src="public/demo/domivault-walkthrough.mp4" controls width="100%"></video>
## Core Features

### Secure Data Vaulting

- Supabase Auth manages user identity, login, password recovery, and OAuth-ready sign-in.
- Supabase Postgres stores home, project, expense, vendor, appliance, vehicle, reminder, and document metadata.
- Row-Level Security policies scope records to `auth.uid()` so users can only access their own data.
- Supabase Storage supports private receipt, warranty, and document assets.
- Document metadata links uploaded files to the relevant expense, appliance, vehicle, task, or service event.

### Home Operations Command Center

- Personalized dashboard with username-aware greeting, saved timestamp, expense totals, service-watch counts, and upcoming maintenance tasks.
- Project planner separates planned budgets from real expense totals so forecasting does not distort financial reporting.
- Expense and utility organizer supports editable records, categories, vendors, project links, tax-review markers, and report generation.
- Maintenance scheduler tracks recurring tasks, notes, due dates, reminder channels, status, and calendar export.
- Appliance tracker manages age, service dates, warranty expiration alerts, notes, edit/delete behavior, and linked vendors.
- Vehicle section tracks vehicle records, repair reminders, and service history foundations.

### Automated OCR Scanning

- Tesseract.js performs client-side OCR for receipt and warranty image scans.
- Canvas-based preprocessing improves OCR readiness before text extraction.
- Text-like uploads such as TXT, CSV, JSON, and Markdown can be extracted directly.
- OCR output can be stored with document metadata for future searching, reporting, and review.

> OCR currently targets image and camera-based scans. Image-based PDF OCR requires a PDF-to-image conversion step before Tesseract can parse the document pages.

### Analytical Insights and Exports

- Recharts powers visual spending breakdowns and dashboard reporting.
- Report export endpoints support CSV/PDF generation paths for entitled users.
- Metrics distinguish actual spending from planned project budgets.
- Plus-tier export gates are designed for API-level enforcement, not only UI locking.

### Notifications and Calendar Workflows

- Browser push notification registration is modeled with VAPID subscriptions stored on the user profile.
- Maintenance tasks support reminder channels including email, SMS, and push.
- Calendar export is available for maintenance tasks.
- Full Google Calendar sync is structured as a DomiVault Plus feature.

## Deep-Dive Tech Stack

| Layer | Technology | Why it was chosen |
| --- | --- | --- |
| Application framework | Next.js App Router | Provides file-based routing, server/client boundaries, API routes, production build optimization, and Vercel-native deployment. |
| UI runtime | React + TypeScript | Enables typed component architecture, safer state management, and reusable feature modules. |
| Styling | Tailwind CSS | Supports fast, consistent, responsive UI development with dark/light mode styling and minimal CSS overhead. |
| Backend-as-a-Service | Supabase | Combines Auth, Postgres, Storage, RLS, and SQL-based portability without building a full custom backend. |
| Database | Supabase Postgres | Relational schema fits user-owned home records, linked projects, documents, vehicles, tasks, and vendors. |
| Authorization | Supabase RLS | Enforces user-scoped data access directly at the database policy layer. |
| File storage | Supabase Storage | Stores private receipts, warranties, and home/vehicle documents with metadata references in Postgres. |
| OCR | Tesseract.js | Enables private client-side parsing without sending images to a third-party OCR provider by default. |
| Charts | Recharts | Provides composable React charts for financial and maintenance insights. |
| Icons | Lucide React | Keeps interface iconography lightweight, consistent, and accessible. |
| Billing foundation | RevenueCat | Provides subscription entitlement checks for DomiVault Plus and webhook-driven profile updates. |
| Testing | Jest + Playwright | Covers unit-level behavior and end-to-end workflows for dashboard sync, deletes, Plus gates, exports, and push setup. |

## Project Structure

```text
app/
  api/
  appliances/
  auth/
  dashboard/
  expenses/
  faq/
  login/
  maintenance/
  oauth/
  plus/
  privacy/
  projects/
  reports/
  scanner/
  settings/
  terms/
  vehicles/
  vendors/
components/
  appliances/
  auth/
  billing/
  dashboard/
  documents/
  expenses/
  faq/
  layout/
  projects/
  reports/
  scanner/
  settings/
  ui/
  vehicles/
  vendors/
hooks/
lib/
  auth/
  supabase/
public/
  screenshots/
supabase/
  schema.sql
  push-notifications.sql
  rls-smoke-tests.sql
tests/
  e2e/
types/
```

## Local Development Setup

### Prerequisites

- Node.js 20+
- npm
- A Supabase project for auth, database, and storage features
- Optional: RevenueCat project for subscription testing

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

NEXT_PUBLIC_REVENUECAT_API_KEY=your_revenuecat_web_sdk_key
NEXT_PUBLIC_REVENUECAT_ENTITLEMENT_ID=premium_access
REVENUECAT_WEBHOOK_AUTH_TOKEN=your_revenuecat_webhook_auth_value
REVENUECAT_WEBHOOK_SIGNING_SECRET=your_revenuecat_hmac_signing_secret

NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:support@domivaultapp.com
```

> Never commit `.env.local`. Keep production secrets in Vercel environment variables, Supabase Vault, or the relevant provider dashboard.

### 3. Run The App

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

DomiVault can render in local preview mode without Supabase keys, but authentication, profile sync, storage uploads, RLS checks, and server-backed features require Supabase configuration.

## Supabase Setup

### 1. Apply The Main Schema

Run the SQL in:

```text
supabase/schema.sql
```

The schema creates the core DomiVault data model:

- `profiles`
- `projects`
- `expenses`
- `bills`
- `maintenance_tasks`
- `appliances`
- `vendors`
- `service_events`
- `reminders`
- `vault_documents`
- `vehicles`
- `vehicle_service_events`
- private `receipts` storage bucket

### 2. Apply Push Notification Columns

If push setup reports missing profile fields, run:

```text
supabase/push-notifications.sql
```

This adds:

- `profiles.push_enabled`
- `profiles.push_subscription`
- `profiles.push_subscription_saved_at`

### 3. Validate RLS

Use:

```text
supabase/rls-smoke-tests.sql
```

Recommended manual checks:

1. Create test user A.
2. Create test user B.
3. Insert records for user A.
4. Confirm user B cannot select, update, or delete user A records.
5. Confirm Plus-only rows/actions are rejected for a free-tier profile where applicable.

## Auth Configuration

In Supabase Auth settings:

1. Enable email/password sign-in.
2. Enable magic links if passwordless login is desired.
3. Enable Google OAuth only after Google Cloud OAuth credentials are configured.
4. Set the Site URL:

```text
https://domivaultapp.com
```

Add redirect URLs:

```text
http://localhost:3000/auth/callback
http://localhost:3005/auth/callback
http://localhost:3000/auth/update-password
http://localhost:3005/auth/update-password
https://domivaultapp.com/auth/callback
https://domivaultapp.com/auth/update-password
```

Password recovery should resolve to:

```text
https://domivaultapp.com/auth/update-password
```

## Google OAuth Setup

For Google sign-in:

1. Verify `domivaultapp.com` in Google Search Console.
2. Add `domivaultapp.com` as an authorized domain in Google Cloud.
3. Set OAuth consent links:

```text
Home page: https://domivaultapp.com
Privacy policy: https://domivaultapp.com/privacy
Terms of service: https://domivaultapp.com/terms
```

4. Add JavaScript origins:

```text
https://domivaultapp.com
https://www.domivaultapp.com
```

5. Add the Supabase Google callback URI:

```text
https://odxobincteposdhqhxvs.supabase.co/auth/v1/callback
```

6. Add the Google Client ID and Client Secret in Supabase Authentication Providers.

## Production Deployment

### Vercel Deployment

1. Connect the project to Vercel.
2. Add the production environment variables from `.env.production.example`.
3. Set the production domain:

```text
https://domivaultapp.com
```

4. Configure Route 53 DNS records for Vercel:

```text
A      @     76.76.21.21
CNAME  www   cname.vercel-dns.com
```

5. Redeploy after environment variable or domain changes.

### Production Hardening Checklist

- Apply `supabase/schema.sql` and all patch SQL files in Supabase.
- Confirm Supabase Auth Site URL and Redirect URLs match production.
- Verify Google OAuth domain ownership and callback URLs.
- Store production secrets in Vercel, Supabase Vault, or provider dashboards.
- Enable RLS on every user-owned table.
- Confirm private storage bucket policies prevent cross-user access.
- Run two-user RLS smoke tests before public launch.
- Configure RevenueCat webhooks and verify entitlement updates.
- Configure error monitoring and production logging.
- Run `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e`.
- Review dependency audit findings before launch.
- Keep privacy policy and terms available at public URLs.

## Security Architecture

DomiVault is designed around database-enforced ownership.

- User-owned tables include a `user_id` column.
- RLS policies compare `user_id` to `auth.uid()`.
- Authenticated users can only select, insert, update, and delete their own rows.
- Private document records are stored in `vault_documents` and linked to the authenticated user.
- Supabase Storage paths should be scoped by user id, such as:

```text
receipts/{user_id}/{document_type}/{file_name}
```

- Paid-tier records and exports should be enforced through RLS policies or server routes that read the user's profile billing state.

> UI locks improve user experience, but server-side checks and RLS policies are the source of truth for protecting paid features and private records.

## Monetization Architecture

DomiVault uses a Free vs. DomiVault Plus model. Plus access is represented by billing state on the user's profile and the RevenueCat `premium_access` entitlement.

| Capability | Free | DomiVault Plus |
| --- | --- | --- |
| Dashboard command center | Included | Included |
| Project planner | Included | Included |
| Expense and utility tracking | Included | Included |
| Vendor address book | Included | Included |
| Basic appliance list | Included | Included |
| Basic maintenance reminders | Included | Included |
| Receipt and warranty vault | Locked | Included |
| OCR scan extraction | Locked | Included |
| Appliance warranty expiration alerts | Locked | Included |
| Vehicle maintenance records | Locked | Included |
| Maintenance history | Locked | Included |
| Google Calendar sync | Locked | Included |
| CSV/PDF report exports | Locked | Included |

Recommended RevenueCat setup:

1. Create a RevenueCat project named `DomiVault`.
2. Create an entitlement named `premium_access`.
3. Create monthly and yearly DomiVault Plus products.
4. Attach both products to `premium_access`.
5. Create and publish the current offering.
6. Add `NEXT_PUBLIC_REVENUECAT_API_KEY` and `NEXT_PUBLIC_REVENUECAT_ENTITLEMENT_ID`.
7. Configure webhooks:

```text
https://domivaultapp.com/api/billing/revenuecat
```

8. Store webhook auth/signing secrets in Vercel.

## Testing

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Current automated coverage includes:

- Dashboard state synchronization after maintenance/appliance updates.
- Hard delete persistence for maintenance and appliance records.
- Vehicle dropdown contrast checks.
- Vendor delete behavior.
- Free vs. Plus feature gating.
- Report export download flow.
- Web push notification registration flow.

## Document Uploads and OCR

Receipt, warranty, vehicle, and report documents are modeled with:

- Private Supabase Storage bucket: `receipts`
- Metadata table: `vault_documents`
- OCR API route: `/api/documents/ocr`

Recommended upload flow:

1. Upload the file to a user-scoped storage path.
2. Save metadata in `vault_documents`.
3. Link the document to an expense, appliance, vehicle, maintenance task, or service event.
4. Run OCR for supported image/text files.
5. Save extracted text and OCR status.
6. Delete both metadata and storage object when the user removes a document.

## Roadmap

- PDF-to-image OCR pipeline for scanned PDFs.
- Full Google Calendar two-way sync.
- Production email/SMS reminder delivery.
- Expanded analytics for annual home cost forecasting.
- Admin-quality observability dashboards for production support.

## License

No license has been declared yet. Add a license before distributing DomiVault as an open-source project.
