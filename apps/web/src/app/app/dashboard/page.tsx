"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, Zap, Clock, Star, Wand2, AlertCircle, Video, Users, CreditCard, Download } from "lucide-react";
import { VIDEOS, MODELS, MODEL_CREDITS, MODEL_COLOR } from "@cineai/mock-data";
import { Icons, VideoCard, Counter, Reveal, StatusDot } from "@cineai/ui";
import { useDashboard } from "../DashboardContext";

const STAT_CARDS = [
  { label: "Total Videos",  value: "247",  delta: "+23%", positive: true,  color: "var(--acc)",  bg: "var(--acc-d)",  icon: Layers, barW: "72%",  barC: "linear-gradient(90deg,var(--acc),#7DFF00)" },
  { label: "Credits Used",  value: "3,720",delta: "62%",  positive: null,  color: "var(--cyan)", bg: "var(--cyan-d)", icon: Zap,    barW: "62%",  barC: "linear-gradient(90deg,var(--cyan),#7BF7FF)" },
  { label: "Total Runtime", value: "38m",  delta: "+4.2h",positive: true,  color: "var(--gold)", bg: "var(--gold-d)", icon: Clock,  barW: "55%",  barC: "linear-gradient(90deg,var(--gold),#FFD787)" },
  { label: "Avg Quality",   value: "4.8★", delta: "↑94%", positive: true, color: "var(--vio)",  bg: "var(--vio-d)",  icon: Star,   barW: "94%",  barC: "linear-gradient(90deg,var(--vio),#C4A9FF)" },
];

const ACTIVITY = [
  { icon: Video,       color: "var(--cyan)", text: "Completed", bold: "Cyberpunk City Rain",    sub: "Kling 2.6 · 4K · 8s",          time: "2m ago"   },
  { icon: Users,       color: "var(--vio)",  text: "Team",      bold: "Priya Nair",              sub: "joined workspace",              time: "18m ago"  },
  { icon: AlertCircle, color: "var(--gold)", text: "Alert:",    bold: "62% credits used",        sub: "3,720 of 6,000 credits",        time: "1h ago"   },
  { icon: Download,    color: "var(--acc)",  text: "Downloaded",bold: "Arctic Aurora",           sub: "4K · 12s · Kling 2.6",         time: "2h ago"   },
  { icon: CreditCard,  color: "#10A37F",     text: "Refilled",  bold: "+6,000 credits",          sub: "monthly renewal",               time: "Yesterday"},
];

const barData = [
  { h: 38, d: "M" }, { h: 62, d: "T" }, { h: 45, d: "W" },
  { h: 80, d: "T" }, { h: 55, d: "F" }, { h: 95, d: "S" }, { h: 28, d: "S" },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function DashboardPage() {
  const { showToast, showModal } = useDashboard();
  const [activeModel, setActiveModel] = useState("Kling 2.6");
  const [activeTab, setActiveTab] = useState("All");
  const [procVisible, setProcVisible] = useState(true);
  const [promptTxt, setPromptTxt] = useState("");
  const [selMode, setSelMode] = useState("Text → Video");

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="page">

      {/* ── In-progress generation strip ── */}
      {procVisible && (
        <div className="proc-strip">
          <div className="proc-dot" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ color: "var(--gold)", fontWeight: 700 }}>Generating </span>
            <span style={{ color: "var(--txt2)", fontSize: "12px" }}>&quot;Cyberpunk city rain, neon reflections on wet pavement&quot;</span>
          </div>
          <span className="proc-model">Kling 2.6 · 4K · 8s</span>
          <div className="proc-track"><div className="proc-fill" /></div>
          <span className="proc-pct">62%</span>
          <button type="button" className="proc-x" onClick={() => setProcVisible(false)} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* ── Welcome header ── */}
      <Reveal>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--t3)", fontFamily: "var(--f)", marginBottom: 4 }}>{today}</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.5px", lineHeight: 1.1, color: "var(--t1)", fontFamily: "var(--f)", margin: 0 }}>
              {greeting()}, <span style={{ color: "var(--acc)" }}>Aman</span> ✦
            </h1>
            <p style={{ fontSize: 13, color: "var(--t2)", fontFamily: "var(--f)", marginTop: 6 }}>
              247 videos generated this month · Brand kit active · 3,720 credits remaining
            </p>
          </div>
          <motion.button
            onClick={showModal}
            whileHover={{ y: -1, boxShadow: "0 6px 20px rgba(184,255,62,.35)" }} whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "var(--acc)", color: "#000", border: "none", cursor: "pointer", fontFamily: "var(--f)" }}
          >
            <Wand2 size={13} /> Quick Generate
          </motion.button>
        </div>
      </Reveal>

      {/* ── Stat cards ── */}
      <div className="stats-row">
        {STAT_CARDS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.07}>
            <motion.div
              whileHover={{ y: -3, borderColor: s.color }}
              transition={{ duration: 0.2 }}
              className="stat-card"
              style={{ borderRadius: 18, padding: "18px 20px", position: "relative", overflow: "hidden" }}
            >
              {/* corner radial glow */}
              <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, pointerEvents: "none", background: `radial-gradient(circle,${s.color}10,transparent 70%)`, transform: "translate(30%,-30%)" }} />
              <div className="sc-top">
                <div className="sc-ico" style={{ background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 10, border: `1px solid ${s.color}22` }}>
                  <s.icon size={15} color={s.color} />
                </div>
                <div className={`sc-trend ${s.positive === true ? "up" : s.positive === false ? "dn" : "neu"}`}>{s.delta}</div>
              </div>
              <div className="sc-val" style={{ color: s.color, fontSize: 26, fontWeight: 900, letterSpacing: "-1px", margin: "10px 0 2px" }}>
                <Counter value={s.value} />
              </div>
              <div className="sc-sub">{s.label}</div>
              <div className="sc-bar" style={{ marginTop: 10 }}>
                <motion.div
                  className="sc-bf"
                  style={{ background: s.barC }}
                  initial={{ width: 0 }}
                  animate={{ width: s.barW }}
                  transition={{ duration: 1, ease: [0, 0, 0.2, 1], delay: i * 0.08 }}
                />
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>

      {/* ── Quick generate panel ── */}
      <Reveal delay={0.1}>
        <div className="gen-panel">
          <div className="gen-bg1" /><div className="gen-bg2" />
          <div className="gen-inner">
            <div className="gen-top">
              <div className="gen-lbl"><span className="blink-dot" />Text-to-Video · AI Studio</div>
              <div className="gen-modes">
                {["Text → Video", "Image → Video", "Video → Video"].map((m) => (
                  <button key={m} type="button" className={`gmode${selMode === m ? " active" : ""}`} onClick={() => setSelMode(m)}>{m}</button>
                ))}
              </div>
            </div>
            <div className="gen-ta-wrap">
              <textarea className="gen-ta" value={promptTxt} onChange={(e) => setPromptTxt(e.target.value)}
                placeholder="Describe your scene… e.g. 'A golden retriever running through lavender fields at golden hour, slow-motion dolly shot'" />
              <div className="ta-bot">
                <button type="button" className="ta-chip" onClick={() => showToast("Prompt enhanced! ✨", "var(--acc)")}>✨ Enhance</button>
                <button type="button" className="ta-chip" onClick={() => { setPromptTxt("A majestic eagle soaring above snow-capped mountains at sunrise, ultra slow motion, 8K cinematic"); showToast("Random prompt loaded", "var(--cyan)"); }}>🎲 Random</button>
                <div className="char-c">{promptTxt.length} / 500</div>
              </div>
            </div>
            <div className="gen-foot">
              <div className="model-tabs">
                {Object.keys(MODEL_CREDITS).map((m) => (
                  <button key={m} type="button" className={`mtab${activeModel === m ? " sel" : ""}`} onClick={() => setActiveModel(m)}>
                    <span className="mdot" style={{ background: MODEL_COLOR[m] }} />
                    {m}
                  </button>
                ))}
              </div>
              <select className="gsel" aria-label="Resolution"><option>4K Ultra</option><option>1080p HD</option><option>720p Fast</option></select>
              <select className="gsel" aria-label="Duration"><option>8 seconds</option><option>5 seconds</option><option>15 seconds</option><option>30 seconds</option></select>
              <select className="gsel" aria-label="Aspect ratio"><option>16:9</option><option>9:16</option><option>1:1</option></select>
              <motion.button
                type="button" className="gen-sub"
                whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(184,255,62,.4)" }} whileTap={{ scale: 0.97 }}
                onClick={() => showToast("Generation queued! 🎬", "var(--acc)")}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width={12} height={12}><polygon points="5 3 19 12 5 21 5 3" /></svg>
                Generate <span className="cc-tag">· {MODEL_CREDITS[activeModel]} credits</span>
              </motion.button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Recent + sidebar panels ── */}
      <div className="two-col">
        <div className="section">
          <div className="sh">
            <div className="sh-title">Recent Generations</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="sh-tabs">
                {["All", "4K", "Shorts", "Processing"].map((t) => (
                  <button key={t} type="button" className={`sh-tab${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
                ))}
              </div>
              <Link href="/app/videos" className="sh-act">View all →</Link>
            </div>
          </div>
          <div className="vgrid">
            {VIDEOS.slice(0, 6).map((v) => (
              <VideoCard key={v.id} video={v} onClick={() => showToast(`Playing "${v.name}"…`, "var(--cyan)")} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Credits chart */}
          <Reveal>
            <div className="panel">
              <div className="sh" style={{ marginBottom: 0 }}>
                <div><div className="sh-title">Credits Usage</div><div style={{ fontSize: 11, color: "var(--acc)" }}>↑ 18% vs last week</div></div>
                <div style={{ fontFamily: "var(--fm)", fontSize: 20, fontWeight: 500, color: "var(--cyan)", letterSpacing: "-1px" }}>2,280</div>
              </div>
              <div className="chart-bars">
                {barData.map((b, i) => (
                  <div key={i} className="cb-g">
                    <motion.div
                      className="cb"
                      style={{ background: i === 6 ? "linear-gradient(to top,rgba(184,255,62,0.6),rgba(184,255,62,0.2))" : "linear-gradient(to top,rgba(62,232,255,0.6),rgba(62,232,255,0.2))" }}
                      initial={{ height: 0 }}
                      animate={{ height: `${b.h}%` }}
                      transition={{ duration: 0.6, ease: [0, 0, 0.2, 1], delay: i * 0.06 }}
                    />
                    <div className="cday">{b.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Models */}
          <Reveal delay={0.05}>
            <div className="panel">
              <div className="sh" style={{ marginBottom: 0 }}>
                <div className="sh-title">AI Models</div>
                <div style={{ fontSize: 10, color: "var(--acc)", fontWeight: 700 }}>7 ACTIVE</div>
              </div>
              <div className="model-list">
                {MODELS.slice(0, 5).map((m) => (
                  <button key={m.name} type="button" className={`mrow${activeModel === m.name ? " sel" : ""}`}
                    onClick={() => { setActiveModel(m.name); showToast(`Switched to ${m.name}`, "var(--acc)"); }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <div className="mdot-lg" style={{ background: m.color }} />
                      <StatusDot status="online" />
                    </div>
                    <div className="mi"><div className="mn">{m.name}</div><div className="ms">{m.by}</div></div>
                    <div className="mres">{m.res}</div>
                    {activeModel === m.name && <div className="mch">✓</div>}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Activity */}
          <Reveal delay={0.1}>
            <div className="panel">
              <div className="sh-title" style={{ marginBottom: 10 }}>Activity</div>
              <div className="act-list">
                {ACTIVITY.map((a, i) => (
                  <motion.div
                    key={i} className="act-i"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: `${a.color}15`, flexShrink: 0 }}>
                      <a.icon size={12} color={a.color} />
                    </div>
                    <div>
                      <div className="act-txt">
                        {a.text} <strong>{a.bold}</strong>
                        <span style={{ color: "var(--t3)", fontSize: 11 }}> · {a.sub}</span>
                      </div>
                      <div className="act-time">{a.time}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Plans row ── */}
      <Reveal delay={0.05}>
        <div className="bottom-row">
          <div className="panel">
            <div className="sh" style={{ marginBottom: 0 }}>
              <div className="sh-title">Plans & Pricing</div>
              <div style={{ fontSize: 11, color: "var(--acc)", background: "var(--acc-d)", border: "1px solid rgba(184,255,62,.2)", padding: "3px 9px", borderRadius: 6, fontWeight: 700 }}>Pro Active ✓</div>
            </div>
            <div className="plan-grid">
              {[
                { name: "Starter", tag: "For beginners",   price: "19",  cred: "1,500 credits/mo", features: ["3 AI models", "Up to 1080p", "5s max"],            cls: "",     badge: null,      badgeCls: "" },
                { name: "Pro",     tag: "For creators",    price: "49",  cred: "6,000 credits/mo", features: ["All 7 models", "4K Ultra", "30s max", "Priority"],   cls: "feat", badge: "CURRENT", badgeCls: "curr" },
                { name: "Studio",  tag: "For agencies",    price: "149", cred: "25,000 credits/mo",features: ["Full API", "4K · 2min", "Team workspace", "White-label"], cls: "ent", badge: "UPGRADE", badgeCls: "up" },
              ].map((p) => (
                <motion.button
                  key={p.name} type="button" className={`pcard ${p.cls}`}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                  onClick={() => showToast(`${p.name} plan selected`, "var(--acc)")}
                >
                  {p.badge && <div className={`pbadge ${p.badgeCls}`}>{p.badge}</div>}
                  <div className="pcname" style={{ marginTop: p.badge ? 10 : 0 }}>{p.name}</div>
                  <div className="pctag">{p.tag}</div>
                  <div className="pcprice" style={{ color: p.cls === "feat" ? "var(--acc)" : p.cls === "ent" ? "var(--vio)" : "var(--txt)" }}>
                    <sup>$</sup>{p.price}<span>/mo</span>
                  </div>
                  <div className="pccred">{p.cred}</div>
                  {p.features.map((f, fi) => (
                    <div key={fi} className="pcf"><span className="pcf-y" style={{ color: p.cls === "ent" ? "var(--vio)" : "var(--acc)" }}>✓</span>{f}</div>
                  ))}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="sh-title" style={{ marginBottom: 10 }}>💡 Prompt Tips</div>
            <div className="tip-list">
              {[
                { e: "🎥", b: <><strong>Camera moves</strong> — &quot;slow dolly-in&quot;, &quot;aerial tracking&quot; improves output 3×</> },
                { e: "⚡", b: <><strong>Kling physics</strong> — describe fluid, cloth, particles explicitly</> },
                { e: "🎨", b: <><strong>Lighting cues</strong> — &quot;golden hour&quot;, &quot;volumetric fog&quot;, &quot;neon reflections&quot;</> },
              ].map((t, ti) => (
                <div key={ti} className="tip"><div className="tip-e">{t.e}</div><div className="tip-b">{t.b}</div></div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
