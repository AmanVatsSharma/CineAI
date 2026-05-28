"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Zap, ChevronDown } from "lucide-react";
import { MODEL_CREDITS, MODEL_COLOR } from "@cineai/mock-data";
import { Reveal } from "@cineai/ui";
import { apiClient } from "@cineai/api-client";
import type { Unsubscribe } from "@cineai/api-client";
import { useDashboard } from "../DashboardContext";

const CAMERA_MOVES = [
  "Static", "Dolly In", "Dolly Out", "Pan Left", "Pan Right",
  "Tilt Up", "Tilt Down", "Orbit Left", "Orbit Right",
  "Aerial Descend", "Aerial Ascend", "Tracking Shot",
  "Handheld", "Crane Up", "Whip Pan",
];

const EXAMPLES = [
  "A golden retriever running through lavender fields at golden hour, slow motion dolly shot, cinematic depth of field, warm tones",
  "Cyberpunk city at night in the rain, neon reflections on wet pavement, slow motion, atmospheric fog",
  "An astronaut floating in deep space, Earth visible below, dramatic lighting, IMAX quality",
  "Abstract liquid metal flowing and morphing, macro photography, studio lighting, photorealistic",
];

export default function GeneratePage() {
  const { showToast } = useDashboard();
  const [prompt, setPrompt] = useState("");
  const [selModel, setSelModel]   = useState("Kling 2.6");
  const [selRes, setSelRes]       = useState("4K Ultra");
  const [selDur, setSelDur]       = useState("8 seconds");
  const [selRatio, setSelRatio]   = useState("16:9");
  const [selStyle, setSelStyle]   = useState("Cinematic");
  const [selCamera, setSelCamera] = useState("Dolly In");
  const [motionInt, setMotionInt] = useState(65);
  const [showAdv, setShowAdv]     = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [stage, setStage]         = useState("Queued…");
  const unsubRef = useRef<Unsubscribe | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) { showToast("Please enter a prompt first", "var(--rose)"); return; }
    setGenerating(true);
    setProgress(0);
    setStage("Queued…");
    try {
      const job = await apiClient.createGeneration(prompt, selModel);
      unsubRef.current?.();
      unsubRef.current = apiClient.subscribeJob(job.id, (evt) => {
        if (evt.type === "queued") {
          setStage("Queued on GPU…");
        } else if (evt.type === "progress") {
          setProgress(evt.job.progress);
          setStage(evt.stage);
        } else if (evt.type === "done") {
          setProgress(100);
          setStage("Done");
          setGenerating(false);
          showToast("Video generated! 🎬", "var(--acc)");
          setTimeout(() => setProgress(0), 1200);
          unsubRef.current?.();
          unsubRef.current = null;
        } else if (evt.type === "error") {
          setGenerating(false);
          showToast(`Generation failed: ${evt.message}`, "var(--rose)");
          unsubRef.current?.();
          unsubRef.current = null;
        }
      });
    } catch (e) {
      setGenerating(false);
      showToast(`Failed to queue: ${(e as Error).message}`, "var(--rose)");
    }
  };

  return (
    <div className="page">
      <Reveal>
        <div className="gen-full">
          <div className="gen-bg1" /><div className="gen-bg2" />
          <div className="gen-full-inner">

            <div style={{ marginBottom: 16 }}>
              <div className="gen-lbl" style={{ marginBottom: 8 }}><span className="blink-dot" />AI Video Generation Studio</div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.5px", marginBottom: 4 }}>
                What will you <span style={{ color: "var(--acc)" }}>create</span> today?
              </div>
              <div style={{ fontSize: 12, color: "var(--txt2)" }}>Describe your scene in detail — the more specific, the better</div>
            </div>

            <textarea
              className="gen-full-ta"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A majestic eagle soaring above snow-capped mountains at golden hour, ultra slow motion, cinematic depth of field, 8K quality…"
            />

            {/* Example chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0 16px" }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} type="button" className="ta-chip"
                  onClick={() => { setPrompt(ex); showToast("Example loaded ✓", "var(--cyan)"); }}>
                  💡 {ex.substring(0, 36)}…
                </button>
              ))}
            </div>

            {/* Core settings */}
            <div className="gen-settings-grid">
              {/* Model */}
              <div className="gs-card">
                <div className="gs-label">AI Model</div>
                <div className="gs-options">
                  {Object.keys(MODEL_CREDITS).map((o) => (
                    <button key={o} type="button" className={`gs-opt${selModel === o ? " sel" : ""}`} onClick={() => setSelModel(o)}>
                      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: MODEL_COLOR[o], marginRight: 6, verticalAlign: "middle" }} />
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div className="gs-card">
                <div className="gs-label">Resolution</div>
                <div className="gs-options">
                  {["4K Ultra", "2K QHD", "1080p HD", "720p Fast"].map((o) => (
                    <button key={o} type="button" className={`gs-opt${selRes === o ? " sel" : ""}`} onClick={() => setSelRes(o)}>{o}</button>
                  ))}
                </div>
              </div>

              {/* Duration + Ratio */}
              <div className="gs-card">
                <div className="gs-label">Duration</div>
                <div className="gs-options">
                  {["5 seconds", "8 seconds", "15 seconds", "30 seconds"].map((o) => (
                    <button key={o} type="button" className={`gs-opt${selDur === o ? " sel" : ""}`} onClick={() => setSelDur(o)}>{o}</button>
                  ))}
                </div>
                <div className="gs-label" style={{ marginTop: 8 }}>Aspect Ratio</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {["16:9", "9:16", "1:1", "4:3"].map((o) => (
                    <button key={o} type="button" className={`gs-opt${selRatio === o ? " sel" : ""}`} style={{ padding: "4px 8px" }} onClick={() => setSelRatio(o)}>{o}</button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div className="gs-card">
                <div className="gs-label">Visual Style</div>
                <div className="gs-options">
                  {["Cinematic", "Anime", "Photorealistic", "Abstract", "Documentary", "Vintage"].map((o) => (
                    <button key={o} type="button" className={`gs-opt${selStyle === o ? " sel" : ""}`} onClick={() => setSelStyle(o)}>{o}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced — camera + motion */}
            <motion.button
              type="button"
              onClick={() => setShowAdv((v) => !v)}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--t2)", background: "none", border: "none", cursor: "pointer", marginTop: 4, padding: "6px 0", fontFamily: "var(--f)" }}
            >
              <Camera size={13} color="var(--acc)" />
              Advanced Controls
              <motion.span animate={{ rotate: showAdv ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={13} />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {showAdv && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 12 }}>

                    {/* Camera movement */}
                    <div className="gs-card">
                      <div className="gs-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Camera size={11} color="var(--acc)" /> Camera Movement
                      </div>
                      <div className="gs-options">
                        {CAMERA_MOVES.map((c) => (
                          <button key={c} type="button" className={`gs-opt${selCamera === c ? " sel" : ""}`} onClick={() => setSelCamera(c)}>{c}</button>
                        ))}
                      </div>
                    </div>

                    {/* Motion intensity slider */}
                    <div className="gs-card">
                      <div className="gs-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Zap size={11} color="var(--cyan)" /> Motion Intensity
                      </div>
                      <div style={{ padding: "8px 0 4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: "var(--t3)" }}>Subtle</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--cyan)", fontFamily: "var(--font-mono)" }}>{motionInt}%</span>
                          <span style={{ fontSize: 11, color: "var(--t3)" }}>Dynamic</span>
                        </div>
                        <input
                          type="range" min={0} max={100} value={motionInt}
                          onChange={(e) => setMotionInt(Number(e.target.value))}
                          style={{ width: "100%", accentColor: "var(--cyan)" }}
                        />
                        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                          {["Smooth Physics", "Particle FX", "Depth of Field", "Motion Blur"].map((f) => (
                            <label key={f} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--t2)", cursor: "pointer" }}>
                              <input type="checkbox" defaultChecked={f === "Smooth Physics"} style={{ accentColor: "var(--acc)" }} />
                              {f}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress bar */}
            {generating && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: "rgba(184,255,62,.06)", border: "1px solid rgba(184,255,62,.15)", borderRadius: 10, padding: "12px 16px", marginTop: 12 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: "var(--acc)", fontWeight: 700 }}>⚡ {stage} · {selModel}</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--acc)" }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ height: 4, background: "var(--surf3)", borderRadius: 4 }}>
                  <motion.div
                    style={{ height: "100%", background: "linear-gradient(90deg,var(--acc),var(--cyan))", borderRadius: 4 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Submit row */}
            <div className="gen-submit-row">
              <div style={{ fontSize: 12, color: "var(--txt2)", flex: 1 }}>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--txt)" }}>{selModel}</span>
                &nbsp;·&nbsp;{selRes}&nbsp;·&nbsp;{selDur}&nbsp;·&nbsp;{selRatio}&nbsp;·&nbsp;{selStyle}&nbsp;·&nbsp;<span style={{ color: "var(--acc)" }}>{selCamera}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--txt2)" }}>
                  Cost: <span style={{ color: "var(--acc)", fontWeight: 700 }}>{MODEL_CREDITS[selModel]} credits</span>
                </div>
                <motion.button
                  type="button" className="gen-sub"
                  whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(184,255,62,.4)" }} whileTap={{ scale: 0.97 }}
                  onClick={handleGenerate} disabled={generating}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width={12} height={12}><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  {generating ? "Generating…" : "Generate Video"}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
