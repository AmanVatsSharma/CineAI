import type { ApiClient, GenerationJob, JobEvent, Unsubscribe } from "./types";
import type { Video, Model } from "@cineai/domain-types";

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
}
