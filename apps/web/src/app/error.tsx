"use client";

import { useEffect } from "react";

export default function Error({
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
        minHeight: "100vh",
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
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Something went wrong</h1>
      <p style={{ color: "var(--txt2)", marginBottom: 24, textAlign: "center" }}>
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          padding: "12px 24px",
          background: "var(--acc)",
          color: "#000",
          fontWeight: 700,
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
