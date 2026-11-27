"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@cineai/api-client";
import type { Modality, ModelSpec } from "@cineai/domain-types";
import { MODALITY_META } from "./shared";

const UNIT_LABEL: Record<ModelSpec["unit"], string> = {
  second: "/ sec", image: "/ image", "1k_chars": "/ 1k chars", track: "/ track", clip: "/ clip", request: "/ request",
};

/** Every model the agents can route to, across all content types — not just video. */
export function ModelCatalog() {
  const [models, setModels] = useState<ModelSpec[] | null>(null);
  const [filter, setFilter] = useState<Modality | "all">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient.listModelCatalog()
      .then((m) => !cancelled && setModels(m))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Could not load the model catalog"));
    return () => { cancelled = true; };
  }, []);

  if (error) return <div className="panel" role="alert" style={{ color: "var(--rose)", fontSize: 12.5 }}>{error}</div>;
  if (!models) return <div className="panel" style={{ color: "var(--txt2)", fontSize: 12.5 }}>Loading model catalog…</div>;

  const shown = models.filter((m) => filter === "all" || m.modality === filter);
  const count = (m: Modality) => models.filter((x) => x.modality === m).length;

  return (
    <div className="panel">
      <div className="sh" style={{ marginBottom: 6 }}>
        <div className="sh-title">Model catalog — every content type</div>
        <span style={{ fontSize: 11, color: "var(--txt2)" }}>{models.length} models · routed per brand deliverable</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--txt2)", marginBottom: 12, lineHeight: 1.55 }}>
        Brand agents pick the best model per asset by use case, required capabilities, budget and your quality/speed/cost priority.
      </div>

      <div className="bo-tabs" role="tablist" aria-label="Filter by content type" style={{ marginBottom: 12, width: "fit-content" }}>
        <button type="button" role="tab" aria-selected={filter === "all"} className={`bo-tab${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
          All ({models.length})
        </button>
        {(Object.keys(MODALITY_META) as Modality[]).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={filter === m} className={`bo-tab${filter === m ? " active" : ""}`} onClick={() => setFilter(m)}>
            {MODALITY_META[m].label} ({count(m)})
          </button>
        ))}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="bo-table">
          <thead>
            <tr><th>Model</th><th>Type</th><th>Best for</th><th>Capabilities</th><th>Quality</th><th>Speed</th><th>Cost</th></tr>
          </thead>
          <tbody>
            {shown.map((m) => {
              const meta = MODALITY_META[m.modality];
              return (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.name} {m.badge && <span className="bo-chip acc" style={{ marginLeft: 4 }}>{m.badge}</span>}</div>
                    <div style={{ fontSize: 10.5, color: "var(--txt3)" }}>{m.provider}</div>
                  </td>
                  <td style={{ color: meta.color, whiteSpace: "nowrap" }}><meta.Icon size={12} style={{ verticalAlign: -1, marginRight: 5 }} />{meta.label}</td>
                  <td style={{ color: "var(--txt2)" }}>{m.useCases.map((u) => u.replace(/_/g, " ")).join(", ")}</td>
                  <td style={{ color: "var(--txt2)" }}>{m.capabilities.map((c) => c.replace(/_/g, " ")).join(", ") || "—"}</td>
                  <td style={{ fontFamily: "var(--fm)" }}>{m.quality}</td>
                  <td style={{ fontFamily: "var(--fm)" }}>{m.speed}</td>
                  <td style={{ fontFamily: "var(--fm)", whiteSpace: "nowrap" }}>{m.creditCost} cr <span style={{ color: "var(--txt3)" }}>{UNIT_LABEL[m.unit]}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--txt3)", marginTop: 10 }}>
        Quality, speed and credit figures are placeholders until provider benchmarks land.
      </div>
    </div>
  );
}
