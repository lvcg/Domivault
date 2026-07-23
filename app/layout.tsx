import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { DomiVaultUserProvider } from "@/components/auth/domivault-user-provider";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";

export const metadata: Metadata = {
  title: "DomiVault | Home and Vehicle Records Vault",
  description: "Secure home, vehicle, receipt, warranty, maintenance, and report vault.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") || undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script nonce={nonce} src="/theme-init.js" />
      </head>
      <body>
        <ThemeProvider>
          <ServiceWorkerRegistration />
          <DomiVaultUserProvider>{children}</DomiVaultUserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
