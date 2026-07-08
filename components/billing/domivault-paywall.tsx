"use client";

import type { Package } from "@revenuecat/purchases-js";
import { Check, Crown, Loader2, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { useRevenueCatPremium } from "@/hooks/use-revenuecat-premium";
import { cn } from "@/lib/utils";

const includedFeatures = [
  "Receipt and warranty vault",
  "OCR scan extraction",
  "Appliance warranty expiration alerts",
  "Vehicle maintenance records",
  "Google Calendar sync",
  "Emergency vendor/contact list",
  "Renewal reminders",
  "PDF and CSV export reports",
];

const valueBullets = [
  "Keep proof of purchase ready for claims, repairs, and resale.",
  "Preserve maintenance and vehicle history in one searchable vault.",
  "Get ahead of renewals before warranties, filters, and registrations expire.",
];

type MembershipPlan = {
  caption: string;
  cta: string;
  highlight?: boolean;
  id: "monthly" | "yearly" | "lifetime";
  package: Package | null;
  title: string;
};

function packageProductText(rcPackage: Package) {
  const productTitle = rcPackage.webBillingProduct.title || rcPackage.webBillingProduct.displayName;

  if (productTitle) return productTitle;

  return rcPackage.identifier.replace("$rc_", "").replace(/[-_]/g, " ");
}

function packagePrice(rcPackage: Package) {
  const price = rcPackage.webBillingProduct.price?.formattedPrice || rcPackage.webBillingProduct.currentPrice?.formattedPrice;
  const period = rcPackage.webBillingProduct.period?.unit;

  if (!price) return "Available";
  if (!period) return price;

  return `${price}/${period}`;
}

function findPackage(packages: Package[], plan: MembershipPlan["id"]) {
  return packages.find((item) => {
    const haystack = [
      item.identifier,
      item.webBillingProduct.identifier,
      item.webBillingProduct.title,
      item.webBillingProduct.displayName,
      item.webBillingProduct.description,
    ].filter(Boolean).join(" ").toLowerCase();

    if (plan === "monthly") return item.identifier === "$rc_monthly" || haystack.includes("month");
    if (plan === "yearly") return item.identifier === "$rc_annual" || haystack.includes("annual") || haystack.includes("year");
    return haystack.includes("lifetime") || haystack.includes("life") || haystack.includes("one-time") || haystack.includes("one_time");
  }) || null;
}

function buildMembershipPlans(packages: Package[]): MembershipPlan[] {
  return [
    {
      caption: "Flexible access for organizing current projects and active repairs.",
      cta: "Start Monthly",
      id: "monthly",
      package: findPackage(packages, "monthly"),
      title: "Monthly",
    },
    {
      caption: "Best value for homeowners who want the full records vault all year.",
      cta: "Start Yearly",
      highlight: true,
      id: "yearly",
      package: findPackage(packages, "yearly"),
      title: "Yearly",
    },
    {
      caption: "One-time access for long-term home, vehicle, warranty, and document records.",
      cta: "Get Lifetime",
      id: "lifetime",
      package: findPackage(packages, "lifetime"),
      title: "Lifetime",
    },
  ];
}

export function DomiVaultPaywall() {
  const {
    checkoutTargetRef,
    error,
    isLoading,
    isPremium,
    isPurchasing,
    managementURL,
    openManagementPortal,
    packages,
    refresh,
    upgrade,
  } = useRevenueCatPremium();
  const membershipPlans = buildMembershipPlans(packages);

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
          <Crown className="h-3.5 w-3.5" />
          DomiVault Plus
        </div>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
          Keep the records you will need before you need them.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-500 dark:text-slate-400">
          DomiVault helps homeowners keep receipts, warranties, maintenance records, and repair history organized before they need them.
        </p>

        <div className="mt-6 grid gap-3">
          {valueBullets.map((item) => (
            <div key={item} className="flex gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
              {item}
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {includedFeatures.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Choose plan</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Unlock your home vault</h2>
          </div>
          <button
            onClick={refresh}
            type="button"
            className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            aria-label="Refresh membership status"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>
        </div>

        {isPremium && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
            <p className="font-semibold">DomiVault Plus is active.</p>
            <p className="mt-1">Your paid home vault features are unlocked.</p>
            {managementURL && (
              <button onClick={openManagementPortal} type="button" className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white">
                Manage subscription
              </button>
            )}
          </div>
        )}

        {!isPremium && (
          <div className="mt-5 grid gap-3">
            {isLoading && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                Checking membership options...
              </div>
            )}

            {membershipPlans.map((plan) => {
              const rcPackage = plan.package;
              const isConfigured = Boolean(rcPackage);

              return (
                <article
                  key={plan.id}
                  className={cn(
                    "rounded-3xl border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white/[0.04]",
                    plan.highlight ? "border-emerald-300 dark:border-emerald-400/30" : "border-slate-200/70 dark:border-white/10",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{plan.title}</h3>
                        {plan.highlight && <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">Best value</span>}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{plan.caption}</p>
                      {rcPackage && <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">{packageProductText(rcPackage)}</p>}
                    </div>
                    <p className="shrink-0 text-right text-lg font-semibold text-slate-950 dark:text-white">
                      {rcPackage ? packagePrice(rcPackage) : "Coming soon"}
                    </p>
                  </div>
                  {!isConfigured && (
                    <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                      This membership option is being prepared for checkout.
                    </p>
                  )}
                  <button
                    disabled={isPurchasing || !rcPackage}
                    onClick={() => upgrade(rcPackage)}
                    type="button"
                    className={cn(
                      "mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60",
                      plan.highlight ? "bg-emerald-600 text-white" : "bg-slate-950 text-white dark:bg-white dark:text-slate-950",
                    )}
                  >
                    {isPurchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {isPurchasing ? "Opening checkout..." : rcPackage ? plan.cta : "Coming soon"}
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100">
            {error}
          </p>
        )}

        <div ref={checkoutTargetRef} />
      </div>
    </section>
  );
}
