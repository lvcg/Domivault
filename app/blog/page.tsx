import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { blogArticles } from "@/lib/blog/articles";

export const metadata: Metadata = {
  title: "Home Records Blog",
  description:
    "Read DomiVault guides about home maintenance tracking, receipt organization, warranty records, appliance service, home expenses, vendors, and reminders.",
  alternates: {
    canonical: "https://www.domivaultapp.com/blog",
  },
};

export default function BlogPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 px-[max(1rem,env(safe-area-inset-left))] py-5 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-7xl">
        <nav className="flex min-h-12 flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/8">
          <Link href="/" className="flex min-h-12 items-center gap-3 rounded-2xl pr-3 focus:outline-none focus:ring-2 focus:ring-emerald-400">
            <span className="grid size-11 place-items-center rounded-2xl bg-emerald-950 text-emerald-200 shadow-sm">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold tracking-tight">DomiVault</span>
              <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Home records blog</span>
            </span>
          </Link>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2 text-sm font-semibold">
            <Link className="touch-target rounded-full px-4 py-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white" href="/plus">
              Plus
            </Link>
            <Link className="touch-target rounded-full bg-slate-950 px-5 py-2 text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-white dark:text-slate-950 dark:hover:bg-emerald-200" href="/login">
              Sign in
            </Link>
          </div>
        </nav>

        <header className="py-12 sm:py-16">
          <p className="inline-flex min-h-10 items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200">
            DomiVault guides
          </p>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.35rem,7vw,5rem)] font-semibold leading-[0.98] tracking-tight">
            Home maintenance, records, warranties, and repair planning.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Practical guides for homeowners, renters, landlords, and property managers who want clearer records before repairs, claims, resale prep, or maintenance deadlines.
          </p>
        </header>

        <section className="grid gap-4 pb-12 md:grid-cols-2 xl:grid-cols-3">
          {blogArticles.map((article) => (
            <article key={article.slug} className="flex min-h-[22rem] flex-col rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/8">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                  {article.category}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{article.readingTime}</span>
              </div>

              <BookOpen className="mt-7 size-8 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{article.title}</h2>
              <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{article.description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {article.keywords.slice(0, 3).map((keyword) => (
                  <span key={keyword} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 dark:border-white/10 dark:text-slate-400">
                    {keyword}
                  </span>
                ))}
              </div>

              <Link href={`/blog/${article.slug}`} className="mt-auto inline-flex min-h-12 items-center gap-2 rounded-full text-sm font-semibold text-emerald-700 transition-all duration-200 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:text-emerald-200 dark:hover:text-emerald-100">
                Read article
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
