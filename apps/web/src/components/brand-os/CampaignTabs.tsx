"use client";

import type { AdVariant, AgentRole, Campaign, Deliverable, FollowUp } from "@cineai/domain-types";
import {
  AGENT_META, FindingList, MODALITY_META, ScoreBadge, StatusPill, fmtDate,
} from "./shared";

export function ModalityChip({ d }: { d: Deliverable }) {
  const m = MODALITY_META[d.modality];
  return (
    <span className="bo-chip" style={{ color: m.color }} title={`${m.label} · ${d.modelName} · ${d.credits} credits`}>
      <m.Icon size={11} /> {d.modelName}
    </span>
  );
}

export function ScenesTab({ campaign }: { campaign: Campaign }) {
  if (campaign.scenes.length === 0) return <Empty>The Creative Director is still planning scenes…</Empty>;
  return (
    <div className="sb-timeline">
      {campaign.scenes.map((s) => {
        const assets = campaign.deliverables.filter((d) => d.sceneIndex === s.index && d.modality !== "copy");
        return (
          <div key={s.index} className="sb-scene" style={{ cursor: "default" }}>
            <div className="sb-num">{s.index}</div>
            <div className="sb-content">
              <div className="sb-scene-name">
                {s.title} <span style={{ color: "var(--txt3)", fontWeight: 400 }}>· {s.beat}</span>
              </div>
              <div className="sb-scene-desc">{s.visual}</div>
              <div style={{ fontSize: 12, margin: "8px 0 2px", color: "var(--txt)" }}>
                <span style={{ color: "var(--txt3)" }}>VO </span>&ldquo;{s.voiceover}&rdquo;
              </div>
              {s.onScreenText && (
                <div style={{ fontSize: 12, color: "var(--txt)" }}>
                  <span style={{ color: "var(--txt3)" }}>ON SCREEN </span>{s.onScreenText}
                </div>
              )}
              <div className="sb-meta" style={{ marginTop: 8 }}>
                <span className="bo-chip">{s.camera}</span>
                <span className="bo-chip">{s.mood}</span>
                {assets.map((d) => <ModalityChip key={d.id} d={d} />)}
                <span style={{ fontSize: 11, color: "var(--txt3)", marginLeft: "auto" }}>{s.durationS}s</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AssetsTab({ campaign }: { campaign: Campaign }) {
  if (campaign.deliverables.length === 0) return <Empty>Assets appear once models are routed.</Empty>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="bo-table">
        <thead>
          <tr><th>Asset</th><th>Scene</th><th>Model</th><th>Credits</th><th>Status</th><th>Brand</th></tr>
        </thead>
        <tbody>
          {campaign.deliverables.map((d) => {
            const m = MODALITY_META[d.modality];
            return (
              <tr key={d.id}>
                <td style={{ color: m.color, whiteSpace: "nowrap" }}>
                  <m.Icon size={12} style={{ verticalAlign: -1, marginRight: 5 }} />{m.label}
                </td>
                <td>{d.sceneIndex ?? "All"}</td>
                <td>
                  {d.modelName}
                  {d.findings.length > 0 && (
                    <div style={{ marginTop: 6, maxWidth: 420 }}><FindingList findings={d.findings} /></div>
                  )}
                </td>
                <td style={{ fontFamily: "var(--fm)" }}>{d.credits}</td>
                <td><StatusPill status={d.status} /></td>
                <td><ScoreBadge score={d.brandScore} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AdCard({ ad }: { ad: AdVariant }) {
  const [w, h] = ad.aspectRatio.split(":").map(Number);
  const tall = h > w;
  return (
    <div className="panel">
      <div className="sh" style={{ marginBottom: 10 }}>
        <div className="sh-title">{ad.channelLabel}</div>
        <span className={`bo-chip ${ad.passed ? "acc" : "rose"}`}>{ad.passed ? "Passed" : "Blocked"}</span>
      </div>
      <div className="bo-ad-frame" style={{ aspectRatio: `${w} / ${h}`, width: tall ? "46%" : "100%" }}>
        <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.25 }}>{ad.headline}</div>
        <div style={{ fontSize: 10, color: "var(--txt2)", marginTop: 4, lineHeight: 1.4 }}>{ad.body}</div>
        <div style={{ marginTop: 8, alignSelf: "flex-start" }} className="bo-chip acc">{ad.cta}</div>
      </div>
      <div className="bo-row"><span>Format</span><span>{ad.aspectRatio} · {ad.durationS}s</span></div>
      <div className="bo-row"><span>Scenes</span><span>{ad.sceneIndexes.join(", ")}</span></div>
      <div className="bo-row"><span>Brand score</span><ScoreBadge score={ad.brandScore} /></div>
      {ad.findings.length > 0 && <div style={{ marginTop: 10 }}><FindingList findings={ad.findings} /></div>}
    </div>
  );
}

export function AdsTab({ campaign }: { campaign: Campaign }) {
  if (campaign.ads.length === 0) return <Empty>The Ad Strategist cuts channel variants after assets are done.</Empty>;
  return <div className="bo-grid">{campaign.ads.map((a) => <AdCard key={a.id} ad={a} />)}</div>;
}

export function FollowUpsTab({
  campaign, onToggle,
}: { campaign: Campaign; onToggle: (f: FollowUp) => void }) {
  if (campaign.followUps.length === 0) return <Empty>Follow-ups are scheduled once the campaign is reviewed.</Empty>;
  return (
    <ul className="bo-list" style={{ gap: 8 }}>
      {campaign.followUps.map((f) => (
        <li key={f.id} style={{ alignItems: "flex-start", background: "var(--surf2)", border: "1px solid var(--b1)", borderRadius: 10, padding: "10px 12px" }}>
          <input
            type="checkbox"
            checked={f.status === "done"}
            onChange={() => onToggle(f)}
            aria-label={`Mark "${f.title}" ${f.status === "done" ? "open" : "done"}`}
            style={{ marginTop: 3, accentColor: "var(--acc)" }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "var(--txt)", fontWeight: 600, textDecoration: f.status === "done" ? "line-through" : "none", opacity: f.status === "done" ? 0.55 : 1 }}>
              {f.title}
            </div>
            <div style={{ marginTop: 2 }}>{f.detail}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
            <span className={`bo-chip ${f.owner === "human" ? "gold" : "cyan"}`}>{f.owner === "human" ? "You" : "Agent"}</span>
            <span style={{ fontSize: 10.5, color: "var(--txt3)" }}>due {fmtDate(f.dueAt)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ActivityTab({ campaign }: { campaign: Campaign }) {
  if (campaign.steps.length === 0) return <Empty>No agent activity yet.</Empty>;
  return (
    <ul className="bo-list" style={{ gap: 7 }}>
      {[...campaign.steps].reverse().map((s, i) => {
        const a = AGENT_META[s.agent];
        return (
          <li key={`${s.at}-${i}`}>
            <span className="bo-chip" style={{ color: a.color, flexShrink: 0 }}>{a.label}</span>
            <span>
              <span style={{ color: "var(--txt)" }}>{s.action}</span> — {s.detail}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Who has worked on this campaign so far. */
export function AgentTeam({ campaign }: { campaign: Campaign }) {
  const counts = new Map<AgentRole, number>();
  campaign.steps.forEach((s) => counts.set(s.agent, (counts.get(s.agent) ?? 0) + 1));
  const active = campaign.steps.at(-1)?.agent;
  const running = !["ready", "needs_attention", "failed"].includes(campaign.status);
  return (
    <div className="bo-chips" aria-label="Agent team">
      {[...counts.entries()].map(([role, n]) => {
        const a = AGENT_META[role];
        const live = running && role === active;
        return (
          <span key={role} className="bo-chip" style={{ color: a.color, borderColor: live ? a.color : undefined }}>
            {live && <span className="blink-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: a.color }} />}
            {a.label} · {n}
          </span>
        );
      })}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12.5, color: "var(--txt2)", padding: "18px 4px" }}>{children}</div>;
}
