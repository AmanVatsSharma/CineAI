"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Notification } from "@cineai/ui";

type ToastState = { msg: string; color: string; id: number } | null;

const DEFAULT_NOTIFS: Notification[] = [
  { id: 1, type: "success", title: "Video generated!",      body: '"Cyberpunk City Rain" is ready — Kling 2.6 · 4K · 8s',    time: "2m ago",  read: false },
  { id: 2, type: "warn",    title: "Credits at 62%",         body: "You've used 3,720 of 6,000 monthly credits. Top up?",      time: "1h ago",  read: false },
  { id: 3, type: "info",    title: "Team invite accepted",   body: "Priya Nair joined your workspace as Editor.",               time: "18m ago", read: false },
  { id: 4, type: "info",    title: "New model available",    body: "Kling 2.6 Pro — 40% better motion physics.",               time: "3h ago",  read: true  },
  { id: 5, type: "success", title: "Export complete",        body: "Campaign pack (12 assets) ready to download.",             time: "5h ago",  read: true  },
];

interface DashboardContextValue {
  // Toasts
  showToast: (msg: string, color?: string) => void;
  toast: ToastState;
  setToast: (t: ToastState) => void;
  // Generate modal
  showModal: () => void;
  showGenerateModal: boolean;
  setShowGenerateModal: (v: boolean) => void;
  // Command palette
  showCmd: boolean;
  setShowCmd: (v: boolean) => void;
  // Notifications
  notifications: Notification[];
  showNotifPanel: boolean;
  setShowNotifPanel: (v: boolean) => void;
  markNotifRead: (id: number) => void;
  markAllRead: () => void;
  unreadCount: number;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showCmd, setShowCmd] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFS);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const showToast = useCallback((msg: string, color = "var(--acc)") => {
    setToast({ msg, color, id: Date.now() });
  }, []);
  const showModal = useCallback(() => setShowGenerateModal(true), []);
  const markNotifRead = useCallback((id: number) => {
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const markAllRead = useCallback(() => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  }, []);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardContext.Provider
      value={{
        showToast, toast, setToast,
        showModal, showGenerateModal, setShowGenerateModal,
        showCmd, setShowCmd,
        notifications, showNotifPanel, setShowNotifPanel,
        markNotifRead, markAllRead, unreadCount,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
