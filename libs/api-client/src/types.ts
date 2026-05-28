import type { Video, Model } from "@cineai/domain-types";

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
}
