/**
 * Notice (GDPR info) card and Consent (acknowledgement) card for the Full Form
 * General Information step. The consent checkbox is Ant-Form-bound to its
 * existing schema field name so required acknowledgements are still enforced by
 * form.validateFields() and the value persists through save/submit.
 */
import React from "react";
import { Form } from "antd";
import type { ConsentCardDef, NoticeDef } from "./layout";
import { C, cardStyle, consentRow, REQ_TAG, OPT_TAG } from "./theme";

export const NoticeCard: React.FC<{ notice: NoticeDef }> = ({ notice }) => (
  <div style={cardStyle}>
    <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
      <div
        style={{
          flex: "none",
          width: 30,
          height: 30,
          borderRadius: 9,
          background: "#eef5ff",
          color: "#2563eb",
          fontSize: 15,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
        }}
      >
        i
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>
          {notice.title}
        </div>
        <p style={{ fontSize: 13.5, color: "#5b6675", margin: 0, lineHeight: 1.55 }}>
          {notice.body}
        </p>
      </div>
    </div>
  </div>
);

// Custom checkbox control bound via Form.Item (valuePropName="checked").
const ConsentCheckbox: React.FC<{
  checked?: boolean;
  onChange?: (v: boolean) => void;
  label: string;
}> = ({ checked, onChange, label }) => {
  const s = consentRow(!!checked);
  return (
    <div onClick={() => onChange?.(!checked)} style={s.row}>
      <div style={s.box}>
        {checked && <span style={{ color: "#fff", fontSize: 14, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={s.label}>{label}</span>
    </div>
  );
};

export const ConsentCard: React.FC<{ def: ConsentCardDef }> = ({ def }) => {
  const tag = def.required ? REQ_TAG : OPT_TAG;
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            flex: "none",
            width: 30,
            height: 30,
            borderRadius: 9,
            background: C.greenSoft,
            color: C.greenDark,
            border: `1px solid ${C.greenSoft2}`,
            boxShadow: "inset 0 0 0 1px rgba(10,140,97,.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 1,
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.4 }}>
              {def.title}
            </span>
            <span style={tag}>{def.required ? "Required" : "Optional"}</span>
          </div>
          {def.intro && (
            <p style={{ fontSize: 13.5, color: "#5b6675", margin: "8px 0 0", lineHeight: 1.55 }}>
              {def.intro}
            </p>
          )}
        </div>
      </div>

      <div style={{ margin: "14px 0 0 42px", display: "flex", flexDirection: "column", gap: 14 }}>
        {def.groups.map((g, gi) => (
          <div
            key={gi}
            style={{
              background: C.panelBg,
              border: `1px solid ${C.hairline}`,
              borderRadius: 12,
              padding: "13px 16px",
            }}
          >
            {g.heading && (
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: ".07em",
                  textTransform: "uppercase",
                  color: C.muted2,
                  marginBottom: 10,
                }}
              >
                {g.heading}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {g.items.map((it, ii) => (
                <div key={ii} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span
                    style={{
                      flex: "none",
                      minWidth: 16,
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: C.greenDark,
                      lineHeight: 1.5,
                    }}
                  >
                    {g.ordered ? `${ii + 1}.` : "•"}
                  </span>
                  <span style={{ fontSize: 13, color: "#3a4754", lineHeight: 1.5 }}>{it}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <Form.Item
          name={def.ackName.split(".")}
          valuePropName="checked"
          className="mb-0"
          rules={[
            {
              validator: (_: any, v: any) =>
                v
                  ? Promise.resolve()
                  : Promise.reject(new Error("Please acknowledge this to continue.")),
            },
          ]}
        >
          <ConsentCheckbox label={def.checkboxLabel} />
        </Form.Item>
      </div>
    </div>
  );
};
