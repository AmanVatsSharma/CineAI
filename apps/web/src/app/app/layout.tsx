import type { Metadata } from "next";
import { DashboardLayoutClient } from "./DashboardLayoutClient";

export const metadata: Metadata = {
  title: "Dashboard — CineAI",
  description: "CineAI AI Video Studio dashboard",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
