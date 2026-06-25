/**
 * Full Form renderer — drop-in replacement for DynamicQuestionnaireForm.
 * Renders the active section as the mock's question cards (number badge,
 * Required/Optional tag, help, primary control, gated tables, follow-up
 * sub-question panel) while keeping the same Ant Form instance and formData
 * dotted paths, so the wizard's save/submit/auto-save logic is untouched.
 */
import React, { useEffect, useMemo, useRef } from "react";
import { Form } from "antd";
import type { FormInstance } from "antd";
import type {
  QuestionnaireSection,
  QuestionnaireField,
} from "../../../config/questionnaireSchema";
import {
  SECTION_LAYOUT,
  GENERAL_LAYOUT,
  type QuestionGroup,
} from "./layout";
import {
  FieldControl,
  buildRules,
  dateValueProps,
  displayLabel,
} from "./controls";
import { NoticeCard, ConsentCard } from "./ConsentNotice";
import QuestionTable from "./QuestionTable";
import { C, cardStyle, numberBadge, tagFor } from "./theme";

interface BomComponent {
  bom_id: string;
  material_number: string;
  component_name: string;
}

interface Props {
  section: QuestionnaireSection;
  initialValues: any;
  form: FormInstance;
  onValuesChange?: (changed: any, all: any) => void;
  bomComponents?: BomComponent[];
  isClientMode?: boolean;
  formErrors?: Record<string, string[]>;
}

const getNested = (obj: any, path: string): any =>
  path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);

const depMet = (
  dep: QuestionnaireField["dependency"],
  values: any,
): boolean => {
  if (!dep) return true;
  const depVal = getNested(values, dep.field);
  if (depVal === undefined || depVal === null || depVal === "") return false;
  const expected = dep.value;
  if (dep.operator === "contains") {
    return Array.isArray(depVal) && depVal.includes(expected);
  }
  if (typeof expected === "boolean") {
    const b =
      typeof depVal === "string"
        ? depVal.toLowerCase() === "yes" || depVal.toLowerCase() === "true"
        : Boolean(depVal);
    return b === expected;
  }
  if (Array.isArray(depVal)) return depVal.includes(expected);
  return String(depVal).toLowerCase() === String(expected).toLowerCase();
};

const helpText = (s: string) => (
  <p style={{ fontSize: 13, color: C.muted2, margin: "6px 0 0", lineHeight: 1.45 }}>
    {s}
  </p>
);

const Tag: React.FC<{ field?: QuestionnaireField; required?: boolean }> = ({
  field,
  required,
}) => {
  const t = tagFor(required ?? field?.required);
  if (!t) return null;
  return <span style={t.style}>{t.label}</span>;
};

const QuestionnaireCardForm: React.FC<Props> = ({
  section,
  initialValues,
  form,
  onValuesChange,
  bomComponents = [],
  isClientMode,
}) => {
  const fieldByName = useMemo(() => {
    const m: Record<string, QuestionnaireField> = {};
    (section?.fields || []).forEach((f) => (m[f.name] = f));
    return m;
  }, [section]);

  // Reactive snapshot of all values for gating/dependency checks.
  const values = (Form.useWatch((all: any) => all, form) as any) || {};

  // ── Effects ported from DynamicQuestionnaireForm ──────────────────────────

  // Sync initialValues (draft load / auto-populate).
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      const current = form.getFieldsValue();
      let changed = true;
      try {
        changed = JSON.stringify(current) !== JSON.stringify(initialValues);
      } catch {
        changed = true;
      }
      if (changed) form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  // Open tables with editable rows. BOM-backed tables (Q8) seed from the
  // assigned BOM once when components are present; every other VISIBLE table
  // opens with one empty row. Two "seed-once" guards mean the supplier can
  // freely add/remove rows afterwards, and a late-arriving BOM still overrides
  // a placeholder empty row (different guard keys).
  const bomSeededRef = useRef<Set<string>>(new Set());
  const emptySeededRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!section) return;
    section.fields.forEach((field) => {
      if (field.type !== "table") return;
      // Don't pre-seed a gated table until its dependency is met (visible).
      if (field.dependency && !depMet(field.dependency, values)) return;
      const key = `${section.id}:${field.name}`;
      const path = field.name.split(".");
      const existing = form.getFieldValue(path);
      const rows = Array.isArray(existing) ? existing.filter(Boolean) : [];
      const hasData = rows.some(
        (r: any) =>
          r &&
          typeof r === "object" &&
          Object.values(r).some((v) => v !== undefined && v !== null && v !== ""),
      );

      if (
        field.autoPopulateFromBom &&
        Array.isArray(bomComponents) &&
        bomComponents.length > 0
      ) {
        if (!hasData && !bomSeededRef.current.has(key)) {
          form.setFieldValue(
            path,
            bomComponents.map((c) => ({
              bom_id: c.bom_id,
              material_number: c.material_number,
              product_id: c.material_number,
              component_name: c.component_name,
              product_name: c.component_name,
            })),
          );
          bomSeededRef.current.add(key);
        }
        return;
      }

      // Fixed-row tables (e.g. Q27 volume types): seed the pre-defined rows.
      if (Array.isArray(field.prefillRows) && field.prefillRows.length > 0) {
        if (!hasData && !emptySeededRef.current.has(key)) {
          form.setFieldValue(
            path,
            field.prefillRows.map((r) => ({ ...r })),
          );
          emptySeededRef.current.add(key);
        }
        return;
      }

      if (rows.length === 0 && !emptySeededRef.current.has(key)) {
        form.setFieldValue(path, [{}]);
        emptySeededRef.current.add(key);
      }
    });
  }, [section, bomComponents, form, values, initialValues]);

  // Backfill component_name for bomMaterials rows saved before onChange wired it.
  useEffect(() => {
    if (!section || !Array.isArray(bomComponents) || bomComponents.length === 0)
      return;
    section.fields.forEach((field) => {
      if (field.type !== "table") return;
      const bomCol = field.columns?.find((c) => c.apiDropdown === "bomMaterials");
      if (!bomCol) return;
      const path = field.name.split(".");
      const existing = form.getFieldValue(path);
      if (!Array.isArray(existing) || existing.length === 0) return;
      let changed = false;
      const next = existing.map((row: any) => {
        if (!row || typeof row !== "object") return row;
        const mpnVal = row[bomCol.name];
        if (!mpnVal || (row.component_name && row.product_name)) return row;
        const bom = bomComponents.find((b) => b.material_number === mpnVal);
        if (!bom) return row;
        changed = true;
        return {
          ...row,
          bom_id: row.bom_id || bom.bom_id,
          material_number: row.material_number || bom.material_number,
          component_name: row.component_name || bom.component_name,
          product_name: row.product_name || bom.component_name,
        };
      });
      if (changed) form.setFieldValue(path, next);
    });
  }, [section, bomComponents, form, initialValues]);

  // Q22: when a certificate scheme is entered (e.g. ISCC), default
  // "Mass balancing used?" to Yes — but only if the supplier hasn't answered
  // it yet, so their choice is never overridden.
  useEffect(() => {
    const scheme = getNested(values, "methodology.certificate_scheme");
    const mb = getNested(values, "methodology.mass_balancing_used");
    if (scheme && String(scheme).trim() !== "" && (mb === undefined || mb === null || mb === "")) {
      form.setFieldValue(["methodology", "mass_balancing_used"], "Yes");
    }
  }, [values, form]);

  // ── Renderers ─────────────────────────────────────────────────────────────

  const renderPrimary = (field: QuestionnaireField) => (
    <Form.Item
      name={field.name.split(".")}
      className="mb-0"
      rules={buildRules(field)}
      {...(field.type === "date" ? dateValueProps : {})}
    >
      <FieldControl field={field} />
    </Form.Item>
  );

  const renderSub = (field: QuestionnaireField, badge: string) => {
    if (!depMet(field.dependency, values)) return null;
    return (
      <div key={field.name} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
        <div
          style={{
            flex: "none",
            width: 22,
            height: 21,
            marginTop: 2,
            borderLeft: "2px solid #d3dde2",
            borderBottom: "2px solid #d3dde2",
            borderBottomLeftRadius: 9,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
            <span
              style={{
                flex: "none",
                fontSize: 11,
                fontWeight: 700,
                color: C.greenDark,
                background: C.greenSoft2,
                borderRadius: 6,
                padding: "2px 7px",
              }}
            >
              {badge}
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: C.textSoft, lineHeight: 1.35 }}>
              {displayLabel(field)}
            </span>
            {field.disabled ? (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  color: C.greenDark,
                  background: C.greenSoft,
                  border: "1px solid #bbf7d0",
                  borderRadius: 6,
                  padding: "2px 7px",
                }}
              >
                Default
              </span>
            ) : (
              <Tag field={field} />
            )}
          </div>
          <Form.Item
            name={field.name.split(".")}
            className="mb-0"
            rules={buildRules(field)}
            {...(field.type === "date" ? dateValueProps : {})}
          >
            <FieldControl field={field} />
          </Form.Item>
        </div>
      </div>
    );
  };

  const gateHintPanel = (hint: string) => (
    <div
      style={{
        margin: "14px 0 0 40px",
        fontSize: 13,
        color: "#9aa6b1",
        background: "#f7fafb",
        border: "1px dashed #dde6ea",
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      {hint}
    </div>
  );

  const renderGroup = (group: QuestionGroup, index: number) => {
    const primary = group.primaryName ? fieldByName[group.primaryName] : undefined;
    const tableField = group.tableName ? fieldByName[group.tableName] : undefined;
    const subFields = (group.subNames || [])
      .map((n) => fieldByName[n])
      .filter(Boolean) as QuestionnaireField[];

    const headerRequired = primary
      ? primary.required
      : tableField
        ? tableField.required
        : subFields.some((f) => f.required);

    // Gating: explicit group gate wins; else the table field's own dependency.
    let gateMet = true;
    let gated = false;
    if (group.gateName) {
      gated = true;
      gateMet = getNested(values, group.gateName) === group.gateValue;
    } else if (tableField?.dependency) {
      gated = true;
      gateMet = depMet(tableField.dependency, values);
    }

    const visibleSubs = subFields.filter((f) => depMet(f.dependency, values));

    return (
      <div key={group.label + index} style={cardStyle}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {group.num && <div style={numberBadge}>{group.num}</div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                flexWrap: "wrap",
                minHeight: 28,
              }}
            >
              <span style={{ fontSize: 15.5, fontWeight: 650, lineHeight: 1.4 }}>
                {group.label}
              </span>
              <Tag required={headerRequired} />
            </div>
            {group.help && helpText(group.help)}
          </div>
        </div>

        {/* primary */}
        {primary && <div style={{ margin: "13px 0 0 40px" }}>{renderPrimary(primary)}</div>}

        {/* gated content vs gate hint */}
        {gated && !gateMet ? (
          // Show a hint only when one is provided; otherwise render nothing so
          // the card collapses to just the question when gated off.
          group.gateHint ? (
            gateHintPanel(group.gateHint)
          ) : null
        ) : (
          <>
            {tableField && (
              <div style={{ marginTop: 16 }}>
                <QuestionTable
                  field={tableField}
                  form={form}
                  bomComponents={bomComponents}
                  isClientMode={isClientMode}
                />
              </div>
            )}
            {visibleSubs.length > 0 && (
              <div
                style={{
                  margin: "14px 0 0 40px",
                  background: C.panelBg,
                  border: `1px solid ${C.hairline}`,
                  borderRadius: 13,
                  padding: "13px 16px 16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 13 }}>
                  <span style={{ fontSize: 14, lineHeight: 1, color: C.green }}>↪</span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: ".07em",
                      textTransform: "uppercase",
                      color: C.muted2,
                    }}
                  >
                    {group.subsLabel || "Follow-up details"}
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: "#aab6bf" }}>
                    {visibleSubs.length} {visibleSubs.length === 1 ? "field" : "fields"}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  {subFields.map((f, i) =>
                    renderSub(f, (group.num || "") + String.fromCharCode(97 + i)),
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderBody = () => {
    if (section.id === "general_information") {
      const generalGroups = SECTION_LAYOUT[section.id] || [];
      return (
        <>
          <NoticeCard notice={GENERAL_LAYOUT.notice} />
          {GENERAL_LAYOUT.consents.map((c) => (
            <ConsentCard key={c.ackName} def={c} />
          ))}
          {generalGroups.map((g, i) => renderGroup(g, i))}
        </>
      );
    }
    const groups = SECTION_LAYOUT[section.id] || [];
    return groups.map((g, i) => renderGroup(g, i));
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      autoComplete="off"
      onValuesChange={(changed, all) => onValuesChange?.(changed, all)}
      scrollToFirstError
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {renderBody()}
      </div>
    </Form>
  );
};

export default QuestionnaireCardForm;
