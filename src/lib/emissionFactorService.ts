import authService from "./authService";
import { getApiBaseUrl } from "./apiBaseUrl";

const API_BASE_URL = getApiBaseUrl();

export interface EmissionFactor {
  ef_id: string;
  product: string;
  category: string | null;
  sub_category_1: string | null;
  sub_category_2: string | null;
  country_code: string | null;
  country_name: string | null;
  unit: string | null;
  kgco2e_per_unit: number | string | null;
  reference_year: number | null;
  source_db: string | null;
  embedding_text: string | null;
  created_date: string;
  updated_date: string;
}

export interface ListEmissionFactorsParams {
  page?: number;
  limit?: number;
  search?: string;
  country_code?: string;
  unit?: string;
}

export interface ListEmissionFactorsResponse {
  success: boolean;
  data: EmissionFactor[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface EmissionFactorStats {
  total: number;
  source_db_count: number;
  country_count: number;
  unit_count: number;
  last_updated: string | null;
}

export interface ImportValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportCsvSuccess {
  success: true;
  message: string;
  insertedCount: number;
}

export interface ImportCsvFailure {
  success: false;
  message: string;
  errorCount?: number;
  errors?: ImportValidationError[];
  sampleErrors?: ImportValidationError[];
  expected?: string[];
  received?: string[];
  mismatches?: string[];
}

export type ImportCsvResponse = ImportCsvSuccess | ImportCsvFailure;

function buildAuthHeaders(extra: Record<string, string> = {}): HeadersInit {
  const token = authService.getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function listEmissionFactors(
  params: ListEmissionFactorsParams = {}
): Promise<ListEmissionFactorsResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.country_code) qs.set("country_code", params.country_code);
  if (params.unit) qs.set("unit", params.unit);

  const url = `${API_BASE_URL}/api/emission-factors/list${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url, { headers: buildAuthHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function getEmissionFactorById(efId: string): Promise<EmissionFactor> {
  const res = await fetch(
    `${API_BASE_URL}/api/emission-factors/${encodeURIComponent(efId)}`,
    { headers: buildAuthHeaders() }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

export interface EmissionFactorCountry {
  country_code: string;
  country_name: string | null;
}

export interface MatchEmissionFactorInput {
  category: string;
  sub_category_1?: string | null;
  sub_category_2?: string | null;
  country_code: string;
  country_name?: string | null;
  year: number;
  unit: string;
}

export interface MatchEmissionFactorResult {
  matched: boolean;
  ef_id?: string;
  kgco2e_per_unit?: number | string;
  unit?: string;
  country_code?: string;
  country_name?: string;
  matched_step?: string;
  matched_embedding?: string;
  supplier_embedding: string;
  tried_steps: string[];
}

export async function matchEmissionFactor(
  input: MatchEmissionFactorInput,
): Promise<MatchEmissionFactorResult> {
  const res = await fetch(`${API_BASE_URL}/api/emission-factors/match`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as MatchEmissionFactorResult;
}

// ── Material/alloy composition (Q7 auto-fill) ────────────────────────────────

export interface CompositionRow {
  element: string;
  min_pct: number;
  max_pct: number;
  bafu_category: string;
  bafu_process: string;
  bafu_sub2: string;
}

export interface MaterialCompositionResult {
  alloy: string | null;
  rows: CompositionRow[];
  source: string;
}

// Resolve a material/alloy description into its constituent materials + % +
// BAFU layer mapping, to auto-populate the raw-materials question. Returns an
// empty rows array (not an error) when nothing could be resolved.
export async function resolveMaterialComposition(
  description: string,
): Promise<MaterialCompositionResult> {
  const res = await fetch(`${API_BASE_URL}/api/emission-factors/material-composition`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ description }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as MaterialCompositionResult;
}

// Full PCF calculation from the raw questionnaire data object.
export interface PcfCalcResult {
  input: any;
  result: {
    sections: {
      raw_materials: { total: number; rows: any[] };
      production: { total: number; detail: any };
      packaging: { total: number; rows: any[] };
      transport: { total: number; legs: any[] };
      waste: { total: number; detail: any };
    };
    pcf_total: number;
  };
}

export async function calculatePcfFromQuestionnaire(data: any): Promise<PcfCalcResult> {
  const res = await fetch(`${API_BASE_URL}/api/emission-factors/pcf-from-questionnaire`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as PcfCalcResult;
}

// Packaging types for the Q8 dropdown (each maps to a BAFU product).
export interface PackagingType {
  id: string;
  name: string;
}

export async function listPackagingTypes(): Promise<PackagingType[]> {
  const res = await fetch(`${API_BASE_URL}/api/emission-factors/meta/packaging-types`, {
    headers: buildAuthHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as PackagingType[];
}

export interface EmissionFactorLayerTriple {
  id: string;
  layer1: string;
  layer2: string | null;
  layer3: string | null;
}

export async function listEmissionFactorLayerTriples(): Promise<EmissionFactorLayerTriple[]> {
  const res = await fetch(`${API_BASE_URL}/api/emission-factors/meta/layer-triples`, {
    headers: buildAuthHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as EmissionFactorLayerTriple[];
}

export async function listEmissionFactorCountries(): Promise<EmissionFactorCountry[]> {
  const res = await fetch(`${API_BASE_URL}/api/emission-factors/meta/countries`, {
    headers: buildAuthHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as EmissionFactorCountry[];
}

export async function listEmissionFactorUnits(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/api/emission-factors/meta/units`, {
    headers: buildAuthHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as string[];
}

export async function getEmissionFactorStats(): Promise<EmissionFactorStats> {
  const res = await fetch(`${API_BASE_URL}/api/emission-factors/meta/stats`, {
    headers: buildAuthHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

export async function importEmissionFactorsCsv(file: File): Promise<ImportCsvResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/emission-factors/import-csv`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: formData,
  });
  const json = (await res.json()) as ImportCsvResponse;
  return json;
}
