"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@cineai/api-client";
import type { Brand } from "@cineai/domain-types";
import { Reveal } from "@cineai/ui";
import { GuardianPanel } from "../../../components/brand-os/GuardianPanel";
import { useDashboard } from "../DashboardContext";

function Swatch({ name, hex, forbidden = false }: { name: string; hex: string; forbidden?: boolean }) {
  return (
    <div className="bo-swatch">
      <div
        className="bo-swatch-c"
        style={{
          background: hex,
          opacity: forbidden ? 0.55 : 1,
          backgroundImage: forbidden
            ? "repeating-linear-gradient(135deg, transparent 0 6px, rgba(0,0,0,.55) 6px 8px)"
            : undefined,
        }}
        aria-label={`${name} ${hex}`}
      />
      <div className="bo-swatch-n">{name}<b>{hex.toUpperCase()}</b></div>
    </div>
  );
}

const Chips = ({ items, cls = "" }: { items: string[]; cls?: string }) => (
  <div className="bo-chips">
    {items.map((t) => <span key={t} className={`bo-chip ${cls}`}>{t}</span>)}
  </div>
);

export default function BrandsPage() {
  const { showToast } = useDashboard();
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .listBrands()
      .then((b) => {
        if (cancelled) return;
        setBrands(b);
        setActiveId((cur) => cur ?? b[0]?.id ?? null);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Could not load brands"));
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="page">
        <div className="panel" role="alert">
          <div className="sh-title" style={{ color: "var(--rose)", marginBottom: 6 }}>Couldn&apos;t load brands</div>
          <div style={{ fontSize: 12.5, color: "var(--txt2)", lineHeight: 1.6 }}>
            {error}. In real mode the agents service must be running (<code>nx run agents:dev</code>) and
            <code> NEXT_PUBLIC_API_URL</code> must point at it.
          </div>
        </div>
      </div>
    );
  }
  if (!brands) {
    return <div className="page"><div className="panel" style={{ color: "var(--txt2)", fontSize: 12.5 }}>Loading brands…</div></div>;
  }

  const brand = brands.find((b) => b.id === activeId) ?? brands[0];
  if (!brand) {
    return <div className="page"><div className="panel" style={{ color: "var(--txt2)" }}>No brands yet.</div></div>;
  }
  const { voice, visual, audio } = brand;
  const p = visual.palette;

  return (
    <div className="page">
      <Reveal>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }} role="tablist" aria-label="Brands">
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={b.id === brand.id}
              className={`bo-tab${b.id === brand.id ? " active" : ""}`}
              style={{ border: "1px solid var(--b1)", padding: "7px 14px" }}
              onClick={() => setActiveId(b.id)}
            >
              {b.name}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-.5px" }}>{brand.name}</h1>
              <div style={{ color: "var(--acc)", fontSize: 13, margin: "2px 0 8px" }}>{brand.tagline}</div>
              <div style={{ fontSize: 12.5, color: "var(--txt2)", maxWidth: 640, lineHeight: 1.6 }}>{brand.mission}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              <span className="bo-chip">{brand.industry}</span>
              {brand.sample && <span className="bo-chip gold" title="Seeded demo data">Sample guidelines — replace with your brand book</span>}
            </div>
          </div>
          <div className="bo-label">Audience</div>
          <div style={{ fontSize: 12.5, color: "var(--txt2)" }}>{brand.audience}</div>
        </div>
      </Reveal>

      <div className="bo-grid">
        <Reveal>
          <div className="panel">
            <div className="sh-title" style={{ marginBottom: 12 }}>Visual identity</div>
            <div className="bo-label">Palette</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Swatch name="Primary" hex={p.primary} />
              <Swatch name="Secondary" hex={p.secondary} />
              <Swatch name="Accent" hex={p.accent} />
              {p.neutrals.map((n, i) => <Swatch key={n} name={`Neutral ${i + 1}`} hex={n} />)}
            </div>
            {p.forbidden.length > 0 && (
              <>
                <div className="bo-label">Never use</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {p.forbidden.map((f) => <Swatch key={f} name="Forbidden" hex={f} forbidden />)}
                </div>
              </>
            )}
            <div className="bo-label">Typography</div>
            <div className="bo-row"><span>Headings</span><span>{visual.typography.headingFont}</span></div>
            <div className="bo-row"><span>Body</span><span>{visual.typography.bodyFont}</span></div>
            <div className="bo-label">Imagery</div>
            <div style={{ fontSize: 12, color: "var(--txt2)", lineHeight: 1.55 }}>{visual.imageryStyle}. Lighting: {visual.lighting}.</div>
            {visual.avoidVisuals.length > 0 && (
              <>
                <div className="bo-label">Never show</div>
                <Chips items={visual.avoidVisuals} cls="rose" />
              </>
            )}
            <div className="bo-label">Logo</div>
            <div className="bo-row"><span>Clear space</span><span>{visual.logo.clearSpacePct}%</span></div>
            <div className="bo-row"><span>Min width</span><span>{visual.logo.minWidthPx}px</span></div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="panel">
            <div className="sh-title" style={{ marginBottom: 12 }}>Voice &amp; copy rules</div>
            <div style={{ fontSize: 12.5, color: "var(--txt2)", lineHeight: 1.55, marginBottom: 8 }}>{voice.persona}</div>
            <Chips items={voice.tone} cls="acc" />
            <div className="bo-label">Do</div>
            <ul className="bo-list">{voice.dos.map((d) => <li key={d}><span style={{ color: "var(--acc)" }}>✓</span>{d}</li>)}</ul>
            <div className="bo-label">Don&apos;t</div>
            <ul className="bo-list">{voice.donts.map((d) => <li key={d}><span style={{ color: "var(--rose)" }}>✕</span>{d}</li>)}</ul>
            <div className="bo-label">Banned words</div>
            <Chips items={voice.bannedWords} cls="rose" />
            {Object.keys(voice.preferredTerms).length > 0 && (
              <>
                <div className="bo-label">Preferred terms</div>
                {Object.entries(voice.preferredTerms).map(([avoid, use]) => (
                  <div className="bo-row" key={avoid}><span>{avoid}</span><span>→ {use}</span></div>
                ))}
              </>
            )}
            {voice.disclaimers.length > 0 && (
              <>
                <div className="bo-label">Required disclaimers</div>
                {voice.disclaimers.map((d) => (
                  <div key={d.text} style={{ fontSize: 12, color: "var(--txt2)", lineHeight: 1.5, marginBottom: 6 }}>
                    <span style={{ color: "var(--txt)" }}>&ldquo;{d.text}&rdquo;</span>
                    <div style={{ fontSize: 10.5, color: "var(--txt3)" }}>when copy mentions: {d.triggerTerms.join(", ")}</div>
                  </div>
                ))}
              </>
            )}
            <div className="bo-label">Approved CTAs</div>
            <Chips items={voice.ctaPhrases} />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <GuardianPanel key={brand.id} brand={brand} onError={(m) => showToast(m, "var(--rose)")} />

            <div className="panel">
              <div className="sh-title" style={{ marginBottom: 12 }}>Audio identity</div>
              <div className="bo-row"><span>Voice</span><span style={{ textAlign: "right" }}>{audio.voiceStyle}</span></div>
              <div className="bo-row"><span>Tempo</span><span>{audio.bpmMin}–{audio.bpmMax} BPM</span></div>
              {audio.sonicLogo && <div className="bo-row"><span>Sonic logo</span><span style={{ textAlign: "right" }}>{audio.sonicLogo}</span></div>}
              <div className="bo-label">Music mood</div>
              <Chips items={audio.musicMood} />
            </div>

            <div className="panel">
              <div className="sh-title" style={{ marginBottom: 8 }}>Channels</div>
              <table className="bo-table">
                <thead><tr><th>Channel</th><th>Format</th><th>Max</th><th>Headline / body</th></tr></thead>
                <tbody>
                  {brand.channels.map((c) => (
                    <tr key={c.id}>
                      <td>{c.label}</td>
                      <td>{c.aspectRatio}</td>
                      <td>{c.maxDurationS}s</td>
                      <td style={{ fontFamily: "var(--fm)", fontSize: 11 }}>{c.maxHeadlineChars} / {c.maxBodyChars}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
