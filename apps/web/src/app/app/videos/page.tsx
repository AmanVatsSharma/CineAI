"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3x3, List, Download, Trash2, Share2, Check } from "lucide-react";
import { VIDEOS } from "@cineai/mock-data";
import { Icons, VideoCard, Reveal, TypeBadge } from "@cineai/ui";
import { useDashboard } from "../DashboardContext";
import type { Video } from "@cineai/domain-types";

export default function VideosPage() {
  const { showToast, showModal } = useDashboard();
  const [filter, setFilter]   = useState("All");
  const [view, setView]       = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [selMode, setSelMode] = useState(false);

  const filtered = VIDEOS.filter((v) => {
    if (filter === "All") return true;
    if (filter === "Done") return v.status === "done";
    if (filter === "Processing") return v.status === "proc";
    if (filter === "4K") return true; // all are 4K in mock
    if (filter === "Shorts") return parseInt(v.dur) <= 15;
    return true;
  });

  const toggleSelect = (id: number) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map((v) => v.id)));
  const clearSel  = () => { setSelected(new Set()); setSelMode(false); };

  const bulkAction = (action: string) => {
    showToast(`${action} ${selected.size} video${selected.size !== 1 ? "s" : ""} ✓`, "var(--acc)");
    clearSel();
  };

  return (
    <div className="page">
      {/* ── Toolbar ── */}
      <Reveal>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div className="hist-filter">
              {["All", "Done", "Processing", "4K", "Shorts"].map((f) => (
                <button key={f} type="button" className={`hf-chip${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSelMode((v) => !v)}
              style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8, background: selMode ? "var(--acc-d)" : "var(--surf2)", color: selMode ? "var(--acc)" : "var(--t2)", border: `1px solid ${selMode ? "rgba(184,255,62,.3)" : "var(--b1)"}`, cursor: "pointer", fontFamily: "var(--f)" }}
            >
              {selMode ? "Cancel" : "Select"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Grid / List toggle */}
            <div style={{ display: "flex", borderRadius: 9, overflow: "hidden", border: "1px solid var(--b1)", background: "var(--surf2)" }}>
              {([["grid", Grid3x3], ["list", List]] as const).map(([v, Icon]) => (
                <motion.button
                  key={v} type="button"
                  onClick={() => setView(v)}
                  whileTap={{ scale: 0.95 }}
                  style={{ padding: "7px 10px", background: view === v ? "var(--surf3)" : "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  <Icon size={14} color={view === v ? "var(--acc)" : "var(--t3)"} />
                </motion.button>
              ))}
            </div>
            <button type="button" className="btn-cta" onClick={showModal}>{Icons.plus} New Video</button>
          </div>
        </div>
      </Reveal>

      {/* ── Bulk action bar ── */}
      <AnimatePresence>
        {selMode && selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 12, background: "var(--surf2)", border: "1px solid var(--b1)", flexWrap: "wrap" }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)", fontFamily: "var(--f)" }}>
              {selected.size} selected
            </span>
            <button type="button" onClick={selectAll} style={{ fontSize: 11, color: "var(--acc)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--f)" }}>Select all</button>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {[
                { icon: Download, label: "Download", color: "var(--cyan)" },
                { icon: Share2,   label: "Share",    color: "var(--vio)" },
                { icon: Trash2,   label: "Delete",   color: "var(--rose)" },
              ].map(({ icon: Icon, label, color }) => (
                <motion.button
                  key={label} type="button"
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
                  onClick={() => bulkAction(label)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: `${color}12`, color, border: `1px solid ${color}30`, cursor: "pointer", fontFamily: "var(--f)" }}
                >
                  <Icon size={12} /> {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Grid view ── */}
      {view === "grid" && (
        <div className="hist-grid">
          {filtered.map((v, i) => (
            <Reveal key={v.id} delay={i * 0.04}>
              <div style={{ position: "relative" }}>
                {selMode && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ position: "absolute", top: 8, left: 8, zIndex: 10, width: 20, height: 20, borderRadius: 6, background: selected.has(v.id) ? "var(--acc)" : "var(--surf3)", border: `1.5px solid ${selected.has(v.id) ? "var(--acc)" : "var(--b2)"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    onClick={() => toggleSelect(v.id)}
                  >
                    {selected.has(v.id) && <Check size={12} color="#000" />}
                  </motion.div>
                )}
                <VideoCard
                  video={v}
                  onClick={() => selMode ? toggleSelect(v.id) : showToast(`Playing "${v.name}"…`, "var(--cyan)")}
                />
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {/* ── List view ── */}
      {view === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {filtered.map((v: Video, i: number) => (
            <Reveal key={v.id} delay={i * 0.03}>
              <motion.div
                whileHover={{ background: "var(--surf2)" }}
                onClick={() => selMode ? toggleSelect(v.id) : showToast(`Playing "${v.name}"…`, "var(--cyan)")}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", borderRadius: 12,
                  background: selected.has(v.id) ? "rgba(184,255,62,.06)" : "var(--surf)",
                  border: `1px solid ${selected.has(v.id) ? "rgba(184,255,62,.3)" : "var(--b1)"}`,
                  cursor: "pointer", transition: "all .15s",
                }}
              >
                {selMode && (
                  <div style={{ width: 18, height: 18, borderRadius: 5, background: selected.has(v.id) ? "var(--acc)" : "var(--surf3)", border: `1.5px solid ${selected.has(v.id) ? "var(--acc)" : "var(--b2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {selected.has(v.id) && <Check size={11} color="#000" />}
                  </div>
                )}
                {/* Thumbnail placeholder */}
                <div style={{ width: 48, height: 32, borderRadius: 6, background: `${v.status === "done" ? "var(--acc)" : "var(--gold)"}20`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18 }}>🎬</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", fontFamily: "var(--f)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--f)" }}>{v.model} · {v.dur}</div>
                </div>
                <TypeBadge type="video" />
                <div style={{ fontSize: 11, color: v.status === "done" ? "var(--acc)" : "var(--gold)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                  {v.status === "done" ? "Done" : "Processing"}
                </div>
                <div style={{ fontSize: 11, color: "var(--t4)", flexShrink: 0 }}>{v.time}</div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
