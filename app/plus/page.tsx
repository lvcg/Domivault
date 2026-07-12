import Link from "next/link";
import { BellRing, CalendarCheck, Car, FileScan, FileText, LifeBuoy, Refrigerator, ShieldCheck } from "lucide-react";
import { DomiVaultPaywall } from "@/components/billing/domivault-paywall";

const plusFeatures = [
  {
    title: "Receipt and warranty vault",
    description: "Store receipts, warranty files, serial label photos, and repair documents in one secure place.",
    icon: FileText,
  },
  {
    title: "Appliance warranty expiration alerts",
    description: "Track warranty dates and replacement windows before coverage quietly expires.",
    icon: Refrigerator,
  },
  {
    title: "Vehicle maintenance records",
    description: "Keep car service dates, repair notes, warranty records, and exportable vehicle history together.",
    icon: Car,
  },
  {
    title: "Google Calendar sync",
    description: "Prepare maintenance reminders for Google Calendar now, with automatic sync planned for Plus.",
    icon: CalendarCheck,
  },
  {
    title: "OCR scan extraction",
    description: "Scan receipts and warranty images, extract text, and save the searchable record to the vault.",
    icon: FileScan,
  },
  {
    title: "Emergency vendor/contact list",
    description: "Keep preferred plumbers, electricians, HVAC techs, contractors, and emergency contacts ready.",
    icon: LifeBuoy,
  },
  {
    title: "Renewal reminders",
    description: "Stay ahead of insurance, utilities, filters, warranties, registrations, and recurring upkeep.",
    icon: BellRing,
  },
  {
    title: "Export-ready home records",
    description: "Create PDF and CSV packets for taxes, resale prep, insurance claims, and contractor handoffs.",
    icon: ShieldCheck,
  },
];

export default function PlusPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">DomiVault</Link>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/dashboard" className="hover:text-slate-950 dark:hover:text-white">Dashboard</Link>
            <Link href="/settings#plan" className="hover:text-slate-950 dark:hover:text-white">Plan</Link>
            <Link href="/faq" className="hover:text-slate-950 dark:hover:text-white">FAQ</Link>
          </div>
        </nav>

        <DomiVaultPaywall />

        <section className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Trial, cancellation, and refunds</p>
          <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            DomiVault offers a 7-day free trial for eligible subscriptions. If you cancel before the trial ends, you will not be charged. After a paid subscription begins, monthly payments are generally non-refundable, but you may cancel anytime to prevent future charges. Annual and lifetime purchases may be refunded within 14 days of the initial purchase if requested through support. Refunds may also be issued for duplicate charges, billing errors, unauthorized transactions, or verified technical issues that prevent use of the service.
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Need billing help? Contact support@domivaultapp.com.
          </p>
        </section>

        <section className="mx-auto grid max-w-5xl gap-3 md:grid-cols-2">
          {plusFeatures.map((feature) => (
            <article key={feature.title} className="flex gap-4 rounded-3xl border border-slate-200/70 bg-white/85 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.05]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">{feature.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{feature.description}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
