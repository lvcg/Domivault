"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, FileText, Home, ShieldCheck, Sparkles, Wrench } from "lucide-react";

const features = [
  {
    title: "Home records vault",
    description: "Keep receipts, warranties, appliance details, service notes, and important documents organized by account.",
    icon: FileText,
  },
  {
    title: "Maintenance tracking",
    description: "Plan recurring home tasks, service dates, repairs, reminders, and Google Calendar-ready maintenance workflows.",
    icon: CalendarCheck,
  },
  {
    title: "Expenses and projects",
    description: "Track improvement costs, bills, vendors, budgets, and exportable records for future planning.",
    icon: Home,
  },
  {
    title: "Appliances and vendors",
    description: "Manage appliance ages, warranty dates, preferred service providers, and repair history in one secure workspace.",
    icon: Wrench,
  },
];

const plusFeatures = [
  "Receipt and warranty document storage",
  "OCR scan extraction",
  "Appliance warranty expiration alerts",
  "Vehicle maintenance records",
  "Report exports and calendar sync",
];

export default function HomePage() {
  useEffect(() => {
    const hash = window.location.hash;
    const isRecoveryHash = hash.includes("type=recovery") || hash.includes("access_token=");

    if (isRecoveryHash) {
      window.location.replace(`/auth/update-password${hash}`);
    }
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 px-[max(1rem,env(safe-area-inset-left))] py-5 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-7xl flex-col">
        <nav className="flex min-h-12 flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/8">
          <Link href="/" className="flex min-h-12 items-center gap-3 rounded-2xl pr-3 focus:outline-none focus:ring-2 focus:ring-emerald-400">
            <span className="grid size-11 place-items-center rounded-2xl bg-emerald-950 text-emerald-200 shadow-sm">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold tracking-tight">DomiVault</span>
              <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Home command center</span>
            </span>
          </Link>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2 text-sm font-semibold">
            <Link className="touch-target rounded-full px-4 py-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white" href="/blog">
              Blog
            </Link>
            <Link className="touch-target rounded-full px-4 py-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white" href="/privacy">
              Privacy
            </Link>
            <Link className="touch-target rounded-full px-4 py-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white" href="/terms">
              Terms
            </Link>
            <Link className="touch-target rounded-full bg-slate-950 px-5 py-2 text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-white dark:text-slate-950 dark:hover:bg-emerald-200" href="/login">
              Sign in
            </Link>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:py-16">
          <div className="max-w-3xl">
            <p className="inline-flex min-h-10 items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200">
              DomiVault
            </p>
            <h1 className="mt-5 text-[clamp(2.5rem,8vw,5.75rem)] font-semibold leading-[0.96] tracking-tight text-slate-950 dark:text-white">
              A secure home command center and records vault.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
              DomiVault helps homeowners organize the records they need to maintain, protect, and document their property, including expenses, appliances, warranties, maintenance tasks, vendors, vehicle records, receipts, and documents.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="touch-target inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" href="/login">
                Open DomiVault
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link className="touch-target inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-950 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15" href="/plus">
                View Plus features
                <Sparkles className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/8 sm:p-6">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm dark:border-white/10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Purpose</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">Know what you own, when it needs service, and where the proof lives.</h2>
              <p className="mt-4 leading-7 text-slate-300">
                DomiVault brings home records, maintenance reminders, repair contacts, and document uploads into one private workspace so users can find critical records before they need them.
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-white/10 dark:bg-white/8">
                    <span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-100">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </aside>
        </div>

        <section className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/8 sm:p-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">Free and Plus</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Start with core home tracking, then unlock advanced vault features.</h2>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
              Free accounts can use the core dashboard, expenses, projects, maintenance planning, vendors, and settings. DomiVault Plus adds premium storage, automation, export, and advanced tracking tools.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {plusFeatures.map((feature) => (
              <div key={feature} className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/8 dark:text-slate-200">
                <ShieldCheck className="size-5 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
