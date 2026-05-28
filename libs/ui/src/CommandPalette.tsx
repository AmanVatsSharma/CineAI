"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowRight, LayoutDashboard, Wand2, Video, Layers,
  Film, Cpu, Users, BarChart2, CreditCard, Code2, Settings,
} from "lucide-react";

const EASE_OUT = [0, 0, 0.2, 1];

const NAV_SECTIONS = [
  {
    label: "Create",
    items: [
      { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { id: "generate",  icon: Wand2,           label: "Generate" },
      { id: "videos",    icon: Video,            label: "Video Studio" },
      { id: "storyboard",icon: Film,             label: "Storyboard" },
    ],
  },
  {
    label: "Manage",
    items: [
      { id: "models",    icon: Cpu,              label: "AI Models" },
      { id: "library",   icon: Layers,           label: "Asset Library" },
    ],
  },
  {
    label: "Team & Account",
    items: [
      { id: "team",      icon: Users,            label: "Team Workspace" },
      { id: "analytics", icon: BarChart2,        label: "Analytics" },
      { id: "billing",   icon: CreditCard,       label: "Credits & Billing" },
      { id: "api",       icon: Code2,            label: "API & SDKs" },
      { id: "settings",  icon: Settings,         label: "Settings" },
    ],
  },
];

const ALL_ITEMS = NAV_SECTIONS.flatMap((s) =>
  s.items.map((i) => ({ ...i, section: s.label, kw: [i.label, s.label].join(" ").toLowerCase() }))
);

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNav: (id: string) => void;
}

export function CommandPalette({ open, onClose, onNav }: CommandPaletteProps) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQ("");
    }
  }, [open]);

  const items = q ? ALL_ITEMS.filter((i) => i.kw.includes(q.toLowerCase())) : ALL_ITEMS;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          style={{
            position: "fixed", inset: 0, zIndex: 200, display: "flex",
            alignItems: "flex-start", justifyContent: "center",
            paddingTop: "18vh", background: "rgba(7,9,16,0.75)", backdropFilter: "blur(8px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            style={{
              width: "100%", maxWidth: 560, margin: "0 16px", borderRadius: 20,
              overflow: "hidden", background: "var(--surf)", border: "1px solid var(--b2)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
            }}
          >
            {/* Input */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px", borderBottom: "1px solid var(--b1)" }}>
              <Search size={14} color="var(--t3)" style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search pages, studios, actions…"
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontSize: 14, padding: "16px 0", color: "var(--t1)", fontFamily: "var(--f)",
                }}
              />
              <kbd style={{
                fontSize: 10, padding: "2px 6px", borderRadius: 5, background: "var(--surf3)",
                color: "var(--t3)", border: "1px solid var(--b1)", fontFamily: "var(--font-mono)",
              }}>ESC</kbd>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 380, overflowY: "auto", padding: "8px 0", scrollbarWidth: "none" }}>
              {!q && (
                <div style={{ padding: "4px 20px 6px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--t4)", fontFamily: "var(--f)" }}>
                    Quick navigation
                  </div>
                </div>
              )}
              {items.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 0", gap: 8 }}>
                  <Search size={22} color="var(--t4)" />
                  <span style={{ fontSize: 13, color: "var(--t3)", fontFamily: "var(--f)" }}>No results for &ldquo;{q}&rdquo;</span>
                </div>
              )}
              {items.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025 }}
                  onClick={() => { onNav(item.id); onClose(); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 20px", background: "transparent", border: "none",
                    cursor: "pointer", color: "var(--t2)", transition: "all .12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surf2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center",
                    justifyContent: "center", background: "var(--surf3)", flexShrink: 0,
                  }}>
                    <item.icon size={13} color="var(--t2)" />
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontFamily: "var(--f)", color: "var(--t1)" }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "var(--t4)", fontFamily: "var(--f)" }}>{item.section}</div>
                  </div>
                  <ArrowRight size={12} color="var(--t4)" />
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", gap: 16, padding: "10px 20px", borderTop: "1px solid var(--b1)" }}>
              {[["↑↓", "Navigate"], ["⏎", "Open"], ["ESC", "Close"]].map(([k, l]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <kbd style={{ fontSize: 10, padding: "1px 6px", borderRadius: 5, background: "var(--surf3)", color: "var(--t3)", border: "1px solid var(--b1)", fontFamily: "var(--font-mono)" }}>{k}</kbd>
                  <span style={{ fontSize: 11, color: "var(--t4)", fontFamily: "var(--f)" }}>{l}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
