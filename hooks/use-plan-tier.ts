"use client";

import { useDomiVaultUser } from "@/components/auth/domivault-user-provider";

export function usePlanTier() {
  const { isLoading, isPlusUser, planTier } = useDomiVaultUser();

  return {
    isLoading,
    isPlus: isPlusUser,
    planTier,
  };
}
