"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { apiClient } from "@cineai/api-client";
import type { Brand, CheckResponse, GuardianReport } from "@cineai/domain-types";
import { FindingList, scoreColor } from "./shared";

const SAMPLE_COPY = "A guaranteed path to real results — buy now!!";
const SAMPLE_VISUAL = "Neon-lit street at night, banner in #FF0000";

function ReportBlock({ title, report }: { title: string; report: GuardianReport }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span className="bo-label" style={{ margin: 0 }}>{title}</span>
        <span style={{ fontSize: 11, color: report.passed ? "var(--acc)" : "var(--rose)", fontWeight: 700 }}>
          {report.passed ? "PASS" : "BLOCKED"} ·{" "}
          <span style={{ fontFamily: "var(--fm)", color: scoreColor(report.score) }}>{report.score}</span>
        </span>
      </div>
      <FindingList findings={report.findings} />
    </div>
  );
}

/** Live Brand Guardian: paste copy or an image/video prompt, see what the agents would catch. */
export function GuardianPanel({ brand, onError }: { brand: Brand; onError: (msg: string) => void }) {
  const [text, setText] = useState(SAMPLE_COPY);
  const [visual, setVisual] = useState(SAMPLE_VISUAL);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    const req = {
      text: text.trim() ? text : undefined,
      visualPrompt: visual.trim() ? visual : undefined,
    };
    if (req.text === undefined && req.visualPrompt === undefined) return;
    setBusy(true);
    try {
      setResult(await apiClient.checkBrand(brand.id, req));
    } catch (e) {
      onError(e instanceof Error ? e.message : "Brand check failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel">
      <div className="sh" style={{ marginBottom: 12 }}>
        <div className="sh-title" style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <ShieldCheck size={15} color="var(--gold)" /> Brand Guardian
        </div>
        <span className="bo-chip">{brand.name} rules</span>
      </div>

      <label className="bo-field">
        Copy (headline, script line, caption…)
        <textarea className="bo-input" value={text} onChange={(e) => setText(e.target.value)} rows={3} />
      </label>
      <label className="bo-field" style={{ marginTop: 10 }}>
        Image / video prompt
        <textarea className="bo-input" value={visual} onChange={(e) => setVisual(e.target.value)} rows={2} />
      </label>
      <button type="button" className="btn-cta" style={{ marginTop: 12, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={run}>
        {busy ? "Checking…" : "Check against brand"}
      </button>

      {result?.textReport && <ReportBlock title="Copy" report={result.textReport} />}
      {result?.revisedText != null && result.textReport && result.revisedText !== text && (
        <div style={{ marginTop: 12 }}>
          <div className="bo-label">Guardian&apos;s revision</div>
          <div className="bo-input" style={{ lineHeight: 1.55, cursor: "text" }}>{result.revisedText}</div>
          <button type="button" className="mbtn mbtn-sec" style={{ marginTop: 8 }} onClick={() => setText(result.revisedText ?? "")}>
            Use revision
          </button>
          <div style={{ fontSize: 10.5, color: "var(--txt3)", marginTop: 6 }}>
            Deleted words can break a sentence — always proofread.
          </div>
        </div>
      )}
      {result?.visualReport && <ReportBlock title="Visual prompt" report={result.visualReport} />}
    </div>
  );
}
