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

export interface GenerationJob {
  id: string;
  prompt: string;
  status: "queued" | "processing" | "done" | "error";
  progress: number;
  videoId?: number;
  createdAt: string;
}

export type JobEvent =
  | { type: "queued"; job: GenerationJob }
  | { type: "progress"; job: GenerationJob; stage: string }
  | { type: "done"; job: GenerationJob }
  | { type: "error"; job: GenerationJob; message: string };

export type Unsubscribe = () => void;

export interface ApiClient {
  // Videos
  listVideos(): Promise<Video[]>;
  getVideo(id: number): Promise<Video>;

  // Models
  listModels(): Promise<Model[]>;

  // Generation
  createGeneration(prompt: string, modelName: string): Promise<GenerationJob>;
  getGeneration(id: string): Promise<GenerationJob>;
  subscribeJob(jobId: string, onEvent: (evt: JobEvent) => void): Unsubscribe;

  // Credits
  getCredits(): Promise<{ used: number; total: number }>;

  // Brand OS — model catalog across video / image / voice / music / sfx / copy
  listModelCatalog(modality?: Modality): Promise<ModelSpec[]>;
  routeModel(req: RouteRequest): Promise<RoutingDecision>;

  // Brand OS — brand kits + the Brand Guardian
  listBrands(): Promise<Brand[]>;
  getBrand(id: string): Promise<Brand>;
  checkBrand(brandId: string, req: CheckRequest): Promise<CheckResponse>;

  // Brand OS — campaigns run by the agent team
  listCampaigns(brandId?: string): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign>;
  createCampaign(brandId: string, brief: Brief): Promise<Campaign>;
  /** Calls back with every state change until the campaign reaches a terminal status. */
  subscribeCampaign(id: string, onUpdate: (c: Campaign) => void): Unsubscribe;
  updateFollowUp(campaignId: string, followUpId: string, status: FollowUpStatus): Promise<Campaign>;
}

export const TERMINAL_CAMPAIGN_STATUSES = ["ready", "needs_attention", "failed"] as const;
