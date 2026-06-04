import authService from "./authService";
import { getApiBaseUrl } from "./apiBaseUrl";

const API_BASE_URL = getApiBaseUrl();

export interface EmissionFactor {
  ef_id: string;
  product: string;
  material: string | null;
  process: string | null;
  activity_type: string | null;
  category: string | null;
  sub_category_1: string | null;
  sub_category_2: string | null;
  sub_category_3: string | null;
  sub_category_4: string | null;
  country_code: string | null;
  country_name: string | null;
  region: string | null;
  geo_fallback_chain: string | null;
  unit: string | null;
  unit_kind: string | null;
  recycled_content: string | null;
  factor_suitability: string | null;
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
  unit_kind?: string;
  source_db?: string;
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
