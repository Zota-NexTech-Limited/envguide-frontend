import authService from "./authService";
import { getApiBaseUrl } from "./apiBaseUrl";

const API_BASE_URL = getApiBaseUrl();

export interface EmissionFactor {
  ef_id: string;
  domain: string;
  category: string | null;
  sub_category: string | null;
  group_name: string | null;
  specific_type: string | null;
  dataset_name: string | null;
  geography: string | null;
  unit: string | null;
  gwp_100: number | string | null;
  is_legacy: boolean | null;
  search_text: string | null;
  source_db: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListEmissionFactorsParams {
  page?: number;
  limit?: number;
  search?: string;
  country_code?: string;
  unit_kind?: string;
  source_db?: string;
  category?: string;
  sub_category?: string;
  group?: string;
  specific_type?: string;
}

export type EfTaxonomyLevel =
  | "category"
  | "sub_category"
  | "group"
  | "specific_type";

export interface EfTaxonomyParams {
  level: EfTaxonomyLevel;
  category?: string;
  sub_category?: string;
  group?: string;
  q?: string;
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
  unit_kind_count: number;
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
  if (params.unit_kind) qs.set("unit_kind", params.unit_kind);
  if (params.source_db) qs.set("source_db", params.source_db);
  if (params.category) qs.set("category", params.category);
  if (params.sub_category) qs.set("sub_category", params.sub_category);
  if (params.group) qs.set("group", params.group);
  if (params.specific_type) qs.set("specific_type", params.specific_type);

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

// Cascading taxonomy for the filter dropdowns. Returns a distinct, sorted list
// of values for the requested level, narrowed by the chosen parent(s):
//   category                                  → all categories
//   sub_category (+category)                  → sub-categories in that category
//   group        (+category,+sub_category)    → groups in that sub-category
//   specific_type(+category,+sub,+group)      → specific types in that group
// The specific_type level returns row objects server-side; we flatten to the
// distinct type names for the filter dropdown.
export async function getEfTaxonomyOptions(
  params: EfTaxonomyParams
): Promise<string[]> {
  const qs = new URLSearchParams();
  qs.set("level", params.level);
  if (params.category) qs.set("category", params.category);
  if (params.sub_category) qs.set("sub_category", params.sub_category);
  if (params.group) qs.set("group", params.group);
  if (params.q) qs.set("q", params.q);

  const res = await fetch(
    `${API_BASE_URL}/api/emission-factors/meta/taxonomy?${qs}`,
    { headers: buildAuthHeaders() }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  const data: any[] = json.data || [];
  const values = data.map((x) => (typeof x === "string" ? x : x?.specific_type));
  return Array.from(new Set(values.filter((v): v is string => !!v)));
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
