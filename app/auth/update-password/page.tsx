import type { Metadata } from "next";
import { UpdatePasswordPanel } from "@/components/auth/update-password-panel";

export const metadata: Metadata = {
  title: "Update Password",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordPanel />;
}
