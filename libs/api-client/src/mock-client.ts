import { VIDEOS, MODELS } from "@cineai/mock-data";
import type { ApiClient, GenerationJob, JobEvent, Unsubscribe } from "./types";
import type { Video, Model } from "@cineai/domain-types";

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

type Listener = (evt: JobEvent) => void;

let jobCounter = 1;
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
