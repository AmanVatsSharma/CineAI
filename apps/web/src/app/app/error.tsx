"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--bg)",
        color: "var(--txt)",
        fontFamily: "var(--f)",
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Dashboard error</h2>
      <p style={{ color: "var(--txt2)", marginBottom: 20, textAlign: "center", fontSize: 14 }}>
        {error.message || "Something went wrong."}
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "10px 20px",
            background: "var(--acc)",
            color: "#000",
            fontWeight: 600,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <Link
          href="/app/dashboard"
          style={{
            padding: "10px 20px",
            background: "var(--surf2)",
            color: "var(--txt)",
            fontWeight: 600,
            border: "1px solid var(--b1)",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
