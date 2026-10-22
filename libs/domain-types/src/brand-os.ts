/**
 * Brand OS contract — mirrors apps/agents (Pydantic, camelCase on the wire).
 * Keep the two in step; apps/agents/tests/test_fixtures.py guards the sample data.
 */

// ── Model catalog ──────────────────────────────────────────────────────────

export type Modality = "video" | "image" | "voice" | "music" | "sfx" | "copy";
export type CreditUnit = "second" | "image" | "1k_chars" | "track" | "clip" | "request";
export type Priority = "quality" | "speed" | "cost" | "balanced";

export interface ModelSpec {
  id: string;
  name: string;
  provider: string;
  modality: Modality;
  useCases: string[];
  capabilities: string[];
  quality: number;
  speed: number;
  creditCost: number;
  unit: CreditUnit;
  maxDurationS: number | null;
  badge: string | null;
}

export interface RouteRequest {
  modality: Modality;
  useCase?: string;
  priority?: Priority;
  require?: string[];
  maxUnitCost?: number;
}

export interface RoutingDecision {
  model: ModelSpec;
  score: number;
  reason: string;
  alternatives: string[];
}

// ── Brand kit ──────────────────────────────────────────────────────────────

export interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  neutrals: string[];
  forbidden: string[];
}

export interface VisualStyle {
  palette: Palette;
  typography: { headingFont: string; bodyFont: string };
  logo: { clearSpacePct: number; minWidthPx: number; allowedBackgrounds: string[] };
  imageryStyle: string;
  lighting: string;
  avoidVisuals: string[];
}

export interface DisclaimerRule {
  triggerTerms: string[];
  text: string;
}

export interface Voice {
  persona: string;
  tone: string[];
  dos: string[];
  donts: string[];
  bannedWords: string[];
  preferredTerms: Record<string, string>;
  disclaimers: DisclaimerRule[];
  ctaPhrases: string[];
  maxExclamations: number;
}

export interface AudioIdentity {
  voiceStyle: string;
  musicMood: string[];
  bpmMin: number;
  bpmMax: number;
  sonicLogo: string | null;
}

export interface ChannelRule {
  id: string;
  label: string;
  aspectRatio: string;
  maxDurationS: number;
  maxHeadlineChars: number;
  maxBodyChars: number;
  requiresCta: boolean;
}

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  audience: string;
  mission: string;
  voice: Voice;
  visual: VisualStyle;
  audio: AudioIdentity;
  channels: ChannelRule[];
  competitors: string[];
  /** Seeded demo data rather than a real brand book. */
  sample: boolean;
}

// ── Brand Guardian ─────────────────────────────────────────────────────────

export type Severity = "error" | "warning" | "info";

export interface Finding {
  code: string;
  severity: Severity;
  message: string;
  excerpt: string | null;
  suggestion: string | null;
}

export interface GuardianReport {
  passed: boolean;
  score: number;
  findings: Finding[];
}

export interface CheckRequest {
  text?: string;
  visualPrompt?: string;
  channel?: string;
  field?: "headline" | "body" | "cta";
}

export interface CheckResponse {
  textReport: GuardianReport | null;
  visualReport: GuardianReport | null;
  revisedText: string | null;
}

// ── Campaigns ──────────────────────────────────────────────────────────────

export type AgentRole =
  | "creative_director"
  | "scriptwriter"
  | "brand_guardian"
  | "image_artist"
  | "video_producer"
  | "audio_producer"
  | "ad_strategist"
  | "follow_up"
  | "orchestrator";

export type Objective = "awareness" | "consideration" | "conversion" | "retention" | "launch";

export type CampaignStatus =
  | "queued"
  | "planning"
  | "producing"
  | "reviewing"
  | "ready"
  | "needs_attention"
  | "failed";

export type DeliverableStatus = "queued" | "generating" | "done" | "needs_review" | "failed";

export interface Brief {
  title: string;
  objective: Objective;
  product: string;
  keyMessage: string;
  cta: string;
  audience?: string | null;
  totalDurationS: number;
  channels: string[];
  modalities: Modality[];
  priority: Priority;
  budgetCredits?: number | null;
}

export interface Scene {
  index: number;
  beat: string;
  title: string;
  visual: string;
  voiceover: string;
  onScreenText: string;
  durationS: number;
  camera: string;
  mood: string;
}

export interface Deliverable {
  id: string;
  sceneIndex: number | null;
  modality: Modality;
  agent: AgentRole;
  modelId: string;
  modelName: string;
  prompt: string;
  negativePrompt: string | null;
  text: string | null;
  status: DeliverableStatus;
  uri: string | null;
  credits: number;
  revisions: number;
  brandScore: number;
  findings: Finding[];
}

export interface AdVariant {
  id: string;
  channel: string;
  channelLabel: string;
  aspectRatio: string;
  durationS: number;
  sceneIndexes: number[];
  headline: string;
  body: string;
  cta: string;
  revisions: number;
  brandScore: number;
  passed: boolean;
  findings: Finding[];
}

export interface AgentStep {
  at: string;
  agent: AgentRole;
  action: string;
  detail: string;
}

export type FollowUpStatus = "open" | "done" | "dismissed";

export interface FollowUp {
  id: string;
  title: string;
  detail: string;
  owner: "agent" | "human";
  dueAt: string;
  status: FollowUpStatus;
  related: string | null;
}

export interface Campaign {
  id: string;
  brandId: string;
  brief: Brief;
  status: CampaignStatus;
  progress: number;
  scenes: Scene[];
  deliverables: Deliverable[];
  ads: AdVariant[];
  followUps: FollowUp[];
  steps: AgentStep[];
  totalCredits: number;
  brandScore: number;
  createdAt: string;
  updatedAt: string;
}
