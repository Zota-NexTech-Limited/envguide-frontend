/**
 * Design tokens + style helpers for the "Supplier Questionnaire - Full Form"
 * UI (imported from Claude Design). Centralises the colours, radii and the
 * bespoke control styles (Yes/No toggles, radio cards, consent rows, tags)
 * so QuestionnaireCardForm + widgets stay declarative.
 *
 * Ported from the mock's tagFor / yesno / miniYesno / radioStyles helpers.
 */
import type { CSSProperties } from "react";

export const C = {
  green: "#16a34a",
  greenDark: "#15803d",
  greenSoft: "#dcfce7",
  greenSoft2: "#dcfce7",
  greenTintRow: "#f0fdf4",
  pageBg: "#f6f8f9",
  panelBg: "#f7fafb",
  cardBorder: "#e9edf1",
  hairline: "#eaf0f2",
  text: "#0f1b24",
  textSoft: "#33424f",
  muted: "#64748b",
  muted2: "#7c8a96",
  muted3: "#94a3b8",
  fieldBg: "#fbfcfd",
  fieldBorder: "#dfe5ea",
  reqColor: "#b42318",
  reqBg: "#fef3f2",
  reqBorder: "#fcd9d4",
};

// Styled-input look used by every Ant control in the form (mock .ff-field).
export const ffStyle: CSSProperties = {
  width: "100%",
  background: C.fieldBg,
  borderColor: C.fieldBorder,
  borderRadius: 10,
};

export const REQ_TAG: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: ".04em",
  textTransform: "uppercase",
  color: C.reqColor,
  background: C.reqBg,
  border: `1px solid ${C.reqBorder}`,
  borderRadius: 6,
  padding: "2px 7px",
  whiteSpace: "nowrap",
};

export const OPT_TAG: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: ".04em",
  textTransform: "uppercase",
  color: C.muted,
  background: "#f1f5f9",
  border: "1px solid #e7ecf1",
  borderRadius: 6,
  padding: "2px 7px",
  whiteSpace: "nowrap",
};

export function tagFor(required?: boolean): {
  label: string;
  style: CSSProperties;
} | null {
  if (required) return { label: "Required", style: REQ_TAG };
  return { label: "Optional", style: OPT_TAG };
}

export function yesnoBtn(active: boolean, kind: "yes" | "no"): CSSProperties {
  const a = kind === "yes" ? C.green : C.muted;
  return {
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    padding: "8px 18px",
    borderRadius: 9,
    cursor: "pointer",
    border: `1px solid ${active ? a : "#d7dde4"}`,
    background: active ? a : "#fff",
    color: active ? "#fff" : "#475569",
  };
}

export function miniYesnoBtn(active: boolean, kind: "yes" | "no"): CSSProperties {
  const a = kind === "yes" ? C.green : C.muted;
  return {
    fontFamily: "inherit",
    fontSize: 11.5,
    fontWeight: 700,
    width: 32,
    padding: "6px 0",
    borderRadius: 7,
    cursor: "pointer",
    border: `1px solid ${active ? a : "#d7dde4"}`,
    background: active ? a : "#fff",
    color: active ? "#fff" : "#5b6675",
  };
}

export function radioCard(sel: boolean): {
  row: CSSProperties;
  dot: CSSProperties;
  label: CSSProperties;
} {
  return {
    row: {
      display: "flex",
      alignItems: "flex-start",
      gap: 11,
      padding: "12px 14px",
      borderRadius: 11,
      cursor: "pointer",
      border: `1px solid ${sel ? C.green : "#e2e8ec"}`,
      background: sel ? C.greenTintRow : "#fff",
      transition: ".12s",
    },
    dot: sel
      ? {
          flex: "none",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: C.green,
          boxShadow: "inset 0 0 0 3px #fff",
          border: `1px solid ${C.green}`,
          marginTop: 1,
        }
      : {
          flex: "none",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          border: "2px solid #c2ccd4",
          marginTop: 1,
        },
    label: {
      fontSize: 13.5,
      fontWeight: sel ? 600 : 500,
      color: sel ? "#166534" : C.textSoft,
      lineHeight: 1.4,
    },
  };
}

export function consentRow(checked: boolean): {
  row: CSSProperties;
  box: CSSProperties;
  label: CSSProperties;
} {
  return {
    row: {
      display: "flex",
      alignItems: "flex-start",
      gap: 11,
      padding: "13px 15px",
      borderRadius: 11,
      cursor: "pointer",
      border: `1px solid ${checked ? C.green : "#dde6ea"}`,
      background: checked ? C.greenTintRow : "#fff",
      transition: ".12s",
    },
    box: {
      flex: "none",
      width: 22,
      height: 22,
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
      border: `2px solid ${checked ? C.green : "#c2ccd4"}`,
      background: checked ? C.green : "#fff",
    },
    label: {
      fontSize: 13.5,
      fontWeight: checked ? 600 : 500,
      color: checked ? "#166534" : C.textSoft,
      lineHeight: 1.45,
    },
  };
}

// Question card shell
export const cardStyle: CSSProperties = {
  background: "#fff",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 14,
  padding: "22px 24px",
  boxShadow: "0 1px 2px rgba(16,24,40,.03)",
};

export const numberBadge: CSSProperties = {
  flex: "none",
  width: 28,
  height: 28,
  borderRadius: 8,
  background: C.greenSoft,
  color: C.greenDark,
  fontSize: 12.5,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
