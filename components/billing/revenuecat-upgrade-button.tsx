"use client";

import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRevenueCatPremium } from "@/hooks/use-revenuecat-premium";

type RevenueCatUpgradeButtonProps = {
  className?: string;
  label?: string;
  showStatus?: boolean;
};

export function RevenueCatUpgradeButton({
  className,
  label = "Upgrade to Plus",
  showStatus = false,
}: RevenueCatUpgradeButtonProps) {
  const {
    annualPackage,
    checkoutTargetRef,
    error,
    isLoading,
    isPremium,
    isPurchasing,
    managementURL,
    monthlyPackage,
    openManagementPortal,
    upgrade,
  } = useRevenueCatPremium();
  const isBusy = isLoading || isPurchasing;
  const selectedPackage = annualPackage || monthlyPackage;
  const buttonLabel = isPremium ? "Manage DomiVault Plus" : label;

  const handleClick = async () => {
    if (isPremium && managementURL) {
      openManagementPortal();
      return;
    }

    await upgrade(selectedPackage);
  };

  return (
    <div className="grid gap-2">
      <button
        disabled={isBusy}
        onClick={handleClick}
        type="button"
        className={cn(
          "inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 sm:px-4",
          className,
        )}
      >
        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {isLoading ? "Checking Plus..." : isPurchasing ? "Opening checkout..." : buttonLabel}
      </button>
      {showStatus && (
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {isPremium ? "DomiVault Plus is active." : error || "Unlock receipt storage, exports, warranty tracking, and calendar sync."}
        </div>
      )}
      <div ref={checkoutTargetRef} />
    </div>
  );
}
