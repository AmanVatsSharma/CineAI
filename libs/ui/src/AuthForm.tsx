"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2 } from "lucide-react";

type Mode = "login" | "signup";

interface Props {
  mode: Mode;
  onSubmit: (data: { name?: string; email: string; password: string }) => Promise<void>;
}

export function AuthForm({ mode, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email.includes("@")) return setErr("Enter a valid email.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    if (mode === "signup" && !name.trim()) return setErr("Name is required.");
    setBusy(true);
    try {
      await onSubmit({ name, email, password });
    } catch (e) {
      setErr((e as Error).message ?? "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 6px" }}>
          {mode === "login" ? "Welcome back." : "Create your account."}
        </h1>
        <p style={{ fontSize: 13, color: "var(--t3)", margin: 0 }}>
          {mode === "login" ? "Log in to continue your work." : "Start your 14-day Pro trial — no card required."}
        </p>
      </div>

      {mode === "signup" && (
        <Field icon={User} label="Full name" value={name} onChange={setName} placeholder="Aman Vedpragya" />
      )}
      <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@studio.com" />
      <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

      {err && (
        <div style={{ fontSize: 12, color: "var(--rose)", padding: "8px 12px", borderRadius: 8, background: "rgba(255,90,120,.08)", border: "1px solid rgba(255,90,120,.2)" }}>
          {err}
        </div>
      )}

      <motion.button
        type="submit"
        disabled={busy}
        whileHover={{ y: busy ? 0 : -1 }}
        whileTap={{ scale: busy ? 1 : 0.98 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginTop: 4,
          padding: "12px 16px",
          borderRadius: 10,
          background: busy ? "var(--surf3)" : "var(--acc)",
          color: busy ? "var(--t3)" : "#070910",
          border: "none",
          fontWeight: 700,
          fontSize: 14,
          cursor: busy ? "wait" : "pointer",
          fontFamily: "var(--f)",
        }}
      >
        {busy && <Loader2 size={14} className="spin" />}
        {mode === "login" ? (busy ? "Signing in…" : "Log in") : busy ? "Creating account…" : "Create account"}
      </motion.button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--b1)" }} />
        <span style={{ fontSize: 10, color: "var(--t4)", letterSpacing: ".5px", fontWeight: 600 }}>OR CONTINUE WITH</span>
        <div style={{ flex: 1, height: 1, background: "var(--b1)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { name: "Google", svg: <GoogleIcon /> },
          { name: "GitHub", svg: <GithubIcon /> },
        ].map((p) => (
          <button
            key={p.name}
            type="button"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "var(--surf2)", border: "1px solid var(--b1)", color: "var(--t1)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--f)" }}
          >
            {p.svg} {p.name}
          </button>
        ))}
      </div>

      <style>{`.spin { animation: authspin 1s linear infinite; } @keyframes authspin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", letterSpacing: ".5px", textTransform: "uppercase" }}>{label}</span>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Icon size={14} color="var(--t3)" />
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "11px 14px 11px 36px",
            borderRadius: 10,
            background: "var(--surf2)",
            border: "1px solid var(--b1)",
            color: "var(--t1)",
            fontSize: 13,
            fontFamily: "var(--f)",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--acc)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--b1)")}
        />
      </div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.41 1.02.01 2.04.14 3 .41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22 0 1.61-.02 2.9-.02 3.29 0 .32.22.7.83.58C20.57 22.3 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}
