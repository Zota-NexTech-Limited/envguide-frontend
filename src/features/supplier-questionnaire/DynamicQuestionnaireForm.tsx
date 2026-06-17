import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { Form, Input, Select, Checkbox, Radio, InputNumber, Button, Table, Space, Typography, Tooltip, Badge, Empty, Tag, Spin, Upload, message, DatePicker } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { QUESTIONNAIRE_OPTIONS } from '../../config/questionnaireConfig';
import { PlusOutlined, DeleteOutlined, UploadOutlined, QuestionCircleOutlined, CheckCircleOutlined, InfoCircleOutlined, LoadingOutlined, FileOutlined, ReloadOutlined } from '@ant-design/icons';
import type { QuestionnaireSection, QuestionnaireField, ApiDropdownType } from '../../config/questionnaireSchema';
import questionnaireDropdownService, { type DropdownItem } from '../../lib/questionnaireDropdownService';
// EF cascading dropdowns were wired to the 6 legacy ECOInvent EF tables (now
// removed). The questionnaire is being rebuilt in Phase 2 against the new
// BAFU 2025 emission_factors master + AI matching engine, so this file's EF
// lookups are intentionally stubbed for now. The cascade dropdowns will appear
// empty until the new EF source is wired in.
type EfGroup = 'materials' | 'electricity' | 'fuel' | 'packaging' | 'vehicle' | 'waste';
interface EmissionFactorRow {
  id: string;
  ef_code?: string;
  layer1?: string;
  layer2?: string;
  layer3?: string;
  layer4?: string;
  region?: string;
  ef_value?: number;
  unit?: string;
  scope?: string;
}
async function listCategorizedEfRows(_group: EfGroup): Promise<EmissionFactorRow[]> {
  return [];
}
import supplierQuestionnaireService from '../../lib/supplierQuestionnaireService';
import LocationAutocomplete from '../../components/LocationAutocomplete';
import type { LocationValue } from '../../components/LocationAutocomplete';

const { Title, Text } = Typography;
const { TextArea } = Input;

// TagsInput component for pill-based multi-input
interface TagsInputProps {
  placeholder?: string;
  form: any;
  fieldName: string;
  value?: string[];
  onChange?: (value: string[]) => void;
}

// Full anti-autofill attribute set covering Chrome / Edge / Safari form
// history AND every major password manager (1Password, LastPass, Bitwarden,
// Dashlane, Roboform, ProtonPass). Each vendor reads a different signal, so
// all of them have to be set together; missing one means that vendor's popup
// still appears. Random autoComplete value is treated as "off" semantically
// by Chrome and prevents Chrome from matching the input against saved form
// history.
const noAutofillProps = (fieldName: string) =>
  ({
    autoComplete: `nope-${fieldName}-${Math.random().toString(36).slice(2, 8)}`,
    "data-form-type": "other",
    "data-lpignore": "true",
    "data-1p-ignore": "true",
    "data-1password-ignore": "true",
    "data-op-ignore": "true",
    "data-bwignore": "true",
    "data-dashlane-ignore": "true",
    "data-dashlane-rid": "ignored",
    "data-protonpass-ignore": "true",
    "data-form-ignore": "true",
    spellCheck: false,
    role: "presentation",
  }) as any;

// Renders a Component Name cell that mirrors the value set by the sibling
// MPN dropdown's onChange. Uses BOTH:
//   1. A `name`-bound Form.Item — this REGISTERS the field with the form
//      store, which is required for Antd's internal subscription system to
//      reliably re-render when setFieldValue / setFields writes to it.
//   2. Form.useWatch on the same path — guarantees a fresh re-render every
//      time the field value changes, even when `disabled` would otherwise
//      block the controlled-Input re-render.
// The bomMaterials onChange writes via form.setFields(...) (NOT setFieldValue)
// because setFields explicitly notifies field-level subscribers, while
// setFieldValue's notification is best-effort and was missing the disabled
// Input in conditional sub-tables (Q9.1 / Q14 / Q16).
interface ReadOnlyTableCellProps {
  form: any;
  // Path inside the parent Form.List (e.g. [0, 'component_name']) — used as
  // the Form.Item `name` so the field registers correctly inside Form.List.
  namePath: (string | number)[];
  // Absolute path from form root — used by Form.useWatch.
  watchPath: (string | number)[];
  placeholder?: string;
}
const ReadOnlyTableCell: React.FC<ReadOnlyTableCellProps> = ({ form, namePath, watchPath, placeholder }) => {
  // KEY INSIGHT: do NOT use a `name`-bound Form.Item. Antd Form.Item with
  // `name` injects its own internally-tracked value into the child Input via
  // cloneElement, OVERRIDING any `value` prop we set manually. That internal
  // tracker doesn't always fire on parent-path setFieldValue inside a
  // Form.List that lives inside an Antd Table cell render — so the injected
  // value stayed empty even after the BOM dropdown wrote component_name into
  // the array.
  //
  // FIX: read the value ourselves via Form.useWatch on the absolute path, then
  // render a bare <Input value={...} disabled /> with no Form.Item name
  // binding. useWatch subscribes to the form store directly and re-renders
  // this component whenever the cell value changes. The outer empty Form.Item
  // is kept only for layout consistency with the other cells in the row.
  // The form store already has component_name (the BOM onChange wrote it via
  // setFieldValue(fieldPath, fullArray)) so getFieldsValue / submit still
  // carry it through to the backend — no name binding needed for persistence.
  void namePath;
  const value = Form.useWatch(watchPath, form);
  return (
    <Form.Item className="mb-0">
      <Input
        disabled
        value={value ?? ""}
        placeholder={placeholder}
        style={{ width: "100%" }}
        autoComplete="off"
        {...({
          "data-form-type": "other",
          "data-lpignore": "true",
          "data-1p-ignore": "true",
          "data-bwignore": "true",
          "data-dashlane-ignore": "true",
        } as any)}
      />
    </Form.Item>
  );
};

const TagsInput: React.FC<TagsInputProps> = ({ placeholder, form, fieldName, value = [], onChange }) => {
  const [inputValue, setInputValue] = useState('');

  // Get current tags from form or prop
  const rawTags = value || form.getFieldValue(fieldName.split('.'));
  const tags = Array.isArray(rawTags) ? rawTags : [];

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      if (onChange) {
        onChange(newTags);
      } else {
        form.setFieldValue(fieldName.split('.'), newTags);
      }
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag: string) => tag !== tagToRemove);
    if (onChange) {
      onChange(newTags);
    } else {
      form.setFieldValue(fieldName.split('.'), newTags);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="w-full">
      {/* Pills display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag: string, index: number) => (
            <Tag
              key={index}
              closable
              onClose={() => handleRemoveTag(tag)}
              className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 border-indigo-200"
            >
              {tag}
            </Tag>
          ))}
        </div>
      )}
      {/* Input field */}
      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ flex: 1 }}
        />
        <Button type="primary" onClick={handleAddTag} className="!bg-indigo-600 hover:!bg-indigo-700">
          Add
        </Button>
      </Space.Compact>
    </div>
  );
};

interface DynamicQuestionnaireFormProps {
  section: QuestionnaireSection;
  initialValues: any;
  onFinish: (values: any) => void;
  form: any; // Ant Form instance
  onValuesChange?: (changedValues: any, allValues: any) => void;
  autoPopulatedFields?: Set<string>;
  formErrors?: Record<string, string[]>;
  isClientMode?: boolean; // Client mode uses Product Code/Name instead of MPN/Component Name
  // BOM components assigned to this supplier on this PCF request. When provided,
  // the bomMaterials dropdown sources its options from this list (immutable BOM)
  // instead of from the supplier's products_manufactured input.
  bomComponents?: Array<{
    bom_id: string;
    material_number: string;
    component_name: string;
  }>;
}

// Type for storing dropdown data
type DropdownDataMap = Record<ApiDropdownType, DropdownItem[]>;

// Type for dependent dropdown data (keyed by parent value)
type DependentDropdownMap = Record<string, DropdownItem[]>;

// Module-level coord + distance store — survives re-renders, no React state needed
const _transportCoords: Record<string, { sLat?: number; sLng?: number; dLat?: number; dLng?: number; distance?: number }> = {};

const DynamicQuestionnaireForm: React.FC<DynamicQuestionnaireFormProps> = ({
  section,
  initialValues,
  onFinish,
  form,
  onValuesChange,
  autoPopulatedFields = new Set(),
  formErrors = {},
  isClientMode = false,
  bomComponents = []
}) => {
  const [charCounts, setCharCounts] = useState<Record<string, number>>({});

  // State for API dropdown data
  const [dropdownData, setDropdownData] = useState<Partial<DropdownDataMap>>({});
  const [dropdownLoading, setDropdownLoading] = useState<Record<string, boolean>>({});

  // State for dependent/cascading dropdowns (sub-fuel types by fuel type, energy types by source)
  const [subFuelTypesByFuel, setSubFuelTypesByFuel] = useState<DependentDropdownMap>({});
  const [energyTypesBySource, setEnergyTypesBySource] = useState<DependentDropdownMap>({});

  // Counter to force re-render when distance is calculated (since distance lives in module-level _transportCoords)
  const [distanceTick, setDistanceTick] = useState(0);

  // Categorized EF rows keyed by ef_group. Backs Layer 1..4 cascade dropdowns
  // sourced from the ECOInvent EF pages.
  const [efRowsByGroup, setEfRowsByGroup] = useState<Record<string, EmissionFactorRow[]>>({});
  const [efLoadedGroups, setEfLoadedGroups] = useState<Set<string>>(new Set());

  // ---- Haversine + correction factor — pure frontend, synchronous, instant ----
  const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius in KM
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getTransportCorrectionFactor = (mode: string): number => {
    if (!mode) return 1.2;
    const m = mode.toLowerCase();
    if (m.includes('ship') || m.includes('sea') || m.includes('vessel') || m.includes('barge') || m.includes('ferry')) return 1.0;
    if (m.includes('air') || m.includes('flight') || m.includes('aircraft') || m.includes('plane')) return 1.0;
    if (m.includes('rail') || m.includes('train') || m.includes('intermodal')) return 1.15;
    return 1.2; // all road: truck, van, bus, etc.
  };

  // Calculate and set distance for a transport row. Stores in _transportCoords (module-level) + triggers re-render.
  const setTransportDistance = useCallback((
    fieldPath: string[],
    rowIndex: number,
    srcLat: number, srcLng: number,
    dstLat: number, dstLng: number,
    mode?: string
  ) => {
    const modeOfTransport = mode ?? (form.getFieldValue([...fieldPath, rowIndex])?.mode || '');
    const straightLine = haversineDistance(srcLat, srcLng, dstLat, dstLng);
    const factor = getTransportCorrectionFactor(modeOfTransport);
    const distance = Math.round(straightLine * factor);
    // Store in module-level object (won't be wiped by initialValues sync)
    _transportCoords[String(rowIndex)] = { ..._transportCoords[String(rowIndex)], distance };
    // Also write to form for saving
    form.setFieldValue([...fieldPath, rowIndex, 'distance'], distance);
    // Force re-render to update the distance display
    setDistanceTick(t => t + 1);
    // Trigger onValuesChange so distance is captured in formData for auto-save
    if (onValuesChange) {
      setTimeout(() => {
        const allValues = form.getFieldsValue();
        onValuesChange({ [fieldPath.join('.')]: allValues[fieldPath[0]] }, allValues);
      }, 100);
    }
  }, [form, onValuesChange]);

  // Patch EVERY input / textarea in the form with the full anti-autofill
  // attribute set. We do this from the DOM because:
  //   1. Antd Select renders an internal <input class="ant-select-selection-search-input">
  //      that does NOT forward autoComplete from the Select wrapper.
  //   2. Antd Input / TextArea forward most props but some browsers / password
  //      managers still match by `name` or `id` attribute; stamping from DOM
  //      after mount gives us one extra layer of defence.
  // Covers Chrome / Edge form history AND every major password manager
  // (1Password, LastPass, Bitwarden, Dashlane, Roboform). The MutationObserver
  // catches any inputs added later (Form.List rows, conditional sections,
  // dropdown opens).
  useEffect(() => {
    const stamp = (inp: Element) => {
      if (inp.getAttribute('data-no-autofill') === '1') return;
      // DO NOT stamp `readonly` here. The React-side noAutofillProps sets
      // readOnly + an onFocus handler that strips it — applied together so
      // the user can type. The DOM stamper has no way to attach the focus
      // handler, so stamping `readonly` here would freeze the field.
      inp.setAttribute(
        'autocomplete',
        `nope-${Math.random().toString(36).slice(2, 10)}`
      );
      inp.setAttribute('data-form-type', 'other');
      inp.setAttribute('data-lpignore', 'true');
      inp.setAttribute('data-1p-ignore', 'true');
      inp.setAttribute('data-1password-ignore', 'true');
      inp.setAttribute('data-op-ignore', 'true');
      inp.setAttribute('data-bwignore', 'true');
      inp.setAttribute('data-dashlane-ignore', 'true');
      inp.setAttribute('data-dashlane-rid', 'ignored');
      inp.setAttribute('data-protonpass-ignore', 'true');
      inp.setAttribute('data-form-ignore', 'true');
      inp.setAttribute('role', 'presentation');
      inp.setAttribute('spellcheck', 'false');
      inp.setAttribute('data-no-autofill', '1');
    };
    const patchInputs = (root: ParentNode = document) => {
      const inputs = root.querySelectorAll(
        '.ant-select-selection-search-input, .ant-select input, .ant-input, .ant-input-number-input, textarea.ant-input, input[type="text"], input[type="number"], textarea'
      );
      inputs.forEach(stamp);
    };
    patchInputs();
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) patchInputs(n as ParentNode);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [section]);

  // Sync initialValues when they change (for auto-population)
  // This is important for Form.List components that need to be updated when data is auto-populated
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      // Only update if there are actual values to set
      const currentValues = form.getFieldsValue();
      // JSON.stringify can throw if a dayjs object has been mangled (its toJSON
      // calls $d.toISOString which then fails). In that case treat as "changed"
      // so we still call setFieldsValue — harmless re-render is preferable to crash.
      let hasNewData = true;
      try {
        hasNewData = JSON.stringify(currentValues) !== JSON.stringify(initialValues);
      } catch {
        hasNewData = true;
      }

      if (hasNewData) {
        console.log("DynamicQuestionnaireForm: Updating form values from initialValues", initialValues);
        form.setFieldsValue(initialValues);
      }
    }
  }, [initialValues, form]);

  // Track character counts for textareas
  useEffect(() => {
    if (!section) return;
    const fields = section.fields.filter(f => f.type === 'textarea');
    const counts: Record<string, number> = {};
    fields.forEach(field => {
      const value = form.getFieldValue(field.name.split('.'));
      if (value) {
        counts[field.name] = value.length;
      }
    });
    setCharCounts(counts);
  }, [section, form]);

  // Auto-populate tables with products_manufactured data
  const autoPopulateTables = useCallback((forceFieldName?: string) => {
    if (!section) return;

    // Get products_manufactured from form
    const productsManufacturedRaw = form.getFieldValue(['product_details', 'products_manufactured']);
    // Filter out undefined/null items to prevent errors when accessing properties
    const productsManufactured = Array.isArray(productsManufacturedRaw) ? productsManufacturedRaw.filter(Boolean) : [];

    if (productsManufactured.length === 0) return;

    // Find tables that need auto-population.
    // Only auto-populate MANDATORY tables — optional tables start empty
    // so the supplier can decide whether to fill them.
    const tablesNeedingAutoPopulate = section.fields.filter(
      (field) =>
        field.type === 'table' &&
        field.autoPopulateFromProducts &&
        field.required === true
    );

    tablesNeedingAutoPopulate.forEach((field) => {
      const fieldPath = field.name.split('.');
      const currentValues = form.getFieldValue(fieldPath) || [];

      // Only auto-populate if table is empty
      // For forced fields (conditional tables that just became visible), still only populate if empty
      const isForced = forceFieldName === field.name;
      const isEmpty = currentValues.length === 0;

      // Auto-populate ONLY if table is empty (forced flag just prioritizes this field but doesn't override existing data)
      if (isEmpty) {
        const autoPopulatedRows = productsManufactured.map((product: any) => {
          const row: Record<string, any> = {};

          // Set material_number/MPN from product (use material_number which matches bomMaterials dropdown ID)
          const materialNumber = product.material_number || product.mpn || '';
          if (materialNumber) {
            row.material_number = materialNumber;
            row.mpn = materialNumber; // For backward compatibility
          }

          // Set component_name or product_name from product
          const productName = product.product_name || '';
          if (productName) {
            row.component_name = productName;
            row.product_name = productName;
          }

          // Set bom_id if available
          if (product.bom_id) {
            row.bom_id = product.bom_id;
          }

          return row;
        }).filter((row: Record<string, any>) => row.material_number || row.mpn || row.product_name); // Include rows with MPN or product_name

        if (autoPopulatedRows.length > 0) {
          console.log(`Auto-populating ${field.name} with ${autoPopulatedRows.length} products`);
          form.setFieldValue(fieldPath, autoPopulatedRows);
        }
      }
    });
  }, [section, form]);

  // Run auto-populate on section load
  useEffect(() => {
    autoPopulateTables();
  }, [autoPopulateTables, initialValues]);

  // Q8 (and any other autoPopulateFromBom table): pre-fill ONE row per BOM
  // component sourced directly from the immutable client-uploaded BOM.
  // MPN and Component Name come from the BOM; supplier fills the rest.
  useEffect(() => {
    if (!section) return;
    if (!Array.isArray(bomComponents) || bomComponents.length === 0) return;

    const tablesFromBom = section.fields.filter(
      (f) => f.type === "table" && f.autoPopulateFromBom
    );
    if (tablesFromBom.length === 0) return;

    tablesFromBom.forEach((field) => {
      const fieldPath = field.name.split(".");
      const existing = form.getFieldValue(fieldPath) || [];
      const filledRows = (Array.isArray(existing) ? existing : []).filter(Boolean);

      // If the table is empty OR has the wrong number of rows for this BOM,
      // rebuild it from the BOM list. We preserve any supplier-entered data
      // for rows whose bom_id matches a BOM component (so refreshes don't wipe).
      if (filledRows.length === bomComponents.length) return;

      const existingByBomId: Record<string, any> = {};
      filledRows.forEach((r: any) => {
        if (r && r.bom_id) existingByBomId[r.bom_id] = r;
      });

      const newRows = bomComponents.map((c) => {
        const prior = existingByBomId[c.bom_id] || {};
        return {
          ...prior,
          bom_id: c.bom_id,
          material_number: c.material_number,
          product_id: c.material_number,
          component_name: c.component_name,
          product_name: c.component_name,
        };
      });

      form.setFieldValue(fieldPath, newRows);
    });
  }, [section, bomComponents, form, initialValues]);

  // BACKFILL component_name for any Form.List row that has an MPN selected
  // (saved in a previous session before the bomMaterials onChange was wired
  // to write component_name). Without this, opening a draft shows the MPN
  // dropdown with a value but the readOnly Component Name cell stays empty
  // because the dropdown's onChange never re-fires on mount.
  // Runs whenever the section, bomComponents, or initialValues change.
  useEffect(() => {
    if (!section) return;
    if (!Array.isArray(bomComponents) || bomComponents.length === 0) return;

    // For every table that uses bomMaterials dropdown columns, scan its rows
    // and backfill missing component_name / bom_id / product_name.
    section.fields.forEach((field) => {
      if (field.type !== "table") return;
      const bomCol = field.columns?.find(
        (c) => c.apiDropdown === "bomMaterials"
      );
      if (!bomCol) return;

      const fieldPath = field.name.split(".");
      const existing = form.getFieldValue(fieldPath);
      if (!Array.isArray(existing) || existing.length === 0) return;

      let changed = false;
      const next = existing.map((row: any) => {
        if (!row || typeof row !== "object") return row;
        const mpnVal = row[bomCol.name];
        if (!mpnVal) return row;
        if (row.component_name && row.product_name) return row;
        // Look up the BOM material the supplier picked
        const bom = bomComponents.find(
          (b) => b.material_number === mpnVal
        );
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
      if (changed) {
        form.setFieldValue(fieldPath, next);
      }
    });
  }, [section, bomComponents, form, initialValues]);

  // Watch for dependency field changes to trigger auto-populate
  // This handles cases where conditional tables become visible
  useEffect(() => {
    if (!section) return;

    // Find all tables with autoPopulateFromProducts that have dependencies.
    // Still only mandatory ones — optional tables don't auto-populate even
    // when their dependency becomes true.
    const conditionalTables = section.fields.filter(
      (field) =>
        field.type === 'table' &&
        field.autoPopulateFromProducts &&
        field.dependency &&
        field.required === true
    );

    conditionalTables.forEach((field) => {
      if (field.dependency) {
        const dependencyFieldPath = field.dependency.field.split('.');
        const dependencyValue = form.getFieldValue(dependencyFieldPath);

        // If the dependency condition is met, try to auto-populate
        if (dependencyValue === field.dependency.value) {
          // Small delay to allow form to render the table
          setTimeout(() => {
            autoPopulateTables(field.name);
          }, 100);
        }
      }
    });
  }, [section, form, autoPopulateTables]);

  // Load categorized EF rows for any ef_group referenced by columns in the
  // current section (cached across section switches so we don't refetch on
  // every step). Failures fall back to an empty list so the cascade still
  // renders with the "no data" placeholder.
  useEffect(() => {
    if (!section) return;
    const needed = new Set<EfGroup>();
    const collect = (fields: QuestionnaireField[]) => {
      fields.forEach((f) => {
        if (f.efSource) needed.add(f.efSource as EfGroup);
        if (f.columns) {
          f.columns.forEach((c) => {
            if (c.efSource) needed.add(c.efSource as EfGroup);
          });
        }
      });
    };
    collect(section.fields);

    needed.forEach((group) => {
      if (efLoadedGroups.has(group)) return;
      listCategorizedEfRows(group)
        .then((rows) => {
          setEfRowsByGroup((prev) => ({ ...prev, [group]: rows }));
        })
        .catch(() => {
          setEfRowsByGroup((prev) => ({ ...prev, [group]: prev[group] ?? [] }));
        })
        .finally(() => {
          setEfLoadedGroups((prev) => {
            const next = new Set(prev);
            next.add(group);
            return next;
          });
        });
    });
  }, [section, efLoadedGroups]);

  // Fetch API dropdown data when section changes
  useEffect(() => {
    if (!section) return;

    // Collect all unique apiDropdown types needed for this section
    const apiDropdownTypes = new Set<ApiDropdownType>();

    const collectApiDropdowns = (fields: QuestionnaireField[]) => {
      fields.forEach(field => {
        if (field.apiDropdown && !field.dependsOnField) {
          // Only fetch non-dependent dropdowns initially
          apiDropdownTypes.add(field.apiDropdown);
        }
        if (field.columns) {
          field.columns.forEach(col => {
            if (col.apiDropdown && !col.dependsOnField) {
              apiDropdownTypes.add(col.apiDropdown);
            }
          });
        }
      });
    };

    collectApiDropdowns(section.fields);

    // Fetch each dropdown type
    const fetchDropdowns = async () => {
      for (const dropdownType of apiDropdownTypes) {
        // Skip if already loaded
        if (dropdownData[dropdownType]) continue;

        setDropdownLoading(prev => ({ ...prev, [dropdownType]: true }));

        try {
          let data: DropdownItem[] = [];

          switch (dropdownType) {
            case 'fuelType':
              data = await questionnaireDropdownService.getFuelTypeDropdown();
              break;
            case 'subFuelType':
              data = await questionnaireDropdownService.getSubFuelTypeDropdown();
              break;
            case 'refrigerantType':
              data = await questionnaireDropdownService.getRefrigerantTypeDropdown();
              break;
            case 'energySource':
              data = await questionnaireDropdownService.getEnergySourceDropdown();
              break;
            case 'processSpecificEnergy':
              data = await questionnaireDropdownService.getProcessSpecificEnergyDropdown();
              break;
            case 'energyType':
              data = await questionnaireDropdownService.getEnergyTypeDropdown();
              break;
            case 'bomMaterials':
              // BOM materials are derived from form data (products_manufactured)
              // This is handled separately in renderSelectField
              data = [];
              break;
            case 'wasteType':
              data = await questionnaireDropdownService.getWasteTypeDropdown();
              break;
            case 'wasteTreatmentType':
              data = await questionnaireDropdownService.getWasteTreatmentTypeDropdown();
              break;
            case 'productUnit':
              data = await questionnaireDropdownService.getProductUnitDropdown();
              break;
            case 'transportMode':
              data = await questionnaireDropdownService.getTransportModeDropdown();
              break;
            // UOM dropdowns
            case 'liquidGaseousSolidWaterUnit':
              data = await questionnaireDropdownService.getLiquidGaseousSolidWaterUnitDropdown();
              break;
            case 'liquidGaseousSolidUnit':
              data = await questionnaireDropdownService.getLiquidGaseousSolidUnitDropdown();
              break;
            case 'gaseousFuelUnit':
              data = await questionnaireDropdownService.getGaseousFuelUnitDropdown();
              break;
            case 'energyUnit':
              data = await questionnaireDropdownService.getEnergyUnitDropdown();
              break;
            case 'qcEquipmentUnit':
              data = await questionnaireDropdownService.getQcEquipmentUnitDropdown();
              break;
            case 'liquidGaseousUnit':
              data = await questionnaireDropdownService.getLiquidGaseousUnitDropdown();
              break;
            case 'solidFuelUnit':
              data = await questionnaireDropdownService.getSolidFuelUnitDropdown();
              break;
            case 'liquidSolidUnit':
              data = await questionnaireDropdownService.getLiquidSolidUnitDropdown();
              break;
            case 'packingUnit':
              data = await questionnaireDropdownService.getPackingUnitDropdown();
              break;
            // Q52 and Q60 specific dropdowns
            case 'materialType':
              data = await questionnaireDropdownService.getMaterialTypeDropdown();
              break;
            case 'packingType':
              data = await questionnaireDropdownService.getPackingTypeDropdown();
              break;
            case 'packagingTreatmentType':
              data = await questionnaireDropdownService.getPackagingTreatmentTypeDropdown();
              break;
          }

          setDropdownData(prev => ({ ...prev, [dropdownType]: data }));
        } catch (error) {
          console.error(`Failed to fetch ${dropdownType} dropdown:`, error);
        } finally {
          setDropdownLoading(prev => ({ ...prev, [dropdownType]: false }));
        }
      }
    };

    fetchDropdowns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // Track in-flight requests to prevent duplicate calls
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  // Helper to check if a value looks like a valid API ID (ULID format)
  // ULIDs are 26 characters, alphanumeric
  const isValidApiId = (value: string): boolean => {
    if (!value || typeof value !== 'string') return false;
    // ULID format: 26 alphanumeric characters
    // Also accept UUIDs and other ID formats that don't contain spaces
    return /^[A-Za-z0-9_-]{10,}$/.test(value) && !value.includes(' ');
  };

  // Function to fetch dependent dropdown data (sub-fuel by fuel, energy type by source)
  const fetchDependentDropdown = useCallback(async (
    dropdownType: 'subFuelTypeByFuel' | 'energyTypeBySource',
    parentId: string
  ) => {
    if (!parentId) return;

    // Validate that parentId is an actual API ID, not a display name
    if (!isValidApiId(parentId)) {
      console.warn(`Invalid API ID format for ${dropdownType}: "${parentId}" - skipping fetch`);
      return;
    }

    const cacheKey = `${dropdownType}_${parentId}`;

    // Check if already cached
    if (dropdownType === 'subFuelTypeByFuel' && subFuelTypesByFuel[parentId]) return;
    if (dropdownType === 'energyTypeBySource' && energyTypesBySource[parentId]) return;

    // Check if request is already in flight
    if (pendingRequests.has(cacheKey)) return;

    // Mark request as pending
    setPendingRequests(prev => new Set(prev).add(cacheKey));
    setDropdownLoading(prev => ({ ...prev, [cacheKey]: true }));

    try {
      let data: DropdownItem[] = [];

      if (dropdownType === 'subFuelTypeByFuel') {
        data = await questionnaireDropdownService.getSubFuelTypeByFuelTypeDropdown(parentId);
        setSubFuelTypesByFuel(prev => ({ ...prev, [parentId]: data }));
      } else if (dropdownType === 'energyTypeBySource') {
        data = await questionnaireDropdownService.getEnergyTypeBySourceDropdown(parentId);
        setEnergyTypesBySource(prev => ({ ...prev, [parentId]: data }));
      }
    } catch (error) {
      console.error(`Failed to fetch ${dropdownType} for ${parentId}:`, error);
    } finally {
      setDropdownLoading(prev => ({ ...prev, [cacheKey]: false }));
      setPendingRequests(prev => {
        const next = new Set(prev);
        next.delete(cacheKey);
        return next;
      });
    }
  }, [subFuelTypesByFuel, energyTypesBySource, pendingRequests]);

  // Helper to get dropdown options for a field
  const getDropdownItems = useCallback((
    apiDropdownType: ApiDropdownType,
    dependsOnField?: string,
    parentValue?: string
  ): DropdownItem[] => {
    // Handle dependent dropdowns
    if (dependsOnField && parentValue) {
      // Only return cached data if parentValue is a valid API ID
      if (!isValidApiId(parentValue)) {
        return [];
      }
      if (apiDropdownType === 'subFuelTypeByFuel') {
        return subFuelTypesByFuel[parentValue] || [];
      }
      if (apiDropdownType === 'energyTypeBySource') {
        return energyTypesBySource[parentValue] || [];
      }
    }

    // Return static dropdown data
    return dropdownData[apiDropdownType] || [];
  }, [dropdownData, subFuelTypesByFuel, energyTypesBySource]);

  if (!section) {
    return null;
  }
  
  // Mark each field as a "sub-field" so it can be visually nested under its
  // parent question: a numbered sub-question ("9.1") or an unnumbered field that
  // follows a numbered main question ("1.", "2." ...). Info blocks and items that
  // appear before any numbered question (e.g. General Information
  // acknowledgements) are not nested.
  const labelIsMainQuestion = (f: QuestionnaireField) =>
    typeof f.label === "string" && /^\d+\.\s/.test(f.label);
  const labelIsNumberedSub = (f: QuestionnaireField) =>
    typeof f.label === "string" && /^\d+\.\d+/.test(f.label);
  const subFieldFlags: boolean[] = (() => {
    const flags: boolean[] = [];
    let parentSeen = false;
    for (const f of section.fields) {
      if (f.type === "info") { flags.push(false); continue; }
      if (labelIsMainQuestion(f)) { parentSeen = true; flags.push(false); continue; }
      flags.push(labelIsNumberedSub(f) || parentSeen);
    }
    return flags;
  })();

  const renderField = (field: QuestionnaireField, isSubField = false) => {
    // Nest sub-fields under their parent (indent + left rule). Wrapping here
    // means hidden dependency fields render nothing and leave no stray line.
    const wrap = (content: React.ReactNode): React.ReactNode =>
      isSubField && content != null ? (
        <div className="ml-1 pl-4 border-l-2 border-gray-200">{content}</div>
      ) : (
        content
      );
    // Handle conditional rendering
    if (field.dependency) {
      return (
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => {
            // Helper to get nested value
            const getValue = (obj: any, path: string) => {
              return path.split('.').reduce((acc, part) => acc && acc[part], obj);
            };
            
            const prev = getValue(prevValues, field.dependency!.field);
            const curr = getValue(currentValues, field.dependency!.field);
            return prev !== curr;
          }}
        >
          {({ getFieldValue }) => {
            const dependencyValue = getFieldValue(field.dependency!.field.split('.'));
            const expectedValue = field.dependency!.value;
            
            // Check if dependency field has been answered at all
            const isAnswered = dependencyValue !== undefined && 
                              dependencyValue !== null && 
                              dependencyValue !== '';
            
            // If dependency field hasn't been answered, don't show dependent field
            if (!isAnswered) {
              return null;
            }
            
            // Handle different value types
            if (typeof expectedValue === 'boolean') {
              // For boolean dependencies, convert dependencyValue to boolean for comparison
              const depBool = typeof dependencyValue === 'string' 
                ? (dependencyValue.toLowerCase() === 'yes' || dependencyValue.toLowerCase() === 'true')
                : Boolean(dependencyValue);
              if (depBool !== expectedValue) {
                return null;
              }
            } else if (Array.isArray(dependencyValue)) {
              // For array values (multi-select), check if expected value is in array
              if (!dependencyValue.includes(expectedValue)) {
                return null;
              }
            } else {
              // For string/number values, check exact match (case-insensitive for Yes/No)
              const depStr = String(dependencyValue).toLowerCase();
              const expStr = String(expectedValue).toLowerCase();
              if (depStr !== expStr) {
                return null;
              }
            }
            
            return wrap(renderFieldContent(field));
          }}
        </Form.Item>
      );
    }

    return wrap(renderFieldContent(field));
  };

  const renderFieldContent = (field: QuestionnaireField) => {
    if (field.type === 'info') {
      // Render the content sub-div only when there's actual content. Empty
      // content used to leak an empty <div> with margin under header-style
      // info blocks (Q21 / Q23 / Q24), making the heading look detached.
      const hasContent = field.content != null && field.content !== "";
      // Header-style info blocks (no content, no className) — render as a
      // plain question heading so it visually groups the sub-fields below
      // without looking like a callout card.
      const isHeaderOnly = !hasContent && !field.className;
      return (
        <div
          className={
            isHeaderOnly
              ? "mb-3"
              : `mb-3 transition-all duration-200 ${field.className || ''}`
          }
          key={field.name}
        >
          {field.label && (
            <h4
              className={
                isHeaderOnly
                  ? "text-base font-semibold text-gray-900 mb-0"
                  : `text-sm font-medium text-gray-900 ${hasContent ? 'mb-2' : 'mb-0'}`
              }
            >
              {field.label}
            </h4>
          )}
          {hasContent && (
            <div className="text-sm text-gray-600 whitespace-pre-line">{field.content}</div>
          )}
        </div>
      );
    }

    if (field.type === 'table') {
      return renderTableField(field);
    }

    const commonProps = {
      placeholder: field.placeholder,
      disabled: field.disabled,
      style: { width: '100%' },
      // Full anti-autofill kit — see noAutofillProps for why each attribute
      // is needed. Chrome / Edge form history, 1Password, LastPass, Bitwarden,
      // Dashlane, Roboform all read different signals; covering all of them is
      // the only reliable way to stop the dark popovers with prior user input
      // (the "dsds" / "ssc" / "sd" suggestions seen in the screenshots).
      ...noAutofillProps(field.name),
    } as any;

    const fieldErrors = formErrors[field.name] || [];

    let inputComponent;
    switch (field.type) {
      case 'text':
        inputComponent = <Input {...commonProps} />;
        break;
      case 'textarea':
        inputComponent = (
          <div>
            <TextArea 
              {...commonProps} 
              rows={4}
              maxLength={field.maxLength}
              showCount={!!field.maxLength}
              onChange={(e) => {
                setCharCounts(prev => ({ ...prev, [field.name]: e.target.value.length }));
                // Clear error if user starts typing
                if (e.target.value && fieldErrors.length > 0) {
                  // Error will be cleared by form validation
                }
              }}
            />
            {field.maxLength && (
              <div className="text-xs text-gray-400 mt-1">
                {charCounts[field.name] || 0} / {field.maxLength} characters
              </div>
            )}
          </div>
        );
        break;
      case 'number':
        inputComponent = (
          <InputNumber
            {...commonProps}
            style={{ width: '100%' }}
            min={field.min}
            max={field.max}
            // Strip non-numeric characters as user types
            // (allows digits, one leading '-', and one '.' for decimals)
            parser={(value) => {
              if (!value) return '' as any;
              // Keep only digits, minus, dot — then normalize
              const cleaned = String(value).replace(/[^\d.\-]/g, '');
              // Ensure minus only at start, only one dot
              const minus = cleaned.startsWith('-') ? '-' : '';
              const rest = cleaned.replace(/-/g, '');
              const firstDot = rest.indexOf('.');
              const normalized =
                firstDot === -1
                  ? rest
                  : rest.slice(0, firstDot + 1) + rest.slice(firstDot + 1).replace(/\./g, '');
              return (minus + normalized) as any;
            }}
          />
        );
        break;
      case 'select':
        inputComponent = (
          <Select 
            {...commonProps} 
            mode={field.mode}
            showSearch={field.options && field.options.length > 5}
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {field.options?.map((opt: any) => {
              const label = typeof opt === 'string' ? opt : opt.label;
              const value = typeof opt === 'string' ? opt : opt.value;
              return <Select.Option key={value} value={value}>{label}</Select.Option>;
            })}
          </Select>
        );
        break;
      case 'checkbox':
        if (field.options) {
          // Multi-select checkbox group
          inputComponent = (
            <Checkbox.Group>
              <Space direction="vertical" size="small">
                {field.options.map((opt: any) => {
                  const label = typeof opt === 'string' ? opt : opt.label;
                  const value = typeof opt === 'string' ? opt : opt.value;
                  return (
                    <Checkbox key={value} value={value}>
                      {label}
                    </Checkbox>
                  );
                })}
              </Space>
            </Checkbox.Group>
          );
        } else {
          // Single checkbox (acknowledgement)
          inputComponent = (
            <Checkbox>
              {field.placeholder || 'I acknowledge'}
            </Checkbox>
          );
        }
        break;
      case 'radio':
        inputComponent = (
          <Radio.Group disabled={field.disabled}>
            <Space size="large">
              {field.options?.map((opt: any) => {
                const label = typeof opt === 'string' ? opt : opt.label;
                const value = typeof opt === 'string' ? opt : opt.value;
                return (
                  <Radio key={value} value={value} disabled={field.disabled}>
                    {label}
                  </Radio>
                );
              })}
            </Space>
          </Radio.Group>
        );
        break;
      case 'tags':
        // Pill-based multi-input for array of strings
        inputComponent = (
          <TagsInput
            placeholder={field.placeholder || 'Type and press Enter to add'}
            form={form}
            fieldName={field.name}
          />
        );
        break;
      case 'date':
        // Date picker with DD/MM/YYYY format, sends timestamp to backend
        inputComponent = (
          <DatePicker
            {...commonProps}
            format="DD/MM/YYYY"
            className="h-8"
            style={{ width: '100%' }}
          />
        );
        break;
      case 'file': {
        const isMultipleFile = field.multiple === true;

        // Extract filename from file key
        const getFileNameFromKey = (key: string) => {
          if (!key) return '';
          const parts = key.split('/');
          const fileName = parts[parts.length - 1];
          // Remove the prefix (IMG-timestamp-uuid-)
          const match = fileName.match(/^[A-Z]+-\d+-[a-f0-9-]+-(.+)$/);
          return match ? match[1] : fileName;
        };

        // Return a Form.Item with shouldUpdate to ensure re-render on value change
        return (
          <Form.Item
            key={field.name}
            label={
              <div className="flex items-center gap-2">
                <span>{field.label}</span>
              </div>
            }
            required={field.required}
            className="mb-6"
            shouldUpdate={(prevValues, currentValues) => {
              const prevVal = field.name.split('.').reduce((acc, part) => acc && acc[part], prevValues);
              const currVal = field.name.split('.').reduce((acc, part) => acc && acc[part], currentValues);
              return prevVal !== currVal;
            }}
          >
            {() => {
              // Get current file keys inside the render function to ensure fresh values
              const currentFileValue = form.getFieldValue(field.name.split('.'));
              const currentFileKeys: string[] = Array.isArray(currentFileValue)
                ? currentFileValue
                : (currentFileValue ? [currentFileValue] : []);

              const fileUploadProps: UploadProps = {
                customRequest: async (options) => {
                  const { file, onSuccess, onError, onProgress } = options;
                  onProgress?.({ percent: 30 });

                  try {
                    const result = await supplierQuestionnaireService.uploadSupplierFile(file as File);
                    if (result.success && result.key) {
                      onProgress?.({ percent: 100 });
                      onSuccess?.({ url: result.url, key: result.key }, file as any);
                      message.success(`File uploaded successfully`);

                      // Store the file key in form - get fresh value to avoid race conditions
                      const existingKeys = form.getFieldValue(field.name.split('.')) || [];
                      let newValue: string | string[];
                      if (isMultipleFile) {
                        // For multiple files, add to array
                        const keysArray = Array.isArray(existingKeys) ? existingKeys : (existingKeys ? [existingKeys] : []);
                        newValue = [...keysArray, result.key];
                        form.setFieldsValue({
                          [field.name.split('.')[0]]: field.name.split('.').slice(1).reduceRight(
                            (acc, part, idx, arr) => idx === arr.length - 1
                              ? { [part]: newValue }
                              : { [part]: acc },
                            {} as any
                          ) || { [field.name.split('.').slice(-1)[0]]: newValue }
                        });
                        // Simpler approach - just set the value directly
                        form.setFieldValue(field.name.split('.'), newValue);
                      } else {
                        // For single file, replace
                        newValue = result.key;
                        form.setFieldValue(field.name.split('.'), newValue);
                      }

                      // Trigger onValuesChange to save to localStorage
                      if (onValuesChange) {
                        // Get current form values
                        const allValues = form.getFieldsValue();

                        // Manually merge the new file value into allValues
                        // because form.setFieldValue may not have updated synchronously
                        const fieldParts = field.name.split('.');
                        let target = allValues;
                        for (let i = 0; i < fieldParts.length - 1; i++) {
                          if (!target[fieldParts[i]]) {
                            target[fieldParts[i]] = {};
                          }
                          target = target[fieldParts[i]];
                        }
                        target[fieldParts[fieldParts.length - 1]] = newValue;

                        // Build the changed value object with proper nesting
                        const changedValues = fieldParts.reduceRight(
                          (acc, part, idx, arr) => idx === arr.length - 1
                            ? { [part]: newValue }
                            : { [part]: acc },
                          {} as any
                        );
                        onValuesChange(changedValues, allValues);
                      }
                    } else {
                      onError?.(new Error(result.message || 'Upload failed'));
                      message.error(result.message || 'Upload failed');
                    }
                  } catch (error: any) {
                    onError?.(error);
                    message.error('Upload failed');
                  }
                },
                maxCount: isMultipleFile ? undefined : 1,
                multiple: isMultipleFile,
                accept: '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg',
                showUploadList: false,
              };

              // Remove a file from the array
              const handleRemoveFile = (keyToRemove: string) => {
                let newValue: string[] | undefined;
                if (isMultipleFile) {
                  const freshKeys = form.getFieldValue(field.name.split('.')) || [];
                  const keysArray = Array.isArray(freshKeys) ? freshKeys : (freshKeys ? [freshKeys] : []);
                  const updatedKeys = keysArray.filter((k: string) => k !== keyToRemove);
                  newValue = updatedKeys.length > 0 ? updatedKeys : undefined;
                  form.setFieldValue(field.name.split('.'), newValue);
                } else {
                  newValue = undefined;
                  form.setFieldValue(field.name.split('.'), newValue);
                }

                // Trigger onValuesChange to save to localStorage
                if (onValuesChange) {
                  // Get current form values
                  const allValues = form.getFieldsValue();

                  // Manually merge the removed file value into allValues
                  // because form.setFieldValue may not have updated synchronously
                  const fieldParts = field.name.split('.');
                  let target = allValues;
                  for (let i = 0; i < fieldParts.length - 1; i++) {
                    if (!target[fieldParts[i]]) {
                      target[fieldParts[i]] = {};
                    }
                    target = target[fieldParts[i]];
                  }
                  target[fieldParts[fieldParts.length - 1]] = newValue;

                  const changedValues = fieldParts.reduceRight(
                    (acc, part, idx, arr) => idx === arr.length - 1
                      ? { [part]: newValue }
                      : { [part]: acc },
                    {} as any
                  );
                  onValuesChange(changedValues, allValues);
                }
              };

              return (
                <div>
                  {currentFileKeys.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {currentFileKeys.map((fileKey, index) => (
                        <div key={fileKey || index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                          <FileOutlined className="text-green-600" />
                          <span className="flex-1 text-sm text-gray-700 truncate" title={getFileNameFromKey(fileKey)}>
                            {getFileNameFromKey(fileKey)}
                          </span>
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveFile(fileKey)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <Upload {...fileUploadProps}>
                    <Button icon={<UploadOutlined />} className="hover:border-green-400 hover:text-green-600">
                      {currentFileKeys.length > 0
                        ? (isMultipleFile ? 'Add More Files' : 'Replace File')
                        : 'Click to Upload'}
                    </Button>
                  </Upload>
                  {field.placeholder && (
                    <div className="text-xs text-gray-500 mt-2">{field.placeholder}</div>
                  )}
                  {isMultipleFile && (
                    <div className="text-xs text-gray-400 mt-1">You can upload multiple files</div>
                  )}
                </div>
              );
            }}
          </Form.Item>
        );
      }
      default:
        inputComponent = <Input {...commonProps} />;
    }

    // For single checkbox (without options), use valuePropName="checked"
    const isSingleCheckbox = field.type === 'checkbox' && !field.options;

    // For date fields, convert string values to dayjs objects
    const getDateValueProps = field.type === 'date' ? {
      getValueProps: (value: any) => ({
        value: value ? (typeof value === 'string' || typeof value === 'number' ? dayjs(value) : value) : undefined,
      }),
    } : {};

    return (
      <Form.Item
        key={field.name}
        name={field.name.split('.')}
        valuePropName={isSingleCheckbox ? "checked" : undefined}
        {...getDateValueProps}
        label={
          <div className="flex items-center gap-2">
            <span>{field.label}</span>
            {field.placeholder && field.type !== 'checkbox' && (
              <Tooltip title={field.placeholder}>
                <QuestionCircleOutlined className="text-gray-400 text-xs" />
              </Tooltip>
            )}
          </div>
        }
        rules={[
          { 
            required: field.required, 
            message: field.required 
              ? (() => {
                  const questionNumber = field.label?.match(/^\d+\./)?.[0] || '';
                  if (isSingleCheckbox) {
                    return questionNumber 
                      ? `Please check this box to acknowledge ${questionNumber.slice(0, -1)}`
                      : `This field is required. Please check the box to continue.`;
                  }
                  if (questionNumber) {
                    return `Please answer ${questionNumber.slice(0, -1)}. This field is required.`;
                  }
                  return `This field is required. Please provide a value.`;
                })()
              : undefined
          },
          // Email validation
          ...(field.name.toLowerCase().includes('email') || field.label?.toLowerCase().includes('e-mail') || field.label?.toLowerCase().includes('email') ? [{
            type: 'email' as const,
            message: 'Please enter a valid email address (e.g., name@example.com)'
          }] : []),
          // Number validation
          ...(field.type === 'number' && field.min !== undefined ? [{
            type: 'number' as const,
            min: field.min,
            message: `Please enter a value of at least ${field.min}`
          }] : []),
          ...(field.type === 'number' && field.max !== undefined ? [{
            type: 'number' as const,
            max: field.max,
            message: `Please enter a value that does not exceed ${field.max}`
          }] : []),
          // Text length validation
          ...(field.type === 'text' && field.maxLength ? [{
            max: field.maxLength,
            message: `Please limit your response to ${field.maxLength} characters or less`
          }] : [])
        ].filter(Boolean)}
        className={`mb-2 transition-all duration-200 ${fieldErrors.length > 0 ? 'animate-pulse' : ''}`}
        validateStatus={fieldErrors.length > 0 ? 'error' : undefined}
        help={fieldErrors.length > 0 ? fieldErrors[0] : undefined}
      >
        {inputComponent}
      </Form.Item>
    );
  };

  const renderTableField = (field: QuestionnaireField) => {
    return (
      <div
        key={field.name}
        className="mb-3 border rounded-lg bg-gray-50 transition-all duration-200 border-gray-200"
      >
        <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900">{field.label}</h4>
              {field.required && <span className="text-red-500">*</span>}
            </div>
            {field.placeholder && (
              <Tooltip title={field.placeholder}>
                <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
              </Tooltip>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => {
              // Watch for changes in tables with dependent dropdowns
              const fieldPath = field.name.split('.');
              const getNestedValue = (obj: any, path: string[]) => {
                return path.reduce((acc, key) => acc?.[key], obj);
              };
              const prevList = getNestedValue(prevValues, fieldPath) || [];
              const currList = getNestedValue(currentValues, fieldPath) || [];

              if (prevList.length !== currList.length) return true;

              // For transport_modes table, re-render when destination, source, or mpn changes
              // so that the chain validation (auto-fill source from previous drop point) stays in sync
              const isTransportTable = field.name.includes('transport_modes');
              if (isTransportTable) {
                return prevList.some((prevRow: any, index: number) => {
                  const currRow = currList[index];
                  return prevRow?.destination !== currRow?.destination ||
                         prevRow?.source !== currRow?.source ||
                         prevRow?.distance !== currRow?.distance ||
                         prevRow?.mode !== currRow?.mode ||
                         prevRow?.mpn !== currRow?.mpn;
                });
              }

              // Check if any dependent field values changed
              const hasDependentColumns = field.columns?.some(c => c.dependsOnField);
              if (hasDependentColumns) {
                return prevList.some((prevRow: any, index: number) => {
                  const currRow = currList[index];
                  return field.columns?.some(col => {
                    if (col.dependsOnField) {
                      return prevRow?.[col.dependsOnField] !== currRow?.[col.dependsOnField];
                    }
                    return false;
                  });
                });
              }
              return false;
            }}
          >
            {() => (
          <Form.List
            name={field.name.split('.')}
            rules={field.required ? [
              {
                validator: async (_, value) => {
                  if (!value || value.length === 0) {
                    const questionNumber = field.label?.match(/^\d+\./)?.[0] || '';
                    return Promise.reject(
                      new Error(
                        questionNumber
                          ? `Please add at least one entry to ${questionNumber.slice(0, -1)}. This table is required.`
                          : 'Please add at least one entry to this table. This field is required.'
                      )
                    );
                  }
                  return Promise.resolve();
                }
              }
            ] : undefined}
          >
            {(fields, { add, remove }, { errors }) => {
              const fieldColumns = Array.isArray(field.columns) ? field.columns : [];
              // One column per table absorbs any leftover row width so the
              // table fills the container with no awkward whitespace after
              // Action. Prefer a text input (it grows naturally), otherwise
              // fall back to the last data column.
              const firstTextColIdx = fieldColumns.findIndex((c) => c.type === 'text');
              const flexColIdx = firstTextColIdx >= 0 ? firstTextColIdx : fieldColumns.length - 1;
              const columns = [
                ...(fieldColumns.map((col, colIndex) => {
                  const isFlexCol = colIndex === flexColIdx;
                  // Check if this column has a dependent dropdown
                  const hasDependentDropdown = col.apiDropdown && col.dependsOnField;

                  // Check if this column's value is depended on by another column
                  const isDependedOn = fieldColumns.some(c => c.dependsOnField === col.name);

                  // Determine display label for client mode
                  let displayLabel = col.label;
                  if (isClientMode) {
                    if (col.name === 'mpn') {
                      displayLabel = 'Product Code';
                    } else if (col.name === 'component_name') {
                      displayLabel = 'Product Name';
                    }
                  }

                  return {
                    title: (
                      <div style={{ minWidth: 80, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.3' }}>
                        <span className="leading-tight">
                          {displayLabel}
                          {col.required && <span className="text-red-500 ml-0.5">*</span>}
                        </span>
                        {col.apiDropdown && dropdownLoading[col.apiDropdown] && (
                          <LoadingOutlined className="text-blue-500 text-xs ml-1" />
                        )}
                      </div>
                    ),
                    dataIndex: col.name,
                    key: col.name,
                    // The flex column has no declared width — with
                    // tableLayout="fixed" CSS gives all leftover row width to
                    // columns without an explicit width, so this column
                    // absorbs the gap that used to sit after Action.
                    ...(isFlexCol ? {} : {
                      width: (() => {
                        // ReadOnly columns (MPN / Component Name auto-populated from BOM)
                        // need enough room for the longest display value. Component-name
                        // strings like "Brake Caliper Housing" need ~200px.
                        if (col.readOnly) {
                          if (col.name === 'product_id' || col.name === 'mpn' || col.name === 'mpn_code') return 160;
                          return 220;
                        }
                        // BOM MPN dropdown shows "MPN - Component Name" — needs ~240px.
                        if (col.apiDropdown === 'bomMaterials') return 240;
                        // Static-option selects: pick a width based on the
                        // longest option label so short lists like
                        // India/Europe/Global don't get a fat default 160 cell.
                        if (col.type === 'select' && Array.isArray(col.options) && col.options.length) {
                          const longest = col.options.reduce((max: number, opt: any) => {
                            const label = typeof opt === 'string' ? opt : (opt?.label ?? '');
                            return Math.max(max, String(label).length);
                          }, 0);
                          // ~9px per char + 50px for padding + arrow + caret.
                          // Floor at 100, cap at 200.
                          return Math.min(200, Math.max(100, longest * 9 + 50));
                        }
                        if (col.type === 'number') return 130;
                        if (col.type === 'select') return 160;
                        return 150;
                      })(),
                    }),
                    render: (_: any, fieldRecord: any) => {
                      const fieldPath = field.name.split('.');

                      // ReadOnly columns (Q8 MPN/Component Name auto-populated
                      // from the BOM, Q9.1/Q14 Component Name auto-filled when
                      // the MPN dropdown picks a row). Use a regular named
                      // Form.Item with a disabled <Input>: same visual style as
                      // other inputs in the row (white box, same border, same
                      // height), and Form.Item handles the value subscription
                      // so setFieldValue from the MPN dropdown propagates here
                      // automatically — no shouldUpdate / hidden hack needed.
                      if (col.readOnly) {
                        return (
                          <ReadOnlyTableCell
                            form={form}
                            // Relative path inside Form.List context — required
                            // so Form.Item registers the field at the correct
                            // nested location.
                            namePath={[fieldRecord.name, col.name]}
                            // Absolute path from form root — used by useWatch
                            // to subscribe to the exact store cell.
                            watchPath={[...fieldPath, fieldRecord.name, col.name]}
                            placeholder={col.placeholder}
                          />
                        );
                      }

                      // Handle Emission Factors cascade dropdown (Layer 1..4 sourced from
                      // the categorized EF API, keyed by col.efSource). Each layer is
                      // filtered by the earlier layers selected on the same row;
                      // changing an earlier layer clears all deeper ones.
                      if (col.efSource && col.efLayer) {
                        // distanceTick reference forces this render to re-evaluate
                        // after onChange writes to form (Form.List doesn't always
                        // re-render the dependent cells on its own).
                        void distanceTick;
                        const layerKeys: ("layer1" | "layer2" | "layer3" | "layer4")[] = [
                          "layer1",
                          "layer2",
                          "layer3",
                          "layer4",
                        ];
                        const myLayerKey = layerKeys[col.efLayer - 1];

                        const allRows: EmissionFactorRow[] = efRowsByGroup[col.efSource] || [];
                        const isLoading = !efLoadedGroups.has(col.efSource);

                        const rowValues = form.getFieldValue([...fieldPath, fieldRecord.name]) || {};
                        // Filter EF rows by all earlier layer selections in this row
                        const filtered = allRows.filter((r) => {
                          for (let i = 0; i < col.efLayer! - 1; i++) {
                            const k = layerKeys[i];
                            const selected = rowValues[k];
                            if (selected && r[k] !== selected) return false;
                          }
                          return true;
                        });

                        // Unique non-empty Layer values from filtered set
                        const seen = new Set<string>();
                        const options: string[] = [];
                        for (const r of filtered) {
                          const v = r[myLayerKey];
                          if (v && !seen.has(v)) {
                            seen.add(v);
                            options.push(v);
                          }
                        }
                        options.sort((a, b) => a.localeCompare(b));

                        // Parent is the previous layer (if any). Layer 1 has no parent.
                        const parentLayerKey = col.efLayer > 1 ? layerKeys[col.efLayer - 2] : null;
                        const parentValue = parentLayerKey ? rowValues[parentLayerKey] : "ready";
                        const hasNoData = !isLoading && allRows.length === 0;
                        const efSourceLabel = String(col.efSource).charAt(0).toUpperCase() + String(col.efSource).slice(1);

                        let placeholder = col.placeholder || `Select Layer ${col.efLayer}`;
                        if (isLoading) {
                          placeholder = "Loading…";
                        } else if (hasNoData) {
                          placeholder = `No ${efSourceLabel} EF data — import on the EF page`;
                        } else if (!parentValue) {
                          placeholder = `Select Layer ${col.efLayer - 1} first`;
                        }

                        return (
                          <Form.Item
                            name={[fieldRecord.name, col.name]}
                            rules={[
                              {
                                required: col.required,
                                message: col.required
                                  ? `Please fill in "${col.label}" for this row. This field is required.`
                                  : undefined,
                              },
                            ].filter(Boolean)}
                            className="mb-0"
                          >
                            <Select
                              placeholder={placeholder}
                              style={{ minWidth: 140, width: '100%' }}
                              disabled={isLoading || hasNoData || !parentValue}
                              loading={isLoading}
                              allowClear
                              showSearch={options.length > 5}
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                              onChange={() => {
                                // Cascade rule: changing a layer invalidates every
                                // deeper layer in this row. We replace the WHOLE
                                // Form.List array (not just the touched fields)
                                // because Ant Design's setFieldValue / setFields
                                // doesn't always propagate cleared values to nested
                                // Form.Item children inside Form.List. Defer with
                                // setTimeout(0) so the Select's own value commits
                                // first, then we wipe deeper layers in the next tick.
                                setTimeout(() => {
                                  const idx = fieldRecord.name as number;
                                  const items: any[] = form.getFieldValue(fieldPath) || [];
                                  if (!items[idx]) return;
                                  const updatedItem = { ...items[idx] };
                                  for (let i = col.efLayer!; i < layerKeys.length; i++) {
                                    updatedItem[layerKeys[i]] = undefined;
                                  }
                                  // ef_code becomes stale when any layer changes.
                                  updatedItem.ef_code = undefined;
                                  const newItems = [...items];
                                  newItems[idx] = updatedItem;
                                  form.setFieldValue(fieldPath, newItems);
                                  setDistanceTick((t) => t + 1);
                                }, 0);
                              }}
                            >
                              {options.map((v) => (
                                <Select.Option key={v} value={v}>{v}</Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        );
                      }

                      // Handle dependent dropdown (e.g., sub_fuel_type depends on fuel_type)
                      if (hasDependentDropdown) {
                        const rowValues = form.getFieldValue([...fieldPath, fieldRecord.name]);
                        const parentValue = rowValues?.[col.dependsOnField!]; // Parent name value (for display check)
                        let parentId = rowValues?.[`${col.dependsOnField!}_id`]; // Parent ID (for API lookup)
                        const currentValue = rowValues?.[col.name];

                        // If parentId is missing but parentValue exists, look up the ID from parent dropdown options
                        if (!parentId && parentValue) {
                          // Determine parent dropdown type based on the dependent dropdown type
                          let parentDropdownType: ApiDropdownType | null = null;
                          if (col.apiDropdown === 'subFuelTypeByFuel') {
                            parentDropdownType = 'fuelType';
                          } else if (col.apiDropdown === 'energyTypeBySource') {
                            parentDropdownType = 'energySource';
                          }

                          if (parentDropdownType) {
                            const parentOptions = getDropdownItems(parentDropdownType);
                            // Try to find by name first, then by ID (in case parentValue is actually an ID)
                            const parentOpt = parentOptions.find(opt => opt.name === parentValue) ||
                                              parentOptions.find(opt => opt.id === parentValue);
                            if (parentOpt) {
                              parentId = parentOpt.id;
                              // Trigger fetch of dependent options if not already cached
                              if (col.apiDropdown === 'subFuelTypeByFuel' && !subFuelTypesByFuel[parentId]) {
                                fetchDependentDropdown('subFuelTypeByFuel', parentId);
                              } else if (col.apiDropdown === 'energyTypeBySource' && !energyTypesBySource[parentId]) {
                                fetchDependentDropdown('energyTypeBySource', parentId);
                              }
                            }
                          }
                        }

                        // Get cached dependent options using parent ID (fetched when parent was selected)
                        const dependentOptions = getDropdownItems(col.apiDropdown!, col.dependsOnField, parentId);
                        const isLoadingDependent = parentId ? dropdownLoading[`${col.apiDropdown}_${parentId}`] : false;

                        // Check if current value exists in options by name, if not clear it
                        const isValueValid = !currentValue || dependentOptions.some(opt => opt.name === currentValue);
                        if (!isValueValid && currentValue) {
                          // Clear invalid value asynchronously to avoid render issues
                          setTimeout(() => {
                            form.setFieldValue([...fieldPath, fieldRecord.name, col.name], null);
                            form.setFieldValue([...fieldPath, fieldRecord.name, `${col.name}_id`], null);
                          }, 0);
                        }

                        return (
                          <Form.Item
                            name={[fieldRecord.name, col.name]}
                            rules={[
                              {
                                required: col.required,
                                message: col.required
                                  ? `Please fill in "${col.label}" for this row. This field is required.`
                                  : undefined
                              }
                            ].filter(Boolean)}
                            className="mb-0"
                          >
                            <Select
                              placeholder={parentValue ? col.placeholder : `Select ${col.dependsOnField?.replace('_', ' ')} first`}
                              style={{ minWidth: 120, width: '100%' }}
                              mode={col.mode}
                              disabled={!parentValue}
                              loading={isLoadingDependent}
                              allowClear
                              showSearch={dependentOptions.length > 5}
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                              onChange={(value) => {
                                // Find selected option by name and store the ID separately
                                const selectedOption = dependentOptions.find((opt: DropdownItem) => opt.name === value);
                                if (selectedOption) {
                                  form.setFieldValue([...fieldPath, fieldRecord.name, `${col.name}_id`], selectedOption.id);
                                } else {
                                  form.setFieldValue([...fieldPath, fieldRecord.name, `${col.name}_id`], null);
                                }
                              }}
                            >
                              {dependentOptions.map((opt: DropdownItem) => (
                                <Select.Option key={opt.id} value={opt.name}>{opt.name}</Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        );
                      }

                      // Handle API dropdown that other columns depend on (parent dropdown)
                      if (col.apiDropdown && isDependedOn) {
                        const apiOptions = getDropdownItems(col.apiDropdown);
                        const isLoadingApi = dropdownLoading[col.apiDropdown];

                        // Find dependent column to clear its value when this changes
                        const dependentCol = fieldColumns.find(c => c.dependsOnField === col.name);

                        return (
                          <Form.Item
                            name={[fieldRecord.name, col.name]}
                            rules={[
                              {
                                required: col.required,
                                message: col.required
                                  ? `Please fill in "${col.label}" for this row. This field is required.`
                                  : undefined
                              }
                            ].filter(Boolean)}
                            className="mb-0"
                          >
                            <Select
                              placeholder={col.placeholder}
                              style={{ minWidth: 120, width: '100%' }}
                              mode={col.mode}
                              loading={isLoadingApi}
                              showSearch={apiOptions.length > 5}
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                              onChange={(value) => {
                                // Find the selected option by name (since value is now name)
                                const selectedOption = apiOptions.find((opt: DropdownItem) => opt.name === value);
                                // Store the ID separately for fetching dependent options
                                if (selectedOption) {
                                  form.setFieldValue([...fieldPath, fieldRecord.name, `${col.name}_id`], selectedOption.id);
                                } else {
                                  form.setFieldValue([...fieldPath, fieldRecord.name, `${col.name}_id`], null);
                                }

                                // Clear dependent column value when parent changes
                                if (dependentCol) {
                                  const dependentFieldPath = [...fieldPath, fieldRecord.name, dependentCol.name];
                                  form.setFieldValue(dependentFieldPath, null);
                                  form.setFieldValue([...fieldPath, fieldRecord.name, `${dependentCol.name}_id`], null);
                                  // Force form to recognize the change
                                  form.setFields([{ name: dependentFieldPath, value: null, errors: [] }]);
                                }
                                // Trigger fetch of dependent options using the ID
                                if (dependentCol?.apiDropdown === 'subFuelTypeByFuel' && selectedOption) {
                                  fetchDependentDropdown('subFuelTypeByFuel', selectedOption.id);
                                } else if (dependentCol?.apiDropdown === 'energyTypeBySource' && selectedOption) {
                                  fetchDependentDropdown('energyTypeBySource', selectedOption.id);
                                }
                              }}
                            >
                              {apiOptions.map((opt: DropdownItem) => (
                                <Select.Option key={opt.id} value={opt.name}>{opt.name}</Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        );
                      }

                      // Handle BOM Materials dropdown — sourced from the
                      // immutable client-uploaded BOM, NOT from
                      // products_manufactured. This way deletes/re-adds in
                      // the form never wipe the available options.
                      if (col.apiDropdown === 'bomMaterials') {
                        const bomMaterialOptions: DropdownItem[] = (bomComponents || [])
                          .map((item) => ({
                            id: item.material_number || '',
                            name: `${item.material_number || ''} — ${item.component_name || ''}`,
                            bom_id: item.bom_id || '',
                            product_name: item.component_name || '',
                          }))
                          .filter((opt: DropdownItem) => opt.id);

                        return (
                          <>
                            {/* Persist bom_id and material_number in form state so
                                getFieldsValue() always returns them and deepMerge never drops them.
                                IMPORTANT: do NOT register hidden Form.Items here for
                                component_name / product_name — the readOnly Component Name
                                column (rendered in another cell) already owns those name paths.
                                Duplicate Form.Items on the same path collide and break
                                setFieldValue propagation, leaving Component Name blank. */}
                            <Form.Item name={[fieldRecord.name, 'bom_id']} hidden>
                              <Input type="hidden" />
                            </Form.Item>
                            <Form.Item name={[fieldRecord.name, 'material_number']} hidden>
                              <Input type="hidden" />
                            </Form.Item>
                          <Form.Item
                            name={[fieldRecord.name, col.name]}
                            rules={[
                              {
                                required: col.required,
                                message: col.required
                                  ? `Please fill in "${col.label}" for this row. This field is required.`
                                  : undefined
                              }
                            ].filter(Boolean)}
                            className="mb-0"
                          >
                            <Select
                              placeholder={col.placeholder}
                              style={{ minWidth: 150, width: '100%' }}
                              showSearch
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                              onChange={(value) => {
                                // BRUTE-FORCE FIX: setFields and setFieldValue
                                // with deep paths (e.g. ['a','b',0,'component_name'])
                                // were NOT propagating to the readOnly Component
                                // Name cell inside Antd Table's render-prop tree.
                                // The reliable way: read the WHOLE Form.List array,
                                // mutate the target row in plain JS, and write the
                                // whole array back via setFieldValue at the Form.List's
                                // shallow path. That forces Form.List to re-render
                                // every row from scratch, so the readOnly cell
                                // picks up the new component_name guaranteed.
                                const selectedItem = bomMaterialOptions.find((opt: any) => opt.id === value);
                                const currentArr = form.getFieldValue(fieldPath);
                                const arr: any[] = Array.isArray(currentArr) ? [...currentArr] : [];
                                const idx = fieldRecord.name as number;
                                const prevRow = arr[idx] || {};
                                if (selectedItem) {
                                  arr[idx] = {
                                    ...prevRow,
                                    [col.name]: value,
                                    bom_id: selectedItem.bom_id || undefined,
                                    material_number: selectedItem.id,
                                    component_name: selectedItem.product_name,
                                    product_name: selectedItem.product_name,
                                  };
                                } else {
                                  arr[idx] = {
                                    ...prevRow,
                                    [col.name]: undefined,
                                    bom_id: undefined,
                                    material_number: undefined,
                                    component_name: undefined,
                                    product_name: undefined,
                                  };
                                }
                                // Transport table: changing MPN clears the leg's
                                // source/destination/distance so the row starts
                                // fresh for the new component.
                                if (field.name.includes('transport_modes')) {
                                  arr[idx] = {
                                    ...arr[idx],
                                    source: undefined,
                                    source_lat: undefined,
                                    source_lng: undefined,
                                    destination: undefined,
                                    destination_lat: undefined,
                                    destination_lng: undefined,
                                    distance: undefined,
                                  };
                                }
                                form.setFieldValue(fieldPath, arr);
                                // Also bump the tick so any cells using module-level
                                // state (transport distance) re-render too.
                                setDistanceTick((t) => t + 1);
                              }}
                            >
                              {bomMaterialOptions.map((opt: any) => (
                                <Select.Option key={opt.id} value={opt.id}>{opt.name}</Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                          </>
                        );
                      }

                      // Handle simple API dropdown (no dependencies)
                      if (col.apiDropdown && !hasDependentDropdown && !isDependedOn) {
                        const apiOptions = getDropdownItems(col.apiDropdown);
                        const isLoadingApi = dropdownLoading[col.apiDropdown];

                        // Get current value - might be ID (from localStorage/API) or name
                        const rowValues = form.getFieldValue([...fieldPath, fieldRecord.name]) || {};
                        const currentValue = rowValues[col.name];

                        // Check if currentValue is an ID (not found in names but found in IDs)
                        // If so, we need to display both ID and name options so the Select can match
                        const isValueAnId = currentValue && apiOptions.length > 0 &&
                                            !apiOptions.some(opt => opt.name === currentValue) &&
                                            apiOptions.some(opt => opt.id === currentValue);

                        // Check if this is the transport mode dropdown in transport_modes table
                        const isTransportModeDropdown = field.name.includes('transport_modes') && col.apiDropdown === 'transportMode';

                        return (
                          <Form.Item
                            name={[fieldRecord.name, col.name]}
                            rules={[
                              {
                                required: col.required,
                                message: col.required
                                  ? `Please fill in "${col.label}" for this row. This field is required.`
                                  : undefined
                              }
                            ].filter(Boolean)}
                            className="mb-0"
                          >
                            <Select
                              placeholder={col.placeholder}
                              style={{ minWidth: 120, width: '100%' }}
                              mode={col.mode}
                              loading={isLoadingApi}
                              showSearch={apiOptions.length > 5}
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                              onChange={isTransportModeDropdown ? (selectedMode: string) => {
                                // Recalculate distance from _transportCoords (reliable, no form state issues)
                                const c = _transportCoords[String(fieldRecord.name)];
                                if (c?.sLat != null && c?.sLng != null && c?.dLat != null && c?.dLng != null) {
                                  setTransportDistance(fieldPath, fieldRecord.name, c.sLat, c.sLng, c.dLat, c.dLng, selectedMode);
                                }
                              } : undefined}
                            >
                              {apiOptions.map((opt: DropdownItem) => (
                                <Select.Option key={opt.id} value={opt.name}>{opt.name}</Select.Option>
                              ))}
                              {/* If current value is an ID, add a hidden option to display it correctly */}
                              {isValueAnId && (() => {
                                const matchedOpt = apiOptions.find(opt => opt.id === currentValue);
                                return matchedOpt ? (
                                  <Select.Option key={`id-${matchedOpt.id}`} value={currentValue} style={{ display: 'none' }}>
                                    {matchedOpt.name}
                                  </Select.Option>
                                ) : null;
                              })()}
                            </Select>
                          </Form.Item>
                        );
                      }

                      // Default rendering for columns without API dropdown
                      // For date columns, add getValueProps to convert string values to dayjs objects
                      const dateValueProps = col.type === 'date' ? {
                        getValueProps: (value: any) => ({
                          value: value ? (typeof value === 'string' || typeof value === 'number' ? dayjs(value) : value) : undefined,
                        }),
                      } : {};

                      // === Q74 Transport Chain + Location Autocomplete + Auto Distance ===
                      // Uses module-level _transportCoords map (not form state) for reliable coord tracking
                      const isTransportTable = field.name.includes('transport_modes');
                      const isSourceCol = col.name === 'source';
                      const isDestinationCol = col.name === 'destination';
                      const isDistanceCol = col.name === 'distance';

                      if (isTransportTable && isDistanceCol) {
                        // Read distance from _transportCoords first, fall back to form value (for restored drafts)
                        let storedDist = _transportCoords[String(fieldRecord.name)]?.distance;
                        if (storedDist == null) {
                          // Restore from form/draft data so distance shows after refresh
                          const formSavedDist = form.getFieldValue([...fieldPath, fieldRecord.name, 'distance']);
                          if (formSavedDist != null && formSavedDist !== 0) {
                            storedDist = formSavedDist;
                            _transportCoords[String(fieldRecord.name)] = { ..._transportCoords[String(fieldRecord.name)], distance: formSavedDist };
                          }
                        }
                        // Sync to form for saving (write on every render so form always has latest)
                        if (storedDist != null) {
                          const formDist = form.getFieldValue([...fieldPath, fieldRecord.name, 'distance']);
                          if (formDist !== storedDist) {
                            setTimeout(() => form.setFieldValue([...fieldPath, fieldRecord.name, 'distance'], storedDist), 0);
                          }
                        }
                        return (
                          <>
                            <Form.Item name={[fieldRecord.name, 'source_lat']} hidden><Input type="hidden" /></Form.Item>
                            <Form.Item name={[fieldRecord.name, 'source_lng']} hidden><Input type="hidden" /></Form.Item>
                            <Form.Item name={[fieldRecord.name, 'destination_lat']} hidden><Input type="hidden" /></Form.Item>
                            <Form.Item name={[fieldRecord.name, 'destination_lng']} hidden><Input type="hidden" /></Form.Item>
                            <Form.Item name={[fieldRecord.name, col.name]} hidden><Input type="hidden" /></Form.Item>
                            <Form.Item className="mb-0">
                              <InputNumber
                                value={storedDist ?? undefined}
                                placeholder="Auto-calculated"
                                style={{ width: '100%' }}
                                disabled
                                className="bg-gray-50"
                              />
                            </Form.Item>
                          </>
                        );
                      }

                      if (isTransportTable && (isSourceCol || isDestinationCol)) {
                        const allRows = form.getFieldValue(fieldPath) || [];
                        const ri = fieldRecord.name; // row index
                        const currentRow = allRows[ri] || {};
                        const currentMpn = currentRow.mpn || currentRow.material_number || '';
                        const key = String(ri);

                        // Find prev row with same MPN for chaining
                        let prevRow: any = null;
                        let prevKey = '';
                        if (currentMpn) {
                          for (let i = ri - 1; i >= 0; i--) {
                            const r = allRows[i];
                            if (r && (r.mpn || r.material_number || '') === currentMpn) {
                              prevRow = r;
                              prevKey = String(i);
                              break;
                            }
                          }
                        }
                        const isChainedRow = prevRow !== null;
                        const chainedSource = prevRow?.destination || '';

                        if (isSourceCol) {
                          // Auto-fill chained source + store coords in _transportCoords
                          if (isChainedRow && chainedSource) {
                            const prevCoords = _transportCoords[prevKey];
                            if (prevCoords?.dLat != null && prevCoords?.dLng != null) {
                              _transportCoords[key] = { ..._transportCoords[key], sLat: prevCoords.dLat, sLng: prevCoords.dLng };
                            }
                            const cur = form.getFieldValue([...fieldPath, ri, 'source']);
                            if (cur !== chainedSource) {
                              setTimeout(() => {
                                form.setFieldValue([...fieldPath, ri, 'source'], chainedSource);
                                if (prevCoords?.dLat != null) {
                                  form.setFieldValue([...fieldPath, ri, 'source_lat'], prevCoords.dLat);
                                  form.setFieldValue([...fieldPath, ri, 'source_lng'], prevCoords.dLng);
                                }
                              }, 0);
                            }
                            return (
                              <Form.Item name={[fieldRecord.name, col.name]}
                                rules={[{ required: col.required, message: 'Source auto-filled from previous drop point' }].filter(Boolean)}
                                className="mb-0">
                                <Input placeholder={chainedSource || 'Set drop point in previous row first'} disabled className="bg-blue-50" />
                              </Form.Item>
                            );
                          }

                          // Free source (first row for this MPN)
                          return (
                            <Form.Item name={[fieldRecord.name, col.name]}
                              rules={[{ required: col.required, message: `Please select "${col.label}"` }].filter(Boolean)}
                              className="mb-0">
                              <LocationAutocomplete
                                placeholder={col.placeholder || 'Search source location...'}
                                onLocationSelect={(loc: LocationValue) => {
                                  form.setFieldValue([...fieldPath, ri, 'source'], loc.name);
                                  form.setFieldValue([...fieldPath, ri, 'source_lat'], loc.lat);
                                  form.setFieldValue([...fieldPath, ri, 'source_lng'], loc.lng);
                                  _transportCoords[key] = { ..._transportCoords[key], sLat: loc.lat, sLng: loc.lng };
                                  // Calculate distance if destination already set
                                  const dc = _transportCoords[key];
                                  if (dc?.dLat != null && dc?.dLng != null) {
                                    setTransportDistance(fieldPath, ri, loc.lat, loc.lng, dc.dLat, dc.dLng);
                                  }
                                }}
                              />
                            </Form.Item>
                          );
                        }

                        if (isDestinationCol) {
                          return (
                            <Form.Item name={[fieldRecord.name, col.name]}
                              rules={[{ required: col.required, message: `Please select "${col.label}"` }].filter(Boolean)}
                              className="mb-0">
                              <LocationAutocomplete
                                placeholder={col.placeholder || 'Search drop location...'}
                                onLocationSelect={(loc: LocationValue) => {
                                  form.setFieldValue([...fieldPath, ri, 'destination'], loc.name);
                                  form.setFieldValue([...fieldPath, ri, 'destination_lat'], loc.lat);
                                  form.setFieldValue([...fieldPath, ri, 'destination_lng'], loc.lng);
                                  _transportCoords[key] = { ..._transportCoords[key], dLat: loc.lat, dLng: loc.lng };

                                  // Get source coords from _transportCoords (reliable)
                                  let sLat = _transportCoords[key]?.sLat;
                                  let sLng = _transportCoords[key]?.sLng;

                                  // Chained row fallback: read from prev row's destination in _transportCoords
                                  if (sLat == null || sLng == null) {
                                    if (prevKey && _transportCoords[prevKey]) {
                                      sLat = _transportCoords[prevKey].dLat;
                                      sLng = _transportCoords[prevKey].dLng;
                                      if (sLat != null && sLng != null) {
                                        _transportCoords[key] = { ..._transportCoords[key], sLat, sLng };
                                      }
                                    }
                                  }

                                  // INSTANT distance calculation
                                  if (sLat != null && sLng != null) {
                                    setTransportDistance(fieldPath, ri, sLat, sLng, loc.lat, loc.lng);
                                  }

                                  // Chain: auto-fill next same-MPN row
                                  if (currentMpn) {
                                    const rows = form.getFieldValue(fieldPath) || [];
                                    for (let i = ri + 1; i < rows.length; i++) {
                                      const nr = rows[i];
                                      if (nr && (nr.mpn || nr.material_number || '') === currentMpn) {
                                        form.setFieldValue([...fieldPath, i, 'source'], loc.name);
                                        form.setFieldValue([...fieldPath, i, 'source_lat'], loc.lat);
                                        form.setFieldValue([...fieldPath, i, 'source_lng'], loc.lng);
                                        _transportCoords[String(i)] = { ..._transportCoords[String(i)], sLat: loc.lat, sLng: loc.lng };
                                        break;
                                      }
                                    }
                                  }
                                }}
                              />
                            </Form.Item>
                          );
                        }
                      }
                      // === End Q74 Transport Chain ===

                      return (
                        <Form.Item
                          name={[fieldRecord.name, col.name]}
                          rules={[
                            {
                              required: col.required,
                              message: col.required
                                ? `Please fill in "${col.label}" for this row. This field is required.`
                                : undefined
                            },
                            ...(col.type === 'number' && col.min !== undefined ? [{
                              type: 'number' as const,
                              min: col.min,
                              message: `${col.label} must be at least ${col.min}`
                            }] : []),
                            ...(col.type === 'number' && col.max !== undefined ? [{
                              type: 'number' as const,
                              max: col.max,
                              message: `${col.label} must not exceed ${col.max}`
                            }] : [])
                          ].filter(Boolean)}
                          className="mb-0"
                          {...dateValueProps}
                        >
                          {col.type === 'select' ? (
                            <Select
                              placeholder={col.placeholder}
                              style={{ width: '100%' }}
                              mode={col.mode}
                              showSearch={col.options && col.options.length > 5}
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {col.options?.map((opt: any) => {
                                const label = typeof opt === 'string' ? opt : opt.label;
                                const value = typeof opt === 'string' ? opt : opt.value;
                                return <Select.Option key={value} value={value}>{label}</Select.Option>;
                              })}
                            </Select>
                          ) : col.type === 'number' ? (
                            <InputNumber
                              placeholder={col.placeholder}
                              style={{ width: '100%' }}
                              {...noAutofillProps(col.name)}
                              min={col.min}
                              max={col.max}
                              parser={(value) => {
                                if (!value) return '' as any;
                                const cleaned = String(value).replace(/[^\d.\-]/g, '');
                                const minus = cleaned.startsWith('-') ? '-' : '';
                                const rest = cleaned.replace(/-/g, '');
                                const firstDot = rest.indexOf('.');
                                const normalized =
                                  firstDot === -1
                                    ? rest
                                    : rest.slice(0, firstDot + 1) + rest.slice(firstDot + 1).replace(/\./g, '');
                                return (minus + normalized) as any;
                              }}
                            />
                          ) : col.type === 'date' ? (
                            <DatePicker
                              placeholder={col.placeholder}
                              format="DD/MM/YYYY"
                              className="h-8"
                              style={{ width: '100%' }}
                            />
                          ) : (
                            <Input
                              placeholder={col.placeholder}
                              {...noAutofillProps(col.name)}
                            />
                          )}
                        </Form.Item>
                      );
                    }
                  };
                }) || []),
                {
                  title: 'Action',
                  key: 'action',
                  width: 70,
                  fixed: 'right' as const,
                  render: (_: any, fieldRecord: any) =>
                    field.lockAddRemove ? (
                      // Q8 (BOM): supplier can wipe editable fields but the row
                      // stays anchored to its BOM component. ReadOnly columns
                      // (MPN, Component Name) are preserved.
                      <Button
                        type="text"
                        icon={<ReloadOutlined />}
                        onClick={() => {
                          const path = field.name.split('.');
                          const rowPath = [...path, fieldRecord.name];
                          const rowValues = form.getFieldValue(rowPath) || {};
                          const cleared: Record<string, any> = {};
                          (field.columns || []).forEach((c: QuestionnaireField) => {
                            if (c.readOnly) {
                              cleared[c.name] = rowValues[c.name];
                            } else {
                              cleared[c.name] = undefined;
                            }
                          });
                          // Preserve hidden link fields (bom_id etc.) too.
                          ["bom_id", "material_number", "product_name"].forEach((k) => {
                            if (rowValues[k] !== undefined) cleared[k] = rowValues[k];
                          });
                          form.setFieldValue(rowPath, cleared);
                        }}
                        className="hover:bg-amber-50 hover:text-amber-600"
                        size="small"
                        title="Clear this row's data (the BOM component stays)"
                      />
                    ) : (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(fieldRecord.name)}
                        className="hover:bg-red-50"
                        size="small"
                      />
                    )
                }
              ];

              return (
                <>
                  {fields.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span className="text-gray-400">
                          No items added yet. Click the button below to add your first entry.
                        </span>
                      }
                      className="py-8"
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <Table
                        dataSource={fields}
                        columns={columns}
                        pagination={false}
                        rowKey="key"
                        size="small"
                        bordered
                        tableLayout="fixed"
                        className="mb-4"
                        scroll={{ x: 'max-content' }}
                        rowClassName={(_, index) =>
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }
                      />
                    </div>
                  )}
                  {errors.length > 0 && (
                    <div className="mt-2">
                      {errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 flex items-center gap-1">
                          <InfoCircleOutlined className="text-xs" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {fields.length} {fields.length === 1 ? 'item' : 'items'}
                      {field.required && fields.length === 0 && !field.lockAddRemove && (
                        <span className="text-red-500 ml-1">(Required - add at least one entry)</span>
                      )}
                      {field.lockAddRemove && (
                        <span className="text-gray-500 ml-1">(locked to BOM — rows cannot be added or removed)</span>
                      )}
                    </span>
                    {!field.lockAddRemove && (
                      <Button
                        type="dashed"
                        onClick={() => {
                          // Add empty row — supplier must select MPN/component for each row
                          // to ensure correct bom_id mapping across multiple components
                          add();
                        }}
                        icon={<PlusOutlined />}
                        className="hover:border-green-400 hover:text-green-600"
                      >
                        {field.addButtonLabel || 'Add Row'}
                      </Button>
                    )}
                  </div>
                </>
              );
            }}
          </Form.List>
            )}
          </Form.Item>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6">
      <div className="mb-6 sm:mb-8">
        <Title level={3} className="mb-2">{section.title}</Title>
        {section.description && (
          <Text type="secondary" className="text-sm">{section.description}</Text>
        )}
      </div>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
        autoComplete="off"
        onValuesChange={(changedValues, allValues) => {
          // Call parent's onValuesChange if provided
          onValuesChange?.(changedValues, allValues);

          // Check if any dependency field changed - trigger auto-populate for conditional tables
          if (section) {
            const conditionalTables = section.fields.filter(
              (field) =>
                field.type === 'table' &&
                field.autoPopulateFromProducts &&
                field.dependency &&
                field.required === true
            );

            conditionalTables.forEach((field) => {
              if (field.dependency) {
                const dependencyFieldPath = field.dependency.field;
                // Check if the changed value is the dependency field
                const changedPath = Object.keys(changedValues).join('.');
                if (dependencyFieldPath.includes(changedPath) || changedPath.includes(dependencyFieldPath.split('.')[0])) {
                  // Get the dependency value
                  const dependencyValue = form.getFieldValue(dependencyFieldPath.split('.'));
                  if (dependencyValue === field.dependency.value) {
                    // Trigger auto-populate after a small delay
                    setTimeout(() => {
                      autoPopulateTables(field.name);
                    }, 200);
                  }
                }
              }
            });
          }
        }}
        scrollToFirstError
        className="space-y-2"
      >
        {section.fields.map((field, index) => (
          <div
            key={field.name}
            className="transition-all duration-200 hover:bg-gray-50 -mx-2 px-2 rounded"
          >
            {renderField(field, subFieldFlags[index])}
          </div>
        ))}
      </Form>
    </div>
  );
};

export default DynamicQuestionnaireForm;
