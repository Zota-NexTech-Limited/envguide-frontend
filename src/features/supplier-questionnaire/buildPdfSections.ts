import { QUESTIONNAIRE_SCHEMA } from "../../config/questionnaireSchema";
import type { QuestionnaireField } from "../../config/questionnaireSchema";

// Safe stringifier — dayjs / Date / plain value, never throws.
const safeToString = (val: any): string => {
  if (val === null || val === undefined) return "";
  if (val instanceof Date) {
    try { return val.toISOString().split("T")[0]; } catch { return ""; }
  }
  if (typeof val === "object") {
    const v: any = val;
    if (typeof v.format === "function") {
      try { return v.format("YYYY-MM-DD"); } catch { /* fall through */ }
    }
    if (typeof v.toISOString === "function") {
      try { return v.toISOString().split("T")[0]; } catch { /* fall through */ }
    }
    if (typeof v.$d !== "undefined" && v.$d instanceof Date) {
      try { return v.$d.toISOString().split("T")[0]; } catch { /* fall through */ }
    }
  }
  try { return String(val); } catch { return ""; }
};

// Shape matching the backend PDF helper contract
export interface PdfFieldItem {
  type: "field";
  label: string;
  value: string;
}

export interface PdfTableItem {
  type: "table";
  label: string;
  columns: string[];
  rows: string[][];
}

export type PdfItem = PdfFieldItem | PdfTableItem;

export interface PdfSection {
  title: string;
  items: PdfItem[];
}

// Helpers ---------------------------------------------------------
const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[part];
  }, obj);
};

const hasValue = (value: any): boolean => {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
};

const isDependencyMet = (
  field: QuestionnaireField,
  formData: any
): boolean => {
  if (!field.dependency) return true;
  const depValue = getNestedValue(formData, field.dependency.field);
  if (depValue === undefined || depValue === null || depValue === "")
    return false;

  const expectedValue = field.dependency.value;
  if (field.dependency.operator === "contains") {
    return Array.isArray(depValue) && depValue.includes(expectedValue);
  }
  if (typeof expectedValue === "boolean") {
    const depBool =
      typeof depValue === "string"
        ? depValue.toLowerCase() === "yes" || depValue.toLowerCase() === "true"
        : Boolean(depValue);
    return depBool === expectedValue;
  }
  return (
    String(depValue).toLowerCase() === String(expectedValue).toLowerCase()
  );
};

const cleanTableRows = (rows: any[]): any[] => {
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row) =>
      row &&
      typeof row === "object" &&
      Object.values(row).some(
        (v) => v !== undefined && v !== null && v !== "" && v !== 0
      )
  );
};

// Columns that EnviGuide auto-populates from BOM/products — not supplier-entered data
const AUTO_POPULATED_COLUMNS = new Set([
  "mpn",
  "component_name",
  "product_name",
  "material_number",
  "bom_id",
  "product_id",
]);

// Determine whether a table row has real supplier-entered data
// (i.e. at least one value in a column NOT in AUTO_POPULATED_COLUMNS).
// Used to hide tables where supplier didn't actually fill anything.
const hasUserEnteredData = (
  rows: any[],
  autoPopulated: boolean
): boolean => {
  if (!Array.isArray(rows) || rows.length === 0) return false;
  // If the table isn't auto-populated, any non-empty row counts as user data
  if (!autoPopulated) {
    return rows.some(
      (row) =>
        row &&
        typeof row === "object" &&
        Object.values(row).some(
          (v) => v !== undefined && v !== null && v !== "" && v !== 0
        )
    );
  }
  // For auto-populated tables, require data in non-auto-populated columns
  return rows.some(
    (row) =>
      row &&
      typeof row === "object" &&
      Object.entries(row).some(([key, value]) => {
        if (AUTO_POPULATED_COLUMNS.has(key)) return false;
        return (
          value !== undefined && value !== null && value !== "" && value !== 0
        );
      })
  );
};

const cleanLabel = (label: string): string =>
  label.replace(/\s*\(Optional\)\s*$/i, "").trim();

const formatFieldValue = (
  field: QuestionnaireField,
  value: any,
  dropdownMaps: Record<string, Record<string, string>>
): string => {
  if (!hasValue(value)) return "";

  if (field.type === "checkbox" && !field.options) {
    return value === true ? "Acknowledged" : "Not Acknowledged";
  }
  if (field.type === "radio") {
    return safeToString(value);
  }
  if (field.type === "checkbox" && field.options) {
    return Array.isArray(value) ? value.join(", ") : safeToString(value);
  }
  if (field.type === "tags") {
    return Array.isArray(value) ? value.join(", ") : safeToString(value);
  }
  if (field.type === "file") {
    const files = Array.isArray(value) ? value : [value];
    return files
      .map((f: any) =>
        typeof f === "string" ? f.split("/").pop() || f : f?.name || "File"
      )
      .join(", ");
  }
  if (field.type === "select" && field.apiDropdown) {
    const map = dropdownMaps[field.apiDropdown];
    const k = safeToString(value);
    if (map && map[k]) return map[k];
    return k;
  }
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  return safeToString(value);
};

// Main builder ----------------------------------------------------
export const buildPdfSections = (
  formData: Record<string, any>,
  dropdownMaps: Record<string, Record<string, string>>
): PdfSection[] => {
  const sections: PdfSection[] = [];

  for (const section of QUESTIONNAIRE_SCHEMA) {
    const items: PdfItem[] = [];

    for (const field of section.fields) {
      if (field.type === "info") continue;
      if (!isDependencyMet(field, formData)) continue;

      const value = getNestedValue(formData, field.name);

      if (field.type === "table") {
        if (!Array.isArray(value)) continue;
        const rows = cleanTableRows(value);
        if (rows.length === 0 || !field.columns) continue;

        // For auto-populated tables, skip if supplier didn't enter any real data
        // beyond the EnviGuide-prefilled MPN/component name columns.
        const autoPopulated = !!field.autoPopulateFromProducts;
        if (!hasUserEnteredData(rows, autoPopulated)) continue;

        // Filter hidden columns (bom_id, product_id)
        const visibleColumns = field.columns.filter(
          (col) =>
            !col.name.startsWith("bom_id") && !col.name.startsWith("product_id")
        );

        const columns = visibleColumns.map(
          (col) => col.label || col.name
        );
        const tableRows = rows.map((row: any) =>
          visibleColumns.map((col) => {
            const val = row[col.name];
            if (val === undefined || val === null || val === "") return "-";
            if (col.apiDropdown && dropdownMaps[col.apiDropdown]) {
              const k = safeToString(val);
              return dropdownMaps[col.apiDropdown][k] || k;
            }
            if (typeof val === "number") return val.toLocaleString();
            return safeToString(val);
          })
        );

        items.push({
          type: "table",
          label: cleanLabel(field.label || field.name),
          columns,
          rows: tableRows,
        });
      } else {
        if (!hasValue(value)) continue;
        items.push({
          type: "field",
          label: cleanLabel(field.label || field.name),
          value: formatFieldValue(field, value, dropdownMaps),
        });
      }
    }

    if (items.length > 0) {
      sections.push({ title: section.title, items });
    }
  }

  return sections;
};
