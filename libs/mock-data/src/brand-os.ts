import type { Brand, Campaign, ModelSpec } from "@cineai/domain-types";
import data from "./brand-os.json";

// brand-os.json is generated from the real agents pipeline:
//   cd apps/agents && python -m scripts.export_fixtures
// (apps/agents/tests/test_fixtures.py fails if it drifts.)
export const MODEL_CATALOG = data.modelCatalog as unknown as ModelSpec[];
export const BRANDS = data.brands as unknown as Brand[];
export const SAMPLE_CAMPAIGN = data.sampleCampaign as unknown as Campaign;
