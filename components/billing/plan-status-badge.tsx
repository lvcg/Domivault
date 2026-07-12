"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type PlanStatusBadgeProps = {
  isLoading?: boolean;
  isPlusUser: boolean;
};

export function PlanStatusBadge({ isLoading = false, isPlusUser }: PlanStatusBadgeProps) {
  if (isLoading) {
    return (
      <span className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-white/80 px-3 text-xs font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
        Checking plan...
      </span>
    );
  }

  if (isPlusUser) {
    return (
      <span className="inline-flex h-8 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
        <Sparkles className="h-3.5 w-3.5" />
        DomiVault Plus
      </span>
    );
  }

  return (
    <Link
      href="/plus"
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        "dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100",
      )}
    >
      Upgrade to Plus
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}
