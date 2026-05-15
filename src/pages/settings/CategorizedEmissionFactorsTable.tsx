import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Edit,
  Leaf,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import {
  App,
  Button,
  Empty,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { usePermissions } from "../../contexts/PermissionContext";
import {
  addLayeredEF,
  bulkAddLayeredEF,
  deleteLayeredEF,
  listLayeredEF,
  updateLayeredEF,
  type LayeredEFEntity,
  type LayeredEFRow,
} from "../../lib/ecoInventService";

export type Region = string;

// Frontend row shape (camelCase). `dbId` holds the backend internal PK
// (mef_id / eef_id / fef_id / pef_id / wtef_id / wmttef_id) so we can update/delete.
export interface EmissionFactorRow {
  id: string;           // ef_code (Excel ID, e.g. EF_001937)
  dbId?: string;
  scope: string;
  layer1: string;
  layer2: string;
  layer3: string;
  layer4: string;
  region: Region;
  year: number;
  efValue: number;
  unit: string;
  dataSource: string;
  category: string;
}

export interface CategorizedEmissionFactorsTableProps {
  title: string;
  description?: string;
  /** Which backend EF type this page is bound to. Drives all API calls. */
  entity: LayeredEFEntity;
  /** Region options shown in the Add/Edit modal. Default: ["EU", "INDIA", "GLOBAL"]. */
  regions?: string[];
  /** Default value for `scope` when creating a new row. */
  defaultScope?: string;
  /** Default value for `unit` when creating a new row. */
  defaultUnit?: string;
  /** Default value for `category` when creating a new row. */
  defaultCategory?: string;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const { Option } = Select;

const REGION_COLORS: Record<string, string> = {
  EU: "blue",
  IN: "orange",
  INDIA: "orange",
  GLOBAL: "green",
  US: "geekblue",
  UK: "blue",
};

const regionColor = (v: string): string =>
  REGION_COLORS[(v || "").toUpperCase()] ?? "default";

const SCOPE_DEFAULT = "Scope 3";
const UNIT_DEFAULT = "KgCo2e/per kg";
const DATA_SOURCE_DEFAULT = "Secondary literature / avg";
const CATEGORY_DEFAULT = "Packaging";
const DEFAULT_REGIONS = ["EU", "INDIA", "GLOBAL"];

const buildEmptyRow = (
  scope: string,
  unit: string,
  category: string,
  defaultRegion: string
): EmissionFactorRow => ({
  id: "",
  scope,
  layer1: "",
  layer2: "",
  layer3: "",
  layer4: "",
  region: defaultRegion,
  year: new Date().getFullYear(),
  efValue: 0,
  unit,
  dataSource: DATA_SOURCE_DEFAULT,
  category,
});

const nextId = (rows: EmissionFactorRow[]): string => {
  let max = 0;
  for (const r of rows) {
    const m = /^EF_(\d+)$/.exec(r.id);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
  }
  return `EF_${String(max + 1).padStart(6, "0")}`;
};

const parseCsvLine = (line: string): string[] => {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
};

// Convert API row -> frontend row, carrying the dbId and applying the page's
// default category (backend doesn't store category).
const fromService = (
  r: LayeredEFRow,
  defaultCategory: string
): EmissionFactorRow => ({
  id: r.id,
  dbId: r.dbId,
  scope: r.scope,
  layer1: r.layer1,
  layer2: r.layer2,
  layer3: r.layer3,
  layer4: r.layer4,
  region: r.region,
  year: r.year,
  efValue: r.efValue,
  unit: r.unit,
  dataSource: r.dataSource,
  category: defaultCategory,
});

const toService = (r: EmissionFactorRow): LayeredEFRow => ({
  id: r.id,
  dbId: r.dbId,
  scope: r.scope,
  layer1: r.layer1,
  layer2: r.layer2,
  layer3: r.layer3,
  layer4: r.layer4,
  region: r.region,
  year: r.year,
  efValue: r.efValue,
  unit: r.unit,
  dataSource: r.dataSource,
});

const CategorizedEmissionFactorsTable: React.FC<
  CategorizedEmissionFactorsTableProps
> = ({
  title,
  description = "Categorized EF database",
  entity,
  regions = DEFAULT_REGIONS,
  defaultScope = SCOPE_DEFAULT,
  defaultUnit = UNIT_DEFAULT,
  defaultCategory = CATEGORY_DEFAULT,
}) => {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const { canCreate, canUpdate, canDelete } = usePermissions();

  const defaultRegion = regions[0] ?? "EU";
  const emptyRow = () =>
    buildEmptyRow(defaultScope, defaultUnit, defaultCategory, defaultRegion);

  const [rows, setRows] = useState<EmissionFactorRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<EmissionFactorRow>(emptyRow());
  const [adding, setAdding] = useState(false);

  const [editingRow, setEditingRow] = useState<EmissionFactorRow | null>(null);
  const [editItem, setEditItem] = useState<EmissionFactorRow>(emptyRow());
  const [savingEdit, setSavingEdit] = useState(false);

  // Load list when entity changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listLayeredEF(entity)
      .then((apiRows) => {
        if (cancelled) return;
        setRows(apiRows.map((r) => fromService(r, defaultCategory)));
      })
      .catch(() => {
        if (!cancelled) message.error("Failed to load emission factors");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entity, defaultCategory, message]);

  const filteredRows = useMemo(() => {
    const q = search.trim();
    if (!q) return rows;
    // Full-word match (case-insensitive) per token. "bus" matches "Bus"
    // but NOT "Business" or "Combustion". Punctuation in the query (parens,
    // commas, slashes) is treated as a separator so multi-word phrases work.
    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cleaned = q.replace(/[^A-Za-z0-9_\s]+/g, " ");
    const tokens = cleaned.split(/\s+/).filter(Boolean).map(escape);
    if (tokens.length === 0) return rows;
    const regexes = tokens.map((t) => new RegExp(`\\b${t}\\b`, "i"));
    const fields = (row: EmissionFactorRow) =>
      [row.id, row.layer1, row.layer2, row.layer3, row.layer4, row.region];
    return rows.filter((row) => {
      const cols = fields(row);
      return regexes.every((re) => cols.some((c) => re.test(c)));
    });
  }, [rows, search]);

  const handleExport = () => {
    const headers = [
      "ID",
      "Scope",
      "Layer1",
      "Layer2",
      "Layer3",
      "Layer4",
      "Region",
      "Year",
      "EF Value",
      "Unit",
      "Data Source",
      "Category",
    ];
    const data = filteredRows.map((r) => [
      r.id,
      r.scope,
      r.layer1,
      r.layer2,
      r.layer3,
      r.layer4,
      r.region,
      r.year.toString(),
      r.efValue.toString(),
      r.unit,
      r.dataSource,
      r.category,
    ]);
    const csv = [headers, ...data]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${slugify(title) || "emission-factors"}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        message.error("CSV must have a header row and at least one data row");
        return;
      }
      const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
      const idx = (name: string) =>
        headers.findIndex((h) => h === name.toLowerCase());

      const iId = idx("id");
      const iScope = idx("scope");
      const iL1 = idx("layer1");
      const iL2 = idx("layer2");
      const iL3 = idx("layer3");
      const iL4 = idx("layer4");
      const iRegion = idx("region");
      const iYear = idx("year");
      const iEf = headers.findIndex(
        (h) => h === "ef value" || h === "efvalue" || h === "ef_value"
      );
      const iUnit = idx("unit");
      const iSrc = headers.findIndex(
        (h) => h === "data source" || h === "datasource" || h === "data_source"
      );
      const iCat = idx("category");

      // Layer4, Region, and EF Value are mandatory in the new schema
      if (iL4 < 0 || iRegion < 0 || iEf < 0) {
        message.error(
          "CSV must contain at least Layer4, Region, and EF Value columns"
        );
        return;
      }

      const imported: EmissionFactorRow[] = [];
      const existingIds = new Set(rows.map((r) => r.id));
      let nextNumeric = (() => {
        let max = 0;
        for (const r of rows) {
          const m = /^EF_(\d+)$/.exec(r.id);
          if (m) max = Math.max(max, parseInt(m[1], 10));
        }
        return max;
      })();

      for (let i = 1; i < lines.length; i++) {
        const cells = parseCsvLine(lines[i]);
        const region = (cells[iRegion] || defaultRegion).toUpperCase();
        if (!region) continue;
        let id = iId >= 0 ? cells[iId] : "";
        if (!id || existingIds.has(id)) {
          nextNumeric += 1;
          id = `EF_${String(nextNumeric).padStart(6, "0")}`;
        }
        existingIds.add(id);
        imported.push({
          id,
          scope: iScope >= 0 ? cells[iScope] || defaultScope : defaultScope,
          layer1: iL1 >= 0 ? cells[iL1] || "" : "",
          layer2: iL2 >= 0 ? cells[iL2] || "" : "",
          layer3: iL3 >= 0 ? cells[iL3] || "" : "",
          layer4: cells[iL4] || "",
          region,
          year:
            iYear >= 0
              ? parseInt(cells[iYear], 10) || new Date().getFullYear()
              : new Date().getFullYear(),
          efValue: parseFloat(cells[iEf]) || 0,
          unit: iUnit >= 0 ? cells[iUnit] || defaultUnit : defaultUnit,
          dataSource:
            iSrc >= 0 ? cells[iSrc] || DATA_SOURCE_DEFAULT : DATA_SOURCE_DEFAULT,
          category:
            iCat >= 0 ? cells[iCat] || defaultCategory : defaultCategory,
        });
      }

      if (imported.length === 0) {
        message.warning("No valid rows found in CSV");
        return;
      }

      const hide = message.loading(`Importing ${imported.length} rows…`, 0);
      const res = await bulkAddLayeredEF(entity, imported.map(toService));
      hide();
      if (!res.success) {
        message.error(res.message || "Bulk import failed");
        return;
      }
      // Reload from server to get authoritative dbIds
      const fresh = await listLayeredEF(entity);
      setRows(fresh.map((r) => fromService(r, defaultCategory)));
      message.success(
        `Imported ${res.addedCount ?? imported.length} row${
          (res.addedCount ?? imported.length) === 1 ? "" : "s"
        }`
      );
    };
    input.click();
  };

  const openAddModal = () => {
    setNewItem({ ...emptyRow(), id: nextId(rows) });
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!newItem.id.trim()) {
      message.warning("Please enter an ID");
      return;
    }
    if (!newItem.layer4.trim()) {
      message.warning("Please enter Layer4");
      return;
    }
    if (!newItem.region.trim()) {
      message.warning("Please select a Region");
      return;
    }
    if (rows.some((r) => r.id === newItem.id)) {
      message.warning(`ID ${newItem.id} already exists`);
      return;
    }
    setAdding(true);
    const res = await addLayeredEF(entity, toService(newItem));
    setAdding(false);
    if (!res.success) {
      message.error(res.message || "Failed to add row");
      return;
    }
    const saved = res.row
      ? fromService(res.row, defaultCategory)
      : { ...newItem };
    setRows((prev) => [...prev, saved]);
    setShowAddModal(false);
    message.success("Row added");
  };

  const openEditModal = (row: EmissionFactorRow) => {
    setEditingRow(row);
    setEditItem({ ...row });
  };

  const handleSaveEdit = async () => {
    if (!editingRow) return;
    if (!editItem.layer4.trim()) {
      message.warning("Please enter Layer4");
      return;
    }
    if (!editItem.region.trim()) {
      message.warning("Please select a Region");
      return;
    }
    if (!editingRow.dbId) {
      message.error("Internal id missing; please reload the page");
      return;
    }
    setSavingEdit(true);
    const res = await updateLayeredEF(entity, {
      ...toService(editItem),
      dbId: editingRow.dbId,
    });
    setSavingEdit(false);
    if (!res.success) {
      message.error(res.message || "Failed to update row");
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.dbId === editingRow.dbId ? { ...editItem, dbId: editingRow.dbId } : r
      )
    );
    setEditingRow(null);
    message.success("Row updated");
  };

  const handleDelete = (row: EmissionFactorRow) => {
    modal.confirm({
      title: "Delete this row?",
      content: `${row.id} — ${row.layer4} (${row.region}) will be removed.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        if (!row.dbId) {
          message.error("Internal id missing; please reload the page");
          return;
        }
        const res = await deleteLayeredEF(entity, row.dbId);
        if (!res.success) {
          message.error(res.message || "Failed to delete row");
          return;
        }
        setRows((prev) => prev.filter((r) => r.dbId !== row.dbId));
        message.success("Row deleted");
      },
    });
  };

  const columns: ColumnsType<EmissionFactorRow> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 110,
      fixed: "left",
      sorter: (a, b) => a.id.localeCompare(b.id),
      render: (v: string) => (
        <span className="font-mono text-xs text-gray-700">{v}</span>
      ),
    },
    { title: "Scope", dataIndex: "scope", key: "scope", width: 90 },
    { title: "Layer1", dataIndex: "layer1", key: "layer1", width: 170 },
    {
      title: "Layer2",
      dataIndex: "layer2",
      key: "layer2",
      width: 280,
      sorter: (a, b) => a.layer2.localeCompare(b.layer2),
      render: (v: string) => (
        <span className="font-medium text-gray-900">{v}</span>
      ),
    },
    { title: "Layer3", dataIndex: "layer3", key: "layer3", width: 170 },
    { title: "Layer4", dataIndex: "layer4", key: "layer4", width: 200 },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      width: 100,
      render: (v: Region) => (
        <Tag color={regionColor(v)} className="font-medium">
          {v}
        </Tag>
      ),
    },
    { title: "Year", dataIndex: "year", key: "year", width: 80 },
    {
      title: "EF Value",
      dataIndex: "efValue",
      key: "efValue",
      width: 100,
      sorter: (a, b) => a.efValue - b.efValue,
      render: (v: number) => (
        <span className="font-semibold text-gray-900">{v}</span>
      ),
    },
    { title: "Unit", dataIndex: "unit", key: "unit", width: 140 },
    {
      title: "Data Source",
      dataIndex: "dataSource",
      key: "dataSource",
      width: 200,
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      fixed: "right",
      align: "center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          {canUpdate("eco invent emission factors") && (
            <button
              onClick={() => openEditModal(row)}
              className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {canDelete("eco invent emission factors") && (
            <button
              onClick={() => handleDelete(row)}
              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const renderEditableFields = (
    item: EmissionFactorRow,
    setItem: (v: EmissionFactorRow) => void
  ) => (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID <span className="text-red-500">*</span>
        </label>
        <Input
          value={item.id}
          onChange={(e) => setItem({ ...item, id: e.target.value })}
          placeholder="EF_xxxxxx"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Scope
        </label>
        <Input
          value={item.scope}
          onChange={(e) => setItem({ ...item, scope: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Region <span className="text-red-500">*</span>
        </label>
        <Select
          className="w-full"
          value={item.region}
          onChange={(v) => setItem({ ...item, region: v })}
        >
          {regions.map((r) => (
            <Option key={r} value={r}>
              {r}
            </Option>
          ))}
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Layer1
        </label>
        <Input
          value={item.layer1}
          onChange={(e) => setItem({ ...item, layer1: e.target.value })}
          placeholder="e.g., Material Emissions"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Layer3
        </label>
        <Input
          value={item.layer3}
          onChange={(e) => setItem({ ...item, layer3: e.target.value })}
          placeholder="e.g., Polymer"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Layer2
        </label>
        <Input
          value={item.layer2}
          onChange={(e) => setItem({ ...item, layer2: e.target.value })}
          placeholder="e.g., Polypropylene (PP)"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Layer4 <span className="text-red-500">*</span>
        </label>
        <Input
          value={item.layer4}
          onChange={(e) => setItem({ ...item, layer4: e.target.value })}
          placeholder="e.g., Plastic & Resin"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Year
        </label>
        <InputNumber
          className="w-full"
          value={item.year}
          onChange={(v) =>
            setItem({ ...item, year: v ?? new Date().getFullYear() })
          }
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          EF Value <span className="text-red-500">*</span>
        </label>
        <InputNumber
          className="w-full"
          value={item.efValue}
          step={0.01}
          onChange={(v) => setItem({ ...item, efValue: v ?? 0 })}
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unit
        </label>
        <Input
          value={item.unit}
          onChange={(e) => setItem({ ...item, unit: e.target.value })}
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data Source
        </label>
        <Input
          value={item.dataSource}
          onChange={(e) => setItem({ ...item, dataSource: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/settings")}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-500">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                <span>Import CSV</span>
              </button>
              {canCreate("eco invent emission factors") && (
                <button
                  onClick={openAddModal}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-green-600/20"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters + Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 pt-6 pb-4 flex flex-wrap items-center gap-3">
            <Input
              allowClear
              prefix={<Search className="h-4 w-4 text-gray-400" />}
              placeholder="Search by ID, material, layer, region…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72"
            />
            <div className="ml-auto text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {filteredRows.length}
              </span>{" "}
              of {rows.length} rows
            </div>
          </div>

          <div className="px-6 pb-6">
            <Spin spinning={loading}>
              <Table<EmissionFactorRow>
                rowKey={(record) => record.dbId || record.id}
                columns={columns}
                dataSource={filteredRows}
                size="middle"
                scroll={{ x: 1700 }}
                pagination={false}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div className="py-4">
                          <div className="text-gray-700 font-medium mb-1">
                            No emission factors yet
                          </div>
                          <div className="text-gray-500 text-sm">
                            Click{" "}
                            <span className="font-medium">Import CSV</span> to
                            upload your data or{" "}
                            <span className="font-medium">Add New</span> to
                            create a row.
                          </div>
                        </div>
                      }
                    />
                  ),
                }}
              />
            </Spin>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                Add Emission Factor
              </div>
              <div className="text-sm text-gray-500 font-normal">
                Enter the details for the new row
              </div>
            </div>
          </div>
        }
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        width={680}
        footer={[
          <Button key="cancel" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>,
          <Button
            key="add"
            type="primary"
            loading={adding}
            onClick={handleAdd}
          >
            Add
          </Button>,
        ]}
      >
        {renderEditableFields(newItem, setNewItem)}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Edit className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                Edit Emission Factor
              </div>
              <div className="text-sm text-gray-500 font-normal">
                {editingRow?.id}
              </div>
            </div>
          </div>
        }
        open={!!editingRow}
        onCancel={() => setEditingRow(null)}
        width={680}
        footer={[
          <Button key="cancel" onClick={() => setEditingRow(null)}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={savingEdit}
            onClick={handleSaveEdit}
          >
            Save
          </Button>,
        ]}
      >
        {renderEditableFields(editItem, setEditItem)}
      </Modal>
    </div>
  );
};

export default CategorizedEmissionFactorsTable;
