import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { FAQSection } from "@/components/faq/faq-section";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about DomiVault home records, document storage, exports, privacy, and DomiVault Plus.",
  alternates: {
    canonical: "https://www.domivaultapp.com/faq",
  },
};

export default function FAQPage() {
  return (
    <AppShell>
      <FAQSection />
    </AppShell>
  );
}
