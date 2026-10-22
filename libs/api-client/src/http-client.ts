import { TERMINAL_CAMPAIGN_STATUSES } from "./types";
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

export class HttpClient implements ApiClient {
  constructor(private baseUrl: string) {}

  private async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
  }

  listVideos(): Promise<Video[]> {
    return this.fetch("/videos");
  }

  getVideo(id: number): Promise<Video> {
    return this.fetch(`/videos/${id}`);
  }

  listModels(): Promise<Model[]> {
    return this.fetch("/models");
  }

  createGeneration(prompt: string, modelName: string): Promise<GenerationJob> {
    return this.fetch("/generations", {
      method: "POST",
      body: JSON.stringify({ prompt, modelName }),
    });
  }

  getGeneration(id: string): Promise<GenerationJob> {
    return this.fetch(`/generations/${id}`);
  }

  subscribeJob(jobId: string, onEvent: (evt: JobEvent) => void): Unsubscribe {
    const es = new EventSource(`${this.baseUrl}/generations/${jobId}/events`);
    es.onmessage = (m) => {
      try {
        onEvent(JSON.parse(m.data) as JobEvent);
      } catch {
        /* ignore malformed */
      }
    };
    return () => es.close();
  }

  getCredits(): Promise<{ used: number; total: number }> {
    return this.fetch("/me/credits");
  }

  // ── Brand OS ── (paths match apps/agents, so API_URL can point straight at it)

  listModelCatalog(modality?: Modality): Promise<ModelSpec[]> {
    return this.fetch(`/models/catalog${modality ? `?modality=${modality}` : ""}`);
  }

  routeModel(req: RouteRequest): Promise<RoutingDecision> {
    return this.fetch("/models/route", { method: "POST", body: JSON.stringify(req) });
  }

  listBrands(): Promise<Brand[]> {
    return this.fetch("/brands");
  }

  getBrand(id: string): Promise<Brand> {
    return this.fetch(`/brands/${encodeURIComponent(id)}`);
  }

  checkBrand(brandId: string, req: CheckRequest): Promise<CheckResponse> {
    return this.fetch(`/brands/${encodeURIComponent(brandId)}/check`, {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  listCampaigns(brandId?: string): Promise<Campaign[]> {
    return this.fetch(`/campaigns${brandId ? `?brand_id=${encodeURIComponent(brandId)}` : ""}`);
  }

  getCampaign(id: string): Promise<Campaign> {
    return this.fetch(`/campaigns/${encodeURIComponent(id)}`);
  }

  createCampaign(brandId: string, brief: Brief): Promise<Campaign> {
    return this.fetch("/campaigns", { method: "POST", body: JSON.stringify({ brandId, brief }) });
  }

  /** The agents service has no push channel for campaigns, so poll until terminal. */
  subscribeCampaign(id: string, onUpdate: (c: Campaign) => void): Unsubscribe {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      if (stopped) return;
      try {
        const c = await this.getCampaign(id);
        if (stopped) return;
        onUpdate(c);
        if ((TERMINAL_CAMPAIGN_STATUSES as readonly string[]).includes(c.status)) return;
      } catch {
        /* transient — retry on the next tick */
      }
      timer = setTimeout(tick, 800);
    };
    void tick();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }

  updateFollowUp(campaignId: string, followUpId: string, status: FollowUpStatus): Promise<Campaign> {
    return this.fetch(
      `/campaigns/${encodeURIComponent(campaignId)}/follow-ups/${encodeURIComponent(followUpId)}`,
      { method: "PATCH", body: JSON.stringify({ status }) }
    );
  }
}
