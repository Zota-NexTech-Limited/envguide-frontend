/**
 * Repeating-row table for the Full Form UI. Div/flex layout matching the mock
 * (header row, horizontal scroll, add/remove), built on Ant Form.List so
 * validation + persistence behave exactly like the legacy renderer.
 *
 * Preserves the only two V3 special behaviours:
 *  - bomMaterials dropdown: selecting an MPN auto-fills component_name / bom_id
 *    / material_number / product_name into the row (brute-force whole-array
 *    rewrite, same as the legacy renderer), and the Component Name cell is a
 *    read-only mirror.
 *  - lockAddRemove (Q8): rows are seeded from the BOM (see autopopulate effect
 *    in QuestionnaireCardForm); the per-row action is "Clear" (wipe editable
 *    cells, keep read-only + link fields) and Add is hidden.
 */
import React from "react";
import { AutoComplete, Form, Input, InputNumber, Select, DatePicker, Button } from "antd";
import type { FormInstance } from "antd";
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import type { QuestionnaireField } from "../../../config/questionnaireSchema";
import { getSubdivisionsForCountry } from "../../../config/countrySubdivisions";
import { C } from "./theme";
import { MiniYesNo, optionsAreYesNo, optionAsPair, dateValueProps } from "./controls";
import supplierQuestionnaireService from "../../../lib/supplierQuestionnaireService";

// Which deeper taxonomy columns to clear when a given level changes.
const TAX_CHILDREN: Record<string, string[]> = {
  category: ["sub_category", "group", "specific_type"],
  sub_category: ["group", "specific_type"],
  group: ["specific_type"],
  specific_type: [],
};

// Cascading EF-taxonomy dropdown cell (Category → Sub-category → Group →
// Specific Type). Each level fetches DB-distinct values filtered by the row's
// higher-level picks, is searchable (server-side), and disabled until its
// parents are chosen. Picking a level clears the deeper ones.
const TaxonomyCell: React.FC<{
  field: QuestionnaireField;
  form: FormInstance;
  fieldPath: string[];
  rowName: number;
  // Column NAME of each taxonomy level in THIS table (names differ per table,
  // e.g. Q8 uses "material" for the category level).
  taxNames: { category?: string; sub_category?: string; group?: string; specific_type?: string };
  // Column NAME of the geography cell (Q10), if any. Cleared on ANY taxonomy
  // change since geography is the 5th cascade level and depends on all 4 above.
  geoColName?: string;
}> = ({ field, form, fieldPath, rowName, taxNames, geoColName }) => {
  const level = field.efTaxonomyLevel as "category" | "sub_category" | "group" | "specific_type";
  const row = (Form.useWatch([...fieldPath, rowName], form) as any) || {};
  const cat = taxNames.category ? row[taxNames.category] : undefined;
  const sub = taxNames.sub_category ? row[taxNames.sub_category] : undefined;
  const grp = taxNames.group ? row[taxNames.group] : undefined;
  const ready =
    level === "category" ? true :
    level === "sub_category" ? !!cat :
    level === "group" ? !!cat && !!sub :
    !!cat && !!sub && !!grp;

  const [options, setOptions] = React.useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const parentKey = `${cat || ""}|${sub || ""}|${grp || ""}`;

  React.useEffect(() => {
    if (!ready) { setOptions([]); return; }
    let alive = true;
    setLoading(true);
    supplierQuestionnaireService
      .getEfTaxonomy(level, { category: cat, sub_category: sub, group: grp, q: search })
      .then((data: any[]) => {
        if (!alive) return;
        setOptions(
          level === "specific_type"
            ? data.map((d) => ({ value: d.specific_type, label: `${d.specific_type}  ·  ${d.gwp_100} kgCO₂e/${d.unit || "unit"}` }))
            : data.map((v) => ({ value: String(v), label: String(v) }))
        );
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [level, parentKey, search, ready]);

  return (
    <Form.Item name={[rowName, field.name]} className="mb-0" rules={requiredRule(field)} style={{ width: "100%" }}>
      <Select
        placeholder={field.placeholder || "Select…"}
        style={{ width: "100%", fontSize: 13 }}
        showSearch
        loading={loading}
        disabled={!ready}
        filterOption={false}
        onSearch={setSearch}
        onChange={(v) => {
          const arr = [...((form.getFieldValue(fieldPath) as any[]) || [])];
          const prev = arr[rowName] || {};
          const next: any = { ...prev, [field.name]: v };
          for (const childLevel of TAX_CHILDREN[level]) {
            const childCol = taxNames[childLevel as keyof typeof taxNames];
            if (childCol) next[childCol] = undefined;
          }
          // Geography (5th cascade level) depends on all 4 taxonomy levels, so a
          // change at ANY level invalidates it — clear so a stale country (e.g. a
          // grid-mix "DE - Germany" left on a biogas type) can't survive.
          if (geoColName) next[geoColName] = undefined;
          arr[rowName] = next;
          form.setFieldValue(fieldPath, arr);
        }}
        options={options}
        notFoundContent={loading ? "Loading…" : !ready ? "Pick the previous level first" : "No matches"}
      />
    </Form.Item>
  );
};

// Geography (electricity sourcing) dropdown — the 5th CASCADE level for Q10.
// Only the geographies that actually have an EF row for the row's chosen
// Category → Sub-category → Group → Specific Type are shown (via the taxonomy
// endpoint level=geography), so every pick is guaranteed to resolve to a real EF
// row (no silent EF=0). Disabled until Specific Type is picked. Options are the
// exact DB geography strings ("DE - Germany"). Fetched lazily on OPEN, debounced
// search; the saved value stays selectable so a draft shows its value on load.
const GeographyCell: React.FC<{
  field: QuestionnaireField;
  form: FormInstance;
  fieldPath: string[];
  rowName: number;
  taxNames: { category?: string; sub_category?: string; group?: string; specific_type?: string };
}> = ({ field, form, fieldPath, rowName, taxNames }) => {
  const selected = Form.useWatch([...fieldPath, rowName, field.name], form) as string | undefined;
  const row = (Form.useWatch([...fieldPath, rowName], form) as any) || {};
  const cat = taxNames.category ? row[taxNames.category] : undefined;
  const sub = taxNames.sub_category ? row[taxNames.sub_category] : undefined;
  const grp = taxNames.group ? row[taxNames.group] : undefined;
  const spec = taxNames.specific_type ? row[taxNames.specific_type] : undefined;
  const ready = !!cat && !!sub && !!grp && !!spec;

  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [loaded, setLoaded] = React.useState(false);
  const parentKey = `${cat || ""}|${sub || ""}|${grp || ""}|${spec || ""}`;

  React.useEffect(() => {
    // Fetch only once the 4 parents are set AND the dropdown is open. Debounce
    // search so each keystroke doesn't fire a request.
    if (!ready || !open) { setLoaded(false); return; }
    let alive = true;
    const t = setTimeout(() => {
      setLoading(true);
      supplierQuestionnaireService
        .getEfTaxonomy("geography", {
          category: cat, sub_category: sub, group: grp, specific_type: spec,
          q: search || undefined,
        })
        .then((data: any[]) => {
          if (!alive) return;
          setOptions(data.map((v) => ({ value: String(v), label: String(v) })));
          setLoaded(true);
        })
        .finally(() => { if (alive) setLoading(false); });
    }, search ? 250 : 0);
    return () => { alive = false; clearTimeout(t); };
  }, [ready, open, parentKey, search]);

  // Ensure the saved value is selectable even if it isn't in the fetched page.
  const merged = React.useMemo(() => {
    if (selected && !options.some((o) => o.value === selected)) {
      return [{ value: selected, label: selected }, ...options];
    }
    return options;
  }, [options, selected]);

  return (
    <Form.Item name={[rowName, field.name]} className="mb-0" rules={requiredRule(field)} style={{ width: "100%" }}>
      <Select
        placeholder={field.placeholder || "Select geography"}
        // Cell can be narrow, but let the popup grow so the full "CODE - Country
        // Name" is always readable, and cap its height so long lists scroll.
        style={{ width: "100%", fontSize: 13 }}
        popupMatchSelectWidth={false}
        listHeight={320}
        showSearch
        loading={loading}
        disabled={!ready}
        filterOption={false}
        onSearch={setSearch}
        onDropdownVisibleChange={setOpen}
        options={merged}
        notFoundContent={
          !ready ? "Pick Specific Type first" : loading || !loaded ? "Loading…" : "No matches"
        }
      />
    </Form.Item>
  );
};

// Country-dependent subdivision (state / province) autocomplete. Suggests the
// selected country's states and always allows a manually typed value, so any
// state can be entered even when the country has no ISO subdivision data.
const SubdivisionCell: React.FC<{
  col: QuestionnaireField;
  form: FormInstance;
  fieldPath: string[];
  rowName: number;
  countryCol: string;
}> = ({ col, form, fieldPath, rowName, countryCol }) => {
  const row = (Form.useWatch([...fieldPath, rowName], form) as any) || {};
  const country = row[countryCol];
  const states = React.useMemo(() => getSubdivisionsForCountry(country), [country]);
  const [query, setQuery] = React.useState("");
  const options = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return (q ? states.filter((s) => s.toLowerCase().includes(q)) : states).map((s) => ({ value: s }));
  }, [states, query]);
  const placeholder = !country
    ? "Select a country first"
    : states.length
      ? "Select or type state / province"
      : "Type state / province";
  return (
    <Form.Item name={[rowName, col.name]} className="mb-0" rules={requiredRule(col)}>
      <AutoComplete
        options={options}
        onSearch={setQuery}
        filterOption={false}
        allowClear
        placeholder={placeholder}
        style={{ width: "100%", fontSize: 13 }}
      />
    </Form.Item>
  );
};

// Select cell whose options are unique across the table's rows: any value
// already chosen in another row is disabled here, so each option can be picked
// only once (Q27 volume types). Watches the whole Form.List array so disabling
// updates the instant another row's value changes.
const UniqueSelectCell: React.FC<{
  col: QuestionnaireField;
  form: FormInstance;
  fieldPath: string[];
  rowName: number;
}> = ({ col, form, fieldPath, rowName }) => {
  const allRows = Form.useWatch(fieldPath, form) as any[] | undefined;
  const takenElsewhere = React.useMemo(() => {
    const s = new Set<string>();
    (Array.isArray(allRows) ? allRows : []).forEach((r, i) => {
      if (i === rowName) return;
      const v = r?.[col.name];
      if (v !== undefined && v !== null && v !== "") s.add(String(v));
    });
    return s;
  }, [allRows, rowName, col.name]);

  return (
    <Form.Item name={[rowName, col.name]} className="mb-0" rules={requiredRule(col)}>
      <Select
        placeholder={col.placeholder}
        style={{ width: "100%", fontSize: 13 }}
        showSearch={Array.isArray(col.options) && col.options.length > 5}
        filterOption={(input, option) =>
          String(option?.children ?? "").toLowerCase().includes(input.toLowerCase())
        }
      >
        {(col.options || []).map((opt) => {
          const { label, value } = optionAsPair(opt);
          return (
            <Select.Option key={String(value)} value={value} disabled={takenElsewhere.has(String(value))}>
              {label}
            </Select.Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};

// Wraps a cell whose visibility depends on a sibling column's value in the same
// row (e.g. Biogenic carbon shows only when Biogenic = Yes). When hidden it
// renders an em dash and clears any stale value so it isn't submitted.
const ConditionalCell: React.FC<{
  col: QuestionnaireField;
  form: FormInstance;
  fieldPath: string[];
  rowName: number;
  children: React.ReactNode;
}> = ({ col, form, fieldPath, rowName, children }) => {
  const row = (Form.useWatch([...fieldPath, rowName], form) as any) || {};
  const dep = col.dependency!;
  const depVal = row[dep.field];
  const met =
    depVal !== undefined &&
    depVal !== null &&
    depVal !== "" &&
    String(depVal).toLowerCase() === String(dep.value).toLowerCase();
  React.useEffect(() => {
    if (met) return;
    const cur = row[col.name];
    if (cur === undefined || cur === null || cur === "") return;
    const arr = [...((form.getFieldValue(fieldPath) as any[]) || [])];
    if (arr[rowName]) {
      arr[rowName] = { ...arr[rowName], [col.name]: undefined };
      form.setFieldValue(fieldPath, arr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [met]);
  if (!met) {
    return <span style={{ color: "#b7c1cb", fontSize: 13, paddingLeft: 4 }}>—</span>;
  }
  return <>{children}</>;
};

interface BomComponent {
  bom_id: string;
  material_number: string;
  component_name: string;
}

interface QuestionTableProps {
  field: QuestionnaireField;
  form: FormInstance;
  bomComponents?: BomComponent[];
  isClientMode?: boolean;
}

const cellInput: React.CSSProperties = {
  width: "100%",
  fontSize: 13,
  borderRadius: 7,
  background: "#fff",
};

const colMinWidth = (col: QuestionnaireField): number => {
  if (col.readOnly)
    return col.name === "product_id" || col.name === "mpn" || col.name === "mpn_code"
      ? 160
      : 220;
  if (col.apiDropdown === "bomMaterials") return 240;
  if (col.type === "select" && optionsAreYesNo(col.options)) return 110;
  if (col.type === "select" && Array.isArray(col.options) && col.options.length) {
    const longest = col.options.reduce(
      (max: number, o: any) => Math.max(max, String(optionAsPair(o).label).length),
      0,
    );
    return Math.min(220, Math.max(120, longest * 8 + 50));
  }
  if (col.type === "number") return 130;
  if (col.type === "select") return 160;
  return 150;
};

const colLabel = (col: QuestionnaireField, isClientMode?: boolean): string => {
  if (isClientMode) {
    if (col.name === "mpn") return "Product Code";
    if (col.name === "component_name") return "Product Name";
  }
  return col.label || col.name;
};

const requiredRule = (col: QuestionnaireField) =>
  [
    {
      required: col.required,
      message: col.required
        ? `Please fill in "${col.label}" for this row. This field is required.`
        : undefined,
    },
    ...(col.type === "number" && col.min !== undefined
      ? [{ type: "number" as const, min: col.min, message: `${col.label} must be at least ${col.min}` }]
      : []),
    ...(col.type === "number" && col.max !== undefined
      ? [{ type: "number" as const, max: col.max, message: `${col.label} must not exceed ${col.max}` }]
      : []),
  ].filter(Boolean);

const QuestionTable: React.FC<QuestionTableProps> = ({
  field,
  form,
  bomComponents = [],
  isClientMode,
}) => {
  const fieldPath = field.name.split(".");
  const columns = Array.isArray(field.columns) ? field.columns : [];
  // Map each taxonomy level → its column name in THIS table (names vary per table).
  const taxNames: { category?: string; sub_category?: string; group?: string; specific_type?: string } = {};
  columns.forEach((c) => { if (c.efTaxonomyLevel) (taxNames as any)[c.efTaxonomyLevel] = c.name; });
  // Geography column (Q10) — cleared by TaxonomyCell whenever a taxonomy level changes.
  const geoColName = columns.find((c) => c.efGeography)?.name;
  // A unique-across-rows select column caps the table at one row per option, so
  // the Add button hides once every option has been used.
  const uniqueCol = columns.find((c) => c.uniqueAcrossRows && Array.isArray(c.options));
  const maxRows = uniqueCol?.options ? uniqueCol.options.length : undefined;
  const flexIdx = (() => {
    const i = columns.findIndex((c) => c.type === "text" && !c.readOnly);
    return i >= 0 ? i : columns.length - 1;
  })();
  const innerMinWidth =
    columns.reduce((a, c, i) => a + (i === flexIdx ? 160 : colMinWidth(c)), 0) + 56;

  const bomOptions = (bomComponents || [])
    .map((item) => ({
      id: item.material_number || "",
      name: `${item.material_number || ""} — ${item.component_name || ""}`,
      bom_id: item.bom_id || "",
      product_name: item.component_name || "",
    }))
    .filter((o) => o.id);

  const cellStyle = (col: QuestionnaireField, i: number): React.CSSProperties => ({
    flex: i === flexIdx ? "1 1 160px" : `1 1 ${colMinWidth(col)}px`,
    minWidth: i === flexIdx ? 160 : colMinWidth(col),
    padding: "6px 8px",
    borderRight: `1px solid #f0f3f5`,
    display: "flex",
    alignItems: "center",
  });

  const thStyle = (col: QuestionnaireField, i: number): React.CSSProperties => ({
    flex: i === flexIdx ? "1 1 160px" : `1 1 ${colMinWidth(col)}px`,
    minWidth: i === flexIdx ? 160 : colMinWidth(col),
    padding: "9px 11px",
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: ".02em",
    textTransform: "uppercase",
    color: "#6b7682",
    borderRight: `1px solid #e6ecef`,
  });

  const renderCell = (col: QuestionnaireField, rowName: number) => {
    // Cells gated on a sibling column's value (e.g. Biogenic carbon only when
    // Biogenic = Yes) render an em dash until the gate is met.
    if (col.dependency) {
      return (
        <ConditionalCell col={col} form={form} fieldPath={fieldPath} rowName={rowName}>
          {renderCellControl(col, rowName)}
        </ConditionalCell>
      );
    }
    return renderCellControl(col, rowName);
  };

  const renderCellControl = (col: QuestionnaireField, rowName: number) => {
    // Read-only mirror cell (Q8 MPN/component, BOM-table component name).
    if (col.readOnly) {
      return (
        <Form.Item name={[rowName, col.name]} className="mb-0" style={{ width: "100%" }}>
          <Input disabled placeholder={col.placeholder} style={{ ...cellInput, background: "#f7fafb" }} />
        </Form.Item>
      );
    }

    // Country-dependent subdivision (state / province) autocomplete.
    if (col.subdivisionOf) {
      return (
        <SubdivisionCell
          col={col}
          form={form}
          fieldPath={fieldPath}
          rowName={rowName}
          countryCol={col.subdivisionOf}
        />
      );
    }

    // Cascading EF-taxonomy dropdown (Category → Sub → Group → Specific Type).
    if (col.efTaxonomyLevel) {
      return <TaxonomyCell field={col} form={form} fieldPath={fieldPath} rowName={rowName} taxNames={taxNames} geoColName={geoColName} />;
    }

    // Geography (electricity sourcing) — 5th cascade level, filtered by the row's
    // Category → Sub → Group → Specific Type picks.
    if (col.efGeography) {
      return <GeographyCell field={col} form={form} fieldPath={fieldPath} rowName={rowName} taxNames={taxNames} />;
    }

    // BOM-sourced MPN dropdown — auto-fills sibling cells on change.
    if (col.apiDropdown === "bomMaterials") {
      return (
        <div style={{ width: "100%" }}>
          <Form.Item name={[rowName, "bom_id"]} hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name={[rowName, "material_number"]} hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name={[rowName, "product_name"]} hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name={[rowName, col.name]} className="mb-0" rules={requiredRule(col)}>
            <Select
              placeholder={col.placeholder || "Pick a component"}
              style={{ width: "100%", fontSize: 13 }}
              showSearch
              filterOption={(input, option) =>
                String(option?.children ?? "").toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => {
                const selected = bomOptions.find((o) => o.id === value);
                const arr = [...(form.getFieldValue(fieldPath) || [])];
                const prev = arr[rowName] || {};
                arr[rowName] = selected
                  ? {
                      ...prev,
                      [col.name]: value,
                      bom_id: selected.bom_id || undefined,
                      material_number: selected.id,
                      component_name: selected.product_name,
                      product_name: selected.product_name,
                    }
                  : {
                      ...prev,
                      [col.name]: undefined,
                      bom_id: undefined,
                      material_number: undefined,
                      component_name: undefined,
                      product_name: undefined,
                    };
                form.setFieldValue(fieldPath, arr);
              }}
            >
              {bomOptions.map((o) => (
                <Select.Option key={o.id} value={o.id}>
                  {o.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      );
    }

    // Select whose options are unique across rows (Q27 volume types).
    if (col.type === "select" && col.uniqueAcrossRows) {
      return <UniqueSelectCell col={col} form={form} fieldPath={fieldPath} rowName={rowName} />;
    }

    // In-table Yes/No → compact toggle.
    if (col.type === "select" && optionsAreYesNo(col.options)) {
      return (
        <Form.Item name={[rowName, col.name]} className="mb-0" rules={requiredRule(col)}>
          <MiniYesNo />
        </Form.Item>
      );
    }

    if (col.type === "select") {
      return (
        <Form.Item name={[rowName, col.name]} className="mb-0" rules={requiredRule(col)}>
          <Select
            placeholder={col.placeholder}
            style={{ width: "100%", fontSize: 13 }}
            mode={col.mode}
            showSearch={Array.isArray(col.options) && col.options.length > 5}
            filterOption={(input, option) =>
              String(option?.children ?? "").toLowerCase().includes(input.toLowerCase())
            }
          >
            {(col.options || []).map((opt) => {
              const { label, value } = optionAsPair(opt);
              return (
                <Select.Option key={String(value)} value={value}>
                  {label}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
      );
    }

    if (col.type === "number") {
      return (
        <Form.Item name={[rowName, col.name]} className="mb-0" rules={requiredRule(col)}>
          <InputNumber placeholder={col.placeholder} min={col.min} max={col.max} style={cellInput} />
        </Form.Item>
      );
    }

    if (col.type === "date") {
      return (
        <Form.Item name={[rowName, col.name]} className="mb-0" rules={requiredRule(col)} {...dateValueProps}>
          <DatePicker placeholder={col.placeholder} format="DD/MM/YYYY" style={cellInput} />
        </Form.Item>
      );
    }

    return (
      <Form.Item name={[rowName, col.name]} className="mb-0" rules={requiredRule(col)}>
        <Input placeholder={col.placeholder} style={cellInput} />
      </Form.Item>
    );
  };

  return (
    <Form.List
      name={fieldPath}
      rules={
        field.required
          ? [
              {
                validator: async (_, value) => {
                  if (!value || value.length === 0) {
                    const qn = field.label?.match(/^\d+[a-z]?\./)?.[0] || "";
                    return Promise.reject(
                      new Error(
                        qn
                          ? `Please add at least one entry to ${qn.slice(0, -1)}. This table is required.`
                          : "Please add at least one entry to this table. This field is required.",
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]
          : undefined
      }
    >
      {(rows, { add, remove }, { errors }) => (
        <div>
          <div
            style={{
              border: "1px solid #e6ecef",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div className="qtable-scroll" style={{ overflowX: "auto" }}>
              <div style={{ minWidth: innerMinWidth }}>
                {/* header */}
                <div style={{ display: "flex", background: "#f3f6f8", borderBottom: "1px solid #e6ecef" }}>
                  {columns.map((col, i) => (
                    <div key={col.name} style={thStyle(col, i)}>
                      {colLabel(col, isClientMode)}
                      {col.required && <span style={{ color: "#dc2626", fontWeight: 700 }}>&nbsp;*</span>}
                    </div>
                  ))}
                  <div style={{ width: 56, flex: "none" }} />
                </div>

                {/* rows */}
                {rows.length === 0 ? (
                  <div style={{ padding: "18px 16px", fontSize: 13, color: C.muted3, background: "#fff" }}>
                    No rows yet. Use the button below to add your first entry.
                  </div>
                ) : (
                  rows.map((row) => (
                    <div
                      key={row.key}
                      style={{ display: "flex", borderBottom: "1px solid #f0f3f5", alignItems: "stretch", background: "#fff" }}
                    >
                      {columns.map((col, i) => (
                        <div key={col.name} style={cellStyle(col, i)}>
                          {/* width:100% so the control fills the column instead
                              of shrinking to its content inside the flex cell */}
                          <div style={{ width: "100%", minWidth: 0 }}>
                            {renderCell(col, row.name)}
                          </div>
                        </div>
                      ))}
                      <div style={{ width: 56, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {field.lockAddRemove ? (
                          <Button
                            type="text"
                            size="small"
                            icon={<ReloadOutlined />}
                            title="Clear this row's values"
                            className="hover:bg-amber-50 hover:text-amber-600"
                            onClick={() => {
                              const rowPath = [...fieldPath, row.name];
                              const rowValues = form.getFieldValue(rowPath) || {};
                              const cleared: Record<string, any> = {};
                              columns.forEach((c) => {
                                cleared[c.name] = c.readOnly ? rowValues[c.name] : undefined;
                              });
                              ["bom_id", "material_number", "product_name"].forEach((k) => {
                                if (rowValues[k] !== undefined) cleared[k] = rowValues[k];
                              });
                              form.setFieldValue(rowPath, cleared);
                            }}
                          />
                        ) : (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            className="hover:bg-red-50"
                            onClick={() => remove(row.name)}
                          />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {!field.lockAddRemove && (maxRows === undefined || rows.length < maxRows) && (
              <div style={{ padding: "10px 12px", background: C.fieldBg }}>
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={() => add()}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.greenDark,
                    background: C.greenSoft,
                    border: "1px solid #bbf7d0",
                    borderRadius: 9,
                  }}
                >
                  {field.addButtonLabel || "Add Row"}
                </Button>
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {errors.map((e, i) => (
                <div key={i} style={{ fontSize: 13, color: "#dc2626" }}>
                  {e}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 8, fontSize: 12, color: C.muted }}>
            {rows.length} {rows.length === 1 ? "item" : "items"}
            {field.lockAddRemove && " (rows are pre-set — fill in the values for each)"}
          </div>
        </div>
      )}
    </Form.List>
  );
};

export default QuestionTable;
