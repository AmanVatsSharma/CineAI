export type { ApiClient, GenerationJob, JobEvent, Unsubscribe } from "./types";
export { MockClient } from "./mock-client";
export { HttpClient } from "./http-client";

// Singleton — swappable via NEXT_PUBLIC_API_MODE=real
import { MockClient } from "./mock-client";
import { HttpClient } from "./http-client";

const apiMode = typeof process !== "undefined"
  ? process.env["NEXT_PUBLIC_API_MODE"]
  : undefined;

export const apiClient =
  apiMode === "real"
    ? new HttpClient(process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001/api")
    : new MockClient();
