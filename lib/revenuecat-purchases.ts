"use client";

import {
  ErrorCode,
  LogLevel,
  Purchases,
  PurchasesError,
  type CustomerInfo,
  type Offering,
  type Offerings,
  type Package,
  type PurchaseResult,
} from "@revenuecat/purchases-js";

const anonymousAppUserIdStorageKey = "domivault-revenuecat-anonymous-app-user-id";
const fallbackTestApiKey = "test_xOKlmUuGRPMTjxxslhKaIbgdwEa";

export const revenueCatConfig = {
  apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || (process.env.NODE_ENV === "development" ? fallbackTestApiKey : ""),
  entitlementId: process.env.NEXT_PUBLIC_REVENUECAT_ENTITLEMENT_ID || "premium_access",
};

type ConfigureRevenueCatOptions = {
  appUserId?: string | null;
  email?: string | null;
};

export type PremiumStatus = {
  appUserId: string;
  customerInfo: CustomerInfo;
  entitlementId: string;
  isPremium: boolean;
  managementURL: string | null;
};

export type RevenueCatOfferingState = {
  offerings: Offerings;
  currentOffering: Offering | null;
  packages: Package[];
};

export type RevenueCatPurchaseState =
  | { ok: true; cancelled: false; result: PurchaseResult; premiumStatus: PremiumStatus }
  | { ok: false; cancelled: true; message: string }
  | { ok: false; cancelled: false; message: string };

function assertBrowser() {
  if (typeof window === "undefined") {
    throw new Error("RevenueCat Purchases JS can only run in the browser.");
  }
}

function getAnonymousAppUserId() {
  assertBrowser();
  const existingId = window.localStorage.getItem(anonymousAppUserIdStorageKey);

  if (existingId) return existingId;

  const nextId = Purchases.generateRevenueCatAnonymousAppUserId();
  window.localStorage.setItem(anonymousAppUserIdStorageKey, nextId);
  return nextId;
}

export function getRevenueCatAppUserId(appUserId?: string | null) {
  return appUserId?.trim() || getAnonymousAppUserId();
}

function normalizeRevenueCatError(error: unknown) {
  if (error instanceof PurchasesError) {
    return {
      cancelled: error.errorCode === ErrorCode.UserCancelledError,
      message: error.message || "RevenueCat purchase failed.",
    };
  }

  if (error && typeof error === "object" && "errorCode" in error) {
    const errorCode = (error as { errorCode?: unknown }).errorCode;
    return {
      cancelled: errorCode === ErrorCode.UserCancelledError,
      message: error instanceof Error ? error.message : "RevenueCat purchase failed.",
    };
  }

  return {
    cancelled: false,
    message: error instanceof Error ? error.message : "RevenueCat purchase failed.",
  };
}

export async function configureRevenueCat({ appUserId, email }: ConfigureRevenueCatOptions = {}) {
  assertBrowser();

  if (!revenueCatConfig.apiKey) {
    throw new Error("DomiVault Plus checkout is not configured yet.");
  }

  const resolvedAppUserId = getRevenueCatAppUserId(appUserId);
  Purchases.setLogLevel(process.env.NODE_ENV === "development" ? LogLevel.Warn : LogLevel.Error);

  const purchases = Purchases.isConfigured()
    ? Purchases.getSharedInstance()
    : Purchases.configure({
      apiKey: revenueCatConfig.apiKey,
      appUserId: resolvedAppUserId,
    });

  if (purchases.getAppUserId() !== resolvedAppUserId) {
    await purchases.identifyUser(resolvedAppUserId);
  }

  if (email) {
    await purchases.setAttributes({ "$email": email }).catch(() => undefined);
  }

  return purchases;
}

export async function checkUserPremiumStatus(options: ConfigureRevenueCatOptions = {}): Promise<PremiumStatus> {
  const purchases = await configureRevenueCat(options);
  const customerInfo = await purchases.getCustomerInfo();
  const entitlement = customerInfo.entitlements.active[revenueCatConfig.entitlementId];

  return {
    appUserId: purchases.getAppUserId(),
    customerInfo,
    entitlementId: revenueCatConfig.entitlementId,
    isPremium: Boolean(entitlement?.isActive),
    managementURL: customerInfo.managementURL,
  };
}

export async function fetchRevenueCatOfferings(options: ConfigureRevenueCatOptions = {}): Promise<RevenueCatOfferingState> {
  const purchases = await configureRevenueCat(options);
  const offerings = await purchases.getOfferings();
  const currentOffering = offerings.current;

  return {
    offerings,
    currentOffering,
    packages: currentOffering?.availablePackages || [],
  };
}

export async function purchaseDomiVaultPlus({
  appUserId,
  email,
  packageToPurchase,
  htmlTarget,
}: ConfigureRevenueCatOptions & {
  packageToPurchase?: Package | null;
  htmlTarget?: HTMLElement | null;
} = {}): Promise<RevenueCatPurchaseState> {
  try {
    const purchases = await configureRevenueCat({ appUserId, email });
    const { packages } = await fetchRevenueCatOfferings({ appUserId, email });
    const selectedPackage = packageToPurchase || packages[0];

    if (!selectedPackage) {
      return {
        ok: false,
        cancelled: false,
        message: "DomiVault Plus checkout is not available yet.",
      };
    }

    const result = await purchases.purchase({
      rcPackage: selectedPackage,
      customerEmail: email || undefined,
      htmlTarget: htmlTarget || undefined,
      skipSuccessPage: true,
      metadata: {
        app: "domivault",
        entitlement: revenueCatConfig.entitlementId,
      },
    });
    const premiumStatus = await checkUserPremiumStatus({ appUserId, email });

    return {
      ok: true,
      cancelled: false,
      result,
      premiumStatus,
    };
  } catch (error) {
    const normalized = normalizeRevenueCatError(error);

    return {
      ok: false,
      cancelled: normalized.cancelled,
      message: normalized.cancelled ? "Purchase canceled." : normalized.message,
    };
  }
}
