"use client";

import type { ComponentType } from "react";
import {
  AudioWaveform, Clapperboard, FileText, Image as ImageIcon, Mic, Music,
  AlertTriangle, CheckCircle2, Info, XCircle,
} from "lucide-react";
import type { AgentRole, CampaignStatus, DeliverableStatus, Finding, Modality } from "@cineai/domain-types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Icon = ComponentType<any>;

export const MODALITY_META: Record<Modality, { label: string; color: string; Icon: Icon }> = {
  video: { label: "Video", color: "var(--cyan)", Icon: Clapperboard },
  image: { label: "Image", color: "var(--vio)", Icon: ImageIcon },
  voice: { label: "Voice", color: "var(--gold)", Icon: Mic },
  music: { label: "Music", color: "var(--rose)", Icon: Music },
  sfx: { label: "SFX", color: "#10A37F", Icon: AudioWaveform },
  copy: { label: "Copy", color: "var(--acc)", Icon: FileText },
};

export const AGENT_META: Record<AgentRole, { label: string; color: string }> = {
  creative_director: { label: "Creative Director", color: "var(--vio)" },
  scriptwriter: { label: "Scriptwriter", color: "var(--acc)" },
  brand_guardian: { label: "Brand Guardian", color: "var(--gold)" },
  image_artist: { label: "Image Artist", color: "var(--vio)" },
  video_producer: { label: "Video Producer", color: "var(--cyan)" },
  audio_producer: { label: "Audio Producer", color: "var(--rose)" },
  ad_strategist: { label: "Ad Strategist", color: "var(--cyan)" },
  follow_up: { label: "Follow-up", color: "var(--acc)" },
  orchestrator: { label: "Orchestrator", color: "var(--txt2)" },
};

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  queued: { label: "Queued", cls: "" },
  planning: { label: "Planning", cls: "vio" },
  producing: { label: "Producing", cls: "cyan" },
  reviewing: { label: "Reviewing", cls: "gold" },
  ready: { label: "Ready", cls: "acc" },
  needs_attention: { label: "Needs attention", cls: "gold" },
  failed: { label: "Failed", cls: "rose" },
  generating: { label: "Generating", cls: "cyan" },
  done: { label: "Done", cls: "acc" },
  needs_review: { label: "Needs review", cls: "gold" },
};

export function StatusPill({ status }: { status: CampaignStatus | DeliverableStatus }) {
  const s = STATUS_STYLE[status] ?? { label: status, cls: "" };
  return <span className={`bo-chip ${s.cls}`}>{s.label}</span>;
}

export const scoreColor = (n: number) => (n >= 90 ? "var(--acc)" : n >= 70 ? "var(--gold)" : "var(--rose)");

export function ScoreBadge({ score, label = "Brand score" }: { score: number; label?: string }) {
  return (
    <span title={label} style={{ fontFamily: "var(--fm)", fontSize: 12, fontWeight: 700, color: scoreColor(score) }}>
      {score}
    </span>
  );
}

const SEV: Record<Finding["severity"], { Icon: Icon; color: string }> = {
  error: { Icon: XCircle, color: "var(--rose)" },
  warning: { Icon: AlertTriangle, color: "var(--gold)" },
  info: { Icon: Info, color: "var(--cyan)" },
};

export function FindingList({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--acc)" }}>
        <CheckCircle2 size={14} /> No brand issues found.
      </div>
    );
  }
  return (
    <ul className="bo-list">
      {findings.map((f, i) => {
        const { Icon: I, color } = SEV[f.severity];
        return (
          <li key={`${f.code}-${i}`}>
            <I size={14} color={color} style={{ flexShrink: 0, marginTop: 2 }} aria-label={f.severity} />
            <span>
              <span style={{ color: "var(--txt)" }}>{f.message}</span>
              {f.suggestion && <span style={{ color: "var(--txt2)" }}> {f.suggestion}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
