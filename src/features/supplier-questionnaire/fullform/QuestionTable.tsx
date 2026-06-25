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
import { Form, Input, InputNumber, Select, DatePicker, Button } from "antd";
import type { FormInstance } from "antd";
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import type { QuestionnaireField } from "../../../config/questionnaireSchema";
import { C } from "./theme";
import { MiniYesNo, optionsAreYesNo, optionAsPair, dateValueProps } from "./controls";

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
    // Read-only mirror cell (Q8 MPN/component, BOM-table component name).
    if (col.readOnly) {
      return (
        <Form.Item name={[rowName, col.name]} className="mb-0" style={{ width: "100%" }}>
          <Input disabled placeholder={col.placeholder} style={{ ...cellInput, background: "#f7fafb" }} />
        </Form.Item>
      );
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

            {!field.lockAddRemove && (
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
