import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { DomiVaultUserProvider } from "@/components/auth/domivault-user-provider";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="/theme-init.js" />
      </head>
      <body>
        <ThemeProvider>
          <DomiVaultUserProvider>{children}</DomiVaultUserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
