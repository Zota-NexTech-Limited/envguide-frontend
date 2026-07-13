/**
 * Questionnaire schema types + active V3 re-export.
 *
 * The active supplier-facing schema lives in `questionnaireSchemaV3.ts`
 * (28 questions, CX-PCF Rulebook v4 / ISO 14067 / SAMM 9.0.0). This file
 * keeps the shared type definitions plus the canonical
 * `QUESTIONNAIRE_SCHEMA` export so consumers don't need to chase imports.
 *
 * The legacy 70-question schema body was removed when the supplier
 * questionnaire pipeline was migrated to V3 (see
 * `src/lib/questionnaireV3Api.ts` + backend `/api/questionnaire/*`). The
 * write path is fully V3; read-only DQR / archived-list views continue
 * to query legacy DB tables via `supplierQuestionnaireService.ts`.
 */

import { QUESTIONNAIRE_SCHEMA_V3 } from "./questionnaireSchemaV3";

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "radio"
  | "textarea"
  | "date"
  | "file"
  | "table"
  | "group"
  | "info"
  | "tags"
  | "location_autocomplete";

export interface QuestionnaireOption {
  label: string;
  value: string | number;
}

// API Dropdown types for dynamic options (legacy form). V3 uses static
// options on each field, so new code should not introduce more entries here.
export type ApiDropdownType =
  | "fuelType"
  | "subFuelTypeByFuel"
  | "subFuelType"
  | "refrigerantType"
  | "energySource"
  | "energyTypeBySource"
  | "processSpecificEnergy"
  | "energyType"
  | "bomMaterials"
  | "wasteType"
  | "wasteTreatmentType"
  | "productUnit"
  | "transportMode"
  | "liquidGaseousSolidWaterUnit"
  | "liquidGaseousSolidUnit"
  | "gaseousFuelUnit"
  | "energyUnit"
  | "qcEquipmentUnit"
  | "liquidGaseousUnit"
  | "solidFuelUnit"
  | "liquidSolidUnit"
  | "packingUnit"
  | "materialType"
  | "packingType"
  | "packagingTreatmentType";

export interface QuestionnaireField {
  name: string;
  label?: string;
  type: FieldType;
  options?: string[] | QuestionnaireOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  dependency?: {
    field: string;
    value: any;
    operator?: "eq" | "neq" | "contains";
  };
  columns?: QuestionnaireField[];
  addButtonLabel?: string;
  fields?: QuestionnaireField[];
  min?: number;
  max?: number;
  /** When set, the value must be strictly greater than this (e.g. 0 → "> 0"). */
  exclusiveMin?: number;
  maxLength?: number;
  content?: React.ReactNode;
  className?: string;
  mode?: "multiple" | "tags";
  apiDropdown?: ApiDropdownType;
  // Cascading EF-taxonomy dropdown sourced from /api/emission-factors/meta/taxonomy.
  // The 4 levels (category → sub_category → group → specific_type) together pin
  // the exact EF. Each level filters by the row's higher-level selections.
  efTaxonomyLevel?: "category" | "sub_category" | "group" | "specific_type";
  dependsOnField?: string;
  efSource?: "electricity" | "fuel" | "packaging" | "vehicle" | "waste" | "materials";
  efLayer?: 1 | 2 | 3 | 4;
  autoPopulateFromProducts?: boolean;
  // Pre-fill table with one row per BOM component sourced from the client-uploaded
  // BOM (bomComponents prop in DynamicQuestionnaireForm). Used by Q8 — supplier
  // describes each BOM line but cannot add or remove rows.
  autoPopulateFromBom?: boolean;
  // Pre-fill a SINGLE field (Q2/Q3 product identity) from the supplier's first
  // BOM component. Value is the bom column to read (e.g. "component_name",
  // "material_number", "detail_description", "quantity", "price"). Fields with
  // this flag are always rendered read-only — the supplier cannot edit them.
  autoPopulateFromBomField?:
    | "component_name"
    | "material_number"
    | "detail_description"
    | "quantity"
    | "price"
    | "weight_kg";
  // Hide the "Add Row" button AND replace the per-row Delete with a Clear button
  // (wipes editable columns, keeps readOnly columns + the row itself). Used by Q8
  // so the BOM structure can't be tampered with.
  lockAddRemove?: boolean;
  multiple?: boolean;
  readOnly?: boolean;
  // Pre-fill a fixed set of rows when the table is empty (e.g. Q27 volume
  // types). Seeded once; the supplier only fills the editable columns. Pair
  // with lockAddRemove + readOnly columns for a fixed-row table.
  prefillRows?: Array<Record<string, any>>;
  // Table-column only: renders a country-dependent subdivision (state /
  // province) autocomplete. Value is the sibling column name that holds the
  // country. Suggestions come from countrySubdivisions; free text is always
  // allowed so any state can be typed manually.
  subdivisionOf?: string;
}

export interface QuestionnaireSection {
  id: string;
  title: string;
  description?: string;
  fields: QuestionnaireField[];
}

// Active questionnaire schema — V3 (28 questions, CX-PCF Rulebook v4).
export const QUESTIONNAIRE_SCHEMA: QuestionnaireSection[] = QUESTIONNAIRE_SCHEMA_V3;
