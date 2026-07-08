import type { PremiumStatus } from "@/lib/revenuecat-purchases";

export type SubscriptionType = "free" | "monthly" | "annual" | "lifetime" | "plus_unknown";

export type SubscriptionDisplayState = {
  billingDateLabel: string | null;
  expirationDate: string | null;
  isPlus: boolean;
  managementURL: string | null;
  planLabel: "Plan: Free Tier" | "Plan: DomiVault Plus";
  productIdentifier: string | null;
  subscriptionType: SubscriptionType;
  subscriptionTypeLabel: string;
};

function readString(value: unknown, keys: string[]) {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;

  for (const key of keys) {
    const item = record[key];
    if (typeof item === "string" && item.trim()) return item;
  }

  return null;
}

function readActiveEntitlement(status: PremiumStatus | null) {
  const active = status?.customerInfo?.entitlements?.active;
  if (!active || typeof active !== "object") return null;
  const entitlement = active[status.entitlementId];
  return entitlement && typeof entitlement === "object" ? entitlement : null;
}

function inferSubscriptionType(productIdentifier: string | null, expirationDate: string | null): SubscriptionType {
  const normalized = (productIdentifier || "").toLowerCase();

  if (normalized.includes("lifetime") || normalized.includes("one_time") || normalized.includes("non_renewing")) {
    return "lifetime";
  }

  if (normalized.includes("annual") || normalized.includes("year") || normalized.includes("$rc_annual")) {
    return "annual";
  }

  if (normalized.includes("month") || normalized.includes("$rc_monthly")) {
    return "monthly";
  }

  if (!expirationDate) return "lifetime";

  return "plus_unknown";
}

export function formatBillingDate(date: string | null) {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export function getSubscriptionDisplayState(status: PremiumStatus | null, fallbackIsPlus = false): SubscriptionDisplayState {
  const entitlement = readActiveEntitlement(status);
  const isPlus = Boolean(status?.isPremium || fallbackIsPlus);
  const productIdentifier = readString(entitlement, [
    "productIdentifier",
    "product_identifier",
    "productId",
    "product_id",
    "identifier",
    "packageIdentifier",
  ]);
  const expirationDate = readString(entitlement, [
    "expirationDate",
    "expiration_date",
    "expiresDate",
    "expires_date",
  ]);

  if (!isPlus) {
    return {
      billingDateLabel: null,
      expirationDate: null,
      isPlus: false,
      managementURL: status?.managementURL || null,
      planLabel: "Plan: Free Tier",
      productIdentifier,
      subscriptionType: "free",
      subscriptionTypeLabel: "Free Tier",
    };
  }

  const subscriptionType = inferSubscriptionType(productIdentifier, expirationDate);
  const formattedDate = formatBillingDate(expirationDate);
  const billingDateLabel = subscriptionType === "lifetime"
    ? "Lifetime Access - Never Expires"
    : subscriptionType === "annual" && formattedDate
      ? `Renews on ${formattedDate}`
      : subscriptionType === "monthly" && formattedDate
        ? `Next billing on ${formattedDate}`
        : formattedDate
          ? `Active through ${formattedDate}`
          : null;

  const subscriptionTypeLabel = subscriptionType === "annual"
    ? "Annual"
    : subscriptionType === "monthly"
      ? "Monthly"
      : subscriptionType === "lifetime"
        ? "Lifetime"
        : "Plus";

  return {
    billingDateLabel,
    expirationDate,
    isPlus: true,
    managementURL: status?.managementURL || null,
    planLabel: "Plan: DomiVault Plus",
    productIdentifier,
    subscriptionType,
    subscriptionTypeLabel,
  };
}
