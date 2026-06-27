import React, { useEffect, useState } from "react";
import { Modal, Collapse, Tag, Descriptions, Table, Button, Spin } from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  User,
  Building2,
  Package,
  CalendarRange,
  Layers,
  Flame,
  Box,
  Truck,
  Leaf,
  BookOpen,
  BadgeCheck,
  StickyNote,
} from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { QUESTIONNAIRE_SCHEMA } from "../../config/questionnaireSchema";
import type { QuestionnaireField } from "../../config/questionnaireSchema";
import {
  getFuelTypeDropdown,
  getSubFuelTypeDropdown,
  getEnergySourceDropdown,
  getEnergyTypeDropdown,
  getRefrigerantTypeDropdown,
  getProcessSpecificEnergyDropdown,
  getTransportModeDropdown,
  type DropdownItem,
} from "../../lib/questionnaireDropdownService";

interface QuestionnairePreviewModalProps {
  open: boolean;
  onClose: () => void;
  formData: Record<string, any>;
  onSubmit?: () => void | Promise<void>;
  isSubmitting?: boolean;
}

// Section config for icons and colors — V3 (28-question / CX-PCF Rulebook v4) section IDs.
const SECTION_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  general_information: {
    icon: <User size={16} />,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  section_a_company_product: {
    icon: <Building2 size={16} />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  section_b_scope_period: {
    icon: <CalendarRange size={16} />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  section_c_bom: {
    icon: <Package size={16} />,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  section_d_energy_process: {
    icon: <Flame size={16} />,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  section_e_packaging: {
    icon: <Box size={16} />,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  section_f_transport: {
    icon: <Truck size={16} />,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  section_g_biobased: {
    icon: <Leaf size={16} />,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  section_h_methodology: {
    icon: <BookOpen size={16} />,
    color: "text-sky-600",
    bgColor: "bg-sky-100",
  },
  section_i_boundary_dqr: {
    icon: <Layers size={16} />,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
  },
  section_j_verification: {
    icon: <BadgeCheck size={16} />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  section_k_other: {
    icon: <StickyNote size={16} />,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
};

// Helper to get nested value from object by dot-notation path
const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[part];
  }, obj);
};

// Safe stringifier — handles dayjs / Date / plain values without crashing.
// dayjs objects can lose their internal $d Date after a deepMerge, which makes
// the default toString throw `this.$d.toUTCString is not a function`.
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
    if (typeof v.$d !== "undefined") {
      const d = v.$d;
      if (d instanceof Date) {
        try { return d.toISOString().split("T")[0]; } catch { /* fall through */ }
      }
    }
  }
  try { return String(val); } catch { return ""; }
};

const QuestionnairePreviewModal: React.FC<QuestionnairePreviewModalProps> = ({
  open,
  onClose,
  formData,
  onSubmit,
  isSubmitting = false,
}) => {
  const [dropdownMaps, setDropdownMaps] = useState<
    Record<string, Record<string, string>>
  >({});
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Load dropdown lookups when modal opens
  useEffect(() => {
    if (!open) return;

    const loadDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        const [
          fuelTypes,
          subFuelTypes,
          energySources,
          energyTypes,
          refrigerantTypes,
          processSpecificEnergy,
          transportModes,
        ] = await Promise.all([
          getFuelTypeDropdown().catch(() => []),
          getSubFuelTypeDropdown().catch(() => []),
          getEnergySourceDropdown().catch(() => []),
          getEnergyTypeDropdown().catch(() => []),
          getRefrigerantTypeDropdown().catch(() => []),
          getProcessSpecificEnergyDropdown().catch(() => []),
          getTransportModeDropdown().catch(() => []),
        ]);

        const buildMap = (items: DropdownItem[]) => {
          const map: Record<string, string> = {};
          items.forEach((item) => {
            map[item.id] = item.name;
          });
          return map;
        };

        setDropdownMaps({
          fuelType: buildMap(fuelTypes),
          subFuelType: buildMap(subFuelTypes),
          subFuelTypeByFuel: buildMap(subFuelTypes),
          energySource: buildMap(energySources),
          energyType: buildMap(energyTypes),
          energyTypeBySource: buildMap(energyTypes),
          refrigerantType: buildMap(refrigerantTypes),
          processSpecificEnergy: buildMap(processSpecificEnergy),
          transportMode: buildMap(transportModes),
        });
      } catch (error) {
        console.error("Error loading dropdown data for preview:", error);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadDropdowns();
  }, [open]);

  // Resolve a dropdown value to its display name
  const resolveDropdownValue = (
    value: any,
    field: QuestionnaireField
  ): string => {
    if (value === null || value === undefined || value === "") return "";
    const strVal = safeToString(value);
    if (field.apiDropdown && dropdownMaps[field.apiDropdown]) {
      return dropdownMaps[field.apiDropdown][strVal] || strVal;
    }
    return strVal;
  };

  // Check if a field's dependency is met
  const isDependencyMet = (field: QuestionnaireField): boolean => {
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
    return String(depValue).toLowerCase() === String(expectedValue).toLowerCase();
  };

  // Check if a value is "answered" (non-empty)
  const hasValue = (value: any): boolean => {
    if (value === undefined || value === null || value === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) return false;
    return true;
  };

  // Render a Yes/No tag
  const renderYesNoTag = (value: any): React.ReactNode => {
    if (value === true || value === "Yes" || value === "yes") {
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Yes
        </Tag>
      );
    }
    if (value === false || value === "No" || value === "no") {
      return (
        <Tag color="red" icon={<CloseCircleOutlined />}>
          No
        </Tag>
      );
    }
    return <Tag color="green">Acknowledged</Tag>;
  };

  // Render a table field
  const renderTable = (
    field: QuestionnaireField,
    data: any[]
  ): React.ReactNode => {
    if (!Array.isArray(data) || data.length === 0) return null;
    if (!field.columns) return null;

    // Filter out empty rows
    const nonEmptyRows = data.filter((row) => {
      if (!row || typeof row !== "object") return false;
      return Object.values(row).some(
        (v) => v !== undefined && v !== null && v !== "" && v !== 0
      );
    });
    if (nonEmptyRows.length === 0) return null;

    const columns = field.columns
      .filter((col) => !col.name.startsWith("bom_id") && !col.name.startsWith("product_id"))
      .map((col) => ({
        title: col.label || col.name,
        dataIndex: col.name,
        key: col.name,
        render: (val: any) => {
          if (val === undefined || val === null || val === "") return "-";
          if (col.apiDropdown && dropdownMaps[col.apiDropdown]) {
            const key = safeToString(val);
            return dropdownMaps[col.apiDropdown][key] || key;
          }
          if (typeof val === "number") {
            return val.toLocaleString(undefined, { maximumFractionDigits: 20 });
          }
          return safeToString(val);
        },
      }));

    return (
      <Table
        dataSource={nonEmptyRows.map((row, i) => ({ ...row, key: i }))}
        columns={columns}
        pagination={false}
        size="small"
        bordered
        className="mt-2"
        scroll={{ x: "max-content" }}
      />
    );
  };

  // Render a single field value
  const renderFieldValue = (field: QuestionnaireField, value: any): React.ReactNode => {
    if (field.type === "checkbox" && !field.options) {
      // Single checkbox (acknowledgement)
      return renderYesNoTag(value);
    }
    if (field.type === "radio") {
      return renderYesNoTag(value);
    }
    if (field.type === "checkbox" && field.options) {
      // Multi-select checkboxes
      if (!Array.isArray(value) || value.length === 0) return null;
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((v: string, i: number) => (
            <Tag key={i} color="blue">
              {v}
            </Tag>
          ))}
        </div>
      );
    }
    if (field.type === "tags") {
      if (!Array.isArray(value) || value.length === 0) return null;
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((v: string, i: number) => (
            <Tag key={i} color="blue">
              {v}
            </Tag>
          ))}
        </div>
      );
    }
    if (field.type === "file") {
      if (!value) return null;
      const files = Array.isArray(value) ? value : [value];
      if (files.length === 0) return null;
      return (
        <div className="flex flex-wrap gap-1">
          {files.map((f: any, i: number) => {
            const fileName = typeof f === "string" ? f.split("/").pop() || f : f?.name || `File ${i + 1}`;
            return (
              <Tag key={i} color="geekblue">
                {fileName}
              </Tag>
            );
          })}
        </div>
      );
    }
    if (field.type === "textarea") {
      return (
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
          {safeToString(value)}
        </div>
      );
    }
    if (field.type === "select" && field.apiDropdown) {
      return resolveDropdownValue(value, field);
    }
    if (typeof value === "number") {
      return value.toLocaleString(undefined, { maximumFractionDigits: 20 });
    }
    return safeToString(value);
  };

  // Get a clean label — keep question numbers, only strip "(Optional)" suffix
  const getCleanLabel = (label: string): string => {
    return label.replace(/\s*\(Optional\)\s*$/i, "").trim();
  };

  // Render a section's content
  const renderSection = (sectionIndex: number): React.ReactNode => {
    const section = QUESTIONNAIRE_SCHEMA[sectionIndex];
    if (!section) return null;

    const fields = section.fields.filter((field) => {
      // Skip info fields
      if (field.type === "info") return false;
      // Check dependency
      if (!isDependencyMet(field)) return false;
      // Get value
      const value = getNestedValue(formData, field.name);
      // Skip empty fields
      if (field.type === "table") {
        return (
          Array.isArray(value) &&
          value.length > 0 &&
          value.some(
            (row: any) =>
              row &&
              Object.values(row).some(
                (v) => v !== undefined && v !== null && v !== "" && v !== 0
              )
          )
        );
      }
      return hasValue(value);
    });

    if (fields.length === 0) {
      return (
        <div className="text-center py-6 text-gray-400 text-sm">
          No data entered for this section
        </div>
      );
    }

    // Separate table fields from simple fields
    const simpleFields = fields.filter((f) => f.type !== "table");
    const tableFields = fields.filter((f) => f.type === "table");

    return (
      <div className="space-y-4">
        {/* Simple fields as Descriptions — single column so long values
            (org name, email, etc.) stay on one line */}
        {simpleFields.length > 0 && (
          <Descriptions bordered size="small" column={1}>
            {simpleFields.map((field) => {
              const value = getNestedValue(formData, field.name);
              return (
                <Descriptions.Item
                  key={field.name}
                  label={getCleanLabel(field.label || field.name)}
                >
                  {renderFieldValue(field, value)}
                </Descriptions.Item>
              );
            })}
          </Descriptions>
        )}

        {/* Table fields */}
        {tableFields.map((field) => {
          const value = getNestedValue(formData, field.name);
          return (
            <div key={field.name} className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">
                {getCleanLabel(field.label || field.name)}
              </div>
              {renderTable(field, value)}
            </div>
          );
        })}
      </div>
    );
  };

  // Count answered questions per section
  const getSectionAnsweredCount = (sectionIndex: number): number => {
    const section = QUESTIONNAIRE_SCHEMA[sectionIndex];
    if (!section) return 0;
    return section.fields.filter((field) => {
      if (field.type === "info") return false;
      if (!isDependencyMet(field)) return false;
      const value = getNestedValue(formData, field.name);
      if (field.type === "table") {
        return (
          Array.isArray(value) &&
          value.length > 0 &&
          value.some(
            (row: any) =>
              row &&
              Object.values(row).some(
                (v) => v !== undefined && v !== null && v !== "" && v !== 0
              )
          )
        );
      }
      return hasValue(value);
    }).length;
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-xl">
            <EyeOutlined className="text-green-600 text-lg" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              Questionnaire Preview
            </div>
            <div className="text-sm text-gray-500 font-normal">
              Review your responses before submitting
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={isSubmitting}>
            Close Preview
          </Button>
          {onSubmit && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={isSubmitting}
              onClick={() => onSubmit()}
              className="!bg-green-600 hover:!bg-green-700 !border-green-600"
            >
              Submit Questionnaire
            </Button>
          )}
        </div>
      }
      width={1000}
      style={{ top: 20 }}
      styles={{
        body: {
          maxHeight: "calc(100vh - 180px)",
          overflowY: "auto",
          padding: "16px",
        },
      }}
    >
      {loadingDropdowns ? (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner size="lg" label="Loading preview..." />
        </div>
      ) : (
        <Collapse
          defaultActiveKey={QUESTIONNAIRE_SCHEMA.map((s) => s.id)}
          className="bg-white"
          expandIconPosition="end"
        >
          {QUESTIONNAIRE_SCHEMA.map((section, index) => {
            const config = SECTION_CONFIG[section.id] || {
              icon: <User size={16} />,
              color: "text-gray-600",
              bgColor: "bg-gray-100",
            };
            const answeredCount = getSectionAnsweredCount(index);

            return (
              <Collapse.Panel
                header={
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 ${config.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <span className={config.color}>{config.icon}</span>
                    </div>
                    <span className="font-medium">{section.title}</span>
                    {answeredCount > 0 && (
                      <Tag color="green" className="ml-2">
                        {answeredCount} {answeredCount === 1 ? "item" : "items"}
                      </Tag>
                    )}
                  </div>
                }
                key={section.id}
              >
                {renderSection(index)}
              </Collapse.Panel>
            );
          })}
        </Collapse>
      )}
    </Modal>
  );
};

export default QuestionnairePreviewModal;
