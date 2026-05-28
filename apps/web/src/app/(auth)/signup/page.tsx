"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@cineai/ui";
import { fakeSignup } from "@/lib/fakeAuth";

export default function SignupPage() {
  const router = useRouter();
  return (
    <>
      <AuthForm
        mode="signup"
        onSubmit={async ({ name, email, password }) => {
          await fakeSignup(name ?? "", email, password);
          router.push("/app/dashboard");
        }}
      />
      <p style={{ marginTop: 24, fontSize: 13, color: "var(--t3)", textAlign: "center" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--acc)", fontWeight: 600, textDecoration: "none" }}>
          Log in
        </Link>
      </p>
    </>
  );
}
