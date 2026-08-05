"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Car, ClipboardList, FileQuestion, FileText, Gauge, Home, LogIn, LogOut, Menu, Refrigerator, ReceiptText, ScanLine, Settings, ShieldCheck, Sparkles, UsersRound, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatTimestamp } from "@/lib/utils";
import { useDomiVaultUser } from "@/components/auth/domivault-user-provider";
import { LockedFeatureBadge } from "@/components/billing/feature-gate";
import { PlanStatusBadge } from "@/components/billing/plan-status-badge";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Project Planner", href: "/projects", icon: ClipboardList },
  { label: "Expenses", href: "/expenses", icon: ReceiptText },
  { label: "Maintenance", href: "/maintenance", icon: CalendarCheck },
  { label: "Appliances", href: "/appliances", icon: Refrigerator },
  { label: "Vehicles", href: "/vehicles", icon: Car, plus: true },
  { label: "Vendors", href: "/vendors", icon: UsersRound },
  { label: "Scanner", href: "/scanner", icon: ScanLine, plus: true },
  { label: "Reports", href: "/reports", icon: FileText, plus: true },
  { label: "DomiVault Plus", href: "/plus", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "FAQ", href: "/faq", icon: FileQuestion },
  { label: "Login / Signup", href: "/login", icon: LogIn },
];

type ShellProfileRow = {
  full_name?: string | null;
  notification_email?: string | null;
  settings_saved_at?: string | null;
  updated_at?: string | null;
};

function getStoredProfile() {
  if (typeof window === "undefined") {
    return { username: "there", lastSavedAt: null as string | null };
  }

  try {
    const localSettings = window.localStorage.getItem("homey-settings");
    if (!localSettings) return { username: "there", lastSavedAt: null as string | null };
    const parsed = JSON.parse(localSettings) as { username?: string; fullName?: string; email?: string; savedAt?: string };
    return {
      username: formatUsername(parsed.username || parsed.fullName || parsed.email),
      lastSavedAt: parsed.savedAt || null,
    };
  } catch {
    return { username: "there", lastSavedAt: null as string | null };
  }
}

function formatUsername(nameOrEmail?: string | null) {
  if (!nameOrEmail) return "there";
  const cleaned = nameOrEmail.includes("@") ? nameOrEmail.split("@")[0] : nameOrEmail;
  const username = cleaned.trim();
  return username || "there";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();
  const { isLoading: isPlanLoading, isPlusUser } = useDomiVaultUser();
  const initialProfile = useMemo(getStoredProfile, []);
  const [username, setUsername] = useState(initialProfile.username);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialProfile.lastSavedAt);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleSettingsSaved = (event: Event) => {
      const detail = (event as CustomEvent<{ username?: string; email?: string; savedAt?: string }>).detail;
      setUsername(formatUsername(detail?.username || detail?.email));
      setLastSavedAt(detail?.savedAt || new Date().toISOString());
    };

    window.addEventListener("homey-settings-saved", handleSettingsSaved);

    if (!supabase) {
      return () => window.removeEventListener("homey-settings-saved", handleSettingsSaved);
    }

    const client = supabase;
    let isMounted = true;

    async function loadProfile() {
      const { data: sessionData } = await client.auth.getSession();
      const activeUser = sessionData.session?.user;
      setIsSignedIn(Boolean(activeUser));
      if (!activeUser || !isMounted) return;

      const profileResult = await client
        .from("profiles")
        .select("full_name,notification_email,settings_saved_at,updated_at")
        .eq("id", activeUser.id)
        .maybeSingle();
      let data = profileResult.data as ShellProfileRow | null;

      if (!data) {
        const fallback = await client
          .from("profiles")
          .select("full_name")
          .eq("id", activeUser.id)
          .maybeSingle();
        data = fallback.data as ShellProfileRow | null;
      }

      if (!isMounted) return;

      const profile = data;
      const storedProfile = getStoredProfile();
      const storedUsername = storedProfile.username === "there" ? "" : storedProfile.username;
      const displaySource = profile?.full_name || storedUsername || activeUser.user_metadata?.username || activeUser.user_metadata?.full_name || activeUser.user_metadata?.name || profile?.notification_email || activeUser.email;
      setUsername(formatUsername(displaySource));
      setLastSavedAt(profile?.settings_saved_at || profile?.updated_at || null);
    }

    loadProfile();

    return () => {
      isMounted = false;
      window.removeEventListener("homey-settings-saved", handleSettingsSaved);
    };
  }, [supabase]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsSignedIn(false);
    window.location.href = "/login";
  };

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  const visibleNavigation = navigation.filter((item) => (isSignedIn ? item.href !== "/login" : true));
  const bottomNavigation = visibleNavigation.filter((item) => ["/dashboard", "/expenses", "/maintenance", "/settings"].includes(item.href));

  // Shared renderer keeps desktop sidebar and mobile drawer behavior in sync.
  const renderNavigation = (onNavigate?: () => void) => (
    <nav className="grid gap-2">
      {visibleNavigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`group flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${
              isActive
                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                : "text-slate-600 hover:bg-slate-950 hover:text-white dark:text-slate-300 dark:hover:bg-white dark:hover:text-slate-950"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.plus && !isPlusUser && <LockedFeatureBadge className="group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white dark:group-hover:border-slate-900/20 dark:group-hover:bg-slate-950/10 dark:group-hover:text-slate-950" />}
          </Link>
        );
      })}
      {isSignedIn && (
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            handleLogout();
          }}
          className="group flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-rose-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-rose-500/20 dark:text-slate-300"
        >
          <LogOut className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          Logout
        </button>
      )}
    </nav>
  );

  return (
    <div className="safe-app-shell">
      {/* Mobile shell: sticky safe-area header plus drawer avoids squeezing the desktop sidebar onto phones. */}
      <div className="sticky top-0 z-40 -mx-2 mb-3 rounded-b-3xl border border-white/70 bg-white/90 px-3 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3 rounded-2xl text-slate-950 dark:text-white">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <Home className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold">DomiVault</span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">Home command center</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen((current) => !current)}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/10 dark:text-white"
          >
            {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="DomiVault navigation">
          <button className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" aria-label="Close navigation" type="button" onClick={() => setIsMobileNavOpen(false)} />
          <aside className="absolute bottom-0 left-0 right-0 max-h-[min(86dvh,740px)] overflow-y-auto rounded-t-[1.75rem] border border-white/70 bg-white p-4 shadow-glass dark:border-white/10 dark:bg-slate-950">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Menu</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Navigate DomiVault</p>
              </div>
              <button type="button" aria-label="Close navigation" onClick={() => setIsMobileNavOpen(false)} className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 dark:border-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderNavigation(() => setIsMobileNavOpen(false))}
          </aside>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] lg:block">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-3xl bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 text-slate-950">
              <Home className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">DomiVault</span>
              <span className="text-xs text-white/60 dark:text-slate-500">Home and vehicle vault</span>
            </span>
          </Link>

          <div className="mt-6">{renderNavigation()}</div>

          <div className="mt-8 rounded-3xl border border-emerald-200/80 bg-emerald-50/80 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="font-semibold">Your records stay yours</p>
            <p className="mt-1 leading-6 opacity-80">DomiVault keeps your home, vehicle, expense, and document records tied to your secure account.</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/privacy" className="hover:text-slate-950 dark:hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-950 dark:hover:text-white">Terms</Link>
          </div>
        </aside>

        <main className="min-w-0 rounded-[1.5rem] border border-white/70 bg-white/70 p-3 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-6 lg:rounded-[2rem]">
          <header className="mb-5 flex flex-col justify-between gap-4 border-b border-slate-200/70 pb-5 dark:border-white/10 sm:flex-row sm:items-center lg:mb-6 lg:pb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">Home command center</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 suppressHydrationWarning className="responsive-page-title break-words font-semibold tracking-tight text-slate-950 dark:text-white">{username}</h1>
                <PlanStatusBadge isLoading={isPlanLoading} isPlusUser={isPlusUser} />
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Stay ahead of your home&apos;s costs, upkeep, and next priorities.
                <span className="mt-1 block font-medium text-slate-700 dark:text-slate-300">Last saved: {formatTimestamp(lastSavedAt)}</span>
              </p>
            </div>
            <Link href="/settings" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </header>
          {children}
        </main>
      </div>

      {/* Four-item bottom nav gives one-thumb access to core workflows without horizontal overflow. */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-white/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 lg:hidden" aria-label="Quick navigation">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[0.68rem] font-semibold transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${
                  isActive ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-500 dark:text-slate-300"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="max-w-full truncate">{item.label.replace("Project Planner", "Projects")}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
