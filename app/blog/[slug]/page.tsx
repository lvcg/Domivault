import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { blogArticles, getBlogArticle } from "@/lib/blog/articles";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const siteUrl = "https://www.domivaultapp.com";

export function generateStaticParams() {
  return blogArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  const url = `${siteUrl}/blog/${article.slug}`;

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      siteName: "DomiVault",
      type: "article",
      publishedTime: article.publishedAt,
      tags: article.keywords,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function BlogArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 px-[max(1rem,env(safe-area-inset-left))] py-5 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <article className="mx-auto w-full max-w-4xl">
        <nav className="flex min-h-12 flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/8">
          <Link href="/" className="flex min-h-12 items-center gap-3 rounded-2xl pr-3 focus:outline-none focus:ring-2 focus:ring-emerald-400">
            <span className="grid size-11 place-items-center rounded-2xl bg-emerald-950 text-emerald-200 shadow-sm">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold tracking-tight">DomiVault</span>
              <span className="block text-xs font-medium text-slate-700">Home records blog</span>
            </span>
          </Link>
          <Link href="/blog" className="touch-target inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Blog
          </Link>
        </nav>

        <header className="py-12 sm:py-16">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
              {article.category}
            </span>
            <span className="text-sm font-medium text-slate-950">{article.readingTime}</span>
            <time dateTime={article.publishedAt} className="text-sm font-medium text-slate-950">
              {new Date(`${article.publishedAt}T00:00:00`).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
          <h1 className="mt-5 text-[clamp(2.35rem,7vw,4.75rem)] font-semibold leading-[0.98] tracking-tight">{article.title}</h1>
          <p className="mt-6 text-lg leading-8 text-slate-950 sm:text-xl">{article.intro}</p>
        </header>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 text-slate-950 shadow-sm dark:border-slate-200 dark:bg-white dark:text-slate-950 sm:p-8">
          <div className="space-y-10">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{section.heading}</h2>
                <div className="mt-4 space-y-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-8 text-slate-950">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-400/20 dark:bg-emerald-400/10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">Key takeaway</p>
            <p className="mt-3 text-lg font-semibold leading-8 text-slate-950">{article.takeaway}</p>
          </aside>

          <div className="mt-8 flex flex-wrap gap-2">
            {article.keywords.map((keyword) => (
              <span key={keyword} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-950">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
