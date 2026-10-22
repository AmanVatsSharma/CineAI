"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { API_MODE, TERMINAL_CAMPAIGN_STATUSES, apiClient } from "@cineai/api-client";
import type { Brand, Brief, Campaign, FollowUp } from "@cineai/domain-types";
import { Reveal } from "@cineai/ui";
import {
  ActivityTab, AdsTab, AgentTeam, AssetsTab, FollowUpsTab, ScenesTab,
} from "../../../components/brand-os/CampaignTabs";
import { NewCampaignForm } from "../../../components/brand-os/NewCampaignForm";
import { ScoreBadge, StatusPill, fmtDate } from "../../../components/brand-os/shared";
import { useDashboard } from "../DashboardContext";

type Tab = "scenes" | "assets" | "ads" | "followups" | "activity";
const isTerminal = (c: Campaign) => (TERMINAL_CAMPAIGN_STATUSES as readonly string[]).includes(c.status);

export default function CampaignsPage() {
  const { showToast } = useDashboard();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("scenes");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const watching = useRef(new Map<string, () => void>());

  const upsert = useCallback((c: Campaign) => {
    setCampaigns((list) => (list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [c, ...list]));
  }, []);

  const watch = useCallback((c: Campaign) => {
    if (isTerminal(c) || watching.current.has(c.id)) return;
    watching.current.set(c.id, apiClient.subscribeCampaign(c.id, (next) => {
      upsert(next);
      if (isTerminal(next)) {
        watching.current.get(c.id)?.();
        watching.current.delete(c.id);
      }
    }));
  }, [upsert]);

  useEffect(() => {
    let cancelled = false;
    const subs = watching.current;
    Promise.all([apiClient.listBrands(), apiClient.listCampaigns()])
      .then(([b, c]) => {
        if (cancelled) return;
        setBrands(b);
        setCampaigns(c);
        setSelectedId(c[0]?.id ?? null);
        c.forEach(watch);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Could not load campaigns"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
      subs.forEach((stop) => stop());
      subs.clear();
    };
  }, [watch]);

  const launch = async (brandId: string, brief: Brief) => {
    setBusy(true);
    try {
      const c = await apiClient.createCampaign(brandId, brief);
      upsert(c);
      watch(c);
      setSelectedId(c.id);
      setTab("activity");
      setCreating(false);
      showToast("Agents are on it", "var(--acc)");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not start campaign", "var(--rose)");
    } finally {
      setBusy(false);
    }
  };

  const toggleFollowUp = async (campaign: Campaign, f: FollowUp) => {
    const status = f.status === "done" ? "open" : "done";
    upsert({ ...campaign, followUps: campaign.followUps.map((x) => (x.id === f.id ? { ...x, status } : x)) });
    try {
      upsert(await apiClient.updateFollowUp(campaign.id, f.id, status));
    } catch (e) {
      upsert(campaign); // roll back the optimistic change
      showToast(e instanceof Error ? e.message : "Could not update follow-up", "var(--rose)");
    }
  };

  if (error) {
    return (
      <div className="page">
        <div className="panel" role="alert">
          <div className="sh-title" style={{ color: "var(--rose)", marginBottom: 6 }}>Couldn&apos;t load campaigns</div>
          <div style={{ fontSize: 12.5, color: "var(--txt2)", lineHeight: 1.6 }}>
            {error}. In real mode the agents service must be running (<code>nx run agents:dev</code>) and
            <code> NEXT_PUBLIC_API_URL</code> must point at it.
          </div>
        </div>
      </div>
    );
  }

  const selected = campaigns.find((c) => c.id === selectedId) ?? null;
  const brandName = (id: string) => brands.find((b) => b.id === id)?.name ?? id;
  const open = selected?.followUps.filter((f) => f.status === "open").length ?? 0;

  return (
    <div className="page">
      <div className="bo-layout">
        <Reveal>
          <aside style={{ display: "flex", flexDirection: "column", gap: 8 }} aria-label="Campaigns">
            <button type="button" className="btn-cta" onClick={() => setCreating(true)} style={{ justifyContent: "center" }}>
              <Plus size={14} /> New campaign
            </button>
            {loading && <div style={{ fontSize: 12, color: "var(--txt2)" }}>Loading campaigns…</div>}
            {campaigns.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`bo-camp${c.id === selectedId && !creating ? " active" : ""}`}
                onClick={() => { setSelectedId(c.id); setCreating(false); }}
              >
                <span style={{ fontSize: 13, fontWeight: 700 }}>{c.brief.title}</span>
                <span style={{ fontSize: 11, color: "var(--txt2)" }}>{brandName(c.brandId)} · {fmtDate(c.createdAt)}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StatusPill status={c.status} />
                  {c.brandScore > 0 && <ScoreBadge score={c.brandScore} />}
                </span>
              </button>
            ))}
          </aside>
        </Reveal>

        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {creating && brands.length > 0 && (
            <NewCampaignForm brands={brands} busy={busy} onSubmit={launch} onCancel={() => setCreating(false)} />
          )}

          {!creating && !selected && !loading && (
            <div className="panel" style={{ color: "var(--txt2)", fontSize: 13 }}>
              No campaigns yet. Start one and the agent team will plan scenes, produce assets, cut ads and schedule follow-ups
              — all inside your brand guidelines.
            </div>
          )}

          {!creating && selected && (
            <>
              <div className="panel">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-.4px" }}>{selected.brief.title}</h1>
                    <div style={{ fontSize: 12, color: "var(--txt2)", marginTop: 4 }}>
                      {brandName(selected.brandId)} · {selected.brief.objective} · {selected.brief.totalDurationS}s ·{" "}
                      {selected.brief.channels.length} channel{selected.brief.channels.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                    <Stat label="Status"><StatusPill status={selected.status} /></Stat>
                    <Stat label="Brand score">{selected.brandScore ? <ScoreBadge score={selected.brandScore} /> : "—"}</Stat>
                    <Stat label="Credits"><span style={{ fontFamily: "var(--fm)" }}>{selected.totalCredits || "—"}</span></Stat>
                  </div>
                </div>

                {!isTerminal(selected) && (
                  <div className="proc-track" style={{ margin: "14px 0 4px", width: "100%" }} role="progressbar"
                    aria-valuenow={selected.progress} aria-valuemin={0} aria-valuemax={100}>
                    <div className="proc-fill" style={{ width: `${selected.progress}%`, animation: "none", transition: "width .4s" }} />
                  </div>
                )}
                <div style={{ marginTop: 12 }}><AgentTeam campaign={selected} /></div>
              </div>

              <div className="bo-tabs" role="tablist" aria-label="Campaign sections">
                {([
                  ["scenes", `Scenes (${selected.scenes.length})`],
                  ["assets", `Assets (${selected.deliverables.length})`],
                  ["ads", `Ads (${selected.ads.length})`],
                  ["followups", `Follow-ups${open ? ` (${open} open)` : ""}`],
                  ["activity", "Agent activity"],
                ] as [Tab, string][]).map(([id, label]) => (
                  <button key={id} type="button" role="tab" aria-selected={tab === id}
                    className={`bo-tab${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>
                    {label}
                  </button>
                ))}
              </div>

              <div role="tabpanel">
                {tab === "scenes" && <ScenesTab campaign={selected} />}
                {tab === "assets" && <AssetsTab campaign={selected} />}
                {tab === "ads" && <AdsTab campaign={selected} />}
                {tab === "followups" && <FollowUpsTab campaign={selected} onToggle={(f) => toggleFollowUp(selected, f)} />}
                {tab === "activity" && <ActivityTab campaign={selected} />}
              </div>

              {API_MODE === "mock" && (
                <div style={{ fontSize: 10.5, color: "var(--txt3)" }}>
                  Demo data: output recorded from the real agents pipeline. Generated assets are stub:// placeholders until model providers are connected.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div className="bo-label" style={{ margin: "0 0 4px" }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}
