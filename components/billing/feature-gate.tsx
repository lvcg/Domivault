"use client";

import { LockKeyhole, Sparkles } from "lucide-react";
import { PremiumLock } from "@/components/ui/premium-lock";
import { useEntitlementGate } from "@/hooks/use-entitlement-gate";
import { type FeatureId } from "@/lib/billing/entitlement-gating";
import { cn } from "@/lib/utils";

const featureLabels: Record<FeatureId, string> = {
  appliance_inventory: "Appliance inventory",
  appliance_warranty_alerts: "Appliance warranty alerts",
  dashboard_overview: "Dashboard overview",
  document_vault: "Receipt and warranty vault",
  expense_tracking: "Expense tracking",
  google_calendar_sync: "Google Calendar sync",
  maintenance_checklists: "Maintenance checklists",
  ocr_scan_extraction: "OCR scan extraction",
  project_planner: "Project planner",
  renewal_reminders: "Renewal reminders",
  vendor_directory: "Vendor directory",
  vehicle_maintenance_records: "Vehicle maintenance records",
};

type FeatureGateProps = {
  children: React.ReactNode;
  description?: string;
  featureId: FeatureId;
  fallback?: React.ReactNode;
  lockClassName?: string;
  title?: string;
};

export function PlusBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100", className)}>
      <Sparkles className="h-3 w-3" />
      Plus
    </span>
  );
}

export function LockedFeatureBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100", className)}>
      <LockKeyhole className="h-3 w-3" />
      Plus
    </span>
  );
}

export function FeatureGate({
  children,
  description,
  fallback,
  featureId,
  lockClassName,
  title,
}: FeatureGateProps) {
  const { canAccess } = useEntitlementGate();

  if (canAccess(featureId)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={lockClassName}>
      <PremiumLock
        title={title || featureLabels[featureId]}
        description={description || `${featureLabels[featureId]} is included with DomiVault Plus.`}
      />
    </div>
  );
}

type GatedActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  featureId: FeatureId;
  onAllowedClick: () => void | Promise<void>;
  showPlusBadge?: boolean;
};

export function GatedActionButton({
  children,
  className,
  featureId,
  onAllowedClick,
  showPlusBadge = true,
  type = "button",
  ...props
}: GatedActionButtonProps) {
  const { blockedFeature, clearBlockedFeature, isPlusUser, requirePlus } = useEntitlementGate();

  const handleClick = async () => {
    if (!requirePlus(featureId)) return;
    clearBlockedFeature();
    await onAllowedClick();
  };

  return (
    <>
      <button {...props} onClick={handleClick} type={type} className={className}>
        <span className="inline-flex min-w-0 items-center gap-2">
          {children}
          {showPlusBadge && !isPlusUser && <LockedFeatureBadge />}
        </span>
      </button>
      {blockedFeature === featureId && (
        <div className="mt-3">
          <PremiumLock title={featureLabels[featureId]} description={`${featureLabels[featureId]} is included with DomiVault Plus.`} />
        </div>
      )}
    </>
  );
}
