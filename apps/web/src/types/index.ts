export type VideoStatus = "done" | "proc";
export type SceneId =
  | "cyberpunk"
  | "ocean"
  | "forest"
  | "galaxy"
  | "volcano"
  | "arctic"
  | "desert"
  | "waterfall";

export interface Video {
  id: number;
  name: string;
  model: string;
  modelCls: string;
  time: string;
  dur: string;
  status: VideoStatus;
  scene: SceneId;
}

export interface Model {
  name: string;
  by: string;
  color: string;
  tags: string[];
  quality: number;
  speed: number;
  realism: number;
  res: string;
  badge: string;
}

export interface NavItem {
  id: string;
  label: string;
  badge: string | null;
  badgeCls: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export type PageId =
  | "dashboard"
  | "generate"
  | "videos"
  | "storyboard"
  | "prompts"
  | "models"
  | "benchmarks"
  | "api"
  | "team"
  | "settings";

export type PageTitles = Record<PageId, string>;
