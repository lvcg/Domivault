import type { Metadata } from "next";
import { LoginPanel } from "@/components/auth/login-panel";

export const metadata: Metadata = {
  title: "Sign In",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function LoginPage() {
  return <LoginPanel />;
}
