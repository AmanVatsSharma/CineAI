"use client";

import { useState } from "react";
import { API_MODE } from "@cineai/api-client";
import { SAMPLE_CAMPAIGN } from "@cineai/mock-data";
import type { Brand, Brief, Modality, Objective, Priority } from "@cineai/domain-types";
import { MODALITY_META } from "./shared";

const OBJECTIVES: Objective[] = ["awareness", "consideration", "conversion", "retention", "launch"];
const PRIORITIES: Priority[] = ["balanced", "quality", "speed", "cost"];
const MODALITIES = Object.keys(MODALITY_META) as Modality[];

/** In demo mode the form shows (read-only) the brief the recorded run was made from. */
const DEFAULT_BRIEF: Brief = SAMPLE_CAMPAIGN.brief;

export function NewCampaignForm({
  brands, busy, onSubmit, onCancel,
}: {
  brands: Brand[];
  busy: boolean;
  onSubmit: (brandId: string, brief: Brief) => void;
  onCancel: () => void;
}) {
  const demo = API_MODE === "mock";
  const [brandId, setBrandId] = useState(brands.find((b) => b.id === "vedpragya")?.id ?? brands[0]?.id ?? "");
  const [brief, setBrief] = useState<Brief>(DEFAULT_BRIEF);
  const brand = brands.find((b) => b.id === brandId);
  const set = <K extends keyof Brief>(k: K, v: Brief[K]) => setBrief((b) => ({ ...b, [k]: v }));
  const toggle = <T extends string>(list: T[], v: T): T[] => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const valid = brief.title.trim() && brief.product.trim() && brief.keyMessage.trim() && brief.cta.trim()
    && brief.channels.length > 0 && brief.modalities.length > 0;

  return (
    <form
      className="panel"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && brand) onSubmit(brand.id, { ...brief, budgetCredits: brief.budgetCredits || null });
      }}
    >
      <div className="sh" style={{ marginBottom: 12 }}>
        <div className="sh-title">New campaign</div>
        <button type="button" className="mbtn mbtn-sec" onClick={onCancel}>Cancel</button>
      </div>

      {demo && (
        <div role="note" className="bo-chip gold" style={{ whiteSpace: "normal", marginBottom: 12, lineHeight: 1.5 }}>
          Demo mode: this replays a run recorded from the real agents. Set NEXT_PUBLIC_API_MODE=real to run your own brief.
        </div>
      )}

      <div className="bo-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label className="bo-field">Brand
          <select className="bo-input" value={brandId} disabled={demo} onChange={(e) => { setBrandId(e.target.value); set("channels", []); }}>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
        <label className="bo-field">Campaign title
          <input className="bo-input" value={brief.title} disabled={demo} onChange={(e) => set("title", e.target.value)} />
        </label>
        <label className="bo-field">Objective
          <select className="bo-input" value={brief.objective} disabled={demo} onChange={(e) => set("objective", e.target.value as Objective)}>
            {OBJECTIVES.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label className="bo-field">Product / offer
          <input className="bo-input" value={brief.product} disabled={demo} onChange={(e) => set("product", e.target.value)} />
        </label>
        <label className="bo-field">Call to action
          <input className="bo-input" value={brief.cta} disabled={demo} maxLength={60} onChange={(e) => set("cta", e.target.value)} />
        </label>
        <label className="bo-field">Length (seconds)
          <input className="bo-input" type="number" min={6} max={180} value={brief.totalDurationS} disabled={demo}
            onChange={(e) => set("totalDurationS", Number(e.target.value))} />
        </label>
      </div>

      <label className="bo-field" style={{ marginTop: 12 }}>Key message
        <textarea className="bo-input" rows={2} maxLength={300} value={brief.keyMessage} disabled={demo} onChange={(e) => set("keyMessage", e.target.value)} />
      </label>

      <fieldset style={{ border: "none", marginTop: 12 }}>
        <legend className="bo-label">Channels</legend>
        <div className="bo-chips">
          {(brand?.channels ?? []).map((c) => (
            <label key={c.id} className="bo-chip" style={{ cursor: demo ? "default" : "pointer" }}>
              <input type="checkbox" checked={brief.channels.includes(c.id)} disabled={demo}
                onChange={() => set("channels", toggle(brief.channels, c.id))} style={{ accentColor: "var(--acc)" }} />
              {c.label} · {c.aspectRatio}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset style={{ border: "none", marginTop: 12 }}>
        <legend className="bo-label">Deliverables</legend>
        <div className="bo-chips">
          {MODALITIES.map((m) => {
            const meta = MODALITY_META[m];
            return (
              <label key={m} className="bo-chip" style={{ color: meta.color, cursor: demo ? "default" : "pointer" }}>
                <input type="checkbox" checked={brief.modalities.includes(m)} disabled={demo}
                  onChange={() => set("modalities", toggle(brief.modalities, m))} style={{ accentColor: "var(--acc)" }} />
                <meta.Icon size={11} /> {meta.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="bo-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 12 }}>
        <label className="bo-field">Model priority
          <select className="bo-input" value={brief.priority} disabled={demo} onChange={(e) => set("priority", e.target.value as Priority)}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="bo-field">Credit budget (optional)
          <input className="bo-input" type="number" min={1} value={brief.budgetCredits ?? ""} disabled={demo}
            onChange={(e) => set("budgetCredits", e.target.value ? Number(e.target.value) : null)} />
        </label>
      </div>

      <button type="submit" className="btn-cta" style={{ marginTop: 16, opacity: busy || !valid ? 0.6 : 1 }} disabled={busy || !valid}>
        {busy ? "Starting agents…" : demo ? "Replay agent run" : "Launch agents"}
      </button>
    </form>
  );
}
