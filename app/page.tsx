import type { Metadata } from "next";
import HomePageClient from "./home-page-client";

const siteUrl = "https://www.domivaultapp.com";

export const metadata: Metadata = {
  title: "DomiVault | Home Command Center and Records Vault",
  description:
    "DomiVault helps homeowners organize expenses, receipts, warranties, appliances, maintenance tasks, vendors, vehicle service records, and documents in one secure home records vault.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "DomiVault | Home Command Center and Records Vault",
    description:
      "Track home expenses, receipts, warranties, maintenance, appliances, vendors, vehicles, and reports in one secure records vault.",
    url: siteUrl,
    siteName: "DomiVault",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DomiVault | Home Command Center and Records Vault",
    description:
      "A secure home command center for expenses, receipts, warranties, maintenance, vendors, vehicles, and records.",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
