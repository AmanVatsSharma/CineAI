"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@cineai/ui";
import { fakeLogin } from "@/lib/fakeAuth";

export default function LoginPage() {
  const router = useRouter();
  return (
    <>
      <AuthForm
        mode="login"
        onSubmit={async ({ email, password }) => {
          await fakeLogin(email, password);
          router.push("/app/dashboard");
        }}
      />
      <p style={{ marginTop: 24, fontSize: 13, color: "var(--t3)", textAlign: "center" }}>
        New to CineAI?{" "}
        <Link href="/signup" style={{ color: "var(--acc)", fontWeight: 600, textDecoration: "none" }}>
          Create an account
        </Link>
      </p>
    </>
  );
}
