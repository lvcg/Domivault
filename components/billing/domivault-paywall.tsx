"use client";

import type { Package } from "@revenuecat/purchases-js";
import { Check, Crown, Loader2, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { useRevenueCatPremium } from "@/hooks/use-revenuecat-premium";
import { domiVaultPlusPackageIds } from "@/lib/revenuecat-purchases";
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
  badge?: "Highly Recommended" | "Most Popular";
  caption: string;
  cta: string;
  highlight?: boolean;
  id: "monthly" | "yearly" | "lifetime";
  package: Package | null;
  price: string;
  reassurance: string;
  savings?: string;
  terms: string;
  title: string;
};

function packageProductText(rcPackage: Package) {
  const productTitle = rcPackage.webBillingProduct.title || rcPackage.webBillingProduct.displayName;

  if (productTitle) return productTitle;

  return rcPackage.identifier.replace("$rc_", "").replace(/[-_]/g, " ");
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

    if (plan === "monthly") {
      return item.identifier === domiVaultPlusPackageIds.monthly
        || item.webBillingProduct.identifier === domiVaultPlusPackageIds.monthly
        || item.identifier === "$rc_monthly"
        || haystack.includes("month");
    }

    if (plan === "yearly") {
      return item.identifier === domiVaultPlusPackageIds.yearly
        || item.webBillingProduct.identifier === domiVaultPlusPackageIds.yearly
        || item.identifier === "$rc_annual"
        || haystack.includes("annual")
        || haystack.includes("year");
    }

    return item.identifier === domiVaultPlusPackageIds.lifetime
      || item.webBillingProduct.identifier === domiVaultPlusPackageIds.lifetime
      || haystack.includes("lifetime")
      || haystack.includes("life")
      || haystack.includes("one-time")
      || haystack.includes("one_time");
  }) || null;
}

function buildMembershipPlans(packages: Package[]): MembershipPlan[] {
  return [
    {
      caption: "Flexible access for organizing current projects and active repairs.",
      cta: "Start 7-Day Free Trial",
      id: "monthly",
      package: findPackage(packages, "monthly"),
      price: "$9.99/mo",
      reassurance: "Cancel anytime.",
      terms: "7-day free trial, then $9.99/month. Cancel anytime.",
      title: "Monthly",
    },
    {
      caption: "Annual access for homeowners who want the full records vault all year.",
      cta: "Start 7-Day Free Trial",
      id: "yearly",
      package: findPackage(packages, "yearly"),
      price: "$69.99/yr",
      reassurance: "Cancel anytime.",
      savings: "Save $49.89 vs monthly",
      terms: "7-day free trial, then $69.99/year. Cancel anytime.",
      title: "Yearly",
    },
    {
      badge: "Highly Recommended",
      caption: "One-time access for long-term home, vehicle, warranty, and document records.",
      cta: "Start 7-Day Free Trial",
      highlight: true,
      id: "lifetime",
      package: findPackage(packages, "lifetime"),
      price: "$99.99",
      reassurance: "Cancel anytime.",
      terms: "7-day free trial, then $99.99. Cancel anytime.",
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
    <section className="mx-auto grid w-full max-w-5xl gap-5">
      <div className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-5 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
          <Crown className="h-3.5 w-3.5" />
          DomiVault Plus
        </div>
        <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
          Keep the records you will need before you need them.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
          DomiVault helps homeowners keep receipts, warranties, maintenance records, and repair history organized before they need them.
        </p>

        <div className="mx-auto mt-6 grid max-w-3xl gap-3 md:grid-cols-3">
          {valueBullets.map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <ShieldCheck className="mx-auto mb-2 h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-6 grid max-w-3xl gap-x-5 gap-y-2 text-left sm:grid-cols-2">
          {includedFeatures.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl rounded-[2rem] border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
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

            <div className="grid gap-3 md:grid-cols-3">
            {membershipPlans.map((plan) => {
              const rcPackage = plan.package;

              return (
                <article
                  key={plan.id}
                  className={cn(
                    "flex min-h-64 flex-col rounded-3xl border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white/[0.04]",
                    plan.highlight ? "border-emerald-300 dark:border-emerald-400/30" : "border-slate-200/70 dark:border-white/10",
                  )}
                >
                  <div className="grid gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{plan.title}</h3>
                        {plan.badge && <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">{plan.badge}</span>}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{plan.caption}</p>
                      {rcPackage && <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">{packageProductText(rcPackage)}</p>}
                    </div>
                    <p className="text-2xl font-semibold text-slate-950 dark:text-white">
                      {plan.price}
                    </p>
                    {plan.savings && (
                      <p className="inline-flex w-fit rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-400/10 dark:text-blue-200">
                        {plan.savings}
                      </p>
                    )}
                  </div>
                  <button
                    disabled={isPurchasing || !rcPackage}
                    onClick={() => upgrade(rcPackage)}
                    type="button"
                    className={cn(
                      "mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60",
                      "bg-blue-600 text-white hover:bg-blue-500",
                    )}
                  >
                    {isPurchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {isPurchasing ? "Opening checkout..." : rcPackage ? plan.cta : "Plan unavailable"}
                  </button>
                  <p className="mt-2 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">{plan.terms}</p>
                  <p className="mt-1 text-center text-xs font-semibold text-slate-700 dark:text-slate-200">{plan.reassurance}</p>
                </article>
              );
            })}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100">
            {error}
          </p>
        )}

        <div ref={checkoutTargetRef} className="mt-4" />
      </div>
    </section>
  );
}
