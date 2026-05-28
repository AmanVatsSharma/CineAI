"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Wand2, Video, Film, Cpu, Layers,
  Users, BarChart2, CreditCard, Code2, Settings,
  Search, Bell, Plus, Zap,
} from "lucide-react";
import { NAV, PAGE_TITLES, STUB_PAGES } from "@cineai/mock-data";
import { Icons, Toast, GenerateModal, CreditBar, CommandPalette, NotificationPanel } from "@cineai/ui";
import { DashboardProvider, useDashboard } from "./DashboardContext";

const SPRING_SLOW = { type: "spring", stiffness: 200, damping: 28 };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  dashboard: LayoutDashboard, generate: Wand2, videos: Video,
  storyboard: Film, models: Cpu, library: Layers,
  team: Users, analytics: BarChart2, billing: CreditCard,
  api: Code2, settings: Settings,
};

const ROUTE_MAP: Record<string, string> = {
  dashboard: "/app/dashboard",
  generate:  "/app/generate",
  videos:    "/app/videos",
  storyboard:"/app/storyboard",
  models:    "/app/models",
  settings:  "/app/settings",
};

function pathnameToPageId(pathname: string | null): string {
  if (!pathname) return "dashboard";
  const segment = pathname.replace(/^\/app\/?/, "") || "dashboard";
  return segment.split("/")[0] ?? "dashboard";
}

function SidebarAndMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pageId = pathnameToPageId(pathname);
  const {
    showToast, showModal, toast, setToast,
    showGenerateModal, setShowGenerateModal,
    showCmd, setShowCmd,
    notifications, showNotifPanel, setShowNotifPanel,
    markNotifRead, markAllRead, unreadCount,
  } = useDashboard();

  const title = (PAGE_TITLES as Record<string, string>)[pageId] ?? "Dashboard";

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCmd(true);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [setShowCmd]);

  const handleNav = useCallback(
    (id: string) => {
      if (STUB_PAGES.includes(id)) {
        showToast(`${(PAGE_TITLES as Record<string, string>)[id] ?? id} — coming soon! 🚧`, "var(--vio)");
        return;
      }
      const href = ROUTE_MAP[id];
      if (href) router.push(href);
    },
    [showToast, router]
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="app">
      {/* ─── Sidebar ─── */}
      <motion.aside
        className="sidebar"
        animate={{ width: 240, minWidth: 240 }}
        transition={SPRING_SLOW}
        style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative", zIndex: 20, flexShrink: 0 }}
      >
        {/* ambient right-edge glow */}
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 1, pointerEvents: "none", background: "linear-gradient(to bottom,transparent,rgba(184,255,62,.12) 40%,transparent)" }} />

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <motion.div
            whileHover={{ opacity: 0.85 }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 18px", borderBottom: "1px solid var(--b1)", minHeight: 60 }}
          >
            <motion.div
              style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,var(--acc),var(--cyan))", display: "flex", alignItems: "center", justifyContent: "center" }}
              animate={{ boxShadow: ["0 0 0 0 rgba(184,255,62,0)", "0 0 20px 2px rgba(184,255,62,0.3)", "0 0 0 0 rgba(184,255,62,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <svg viewBox="0 0 20 20" fill="none" width={14} height={14}>
                <path d="M4 4 L16 10 L4 16 Z" fill="#070910" />
              </svg>
            </motion.div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, minWidth: 0 }}>
              <span className="logo-text">Cine<em>AI</em></span>
              <span className="logo-ver">v2.6</span>
            </div>
          </motion.div>
        </Link>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 0", scrollbarWidth: "none" }}>
          {NAV.map((group) => (
            <div key={group.group} style={{ marginBottom: 4 }}>
              <div style={{ padding: "10px 18px 4px", fontSize: 9.5, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--t4)", fontFamily: "var(--f)" }}>
                {group.group}
              </div>
              {group.items.map((item) => {
                const href = ROUTE_MAP[item.id];
                const isStub = STUB_PAGES.includes(item.id);
                const isActive = pageId === item.id;
                const NavIcon = ICON_MAP[item.id] ?? LayoutDashboard;

                const inner = (
                  <>
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="nav-pip"
                          style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: "60%", background: "var(--acc)", borderRadius: "0 3px 3px 0" }}
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                    </AnimatePresence>
                    <NavIcon size={15} color={isActive ? "var(--acc)" : "var(--t2)"} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />
                    <span style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: isActive ? 600 : 400, color: isActive ? "var(--acc)" : "var(--t2)" }}>
                      {item.label}
                    </span>
                    {item.badge && <span className={`nb ${item.badgeCls}`}>{item.badge}</span>}
                  </>
                );

                if (isStub) {
                  return (
                    <motion.div
                      key={item.id}
                      className={`nav-item${isActive ? " active" : ""}`}
                      whileHover={{ background: "var(--surf2)" }}
                      onClick={() => handleNav(item.id)}
                      role="button" tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleNav(item.id)}
                      style={{ position: "relative" }}
                    >
                      {inner}
                    </motion.div>
                  );
                }
                return (
                  <Link
                    key={item.id}
                    href={href ?? "/app/dashboard"}
                    className={`nav-item${isActive ? " active" : ""}`}
                    style={{ position: "relative" }}
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Credit widget */}
        <div style={{ margin: "0 10px 10px", borderRadius: 12, padding: 12, background: "linear-gradient(135deg,rgba(184,255,62,.06),rgba(62,232,255,.1))", border: "1px solid rgba(184,255,62,.2)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Zap size={11} color="var(--acc)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--acc)", fontFamily: "var(--f)" }}>Credits</span>
            </div>
            <span style={{ fontSize: 10, color: "var(--t2)", fontFamily: "var(--font-mono)" }}>3,720 / 6,000</span>
          </div>
          <CreditBar used={3720} total={6000} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--f)" }}>Resets in 18 days</span>
            <button style={{ fontSize: 10, fontWeight: 700, color: "var(--acc)", fontFamily: "var(--f)", background: "none", border: "none", cursor: "pointer" }}>Top up</button>
          </div>
        </div>

        {/* User row */}
        <div className="sidebar-bot">
          <Link href="/app/settings" className="user-row" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="ava">AV</div>
            <div className="user-meta">
              <div className="u-name">Aman Vedpragya</div>
              <div className="u-plan">Pro · Apr 2026</div>
            </div>
            {Icons.chevRight}
          </Link>
        </div>
      </motion.aside>

      {/* ─── Main ─── */}
      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{title}</div>
            <div className="topbar-sub">{today}</div>
          </div>

          <div className="topbar-r">
            {/* ⌘K search trigger */}
            <motion.button
              onClick={() => setShowCmd(true)}
              whileHover={{ borderColor: "var(--b2)" }} whileTap={{ scale: 0.98 }}
              className="srch"
              style={{ background: "var(--surf2)", border: "1px solid var(--b1)", borderRadius: 10, cursor: "pointer", minWidth: 200, display: "flex", alignItems: "center", gap: 8, padding: "7px 12px" }}
            >
              <Search size={12} color="var(--t3)" />
              <span style={{ fontSize: 12, fontFamily: "var(--f)", flex: 1, textAlign: "left", color: "var(--t3)" }}>Search anything…</span>
              <span className="kbd">⌘K</span>
            </motion.button>

            {/* Notifications */}
            <motion.button
              onClick={() => setShowNotifPanel(true)}
              whileHover={{ borderColor: "var(--b2)" }} whileTap={{ scale: 0.95 }}
              className="ibtn"
              aria-label="Notifications"
              style={{ position: "relative" }}
            >
              {Icons.bell}
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="notif-dot"
                />
              )}
            </motion.button>

            {/* Create */}
            <motion.button
              className="btn-cta"
              onClick={showModal}
              whileHover={{ y: -1, boxShadow: "0 6px 20px rgba(184,255,62,.35)" }}
              whileTap={{ scale: 0.97 }}
            >
              {Icons.plus} New Video
            </motion.button>
          </div>
        </header>

        <div className="scroll">{children}</div>
      </div>

      {/* ─── Global overlays ─── */}
      <CommandPalette open={showCmd} onClose={() => setShowCmd(false)} onNav={handleNav} />

      <NotificationPanel
        open={showNotifPanel}
        onClose={() => setShowNotifPanel(false)}
        notifs={notifications}
        onMarkRead={markNotifRead}
        onMarkAllRead={markAllRead}
      />

      {showGenerateModal && (
        <GenerateModal
          onClose={() => setShowGenerateModal(false)}
          onGenerate={(p) => {
            if (p.trim()) showToast("Generation queued! 🎬", "var(--acc)");
            else showToast("Please enter a prompt", "var(--rose)");
            setShowGenerateModal(false);
          }}
        />
      )}

      {toast && (
        <Toast key={toast.id} msg={toast.msg} color={toast.color} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <SidebarAndMain>{children}</SidebarAndMain>
    </DashboardProvider>
  );
}
