"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertCircle, Users, Star, Download, Zap } from "lucide-react";

const EASE = [0.4, 0, 0.2, 1];

export interface Notification {
  id: number;
  type: "success" | "warn" | "info" | "error";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const DEFAULT_NOTIFS: Notification[] = [
  { id: 1, type: "success", title: "Video generated!", body: '"Cyberpunk City Rain" is ready — Kling 2.6 · 4K · 8s', time: "2m ago", read: false },
  { id: 2, type: "warn",    title: "Credits at 62%",   body: "You've used 3,720 of 6,000 monthly credits. Top up?", time: "1h ago", read: false },
  { id: 3, type: "info",    title: "Team invite accepted", body: "Priya Nair joined your workspace as Editor.", time: "18m ago", read: false },
  { id: 4, type: "info",    title: "New model available",  body: "Kling 2.6 Pro — 40% better motion physics.", time: "3h ago", read: true },
  { id: 5, type: "success", title: "Export complete",      body: "Campaign pack (12 assets) ready to download.", time: "5h ago", read: true },
  { id: 6, type: "info",    title: "Monthly credits refreshed", body: "Your 6,000 monthly credits have been renewed.", time: "1d ago", read: true },
];

const TYPE_ICON = {
  success: Check,
  warn: AlertCircle,
  info: Users,
  error: AlertCircle,
};

const TYPE_STYLE: Record<string, { bg: string; border: string; dot: string }> = {
  success: { bg: "rgba(184,255,62,.08)", border: "rgba(184,255,62,.25)", dot: "var(--acc)" },
  warn:    { bg: "rgba(255,185,48,.08)", border: "rgba(255,185,48,.25)", dot: "var(--gold)" },
  info:    { bg: "var(--cyan-d)",        border: "rgba(62,232,255,.2)",  dot: "var(--cyan)" },
  error:   { bg: "var(--rose-d)",        border: "rgba(255,94,125,.2)",  dot: "var(--rose)" },
};

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  notifs?: Notification[];
  onMarkRead?: (id: number) => void;
  onMarkAllRead?: () => void;
}

export function NotificationPanel({
  open,
  onClose,
  notifs = DEFAULT_NOTIFS,
  onMarkRead,
  onMarkAllRead,
}: NotificationPanelProps) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 180, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{
              position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 190,
              width: 380, display: "flex", flexDirection: "column",
              background: "var(--surf)", borderLeft: "1px solid var(--b1)",
              boxShadow: "-24px 0 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid var(--b1)", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", fontFamily: "var(--f)" }}>Notifications</div>
                <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--f)" }}>{unread} unread</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {onMarkAllRead && (
                  <button
                    onClick={onMarkAllRead}
                    style={{ fontSize: 11, fontWeight: 600, color: "var(--acc)", fontFamily: "var(--f)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Mark all read
                  </button>
                )}
                <motion.button
                  onClick={onClose} whileHover={{ background: "var(--surf2)" }} whileTap={{ scale: 0.95 }}
                  style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--b1)", cursor: "pointer", color: "var(--t2)" }}
                >
                  <X size={14} />
                </motion.button>
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0", scrollbarWidth: "none" }}>
              {notifs.map((n, i) => {
                const s = TYPE_STYLE[n.type] ?? TYPE_STYLE.info;
                const Icon = TYPE_ICON[n.type] ?? Zap;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => onMarkRead?.(n.id)}
                    whileHover={{ scale: 1.01 }}
                    style={{
                      margin: "0 12px 8px", borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                      background: n.read ? "var(--surf2)" : s.bg,
                      border: `1px solid ${n.read ? "var(--b1)" : s.border}`,
                      transition: "all .15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: `${s.dot}18`, flexShrink: 0 }}>
                        <Icon size={13} color={s.dot} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--t1)", fontFamily: "var(--f)" }}>{n.title}</span>
                          {!n.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />}
                        </div>
                        <p style={{ fontSize: 11.5, lineHeight: 1.45, color: "var(--t2)", fontFamily: "var(--f)", margin: 0 }}>{n.body}</p>
                        <span style={{ fontSize: 10, color: "var(--t4)", fontFamily: "var(--font-mono)", display: "block", marginTop: 4 }}>{n.time}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--b1)", flexShrink: 0 }}>
              <motion.button
                whileHover={{ borderColor: "var(--b2)" }}
                style={{ width: "100%", padding: "10px 0", borderRadius: 10, fontSize: 12.5, fontWeight: 600, background: "var(--surf2)", color: "var(--t2)", border: "1px solid var(--b1)", fontFamily: "var(--f)", cursor: "pointer" }}
              >
                View all notifications
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
