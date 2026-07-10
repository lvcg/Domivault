"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Package } from "@revenuecat/purchases-js";
import { createClient } from "@/lib/supabase/client";
import {
  checkUserPremiumStatus,
  fetchRevenueCatOfferings,
  purchaseDomiVaultPlus,
  presentDomiVaultPaywall,
  domiVaultPlusPackageIds,
  type PremiumStatus,
} from "@/lib/revenuecat-purchases";

type RevenueCatPremiumState = {
  appUserId: string | null;
  email: string | null;
  error: string | null;
  isLoading: boolean;
  isPremium: boolean;
  isPurchasing: boolean;
  managementURL: string | null;
  packages: Package[];
  status: PremiumStatus | null;
};

const plusEntitlementStorageKey = "domivault-plus-entitlement-active";
const plusEntitlementEvent = "domivault-plus-entitlement-updated";

export function useRevenueCatPremium() {
  const supabase = useMemo(() => createClient(), []);
  const checkoutTargetRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<RevenueCatPremiumState>({
    appUserId: null,
    email: null,
    error: null,
    isLoading: true,
    isPremium: false,
    isPurchasing: false,
    managementURL: null,
    packages: [],
    status: null,
  });

  const loadRevenueCatState = useCallback(async () => {
    setState((current) => ({ ...current, error: null, isLoading: true }));

    try {
      const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
      const user = data.session?.user;
      const appUserId = user?.id || null;
      const email = user?.email || null;
      const [status, offeringState] = await Promise.all([
        checkUserPremiumStatus({ appUserId, email }),
        fetchRevenueCatOfferings({ appUserId, email }),
      ]);

      setState((current) => ({
        ...current,
        appUserId: status.appUserId,
        email,
        error: null,
        isLoading: false,
        isPremium: status.isPremium,
        managementURL: status.managementURL,
        packages: offeringState.packages,
        status,
      }));

      if (typeof window !== "undefined") {
        if (status.isPremium) {
          window.localStorage.setItem(plusEntitlementStorageKey, "true");
        } else {
          window.localStorage.removeItem(plusEntitlementStorageKey);
        }
        window.dispatchEvent(new CustomEvent(plusEntitlementEvent, { detail: { isPremium: status.isPremium } }));
      }
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Could not load DomiVault Plus status.",
        isLoading: false,
      }));
    }
  }, [supabase]);

  useEffect(() => {
    loadRevenueCatState();
  }, [loadRevenueCatState]);

  const upgrade = useCallback(async (packageToPurchase?: Package | null) => {
    setState((current) => ({ ...current, error: null, isPurchasing: true }));

    const result = await purchaseDomiVaultPlus({
      appUserId: state.appUserId,
      email: state.email,
      htmlTarget: checkoutTargetRef.current,
      packageToPurchase,
    });

    if (!result.ok) {
      setState((current) => ({
        ...current,
        error: result.cancelled ? null : result.message,
        isPurchasing: false,
      }));
      return result;
    }

    setState((current) => ({
      ...current,
      error: null,
      isPremium: result.premiumStatus.isPremium,
      isPurchasing: false,
      managementURL: result.premiumStatus.managementURL,
      status: result.premiumStatus,
    }));

    if (result.premiumStatus.isPremium && typeof window !== "undefined") {
      window.localStorage.setItem(plusEntitlementStorageKey, "true");
      window.dispatchEvent(new CustomEvent(plusEntitlementEvent, { detail: { isPremium: true } }));
    }

    return result;
  }, [state.appUserId, state.email]);

  const openPaywall = useCallback(async () => {
    setState((current) => ({ ...current, error: null, isPurchasing: true }));
    checkoutTargetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const result = await presentDomiVaultPaywall({
      appUserId: state.appUserId,
      email: state.email,
      htmlTarget: checkoutTargetRef.current || document.getElementById("show-paywall-here"),
    });

    if (!result.ok) {
      setState((current) => ({
        ...current,
        error: result.cancelled ? null : result.message,
        isPurchasing: false,
      }));
      return result;
    }

    setState((current) => ({
      ...current,
      error: null,
      isPremium: result.premiumStatus.isPremium,
      isPurchasing: false,
      managementURL: result.premiumStatus.managementURL,
      status: result.premiumStatus,
    }));

    if (result.premiumStatus.isPremium && typeof window !== "undefined") {
      window.localStorage.setItem(plusEntitlementStorageKey, "true");
      window.dispatchEvent(new CustomEvent(plusEntitlementEvent, { detail: { isPremium: true } }));
    }

    return result;
  }, [state.appUserId, state.email]);

  const openManagementPortal = useCallback(() => {
    if (state.managementURL) {
      window.open(state.managementURL, "_blank", "noopener,noreferrer");
    }
  }, [state.managementURL]);

  return {
    ...state,
    checkoutTargetRef,
    monthlyPackage: state.packages.find((item) => item.identifier === domiVaultPlusPackageIds.monthly || item.webBillingProduct.identifier === domiVaultPlusPackageIds.monthly || item.identifier === "$rc_monthly" || /month/i.test(item.identifier)) || state.packages[0] || null,
    annualPackage: state.packages.find((item) => item.identifier === domiVaultPlusPackageIds.yearly || item.webBillingProduct.identifier === domiVaultPlusPackageIds.yearly || item.identifier === "$rc_annual" || /annual|year/i.test(item.identifier)) || null,
    lifetimePackage: state.packages.find((item) => item.identifier === domiVaultPlusPackageIds.lifetime || item.webBillingProduct.identifier === domiVaultPlusPackageIds.lifetime || /lifetime|life|one[-_]?time/i.test(item.identifier)) || null,
    openManagementPortal,
    openPaywall,
    refresh: loadRevenueCatState,
    upgrade,
  };
}
