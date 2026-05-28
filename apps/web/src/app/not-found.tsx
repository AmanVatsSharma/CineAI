import Link from "next/link";

export default function NotFound() {
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
      <h1 style={{ fontSize: 72, fontWeight: 800, marginBottom: 8, color: "var(--acc)" }}>404</h1>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Page not found</h2>
      <p style={{ color: "var(--txt2)", marginBottom: 24 }}>The page you’re looking for doesn’t exist.</p>
      <Link
        href="/"
        style={{
          padding: "12px 24px",
          background: "var(--acc)",
          color: "#000",
          fontWeight: 700,
          borderRadius: 10,
          textDecoration: "none",
        }}
      >
        Go home
      </Link>
    </div>
  );
}
