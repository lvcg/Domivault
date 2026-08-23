import type { MetadataRoute } from "next";

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

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
