import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--t1)",
        fontFamily: "var(--f)",
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
      }}
    >
      {/* Left — form */}
      <div style={{ display: "flex", flexDirection: "column", padding: "32px 48px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,var(--acc),var(--cyan))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 20 20" width={14} height={14}><path d="M4 4 L16 10 L4 16 Z" fill="#070910" /></svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.5px" }}>
            Cine<em style={{ color: "var(--acc)", fontStyle: "normal" }}>AI</em>
          </span>
        </Link>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>{children}</div>
        </div>

        <div style={{ fontSize: 11, color: "var(--t4)", textAlign: "center" }}>
          © {new Date().getFullYear()} CineAI · <Link href="/" style={{ color: "var(--t3)" }}>Terms</Link> · <Link href="/" style={{ color: "var(--t3)" }}>Privacy</Link>
        </div>
      </div>

      {/* Right — marketing panel */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg,rgba(184,255,62,.04),rgba(62,232,255,.03))",
          borderLeft: "1px solid var(--b1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 64px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(184,255,62,.12),transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -100,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(62,232,255,.08),transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: 440 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: "rgba(184,255,62,.08)", border: "1px solid rgba(184,255,62,.2)", fontSize: 10, fontWeight: 700, color: "var(--acc)", letterSpacing: ".5px", marginBottom: 20 }}>
            ⚡ 2,847 CREATORS THIS WEEK
          </div>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.1, margin: "0 0 16px" }}>
            The fastest way<br />to make<br />
            <span style={{ color: "var(--acc)" }}>cinematic AI</span>.
          </h2>
          <p style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.6, marginBottom: 32 }}>
            7 world-class models. One prompt bar. No GPU to babysit. Ship your vision in minutes, not weeks.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "6,000 credits on every Pro trial",
              "4K Ultra output, 60fps",
              "No watermark, full commercial license",
              "Cancel any time — no lock-in",
            ].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--t2)" }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, background: "rgba(184,255,62,.15)", border: "1px solid rgba(184,255,62,.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" width={10} height={10} fill="none" stroke="var(--acc)" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
