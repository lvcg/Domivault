"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { PlanTier } from "@/types/homey";

type DomiVaultUserContextValue = {
  isLoading: boolean;
  isPlusUser: boolean;
  planTier: PlanTier;
  refreshUserState: () => Promise<void>;
  user: User | null;
};

const plusEntitlementStorageKey = "domivault-plus-entitlement-active";
const plusEntitlementEvent = "domivault-plus-entitlement-updated";
const DomiVaultUserContext = createContext<DomiVaultUserContextValue | null>(null);

function hasClientPlusSignal() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(plusEntitlementStorageKey) === "true";
}

export function DomiVaultUserProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [planTier, setPlanTier] = useState<PlanTier>("free");
  const [user, setUser] = useState<User | null>(null);

  const refreshUserState = useCallback(async () => {
    if (!supabase) {
      setPlanTier(hasClientPlusSignal() ? "vault_plus" : "free");
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const activeUser = sessionData.session?.user || null;
    setUser(activeUser);

    if (!activeUser) {
      setPlanTier(hasClientPlusSignal() ? "vault_plus" : "free");
      setIsLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("plan_tier")
      .eq("id", activeUser.id)
      .maybeSingle();

    const syncedPlanTier = data?.plan_tier as PlanTier | null;
    setPlanTier(syncedPlanTier === "vault_plus" ? "vault_plus" : "free");
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    refreshUserState();

    const handlePlanSignal = (event: Event) => {
      if ("detail" in event && typeof event.detail === "object" && event.detail) {
        const { isPremium } = event.detail as { isPremium?: boolean };

        if (typeof isPremium === "boolean") {
          setPlanTier(isPremium ? "vault_plus" : "free");
          setIsLoading(false);
          return;
        }
      }

      refreshUserState();
    };
    window.addEventListener(plusEntitlementEvent, handlePlanSignal);
    window.addEventListener("storage", handlePlanSignal);

    const authListener = supabase?.auth.onAuthStateChange(() => {
      refreshUserState();
    });

    return () => {
      window.removeEventListener(plusEntitlementEvent, handlePlanSignal);
      window.removeEventListener("storage", handlePlanSignal);
      authListener?.data.subscription.unsubscribe();
    };
  }, [refreshUserState, supabase]);

  const value = useMemo<DomiVaultUserContextValue>(() => ({
    isLoading,
    isPlusUser: planTier === "vault_plus",
    planTier,
    refreshUserState,
    user,
  }), [isLoading, planTier, refreshUserState, user]);

  return (
    <DomiVaultUserContext.Provider value={value}>
      {children}
    </DomiVaultUserContext.Provider>
  );
}

export function useDomiVaultUser() {
  const context = useContext(DomiVaultUserContext);

  if (!context) {
    throw new Error("useDomiVaultUser must be used inside DomiVaultUserProvider.");
  }

  return context;
}
