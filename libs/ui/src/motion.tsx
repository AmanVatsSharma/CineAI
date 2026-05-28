"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const EASE = [0.4, 0, 0.2, 1];

// Animated number counter — counts up from 0 to value on mount
export function Counter({ value, dur = 1.2 }: { value: string; dur?: number }) {
  const [v, setV] = useState("0");
  useEffect(() => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    const sfx = value.slice(value.replace(/[^0-9.]/g, "").length);
    let s = 0;
    const steps = 40;
    const stepMs = (dur * 1000) / steps;
    const t = setInterval(() => {
      s++;
      const p = s / steps;
      const e2 = 1 - Math.pow(1 - p, 3);
      setV(`${Math.round(e2 * num).toLocaleString()}${sfx}`);
      if (s >= steps) clearInterval(t);
    }, stepMs);
    return () => clearInterval(t);
  }, [value, dur]);
  return <>{v}</>;
}

// Scroll-triggered reveal — children fade+slide in when entering viewport
export function Reveal({
  children,
  delay = 0,
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          o.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return (
    <motion.div
      ref={ref}
      style={style}
      initial={{ opacity: 0, y: 14 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.44, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// Animated status dot — green "ping" for online, static for busy/offline/error
export function StatusDot({ status }: { status: "online" | "busy" | "offline" | "error" }) {
  const colors: Record<string, string> = {
    online: "var(--acc)",
    busy: "var(--gold)",
    offline: "var(--t3)",
    error: "var(--rose)",
  };
  const c = colors[status] ?? "var(--t3)";
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8, flexShrink: 0 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "block" }} />
      {status === "online" && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: c,
            opacity: 0.4,
            animation: "ping 1.5s ease infinite",
          }}
        />
      )}
    </span>
  );
}

// Animated credit bar — fills from 0 on mount, turns gold/rose when high usage
export function CreditBar({
  used,
  total,
  color = "var(--acc)",
}: {
  used: number;
  total: number;
  color?: string;
}) {
  const pct = Math.min(100, (used / total) * 100);
  const c = pct > 90 ? "var(--rose)" : pct > 75 ? "var(--gold)" : color;
  return (
    <div style={{ width: "100%", height: 3, borderRadius: 4, background: "var(--surf3)" }}>
      <motion.div
        style={{ height: "100%", borderRadius: 4, background: c }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: [0, 0, 0.2, 1] }}
      />
    </div>
  );
}

// Type badge — color-coded VIDEO / IMAGE / AUDIO / AVATAR / COPY chip
export function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; c: string }> = {
    video: { bg: "var(--cyan-d)", c: "var(--cyan)" },
    image: { bg: "var(--acc-d)", c: "var(--acc)" },
    audio: { bg: "var(--vio-d)", c: "var(--vio)" },
    avatar: { bg: "var(--gold-d)", c: "var(--gold)" },
    copy: { bg: "var(--rose-d)", c: "var(--rose)" },
  };
  const s = map[type?.toLowerCase()] ?? { bg: "rgba(255,255,255,0.05)", c: "var(--t2)" };
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: ".8px",
        textTransform: "uppercase",
        padding: "2px 6px",
        borderRadius: 4,
        background: s.bg,
        color: s.c,
        fontFamily: "var(--font-mono)",
      }}
    >
      {type}
    </span>
  );
}
