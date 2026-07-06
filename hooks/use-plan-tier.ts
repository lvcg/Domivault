"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PlanTier } from "@/types/homey";

const plusEntitlementStorageKey = "domivault-plus-entitlement-active";
const plusEntitlementEvent = "domivault-plus-entitlement-updated";

function hasFreshClientPlusSignal() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(plusEntitlementStorageKey) === "true";
}

export function usePlanTier() {
  const supabase = useMemo(() => createClient(), []);
  const [planTier, setPlanTier] = useState<PlanTier>("free");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setPlanTier(hasFreshClientPlusSignal() ? "vault_plus" : "free");
      setIsLoading(false);
      return;
    }

    const client = supabase;
    let isMounted = true;

    async function loadPlan() {
      const { data: sessionData } = await client.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      const { data } = await client
        .from("profiles")
        .select("plan_tier")
        .eq("id", userId)
        .maybeSingle();

      if (!isMounted) return;
      const syncedPlanTier = data?.plan_tier as PlanTier | null;
      setPlanTier(syncedPlanTier === "vault_plus" || hasFreshClientPlusSignal() ? "vault_plus" : "free");
      setIsLoading(false);
    }

    loadPlan();
    const refreshFromClientSignal = () => {
      setPlanTier(hasFreshClientPlusSignal() ? "vault_plus" : "free");
      loadPlan();
    };
    window.addEventListener(plusEntitlementEvent, refreshFromClientSignal);
    window.addEventListener("storage", refreshFromClientSignal);

    return () => {
      isMounted = false;
      window.removeEventListener(plusEntitlementEvent, refreshFromClientSignal);
      window.removeEventListener("storage", refreshFromClientSignal);
    };
  }, [supabase]);

  return {
    isLoading,
    isPlus: planTier === "vault_plus",
    planTier,
  };
}
