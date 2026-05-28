"use client";

import dynamic from "next/dynamic";
import type { ReactElement } from "react";

const LandingPage = dynamic(
  () => import("@/components/landing/LandingPage").then((m) => m.default),
  { ssr: false }
);

export default function HomePage(): ReactElement {
  return <LandingPage />;
}
