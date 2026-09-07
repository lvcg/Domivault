import type { MetadataRoute } from "next";
import { blogArticles } from "@/lib/blog/articles";

const siteUrl = "https://www.domivaultapp.com";

const publicRoutes = [
  {
    path: "/",
    priority: 1,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/plus",
    priority: 0.8,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/blog",
    priority: 0.8,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/faq",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/privacy",
    priority: 0.4,
    changeFrequency: "yearly" as const,
  },
  {
    path: "/terms",
    priority: 0.4,
    changeFrequency: "yearly" as const,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const baseRoutes = publicRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogRoutes = blogArticles.map((article) => ({
    url: `${siteUrl}/blog/${article.slug}`,
    lastModified: new Date(`${article.publishedAt}T00:00:00`),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...baseRoutes, ...blogRoutes];
}
