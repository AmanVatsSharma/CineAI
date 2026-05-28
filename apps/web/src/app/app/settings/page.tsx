"use client";

import { useState } from "react";
import { useDashboard } from "../DashboardContext";

type Toggles = Record<string, boolean>;

export default function SettingsPage() {
  const { showToast } = useDashboard();
  const [toggles, setToggles] = useState<Toggles>({
    hq: true,
    autoSave: true,
    email: false,
    darkMode: true,
    api: false,
    analytics: true,
    gpu: true,
    preview: false,
  });

  const toggle = (k: string) => {
    setToggles((p) => ({ ...p, [k]: !p[k] }));
    showToast("Setting updated", "var(--acc)");
  };

  const Toggle = ({ k }: { k: string }) => (
    <button type="button" className={`toggle ${toggles[k] ? "on" : "off"}`} onClick={() => toggle(k)} aria-pressed={toggles[k]}>
      <div className="toggle-knob" />
    </button>
  );

  return (
    <div className="page">
      <div className="settings-grid">
        <div className="sett-section">
          <div className="sett-title">⚙️ Generation Settings</div>
          {[
            { k: "hq", l: "High Quality Mode", s: "Always use maximum quality" },
            { k: "autoSave", l: "Auto-save videos", s: "Save on completion" },
            { k: "preview", l: "Live preview", s: "Frame-by-frame during generation" },
            { k: "gpu", l: "GPU acceleration", s: "Faster rendering" },
          ].map((r) => (
            <div key={r.k} className="sett-row">
              <div><div className="sett-lbl">{r.l}</div><div className="sett-sub">{r.s}</div></div>
              <Toggle k={r.k} />
            </div>
          ))}
        </div>
        <div className="sett-section">
          <div className="sett-title">🔔 Notifications & Privacy</div>
          {[
            { k: "email", l: "Email notifications", s: "Get notified on completion" },
            { k: "analytics", l: "Usage analytics", s: "Anonymous improvement data" },
            { k: "api", l: "API access", s: "Enable API key generation" },
            { k: "darkMode", l: "Dark mode", s: "Currently active" },
          ].map((r) => (
            <div key={r.k} className="sett-row">
              <div><div className="sett-lbl">{r.l}</div><div className="sett-sub">{r.s}</div></div>
              <Toggle k={r.k} />
            </div>
          ))}
        </div>
        <div className="sett-section">
          <div className="sett-title">👤 Account</div>
          {[
            { l: "Name", v: "Aman Vedpragya" },
            { l: "Email", v: "aman@vedpragya.com" },
            { l: "Plan", v: "Pro · Renews Apr 1, 2026" },
            { l: "Credits", v: "3,720 / 6,000" },
            { l: "Member since", v: "Jan 2025" },
          ].map((r) => (
            <div key={r.l} className="sett-row">
              <div className="sett-lbl" style={{ color: "var(--txt2)", fontSize: "11.5px" }}>{r.l}</div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: r.l === "Credits" ? "var(--fm)" : "var(--f)",
                  color: r.l === "Plan" ? "var(--acc)" : r.l === "Credits" ? "var(--cyan)" : "var(--txt)",
                }}
              >
                {r.v}
              </div>
            </div>
          ))}
          <button type="button" className="gen-sub" style={{ width: "100%", marginTop: "10px", justifyContent: "center" }} onClick={() => showToast("Profile saved ✓", "var(--acc)")}>
            Save Changes
          </button>
        </div>
        <div className="sett-section">
          <div className="sett-title">🔑 API & Integrations</div>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--b2)", borderRadius: "9px", padding: "12px", marginBottom: "12px", fontFamily: "var(--fm)", fontSize: "11px", color: "var(--txt2)", wordBreak: "break-all" }}>
            sk-cai-••••••••••••••••••••••••••••••••
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
            <button type="button" className="mbtn mbtn-sec" style={{ flex: 1 }} onClick={() => showToast("API key copied!", "var(--cyan)")}>Copy Key</button>
            <button type="button" className="mbtn mbtn-sec" style={{ flex: 1 }} onClick={() => showToast("New key generated", "var(--acc)")}>Regenerate</button>
          </div>
          {[
            { l: "Zapier", s: "Automate workflows", on: false },
            { l: "Make.com", s: "Complex automations", on: true },
            { l: "Webhook URL", s: "Custom integrations", on: false },
          ].map((r) => (
            <div key={r.l} className="sett-row">
              <div><div className="sett-lbl">{r.l}</div><div className="sett-sub">{r.s}</div></div>
              <div style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "5px", background: r.on ? "var(--acc-d)" : "var(--surf3)", color: r.on ? "var(--acc)" : "var(--txt3)", fontWeight: 700 }}>{r.on ? "ON" : "OFF"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
