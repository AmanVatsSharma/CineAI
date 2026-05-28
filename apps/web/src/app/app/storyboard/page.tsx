"use client";

import { useState } from "react";
import { Icons, Thumb } from "@cineai/ui";
import { useDashboard } from "../DashboardContext";

const scenes = [
  { id: 1, name: "Opening — Establishing Shot", desc: "Wide aerial shot of the cyberpunk cityscape at night, rain falling, neon lights reflecting on wet streets. Camera slowly descends.", model: "Kling 2.6", dur: "8s", style: "Cinematic", scene: "cyberpunk" as const },
  { id: 2, name: "Act 1 — Street Level", desc: "Ground-level tracking shot following a hooded figure through a crowded market. Shallow depth of field, bokeh neon lights.", model: "Runway Gen-4.5", dur: "12s", style: "Noir", scene: "ocean" as const },
  { id: 3, name: "Act 2 — Chase Sequence", desc: "Dynamic handheld chase through back alleys. Fast cuts, motion blur, intense pacing. Drones and holographic ads visible.", model: "Sora 2 Pro", dur: "15s", style: "Action", scene: "volcano" as const },
  { id: 4, name: "Climax — Rooftop Confrontation", desc: "Epic wide shot on a rain-soaked rooftop. Lightning strikes in background. Two figures face each other dramatically.", model: "Veo 3.1", dur: "10s", style: "Dramatic", scene: "arctic" as const },
  { id: 5, name: "Resolution — Sunrise", desc: "Time-lapse of city transitioning from night to dawn. Neon fades as golden light spreads across the skyline.", model: "Luma Ray3", dur: "8s", style: "Atmospheric", scene: "forest" as const },
];

const tagColors: Record<string, string> = {
  Cinematic: "var(--cyan)",
  Noir: "var(--vio)",
  Action: "var(--rose)",
  Dramatic: "var(--gold)",
  Atmospheric: "var(--acc)",
};

export default function StoryboardPage() {
  const { showToast } = useDashboard();
  const [activeScene, setActiveScene] = useState(1);
  const current = scenes.find((s) => s.id === activeScene);
  return (
    <div className="page">
      <div style={{ display: "flex", gap: "14px" }}>
        <div style={{ flex: 1 }}>
          <div className="sh" style={{ marginBottom: "12px" }}>
            <div className="sh-title">Scene Timeline</div>
            <button type="button" className="btn-cta" style={{ fontSize: "12px", padding: "7px 13px" }} onClick={() => showToast("New scene added!", "var(--acc)")}>
              {Icons.plus} Add Scene
            </button>
          </div>
          <div className="sb-timeline">
            {scenes.map((s) => (
              <button
                key={s.id}
                type="button"
                className={"sb-scene" + (activeScene === s.id ? " active-s" : "")}
                onClick={() => setActiveScene(s.id)}
              >
                <div className="sb-num">{s.id}</div>
                <div className="sb-content">
                  <div className="sb-scene-name">{s.name}</div>
                  <div className="sb-scene-desc">{s.desc}</div>
                  <div className="sb-meta">
                    <span className="sb-tag" style={{ background: `${tagColors[s.style]}22`, color: tagColors[s.style], border: `1px solid ${tagColors[s.style]}44` }}>{s.style}</span>
                    <span style={{ fontSize: "11px", color: "var(--txt3)", fontFamily: "var(--fm)" }}>{s.model}</span>
                    <span style={{ fontSize: "11px", color: "var(--txt3)", marginLeft: "auto" }}>{s.dur}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ width: "260px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="panel">
            <div className="sh-title" style={{ marginBottom: "12px" }}>Scene Preview</div>
            {current ? (
              <>
                <div style={{ borderRadius: "9px", overflow: "hidden", marginBottom: "12px", border: "1px solid var(--b1)", aspectRatio: "16/9", position: "relative" }}>
                  <Thumb scene={current.scene} />
                  <div className="vov" />
                  <div style={{ position: "absolute", bottom: "8px", left: "8px", fontFamily: "var(--fm)", fontSize: "10px", color: "rgba(255,255,255,.7)" }}>Scene {current.id} Preview</div>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>{current.name}</div>
                <div style={{ fontSize: "11.5px", color: "var(--txt2)", lineHeight: 1.5, marginBottom: "12px" }}>{current.desc}</div>
                {[
                  { l: "Model", v: current.model },
                  { l: "Duration", v: current.dur },
                  { l: "Style", v: current.style },
                ].map((r) => (
                  <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.03)", fontSize: "12px" }}>
                    <span style={{ color: "var(--txt2)" }}>{r.l}</span>
                    <span style={{ fontWeight: 600 }}>{r.v}</span>
                  </div>
                ))}
                <button type="button" className="gen-sub" style={{ width: "100%", marginTop: "12px", justifyContent: "center" }} onClick={() => showToast("Generating Scene " + current.id + "… 🎬", "var(--acc)")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width={12} height={12}><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  Generate Scene
                </button>
              </>
            ) : null}
          </div>
          <div className="panel">
            <div className="sh-title" style={{ marginBottom: "10px" }}>Project Stats</div>
            {[
              { l: "Total Scenes", v: "5" },
              { l: "Total Duration", v: "53s" },
              { l: "Est. Cost", v: "220 credits" },
              { l: "Models Used", v: "5 different" },
            ].map((r) => (
              <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,.03)", fontSize: "12px" }}>
                <span style={{ color: "var(--txt2)" }}>{r.l}</span>
                <span style={{ fontWeight: 600, fontFamily: "var(--fm)", fontSize: "11px" }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
