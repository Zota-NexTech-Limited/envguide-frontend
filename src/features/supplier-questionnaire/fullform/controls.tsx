/**
 * Form controls for the Full Form UI. Each is Ant-Form-bound (accepts the
 * value/onChange that Form.Item injects) so validation, getFieldsValue and
 * setFieldsValue keep working exactly as in the legacy renderer — only the
 * look changes.
 */
import React from "react";
import { Input, InputNumber, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import type { QuestionnaireField } from "../../../config/questionnaireSchema";
import { LABEL_OVERRIDES } from "./layout";
import { ffStyle, yesnoBtn, miniYesnoBtn, radioCard } from "./theme";

const { TextArea } = Input;

// ── helpers ────────────────────────────────────────────────────────────────

export const optionAsPair = (opt: any): { label: string; value: any } =>
  typeof opt === "string" ? { label: opt, value: opt } : opt;

export const optionsAreYesNo = (options?: any[]): boolean => {
  if (!Array.isArray(options) || options.length !== 2) return false;
  const vals = options.map((o) => String(optionAsPair(o).value).toLowerCase());
  return vals.includes("yes") && vals.includes("no");
};

export const stripNum = (label?: string): string =>
  (label || "")
    .replace(/^\d+(\.\d+)?[a-z]?\.?\s*/i, "")
    .replace(/\s*\((optional)\)\s*$/i, "")
    .trim();

export const displayLabel = (field: QuestionnaireField): string =>
  LABEL_OVERRIDES[field.name] ?? (stripNum(field.label) || field.name);

// Replicates the legacy DynamicQuestionnaireForm validation rules so behaviour
// is identical (required message with question number, email, number min/max,
// text maxLength).
export const buildRules = (field: QuestionnaireField): any[] => {
  const isSingleCheckbox = field.type === "checkbox" && !field.options;
  const questionNumber = field.label?.match(/^\d+\./)?.[0] || "";
  return [
    {
      required: field.required,
      message: field.required
        ? isSingleCheckbox
          ? questionNumber
            ? `Please check this box to acknowledge ${questionNumber.slice(0, -1)}`
            : "This field is required. Please check the box to continue."
          : questionNumber
            ? `Please answer ${questionNumber.slice(0, -1)}. This field is required.`
            : "This field is required. Please provide a value."
        : undefined,
    },
    ...(field.name.toLowerCase().includes("email") ||
    field.label?.toLowerCase().includes("e-mail") ||
    field.label?.toLowerCase().includes("email")
      ? [
          {
            type: "email" as const,
            message: "Please enter a valid email address (e.g., name@example.com)",
          },
        ]
      : []),
    ...(field.type === "number" && field.min !== undefined
      ? [{ type: "number" as const, min: field.min, message: `Please enter a value of at least ${field.min}` }]
      : []),
    ...(field.type === "number" && field.max !== undefined
      ? [{ type: "number" as const, max: field.max, message: `Please enter a value that does not exceed ${field.max}` }]
      : []),
    ...(field.type === "number" && field.exclusiveMin !== undefined
      ? [{
          type: "number" as const,
          validator: (_: unknown, value: number | undefined | null) =>
            value === undefined || value === null || value > (field.exclusiveMin as number)
              ? Promise.resolve()
              : Promise.reject(new Error(`Please enter a value greater than ${field.exclusiveMin}`)),
        }]
      : []),
    ...(field.type === "text" && field.maxLength
      ? [{ max: field.maxLength, message: `Please limit your response to ${field.maxLength} characters or less` }]
      : []),
  ].filter(Boolean);
};

export const dateValueProps = {
  getValueProps: (value: any) => ({
    value: value
      ? typeof value === "string" || typeof value === "number"
        ? dayjs(value)
        : value
      : undefined,
  }),
};

const numberParser = (value: string | undefined) => {
  if (!value) return "" as any;
  const cleaned = String(value).replace(/[^\d.\-]/g, "");
  const minus = cleaned.startsWith("-") ? "-" : "";
  const rest = cleaned.replace(/-/g, "");
  const firstDot = rest.indexOf(".");
  const normalized =
    firstDot === -1
      ? rest
      : rest.slice(0, firstDot + 1) + rest.slice(firstDot + 1).replace(/\./g, "");
  return (minus + normalized) as any;
};

// ── Yes / No toggle (binds to the field's option values, e.g. "Yes"/"No") ────

interface YesNoProps {
  value?: any;
  onChange?: (v: any) => void;
  disabled?: boolean;
  yesValue?: any;
  noValue?: any;
}

export const YesNoToggle: React.FC<YesNoProps> = ({
  value,
  onChange,
  disabled,
  yesValue = "Yes",
  noValue = "No",
}) => (
  <div style={{ display: "flex", gap: 9 }}>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(yesValue)}
      style={yesnoBtn(value === yesValue, "yes")}
    >
      Yes
    </button>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(noValue)}
      style={yesnoBtn(value === noValue, "no")}
    >
      No
    </button>
  </div>
);

// Compact Y/N for table cells.
export const MiniYesNo: React.FC<YesNoProps> = ({
  value,
  onChange,
  disabled,
  yesValue = "Yes",
  noValue = "No",
}) => (
  <div style={{ display: "flex", gap: 5 }}>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(value === yesValue ? "" : yesValue)}
      style={miniYesnoBtn(value === yesValue, "yes")}
    >
      Y
    </button>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(value === noValue ? "" : noValue)}
      style={miniYesnoBtn(value === noValue, "no")}
    >
      N
    </button>
  </div>
);

// ── Radio cards (multi-option single-select) ─────────────────────────────────

interface RadioCardsProps {
  value?: any;
  onChange?: (v: any) => void;
  options?: any[];
  disabled?: boolean;
}

export const RadioCards: React.FC<RadioCardsProps> = ({
  value,
  onChange,
  options = [],
  disabled,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
    {options.map((opt) => {
      const { label, value: val } = optionAsPair(opt);
      const sel = value === val;
      const s = radioCard(sel);
      return (
        <div
          key={String(val)}
          onClick={() => !disabled && onChange?.(val)}
          style={{ ...s.row, opacity: disabled && !sel ? 0.6 : 1, cursor: disabled ? "default" : "pointer" }}
        >
          <span style={s.dot} />
          <span style={s.label}>{label}</span>
        </div>
      );
    })}
  </div>
);

// ── FieldControl: renders the right input for a flat-schema field ────────────
// Spreads {value,onChange,...} injected by the wrapping Form.Item onto the
// inner control.

interface FieldControlProps {
  field: QuestionnaireField;
  disabled?: boolean;
  [key: string]: any;
}

export const FieldControl: React.FC<FieldControlProps> = ({
  field,
  disabled,
  ...rest
}) => {
  // Fields pre-filled from the immutable client BOM are always locked.
  const isDisabled = disabled ?? field.disabled ?? Boolean(field.autoPopulateFromBomField);
  switch (field.type) {
    case "textarea":
      return (
        <TextArea
          {...rest}
          rows={4}
          maxLength={field.maxLength}
          showCount={!!field.maxLength}
          placeholder={field.placeholder}
          disabled={isDisabled}
          style={ffStyle}
        />
      );
    case "number":
      return (
        <InputNumber
          {...rest}
          min={field.min}
          max={field.max}
          placeholder={field.placeholder}
          disabled={isDisabled}
          parser={numberParser}
          style={ffStyle}
        />
      );
    case "date":
      return (
        <DatePicker
          {...rest}
          format="DD/MM/YYYY"
          placeholder={field.placeholder}
          disabled={isDisabled}
          style={ffStyle}
        />
      );
    case "select":
      return (
        <Select
          {...rest}
          mode={field.mode}
          placeholder={field.placeholder || "Select an option…"}
          disabled={isDisabled}
          showSearch={Array.isArray(field.options) && field.options.length > 5}
          filterOption={(input: string, option: any) =>
            String(option?.children ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          style={{ width: "100%" }}
        >
          {(field.options || []).map((opt) => {
            const { label, value } = optionAsPair(opt);
            return (
              <Select.Option key={String(value)} value={value}>
                {label}
              </Select.Option>
            );
          })}
        </Select>
      );
    case "radio":
      return optionsAreYesNo(field.options) ? (
        <YesNoToggle {...rest} disabled={isDisabled} />
      ) : (
        <RadioCards {...rest} options={field.options} disabled={isDisabled} />
      );
    case "text":
    default:
      return (
        <Input
          {...rest}
          placeholder={field.placeholder}
          disabled={isDisabled}
          style={ffStyle}
        />
      );
  }
};
