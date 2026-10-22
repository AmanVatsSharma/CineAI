import { VIDEOS, MODELS, MODEL_CATALOG, BRANDS, SAMPLE_CAMPAIGN } from "@cineai/mock-data";
import type { ApiClient, GenerationJob, JobEvent, Unsubscribe } from "./types";
import type {
  Brand,
  Brief,
  Campaign,
  CheckRequest,
  CheckResponse,
  FollowUpStatus,
  Modality,
  Model,
  ModelSpec,
  RouteRequest,
  RoutingDecision,
  Video,
} from "@cineai/domain-types";
import { mockCheck } from "./mock-guardian";

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

type Listener = (evt: JobEvent) => void;

let jobCounter = 1;
let campaignCounter = 1;
const campaigns = new Map<string, Campaign>([[SAMPLE_CAMPAIGN.id, SAMPLE_CAMPAIGN]]);
const campaignListeners = new Map<string, Set<(c: Campaign) => void>>();
const jobs = new Map<string, GenerationJob>();
const listeners = new Map<string, Set<Listener>>();

function emit(id: string, evt: JobEvent) {
  const set = listeners.get(id);
  if (!set) return;
  set.forEach((fn) => fn(evt));
}

export class MockClient implements ApiClient {
  async listVideos(): Promise<Video[]> {
    await delay();
    return VIDEOS;
  }

  async getVideo(id: number): Promise<Video> {
    await delay(200);
    const v = VIDEOS.find((v) => v.id === id);
    if (!v) throw new Error(`Video ${id} not found`);
    return v;
  }

  async listModels(): Promise<Model[]> {
    await delay();
    return MODELS;
  }

  async createGeneration(prompt: string, _modelName: string): Promise<GenerationJob> {
    await delay(300);
    const job: GenerationJob = {
      id: `job-${jobCounter++}`,
      prompt,
      status: "queued",
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    jobs.set(job.id, job);
    this._simulateJob(job.id);
    return job;
  }

  async getGeneration(id: string): Promise<GenerationJob> {
    await delay(100);
    const job = jobs.get(id);
    if (!job) throw new Error(`Job ${id} not found`);
    return job;
  }

  subscribeJob(jobId: string, onEvent: Listener): Unsubscribe {
    let set = listeners.get(jobId);
    if (!set) {
      set = new Set();
      listeners.set(jobId, set);
    }
    set.add(onEvent);
    // Replay current state on subscribe
    const current = jobs.get(jobId);
    if (current) {
      queueMicrotask(() =>
        onEvent(
          current.status === "done"
            ? { type: "done", job: current }
            : { type: "progress", job: current, stage: stageFor(current.progress) }
        )
      );
    }
    return () => {
      set?.delete(onEvent);
      if (set && set.size === 0) listeners.delete(jobId);
    };
  }

  async getCredits(): Promise<{ used: number; total: number }> {
    await delay(150);
    return { used: 3720, total: 6000 };
  }

  // ── Brand OS (demo mode) ─────────────────────────────────────────────────
  // Campaigns replay a run recorded from the real agents pipeline (see
  // libs/mock-data/src/brand-os.json); NEXT_PUBLIC_API_MODE=real runs your own brief.

  async listModelCatalog(modality?: Modality): Promise<ModelSpec[]> {
    await delay(200);
    return modality ? MODEL_CATALOG.filter((m) => m.modality === modality) : MODEL_CATALOG;
  }

  async routeModel(req: RouteRequest): Promise<RoutingDecision> {
    await delay(150);
    const pool = MODEL_CATALOG.filter((m) => m.modality === req.modality);
    const pick = pool.find((m) => req.useCase && m.useCases.includes(req.useCase)) ?? pool[0];
    if (!pick) throw new Error(`No ${req.modality} model available`);
    return {
      model: pick,
      score: 0,
      reason: "demo mode — connect the agents service for real routing",
      alternatives: [],
    };
  }

  async listBrands(): Promise<Brand[]> {
    await delay(250);
    return BRANDS;
  }

  async getBrand(id: string): Promise<Brand> {
    await delay(150);
    const b = BRANDS.find((b) => b.id === id);
    if (!b) throw new Error(`Brand ${id} not found`);
    return b;
  }

  async checkBrand(brandId: string, req: CheckRequest): Promise<CheckResponse> {
    await delay(250);
    return mockCheck(await this.getBrand(brandId), req);
  }

  async listCampaigns(brandId?: string): Promise<Campaign[]> {
    await delay(300);
    const all = [...campaigns.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return brandId ? all.filter((c) => c.brandId === brandId) : all;
  }

  async getCampaign(id: string): Promise<Campaign> {
    await delay(100);
    const c = campaigns.get(id);
    if (!c) throw new Error(`Campaign ${id} not found`);
    return c;
  }

  async createCampaign(brandId: string, brief: Brief): Promise<Campaign> {
    await delay(300);
    const now = new Date().toISOString();
    const id = `cmp-demo-${campaignCounter++}`;
    const queued: Campaign = {
      ...SAMPLE_CAMPAIGN, id, brandId, brief,
      status: "queued", progress: 0, scenes: [], deliverables: [], ads: [], followUps: [],
      steps: [], totalCredits: 0, brandScore: 0, createdAt: now, updatedAt: now,
    };
    campaigns.set(id, queued);
    this._replayCampaign(id);
    return queued;
  }

  subscribeCampaign(id: string, onUpdate: (c: Campaign) => void): Unsubscribe {
    let set = campaignListeners.get(id);
    if (!set) campaignListeners.set(id, (set = new Set()));
    set.add(onUpdate);
    const current = campaigns.get(id);
    if (current) queueMicrotask(() => onUpdate(current));
    return () => {
      set?.delete(onUpdate);
      if (set && set.size === 0) campaignListeners.delete(id);
    };
  }

  async updateFollowUp(campaignId: string, followUpId: string, status: FollowUpStatus): Promise<Campaign> {
    await delay(150);
    const c = await this.getCampaign(campaignId);
    const next: Campaign = {
      ...c,
      followUps: c.followUps.map((f) => (f.id === followUpId ? { ...f, status } : f)),
    };
    campaigns.set(campaignId, next);
    return next;
  }

  /** Reveal the recorded run stage by stage so the UI exercises every state. */
  private _replayCampaign(id: string) {
    const rec = SAMPLE_CAMPAIGN;
    const stages: { after: number; patch: (c: Campaign) => Partial<Campaign> }[] = [
      { after: 500, patch: () => ({ status: "planning", scenes: rec.scenes, steps: rec.steps.slice(0, 1) }) },
      { after: 1400, patch: () => ({ steps: rec.steps.slice(0, 5) }) },
      { after: 2300, patch: () => ({
          status: "producing", progress: 30, totalCredits: rec.totalCredits,
          steps: rec.steps.slice(0, 5 + Math.floor((rec.steps.length - 8) / 3)),
          deliverables: rec.deliverables.map((d, i) => ({
            ...d, status: i < rec.deliverables.length / 3 ? d.status : "queued", uri: i < rec.deliverables.length / 3 ? d.uri : null,
          })),
        }) },
      { after: 3400, patch: () => ({
          progress: 65, steps: rec.steps.slice(0, 5 + Math.floor(((rec.steps.length - 8) * 2) / 3)),
          deliverables: rec.deliverables.map((d, i) => ({
            ...d, status: i < (rec.deliverables.length * 2) / 3 ? d.status : "generating", uri: i < (rec.deliverables.length * 2) / 3 ? d.uri : null,
          })),
        }) },
      { after: 4400, patch: () => ({ status: "reviewing", progress: 90, deliverables: rec.deliverables, steps: rec.steps.slice(0, -2) }) },
      { after: 5200, patch: (c) => ({
          status: rec.status, progress: 100, ads: rec.ads, followUps: rec.followUps, steps: rec.steps,
          brandScore: rec.brandScore, updatedAt: c.updatedAt,
        }) },
    ];
    stages.forEach(({ after, patch }) =>
      setTimeout(() => {
        const cur = campaigns.get(id);
        if (!cur) return;
        const next = { ...cur, ...patch(cur) };
        campaigns.set(id, next);
        campaignListeners.get(id)?.forEach((fn) => fn(next));
      }, after)
    );
  }

  private _simulateJob(id: string) {
    const steps: { progress: number; stage: string; after: number }[] = [
      { progress: 5,  stage: "Analyzing prompt…",           after: 300 },
      { progress: 15, stage: "Allocating GPU cluster…",     after: 900 },
      { progress: 30, stage: "Sampling latent space…",      after: 1800 },
      { progress: 50, stage: "Rendering frames 1/24…",      after: 2700 },
      { progress: 70, stage: "Rendering frames 18/24…",     after: 3800 },
      { progress: 85, stage: "Applying motion blur…",       after: 4700 },
      { progress: 95, stage: "Encoding H.264…",             after: 5500 },
      { progress: 100, stage: "Done",                       after: 6200 },
    ];

    const initial = jobs.get(id);
    if (initial) emit(id, { type: "queued", job: initial });

    steps.forEach(({ progress, stage, after }) => {
      setTimeout(() => {
        const job = jobs.get(id);
        if (!job) return;
        const next: GenerationJob = {
          ...job,
          status: progress >= 100 ? "done" : "processing",
          progress,
          videoId: progress >= 100 ? 1 : undefined,
        };
        jobs.set(id, next);
        if (progress >= 100) emit(id, { type: "done", job: next });
        else emit(id, { type: "progress", job: next, stage });
      }, after);
    });
  }
}

function stageFor(p: number): string {
  if (p < 15) return "Analyzing prompt…";
  if (p < 30) return "Allocating GPU…";
  if (p < 70) return "Rendering frames…";
  if (p < 95) return "Applying motion blur…";
  return "Encoding…";
}
