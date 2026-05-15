// Categorized Emission Factor API client.
// Backs the new ECOInvent EF cards (Electricity first) and the supplier
// questionnaire's Layer 1..4 cascade. The list endpoint is public so the
// unauthenticated supplier link can read the same rows the admin imported.

import authService from "./authService";
import { getApiBaseUrl } from "./apiBaseUrl";
import type { EmissionFactorRow } from "../pages/settings/CategorizedEmissionFactorsTable";

const API_BASE_URL = getApiBaseUrl();
const BASE = `${API_BASE_URL}/api/ecoinvent-emission-factor-data-setup/categorized-emission-factor`;

export type EfGroup =
  | "materials"
  | "electricity"
  | "fuel"
  | "packaging"
  | "vehicle"
  | "waste";

interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  code: number;
  data?: T;
}

interface CategorizedEfApiRow {
  ef_group: string;
  ef_id: string;
  scope: string | null;
  layer1: string | null;
  layer2: string | null;
  layer3: string | null;
  layer4: string | null;
  region: string | null;
  year: string | null;
  ef_value: string | null;
  unit: string | null;
  data_source: string | null;
  category: string | null;
}

const authHeaders = (): Record<string, string> => {
  const token = authService.getToken();
  return token ? { Authorization: token } : {};
};

const toRow = (r: CategorizedEfApiRow): EmissionFactorRow => ({
  id: r.ef_id,
  scope: r.scope || "",
  layer1: r.layer1 || "",
  layer2: r.layer2 || "",
  layer3: r.layer3 || "",
  layer4: r.layer4 || "",
  region: r.region || "",
  year: r.year ? parseInt(r.year, 10) || new Date().getFullYear() : new Date().getFullYear(),
  efValue: r.ef_value ? parseFloat(r.ef_value) || 0 : 0,
  unit: r.unit || "",
  dataSource: r.data_source || "",
  category: r.category || "",
});

const toApiPayload = (row: EmissionFactorRow) => ({
  ef_id: row.id,
  scope: row.scope,
  layer1: row.layer1,
  layer2: row.layer2,
  layer3: row.layer3,
  layer4: row.layer4,
  region: row.region,
  year: row.year,
  ef_value: row.efValue,
  unit: row.unit,
  data_source: row.dataSource,
  category: row.category,
});

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const body = (await res.json()) as ApiResponse<T>;
  if (!body.status) throw new Error(body.message || "Request failed");
  return body.data as T;
}

export async function listCategorizedEfRows(
  ef_group: EfGroup
): Promise<EmissionFactorRow[]> {
  const res = await fetch(`${BASE}/list?ef_group=${encodeURIComponent(ef_group)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await jsonOrThrow<CategorizedEfApiRow[]>(res);
  return (data || []).map(toRow);
}

export async function bulkAddCategorizedEfRows(
  ef_group: EfGroup,
  rows: EmissionFactorRow[]
): Promise<EmissionFactorRow[]> {
  const res = await fetch(`${BASE}/bulk/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ ef_group, rows: rows.map(toApiPayload) }),
  });
  const data = await jsonOrThrow<CategorizedEfApiRow[]>(res);
  return (data || []).map(toRow);
}

export async function addCategorizedEfRow(
  ef_group: EfGroup,
  row: EmissionFactorRow
): Promise<EmissionFactorRow> {
  const res = await fetch(`${BASE}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ ef_group, ...toApiPayload(row) }),
  });
  const data = await jsonOrThrow<CategorizedEfApiRow>(res);
  return toRow(data);
}

export async function updateCategorizedEfRow(
  ef_group: EfGroup,
  row: EmissionFactorRow
): Promise<EmissionFactorRow> {
  const res = await fetch(`${BASE}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ ef_group, ...toApiPayload(row) }),
  });
  const data = await jsonOrThrow<CategorizedEfApiRow>(res);
  return toRow(data);
}

export async function deleteCategorizedEfRow(
  ef_group: EfGroup,
  ef_id: string
): Promise<void> {
  const res = await fetch(`${BASE}/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ ef_group, ef_id }),
  });
  await jsonOrThrow<null>(res);
}
