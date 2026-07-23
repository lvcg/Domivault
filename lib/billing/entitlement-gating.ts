import type { PremiumStatus } from "@/lib/revenuecat-purchases";
import { defaultRevenueCatEntitlementId, domiVaultPlusPackageIds } from "@/lib/billing/revenuecat-config";

export const premiumEntitlementId = defaultRevenueCatEntitlementId;

export const premiumFeatureIds = [
  "document_vault",
  "ocr_scan_extraction",
  "appliance_warranty_alerts",
  "vehicle_maintenance_records",
  "google_calendar_sync",
  "renewal_reminders",
] as const;

export const freeFeatureIds = [
  "dashboard_overview",
  "expense_tracking",
  "maintenance_checklists",
  "appliance_inventory",
  "vendor_directory",
  "project_planner",
] as const;

export type PremiumFeatureId = typeof premiumFeatureIds[number];
export type FreeFeatureId = typeof freeFeatureIds[number];
export type FeatureId = PremiumFeatureId | FreeFeatureId;
export type SubscriptionTierLabel = "Free Tier" | "Monthly Subscription" | "Yearly Subscription" | "Lifetime Access" | "DomiVault Plus";

export type EntitlementGateState = {
  entitlementId: typeof premiumEntitlementId;
  isPlus: boolean;
  planLabel: SubscriptionTierLabel;
  productIdentifier: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function readString(value: unknown, keys: string[]) {
  if (!isRecord(value)) return null;

  for (const key of keys) {
    const item = value[key];
    if (typeof item === "string" && item.trim()) return item;
  }

  return null;
}

export function isPremiumFeature(featureId: FeatureId) {
  return (premiumFeatureIds as readonly string[]).includes(featureId);
}

export function canAccessFeature(featureId: FeatureId, isPlus: boolean) {
  return !isPremiumFeature(featureId) || isPlus;
}

export function readPremiumEntitlement(customerInfo: unknown, entitlementId = premiumEntitlementId) {
  if (!isRecord(customerInfo)) return null;
  const entitlements = customerInfo.entitlements;
  if (!isRecord(entitlements)) return null;
  const active = entitlements.active;
  if (!isRecord(active)) return null;
  const entitlement = active[entitlementId];

  return isRecord(entitlement) ? entitlement : null;
}

export function getProductIdentifierFromEntitlement(entitlement: unknown) {
  return readString(entitlement, [
    "productIdentifier",
    "product_identifier",
    "productId",
    "product_id",
    "storeProductIdentifier",
    "packageIdentifier",
    "identifier",
  ]);
}

export function getSubscriptionTierFromProduct(productIdentifier: string | null): SubscriptionTierLabel {
  const normalized = (productIdentifier || "").toLowerCase();

  if (normalized === domiVaultPlusPackageIds.lifetime || normalized.includes("lifetime") || normalized.includes("life") || normalized.includes("one_time") || normalized.includes("one-time")) {
    return "Lifetime Access";
  }

  if (normalized === domiVaultPlusPackageIds.yearly || normalized.includes("annual") || normalized.includes("year") || normalized.includes("$rc_annual")) {
    return "Yearly Subscription";
  }

  if (normalized === domiVaultPlusPackageIds.monthly || normalized.includes("month") || normalized.includes("$rc_monthly")) {
    return "Monthly Subscription";
  }

  return productIdentifier ? "DomiVault Plus" : "Free Tier";
}

export function getEntitlementGateState(status: PremiumStatus | null | undefined, fallbackIsPlus = false): EntitlementGateState {
  const entitlement = readPremiumEntitlement(status?.customerInfo, status?.entitlementId || premiumEntitlementId);
  const productIdentifier = getProductIdentifierFromEntitlement(entitlement);
  const isPlus = Boolean(status?.isPremium || entitlement || fallbackIsPlus);

  return {
    entitlementId: premiumEntitlementId,
    isPlus,
    planLabel: isPlus ? getSubscriptionTierFromProduct(productIdentifier) : "Free Tier",
    productIdentifier,
  };
}
