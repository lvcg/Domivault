"use client";

import { useCallback, useState } from "react";
import { useDomiVaultUser } from "@/components/auth/domivault-user-provider";
import { canAccessFeature, isPremiumFeature, type FeatureId } from "@/lib/billing/entitlement-gating";

export function useEntitlementGate() {
  const { isLoading, isPlusUser, planTier } = useDomiVaultUser();
  const [blockedFeature, setBlockedFeature] = useState<FeatureId | null>(null);

  const canAccess = useCallback((featureId: FeatureId) => {
    return canAccessFeature(featureId, isPlusUser);
  }, [isPlusUser]);

  const requirePlus = useCallback((featureId: FeatureId) => {
    const allowed = canAccessFeature(featureId, isPlusUser);

    if (!allowed) {
      setBlockedFeature(featureId);
    }

    return allowed;
  }, [isPlusUser]);

  return {
    blockedFeature,
    canAccess,
    clearBlockedFeature: () => setBlockedFeature(null),
    isLoading,
    isPlusUser,
    isPremiumFeature,
    planTier,
    requirePlus,
  };
}
