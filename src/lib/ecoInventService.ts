import authService from "./authService";
import { getApiBaseUrl } from "./apiBaseUrl";

const API_BASE_URL = getApiBaseUrl();

// ECOInvent Emission Factor Data Setup entities
export type EcoInventEntity =
  | "materials-emission-factor"
  | "electricity-emission-factor"
  | "fuel-emission-factor"
  | "packaging-emission-factor"
  | "packaging-treatment-type"
  | "vehicle-type-emission-factor"
  | "waste-material-type-emission-factor"
  | "waste-treatment-type";

// Common emission factor fields
export interface EcoInventItem {
  id?: string;
  // Name field varies by entity type
  element_name?: string; // materials-emission-factor
  element_type?: string; // materials-emission-factor (for bulk import)
  type_of_energy?: string; // electricity-emission-factor
  treatment_type?: string; // electricity-emission-factor (for bulk import)
  fuel_type?: string; // fuel-emission-factor
  sub_fuel_type?: string; // fuel-emission-factor (for bulk import)
  material_type?: string; // packaging-emission-factor
  name?: string; // packaging-treatment-type, waste-treatment-type
  code?: string; // packaging-treatment-type, waste-treatment-type
  vehicle_type?: string; // vehicle-type-emission-factor
  waste_type?: string; // waste-material-type-emission-factor
  // Common emission factor fields
  ef_eu_region?: string;
  ef_india_region?: string;
  ef_global_region?: string;
  year?: number;
  unit?: string;
  iso_country_code?: string;
  // Foreign keys (for display/selection in UI)
  ptt_id?: string; // packaging-emission-factor -> treatment type (for dropdown selection)
  wtt_id?: string; // waste-material-type-emission-factor -> waste treatment type (for dropdown selection)
  vt_id?: string; // vehicle-type-emission-factor -> vehicle type
  // API expects treatment_type_name instead of ptt_id/wtt_id
  treatment_type_name?: string; // packaging-emission-factor & waste-material-type-emission-factor
}

// Entity-specific configuration
export interface EcoInventEntityConfig {
  nameField: string;
  displayName: string;
  idField: string;
}

// Configuration for each entity type
export const entityConfigs: Record<EcoInventEntity, EcoInventEntityConfig> = {
  "materials-emission-factor": {
    nameField: "element_name",
    displayName: "Element Name",
    idField: "mef_id",
  },
  "electricity-emission-factor": {
    nameField: "type_of_energy",
    displayName: "Type of Energy",
    idField: "eef_id",
  },
  "fuel-emission-factor": {
    nameField: "fuel_type",
    displayName: "Fuel Type",
    idField: "fef_id",
  },
  "packaging-emission-factor": {
    nameField: "material_type",
    displayName: "Material Type",
    idField: "pef_id",
  },
  "packaging-treatment-type": {
    nameField: "name",
    displayName: "Treatment Type",
    idField: "ptt_id",
  },
  "vehicle-type-emission-factor": {
    nameField: "vehicle_type",
    displayName: "Vehicle Type",
    idField: "wtef_id",
  },
  "waste-material-type-emission-factor": {
    nameField: "waste_type",
    displayName: "Waste Type",
    idField: "wmttef_id",
  },
  "waste-treatment-type": {
    nameField: "name",
    displayName: "Treatment Type",
    idField: "wtt_id",
  },
};

// Get entity config
export function getEntityConfig(entity: EcoInventEntity): EcoInventEntityConfig {
  return entityConfigs[entity];
}

function getAuthHeaders() {
  const token = authService.getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token || "",
  } as Record<string, string>;
}

function endpoint(
  entity: EcoInventEntity,
  action: "list/search" | "add" | "update" | "delete" | "bulk/add" | "drop-down-list"
) {
  return `${API_BASE_URL}/api/ecoinvent-emission-factor-data-setup/${entity}/${action}`;
}

// Extract ID from an item based on entity type
function extractId(entity: EcoInventEntity, item: any): string {
  const config = entityConfigs[entity];
  return (
    item[config.idField]?.toString() ||
    item.id?.toString() ||
    item._id?.toString() ||
    ""
  );
}

// Extract the name value from an item based on entity type
function extractName(entity: EcoInventEntity, item: any): string {
  const config = entityConfigs[entity];
  return item[config.nameField] || "";
}

// Normalize item from API response
function normalizeItem(entity: EcoInventEntity, item: any): EcoInventItem {
  const config = entityConfigs[entity];

  // Treatment types (packaging and waste) use name and code only
  if (entity === "packaging-treatment-type" || entity === "waste-treatment-type") {
    return {
      id: extractId(entity, item),
      name: item.name || "",
      code: item.code || "",
    };
  }

  // Packaging emission factor includes treatment_type_name
  if (entity === "packaging-emission-factor") {
    return {
      id: extractId(entity, item),
      [config.nameField]: extractName(entity, item),
      ptt_id: item.ptt_id || "", // Keep for UI dropdown selection
      treatment_type_name: item.treatment_type_name || "", // API field
      ef_eu_region: item.ef_eu_region || "",
      ef_india_region: item.ef_india_region || "",
      ef_global_region: item.ef_global_region || "",
      year: item.year || new Date().getFullYear(),
      unit: item.unit || "",
      iso_country_code: item.iso_country_code || "",
    };
  }

  // Waste material type emission factor includes treatment_type_name
  if (entity === "waste-material-type-emission-factor") {
    return {
      id: extractId(entity, item),
      [config.nameField]: extractName(entity, item),
      wtt_id: item.wtt_id || "", // Keep for UI dropdown selection
      treatment_type_name: item.treatment_type_name || "", // API field
      ef_eu_region: item.ef_eu_region || "",
      ef_india_region: item.ef_india_region || "",
      ef_global_region: item.ef_global_region || "",
      year: item.year || new Date().getFullYear(),
      unit: item.unit || "",
      iso_country_code: item.iso_country_code || "",
    };
  }

  return {
    id: extractId(entity, item),
    [config.nameField]: extractName(entity, item),
    ef_eu_region: item.ef_eu_region || "",
    ef_india_region: item.ef_india_region || "",
    ef_global_region: item.ef_global_region || "",
    year: item.year || new Date().getFullYear(),
    unit: item.unit || "",
    iso_country_code: item.iso_country_code || "",
  };
}

export async function listEcoInventData(
  entity: EcoInventEntity,
  params?: { searchValue?: string }
): Promise<EcoInventItem[]> {
  const url = new URL(endpoint(entity, "list/search"));
  if (params?.searchValue)
    url.searchParams.set("searchValue", params.searchValue);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  // Expected: { status, message, code, data: { totalCount, list: [] } }
  const normalize = (item: any) => normalizeItem(entity, item);

  if (Array.isArray((data as any)?.data?.list)) {
    return ((data as any).data.list as any[]).map(normalize);
  }
  // Fallbacks
  if (Array.isArray(data)) return (data as any[]).map(normalize);
  if (Array.isArray((data as any)?.data))
    return ((data as any).data as any[]).map(normalize);
  if (Array.isArray((data as any)?.items))
    return ((data as any).items as any[]).map(normalize);
  return [];
}

export async function addEcoInventData(
  entity: EcoInventEntity,
  item: EcoInventItem
): Promise<{ success: boolean; message?: string }> {
  try {
    const config = entityConfigs[entity];
    let payload: any;

    // Treatment types (packaging and waste) use name and code only
    if (entity === "packaging-treatment-type" || entity === "waste-treatment-type") {
      payload = {
        name: item.name || "",
        code: item.code || "",
      };
    }
    // Packaging emission factor includes ptt_id (single create uses ID)
    else if (entity === "packaging-emission-factor") {
      payload = {
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        ptt_id: item.ptt_id || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      };
    }
    // Waste material type emission factor includes wtt_id (single create uses ID)
    else if (entity === "waste-material-type-emission-factor") {
      payload = {
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        wtt_id: item.wtt_id || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      };
    } else {
      payload = {
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      };
    }

    const res = await fetch(endpoint(entity, "add"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const success = !!(data?.success ?? data?.status);
    return {
      success,
      message: data?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while adding item",
    };
  }
}

export async function updateEcoInventData(
  entity: EcoInventEntity,
  item: EcoInventItem & { id: string }
): Promise<{ success: boolean; message?: string }> {
  try {
    const config = entityConfigs[entity];
    let payload: any;

    // Treatment types (packaging and waste) use name and code only
    if (entity === "packaging-treatment-type" || entity === "waste-treatment-type") {
      payload = {
        [config.idField]: item.id,
        name: item.name || "",
        code: item.code || "",
      };
    }
    // Packaging emission factor includes ptt_id (single update uses ID)
    else if (entity === "packaging-emission-factor") {
      payload = {
        [config.idField]: item.id,
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        ptt_id: item.ptt_id || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      };
    }
    // Waste material type emission factor includes wtt_id (single update uses ID)
    else if (entity === "waste-material-type-emission-factor") {
      payload = {
        [config.idField]: item.id,
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        wtt_id: item.wtt_id || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      };
    } else {
      payload = {
        [config.idField]: item.id,
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      };
    }

    const res = await fetch(endpoint(entity, "update"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify([payload]),
    });
    const data = await res.json();
    const success = !!(data?.success ?? data?.status);
    return {
      success,
      message: data?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while updating item",
    };
  }
}

export async function deleteEcoInventData(
  entity: EcoInventEntity,
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const config = entityConfigs[entity];
    const res = await fetch(endpoint(entity, "delete"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ [config.idField]: id }),
    });
    const data = await res.json();
    const success = !!(data?.success ?? data?.status);
    return {
      success,
      message: data?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while deleting item",
    };
  }
}

export async function bulkAddEcoInventData(
  entity: EcoInventEntity,
  items: EcoInventItem[]
): Promise<{ success: boolean; message: string; addedCount?: number }> {
  try {
    const config = entityConfigs[entity];
    let payloadItems: any[];

    // Treatment types (packaging and waste) use name and code only
    if (entity === "packaging-treatment-type" || entity === "waste-treatment-type") {
      payloadItems = items.map((item) => ({
        name: item.name || "",
        code: item.code || "",
      }));
    }
    // Packaging emission factor includes treatment_type_name
    else if (entity === "packaging-emission-factor") {
      payloadItems = items.map((item) => ({
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        treatment_type_name: item.treatment_type_name || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      }));
    }
    // Waste material type emission factor includes treatment_type_name
    else if (entity === "waste-material-type-emission-factor") {
      payloadItems = items.map((item) => ({
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        treatment_type_name: item.treatment_type_name || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      }));
    }
    // Materials emission factor includes element_type
    else if (entity === "materials-emission-factor") {
      payloadItems = items.map((item) => ({
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        element_type: item.element_type || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      }));
    }
    // Electricity emission factor includes treatment_type
    else if (entity === "electricity-emission-factor") {
      payloadItems = items.map((item) => ({
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        treatment_type: item.treatment_type || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      }));
    }
    // Fuel emission factor includes sub_fuel_type
    else if (entity === "fuel-emission-factor") {
      payloadItems = items.map((item) => ({
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        sub_fuel_type: item.sub_fuel_type || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      }));
    } else {
      payloadItems = items.map((item) => ({
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      }));
    }

    const res = await fetch(endpoint(entity, "bulk/add"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payloadItems),
    });
    const data = await res.json();
    if (data?.success || data?.status) {
      return {
        success: true,
        message: data?.message || "Bulk import successful",
        addedCount: data?.data?.addedCount || items.length,
      };
    }
    return {
      success: false,
      message: data?.message || "Bulk import failed",
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred during bulk import",
    };
  }
}

export async function getDropdownList(
  entity: EcoInventEntity
): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch(endpoint(entity, "drop-down-list"), {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (Array.isArray(data?.data)) {
      return (data.data as any[]).map((item) => ({
        id: extractId(entity, item),
        name: extractName(entity, item),
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Get treatment types dropdown for packaging emission factor
export async function getTreatmentTypeDropdown(): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch(endpoint("packaging-treatment-type", "drop-down-list"), {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (Array.isArray(data?.data)) {
      return (data.data as any[]).map((item) => ({
        id: item.ptt_id || item.id || "",
        name: item.name || "",
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Get waste material types dropdown (distinct waste_type from waste emission factor setup)
export async function getWasteTypeDropdown(): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch(endpoint("waste-material-type-emission-factor", "drop-down-list"), {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (Array.isArray(data?.data)) {
      return (data.data as any[]).map((item) => ({
        id: item.wmttef_id || item.id || "",
        name: item.waste_type || item.name || "",
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Get packaging material types dropdown (distinct material_type from packaging emission factor setup)
export async function getPackagingMaterialTypeDropdown(): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch(endpoint("packaging-emission-factor", "drop-down-list"), {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (Array.isArray(data?.data)) {
      // Deduplicate by material_type
      const seen = new Set<string>();
      const result: { id: string; name: string }[] = [];
      for (const item of data.data as any[]) {
        const name = item.material_type || item.name || "";
        if (name && !seen.has(name)) {
          seen.add(name);
          result.push({ id: item.pef_id || item.id || "", name });
        }
      }
      return result;
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Get waste treatment types dropdown for waste material type emission factor
export async function getWasteTreatmentTypeDropdown(): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch(endpoint("waste-treatment-type", "drop-down-list"), {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (Array.isArray(data?.data)) {
      return (data.data as any[]).map((item) => ({
        id: item.wtt_id || item.id || "",
        name: item.name || "",
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Get vehicle types dropdown for vehicle type emission factor
export async function getVehicleTypeDropdown(): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/master-data-setup/vehicle-type/drop-down-list`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (Array.isArray(data?.data)) {
      return (data.data as any[]).map((item) => ({
        id: item.vt_id || item.id || "",
        name: item.name || "",
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Get materials (material + material type) dropdown for materials emission factor
export async function getMaterialsMaterialTypeDropdown(): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ecoinvent-emission-factor-data-setup/materials-emission-factor/material-materialtype-drop-down-list`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (Array.isArray(data?.data)) {
      return (data.data as any[]).map((item) => ({
        id: item.mcm_id || item.id || "",
        name: item.combined_name || item.name || "",
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Get energy source + energy type dropdown for electricity emission factor
export async function getEnergySourceEnergyTypeDropdown(): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ecoinvent-emission-factor-data-setup/electricity-emission-factor/energysource-energytype-drop-down-list`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (Array.isArray(data?.data)) {
      return (data.data as any[]).map((item) => ({
        id: item.es_id || item.id || "",
        name: item.combined_name || item.name || "",
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Get fuel type + sub fuel type dropdown for fuel emission factor
export async function getFuelTypeSubTypeDropdown(): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ecoinvent-emission-factor-data-setup/fuel-emission-factor/fueltype-fuelsubtype-drop-down-list`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (Array.isArray(data?.data)) {
      return (data.data as any[]).map((item) => ({
        id: item.ft_id || item.id || "",
        name: item.combined_name || item.name || "",
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

// ============================================================
// NEW: 4-layer (Categorized) EF schema helpers
// Used by CategorizedEmissionFactorsTable.tsx (new setup UI).
// Maps frontend camelCase <-> backend snake_case.
// Row shape: { id, scope, layer1-4, region, year, efValue, unit,
// dataSource, category, dbId } where dbId is the row's <x>ef_id PK.
// ============================================================

export type LayeredEFEntity =
  | "materials-emission-factor"
  | "electricity-emission-factor"
  | "fuel-emission-factor"
  | "packaging-emission-factor"
  | "vehicle-type-emission-factor"
  | "waste-material-type-emission-factor";

export interface LayeredEFRow {
  id: string;           // ef_code from Excel (e.g. EF_001937) — the business identifier
  dbId?: string;        // internal PK (mef_id / eef_id / etc.) — for update/delete
  scope: string;
  layer1: string;
  layer2: string;
  layer3: string;
  layer4: string;
  region: string;
  year: number;
  efValue: number;
  unit: string;
  dataSource: string;
  category?: string;    // frontend-only, not sent to backend
}

// Routing helper for the 6 layered EF endpoints.
function layeredEndpoint(
  entity: LayeredEFEntity,
  action: "list/search" | "add" | "update" | "delete" | "bulk/add" | "drop-down-list"
): string {
  // Note: backend route prefix matches existing one-per-EF-type pattern.
  return `${API_BASE_URL}/api/ecoinvent-emission-factor-data-setup/${entity}/${action}`;
}

// API row -> frontend row (snake_case -> camelCase)
function fromApi(entity: LayeredEFEntity, item: any): LayeredEFRow {
  const config = entityConfigs[entity];
  return {
    id: item.ef_code || "",
    dbId: item[config.idField] || item.id || "",
    scope: item.scope || "",
    layer1: item.layer1 || "",
    layer2: item.layer2 || "",
    layer3: item.layer3 || "",
    layer4: item.layer4 || "",
    region: item.region || "",
    year: typeof item.year === "number" ? item.year : parseInt(item.year, 10) || new Date().getFullYear(),
    efValue: typeof item.ef_value === "number" ? item.ef_value : parseFloat(item.ef_value) || 0,
    unit: item.unit || "",
    dataSource: item.data_source || "",
  };
}

// Frontend row -> API payload (camelCase -> snake_case). Strips `category` and `dbId`.
function toApi(row: LayeredEFRow): Record<string, unknown> {
  return {
    ef_code: row.id,
    scope: row.scope || null,
    layer1: row.layer1 || null,
    layer2: row.layer2 || null,
    layer3: row.layer3 || null,
    layer4: row.layer4,
    region: row.region,
    year: row.year,
    ef_value: row.efValue,
    unit: row.unit || null,
    data_source: row.dataSource || null,
  };
}

export async function listLayeredEF(
  entity: LayeredEFEntity,
  params?: { searchValue?: string; region?: string; year?: string | number }
): Promise<LayeredEFRow[]> {
  const url = new URL(layeredEndpoint(entity, "list/search"));
  if (params?.searchValue) url.searchParams.set("searchValue", params.searchValue);
  if (params?.region) url.searchParams.set("region", params.region);
  if (params?.year !== undefined) url.searchParams.set("year", String(params.year));
  const res = await fetch(url.toString(), { method: "GET", headers: getAuthHeaders() });
  const data = await res.json();
  const list: any[] = Array.isArray(data?.data?.list)
    ? data.data.list
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];
  return list.map((it) => fromApi(entity, it));
}

export async function addLayeredEF(
  entity: LayeredEFEntity,
  row: LayeredEFRow
): Promise<{ success: boolean; message?: string; row?: LayeredEFRow }> {
  try {
    const res = await fetch(layeredEndpoint(entity, "add"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(toApi(row)),
    });
    const data = await res.json();
    const success = !!(data?.success ?? data?.status);
    return {
      success,
      message: data?.message,
      row: success && data?.data ? fromApi(entity, data.data) : undefined,
    };
  } catch {
    return { success: false, message: "Network error while adding row" };
  }
}

export async function updateLayeredEF(
  entity: LayeredEFEntity,
  row: LayeredEFRow
): Promise<{ success: boolean; message?: string }> {
  if (!row.dbId) return { success: false, message: "Missing internal id (dbId)" };
  try {
    const config = entityConfigs[entity];
    const payload = [{ ...toApi(row), [config.idField]: row.dbId }];
    const res = await fetch(layeredEndpoint(entity, "update"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const success = !!(data?.success ?? data?.status);
    return { success, message: data?.message };
  } catch {
    return { success: false, message: "Network error while updating row" };
  }
}

export async function deleteLayeredEF(
  entity: LayeredEFEntity,
  dbId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const config = entityConfigs[entity];
    const res = await fetch(layeredEndpoint(entity, "delete"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ [config.idField]: dbId }),
    });
    const data = await res.json();
    const success = !!(data?.success ?? data?.status);
    return { success, message: data?.message };
  } catch {
    return { success: false, message: "Network error while deleting row" };
  }
}

export async function bulkAddLayeredEF(
  entity: LayeredEFEntity,
  rows: LayeredEFRow[]
): Promise<{ success: boolean; message?: string; addedCount?: number }> {
  try {
    const payload = rows.map(toApi);
    const res = await fetch(layeredEndpoint(entity, "bulk/add"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const success = !!(data?.success ?? data?.status);
    return {
      success,
      message: data?.message,
      addedCount: Array.isArray(data?.data) ? data.data.length : undefined,
    };
  } catch {
    return { success: false, message: "Network error during bulk import" };
  }
}
