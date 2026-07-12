"use client";

import Link from "next/link";
import { CreditCard, ExternalLink, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useRevenueCatPremium } from "@/hooks/use-revenuecat-premium";
import { getSubscriptionDisplayState } from "@/lib/billing/subscription-status";

type SubscriptionStatusCardProps = {
  fallbackIsPlus?: boolean;
};

export function SubscriptionStatusCard({ fallbackIsPlus = false }: SubscriptionStatusCardProps) {
  const {
    annualPackage,
    checkoutTargetRef,
    error,
    isLoading,
    isPurchasing,
    managementURL,
    monthlyPackage,
    status,
    upgrade,
  } = useRevenueCatPremium();
  const subscription = getSubscriptionDisplayState(status, fallbackIsPlus);
  const selectedPackage = annualPackage || monthlyPackage || null;
  const canManage = subscription.isPlus && subscription.subscriptionType !== "lifetime" && Boolean(managementURL || subscription.managementURL);
  const isFree = !subscription.isPlus;

  const upgradeNow = async () => {
    await upgrade(selectedPackage);
  };

  const manageSubscription = () => {
    const url = managementURL || subscription.managementURL;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="plan" className="xl:col-span-2 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/85 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Account & Subscription</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{subscription.planLabel}</h3>
            {subscription.isPlus ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
                <Sparkles className="h-3.5 w-3.5" />
                {subscription.subscriptionTypeLabel}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                Free
              </span>
            )}
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Free includes the core home command center. DomiVault Plus unlocks document vaulting, OCR scan extraction, warranty tracking, vehicle records, maintenance history, calendar sync, and report exports.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5 lg:min-w-72">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
              {subscription.isPlus ? <ShieldCheck className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                {subscription.isPlus ? subscription.subscriptionTypeLabel : "Free Tier"}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                {subscription.billingDateLabel || (subscription.isPlus ? "Plus entitlement active" : "Upgrade anytime")}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {isFree && (
              <button
                disabled={isLoading || isPurchasing}
                onClick={upgradeNow}
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
              >
                {isLoading || isPurchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isPurchasing ? "Opening checkout..." : "Upgrade Now"}
              </button>
            )}

            {canManage && (
              <button
                onClick={manageSubscription}
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950"
              >
                <ExternalLink className="h-4 w-4" />
                Manage Subscription
              </button>
            )}

            {subscription.isPlus && subscription.subscriptionType === "lifetime" && (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
                Lifetime Access - Never Expires
              </p>
            )}

            {subscription.isPlus && subscription.subscriptionType !== "lifetime" && !canManage && (
              <Link href="/plus" className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                View Plus Details
              </Link>
            )}
          </div>
        </div>
      </div>

      {(error || isLoading) && (
        <div className="border-t border-slate-200/70 bg-slate-50/80 px-5 py-3 text-xs font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          {isLoading ? "Checking subscription status..." : error}
        </div>
      )}
      <div ref={checkoutTargetRef} />
    </section>
  );
}
