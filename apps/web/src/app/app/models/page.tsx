"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MODELS } from "@cineai/mock-data";
import { Reveal, StatusDot, TypeBadge } from "@cineai/ui";
import { useDashboard } from "../DashboardContext";

// Mock status + cost for each model
const MODEL_META: Record<string, { status: "online" | "busy" | "offline"; costPerSec: number; avgTime: string }> = {
  "Kling 2.6":      { status: "online", costPerSec: 8,  avgTime: "2m avg" },
  "Veo 3.0":        { status: "online", costPerSec: 7,  avgTime: "3m avg" },
  "Runway Gen-4.5": { status: "busy",   costPerSec: 6,  avgTime: "4m avg" },
  "Luma Ray3":      { status: "online", costPerSec: 9,  avgTime: "2.5m avg" },
  "Sora 2":         { status: "busy",   costPerSec: 10, avgTime: "5m avg" },
  "Pika 3.0":       { status: "online", costPerSec: 5,  avgTime: "90s avg" },
  "Hailuo 2":       { status: "online", costPerSec: 4,  avgTime: "75s avg" },
};

const STATUS_LABEL: Record<string, string> = {
  online: "Online",
  busy: "High demand",
  offline: "Offline",
};

export default function ModelsPage() {
  const { showToast } = useDashboard();
  const [active, setActive] = useState("Kling 2.6");

  return (
    <div className="page">
      <Reveal>
        <div className="panel" style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 12, color: "var(--txt2)", lineHeight: 1.6 }}>
            Compare all <strong style={{ color: "var(--txt)" }}>7 AI video models</strong> — each optimized for different use cases.
            Live status and per-second credit costs shown below.
          </div>
        </div>
      </Reveal>

      <div className="model-cards">
        {MODELS.map((m, i) => {
          const meta = MODEL_META[m.name] ?? { status: "online" as const, costPerSec: 6, avgTime: "2m avg" };
          return (
            <Reveal key={m.name} delay={i * 0.05}>
              <motion.button
                type="button"
                className={`mc${active === m.name ? " active-mc" : ""}`}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setActive(m.name);
                  showToast(`${m.name} selected as default`, "var(--acc)");
                }}
              >
                <div className="mc-glow" style={{ background: m.color }} />

                {/* Header */}
                <div className="mc-head">
                  <div className="mc-dot-big" style={{ background: `${m.color}22`, border: `1px solid ${m.color}44` }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: m.color, opacity: 0.9 }} />
                  </div>
                  <div>
                    <div className="mc-name">{m.name}</div>
                    <div className="mc-by">{m.by}</div>
                  </div>
                  {m.badge && (
                    <div style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: `${m.color}22`, color: m.color, border: `1px solid ${m.color}44`, letterSpacing: ".5px" }}>
                      {m.badge}
                    </div>
                  )}
                </div>

                {/* Status + cost row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <StatusDot status={meta.status} />
                    <span style={{ fontSize: 11, color: meta.status === "busy" ? "var(--gold)" : meta.status === "offline" ? "var(--t3)" : "var(--acc)", fontFamily: "var(--f)" }}>
                      {STATUS_LABEL[meta.status]}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--t3)" }}>· {meta.avgTime}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <TypeBadge type="video" />
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--t2)" }}>
                      {meta.costPerSec} cr/s
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="mc-tags">
                  {m.tags.map((t, ti) => (
                    <div key={t} className={ti === 0 ? "mc-tag accent" : "mc-tag"}>{t}</div>
                  ))}
                </div>

                {/* Resolution + quality row */}
                <div className="mc-stats">
                  <div className="mc-stat">
                    <div className="mc-stat-v" style={{ color: m.color }}>{m.res.split("·")[0].trim()}</div>
                    <div className="mc-stat-l">Max Res</div>
                  </div>
                  <div className="mc-stat">
                    <div className="mc-stat-v">{m.quality}%</div>
                    <div className="mc-stat-l">Quality</div>
                  </div>
                  <div className="mc-stat">
                    <div className="mc-stat-v">{meta.costPerSec} cr</div>
                    <div className="mc-stat-l">Per sec</div>
                  </div>
                </div>

                {/* Quality / Speed / Realism bars */}
                {[
                  { label: "Quality", val: m.quality, color: m.color },
                  { label: "Speed",   val: m.speed,   color: "var(--gold)" },
                  { label: "Realism", val: m.realism, color: "var(--cyan)" },
                ].map((b) => (
                  <div key={b.label} style={{ marginBottom: 7 }}>
                    <div className="mc-bar-label"><span>{b.label}</span><span>{b.val}%</span></div>
                    <div className="mc-bar">
                      <motion.div
                        className="mc-bar-f"
                        style={{ background: b.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${b.val}%` }}
                        transition={{ duration: 0.8, ease: [0, 0, 0.2, 1], delay: i * 0.04 }}
                      />
                    </div>
                  </div>
                ))}

                <span className="mc-select-btn">{active === m.name ? "✓ Selected — Default Model" : "Select Model"}</span>
              </motion.button>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
