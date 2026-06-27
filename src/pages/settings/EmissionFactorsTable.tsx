import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Upload,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadProps } from "antd";
import {
  ArrowLeft,
  Database,
  Globe,
  Leaf,
  Ruler,
  Search,
  Upload as UploadIcon,
} from "lucide-react";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";
import {
  getEmissionFactorStats,
  importEmissionFactorsCsv,
  listEmissionFactors,
} from "../../lib/emissionFactorService";
import type {
  EmissionFactor,
  EmissionFactorStats,
  ImportValidationError,
} from "../../lib/emissionFactorService";

const { Option } = Select;

const isSuperAdminRole = (role?: string | null): boolean => {
  if (!role) return false;
  const r = role.toLowerCase().replace(/[\s_]/g, "");
  return r === "superadmin";
};

const EmissionFactorsTable: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canImport = isSuperAdminRole(user?.role);

  // Table state
  const [rows, setRows] = useState<EmissionFactor[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [countryCode, setCountryCode] = useState<string | undefined>();
  const [unitKind, setUnitKind] = useState<string | undefined>();
  const [sourceDb, setSourceDb] = useState<string | undefined>();

  // Stats
  const [stats, setStats] = useState<EmissionFactorStats | null>(null);

  // Bumped by Reset / explicit refresh — guarantees a fresh fetch even if the
  // other deps (search, filters, page) end up at the same values they already
  // had. Without this, React would skip re-running useEffect after a no-op reset.
  const [reloadKey, setReloadKey] = useState(0);

  // Import modal state
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<ImportValidationError[] | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const lastSearchDebounce = useRef<number | null>(null);
  // Sequence number guards against out-of-order responses: when the user types
  // fast or changes pageSize quickly, multiple fetches can be in flight at once;
  // we only accept the result of the most recently issued request.
  const fetchSeq = useRef(0);

  const fetchRows = useCallback(async () => {
    const mySeq = ++fetchSeq.current;
    setLoading(true);
    try {
      const resp = await listEmissionFactors({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        country_code: countryCode,
        unit_kind: unitKind,
        source_db: sourceDb,
      });
      if (mySeq !== fetchSeq.current) return; // stale — newer request already issued
      setRows(resp.data || []);
      setTotal(resp.pagination?.total || 0);
    } catch (err: any) {
      if (mySeq !== fetchSeq.current) return;
      message.error(err?.message || "Failed to load emission factors");
      setRows([]);
      setTotal(0);
    } finally {
      if (mySeq === fetchSeq.current) setLoading(false);
    }
  }, [page, pageSize, search, countryCode, unitKind, sourceDb, reloadKey]);

  const fetchStats = useCallback(async () => {
    try {
      const s = await getEmissionFactorStats();
      setStats(s);
    } catch {
      // Stats are non-critical; ignore failure.
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onSearchChange = (val: string) => {
    setSearch(val);
    if (lastSearchDebounce.current) window.clearTimeout(lastSearchDebounce.current);
    lastSearchDebounce.current = window.setTimeout(() => setPage(1), 300);
  };

  const resetFilters = () => {
    // Cancel any pending search debounce so it doesn't fire AFTER reset and
    // accidentally re-trigger a setPage call into a stale fetch race.
    if (lastSearchDebounce.current) {
      window.clearTimeout(lastSearchDebounce.current);
      lastSearchDebounce.current = null;
    }
    setSearch("");
    setCountryCode(undefined);
    setUnitKind(undefined);
    setSourceDb(undefined);
    setPage(1);
    // Force a fresh fetch even if nothing actually changed (e.g. user clicked
    // Reset when no filters were applied) — guarantees the table refills.
    setReloadKey((k) => k + 1);
  };

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    const isCsv =
      file.type === "text/csv" ||
      file.name.toLowerCase().endsWith(".csv");
    if (!isCsv) {
      message.error("Only .csv files are accepted");
      return Upload.LIST_IGNORE;
    }
    if (file.size > 50 * 1024 * 1024) {
      message.error("File exceeds 50 MB limit");
      return Upload.LIST_IGNORE;
    }
    setPendingFile(file);
    setImportErrors(null);
    setImportSummary(null);
    return false;
  };

  const runImport = async () => {
    if (!pendingFile) return;
    setImporting(true);
    setImportErrors(null);
    setImportSummary(null);
    try {
      const resp = await importEmissionFactorsCsv(pendingFile);
      if (resp.success) {
        message.success(resp.message);
        setImportSummary(resp.message);
        setPendingFile(null);
        await Promise.all([fetchRows(), fetchStats()]);
        setTimeout(() => setImportOpen(false), 1200);
      } else {
        setImportErrors(resp.errors || resp.sampleErrors || []);
        setImportSummary(resp.message || "Import failed");
        message.error(resp.message || "Import failed");
      }
    } catch (err: any) {
      const msg = err?.message || "Import failed";
      setImportSummary(msg);
      message.error(msg);
    } finally {
      setImporting(false);
    }
  };

  // Text column that wraps content across multiple lines instead of truncating —
  // so users can read the full Material / Process / Sub Category etc. without
  // having to hover. Rows get a bit taller when content is long; that's the trade.
  const wrapCol = (
    title: string,
    key: keyof EmissionFactor,
    width: number
  ) => ({
    title,
    dataIndex: key as string,
    key: key as string,
    width,
    render: (v: string | null) =>
      v ? (
        <span className="whitespace-normal break-words leading-snug">{v}</span>
      ) : (
        <span className="text-gray-300">-</span>
      ),
  });

  // Columns mirror the source CSV exactly, in the same order and with the same
  // headers: Category, Sub-category, Group, Specific Type, Dataset Name,
  // Geography, Unit, GWP 100 [kg CO₂e]. (EF ID is the row id, kept leftmost.)
  const columns: ColumnsType<EmissionFactor> = useMemo(
    () => [
      {
        title: "EF ID",
        dataIndex: "ef_id",
        key: "ef_id",
        width: 80,
        fixed: "left",
        render: (v: string) => <code className="text-xs">{v}</code>,
      },
      wrapCol("Category", "category", 180),
      wrapCol("Sub-category", "sub_category", 180),
      wrapCol("Group", "group_name", 240),
      {
        title: "Specific Type",
        dataIndex: "specific_type",
        key: "specific_type",
        width: 300,
        render: (v: string) => (
          <span className="whitespace-normal break-words leading-snug">{v}</span>
        ),
      },
      wrapCol("Dataset Name", "dataset_name", 320),
      {
        title: "Geography",
        dataIndex: "geography",
        key: "geography",
        width: 120,
        render: (v: string | null) =>
          v ? <Tag color="blue">{v}</Tag> : <span className="text-gray-300">-</span>,
      },
      {
        title: "Unit",
        dataIndex: "unit",
        key: "unit",
        width: 90,
        render: (v: string | null) => v || <span className="text-gray-300">-</span>,
      },
      {
        title: "GWP 100 [kg CO₂e]",
        dataIndex: "gwp_100",
        key: "gwp_100",
        width: 170,
        align: "right",
        render: (v: number | string | null) => {
          const n = typeof v === "string" ? Number(v) : v;
          if (n == null || !Number.isFinite(n as number)) return <span className="text-gray-300">-</span>;
          return (
            <span className="tabular-nums font-medium">
              {(n as number).toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <Button
              type="text"
              onClick={() => navigate("/settings")}
              icon={<ArrowLeft size={18} />}
            >
              Back
            </Button>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 flex-shrink-0">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                Emission Factors
              </h1>
              <p className="text-slate-500 text-sm">
                Centralized emission factor dataset (BAFU 2025) powering Enviraan's PCF calculations.{canImport ? "" : " Read-only — only super admin can import."}
              </p>
            </div>
          </div>
          {canImport && (
            <Button
              type="primary"
              size="large"
              icon={<UploadIcon size={16} />}
              onClick={() => {
                setImportOpen(true);
                setImportErrors(null);
                setImportSummary(null);
                setPendingFile(null);
              }}
            >
              Import Dataset
            </Button>
          )}
        </div>

        {/* Stat chips */}
        <div className="flex items-center gap-3 flex-wrap mt-5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100">
            <Database className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-700 tabular-nums">
              {(stats?.total ?? total).toLocaleString()}
            </span>
            <span className="text-xs text-green-600/80">total rows</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700 tabular-nums">
              {stats?.country_count ?? "-"}
            </span>
            <span className="text-xs text-blue-600/80">geographies</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
            <Ruler className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 tabular-nums">
              {stats?.unit_kind_count ?? "-"}
            </span>
            <span className="text-xs text-amber-600/80">domains</span>
          </div>
          {stats?.last_updated && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">last import</span>
              <span className="text-xs font-semibold text-slate-700">
                {dayjs(stats.last_updated).format("YYYY-MM-DD HH:mm")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            allowClear
            prefix={<Search size={14} />}
            placeholder="Search any column (material, dataset, geography, category, unit, source…)"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 440, flex: "1 1 320px", maxWidth: 560 }}
          />
          <Select
            allowClear
            placeholder="Geography"
            value={countryCode}
            onChange={(v) => { setCountryCode(v); setPage(1); }}
            style={{ width: 160 }}
          >
            {["RER", "GLO", "RoW", "CH", "US", "IN", "DE"].map((c) => (
              <Option key={c} value={c}>{c}</Option>
            ))}
          </Select>
          <Select
            allowClear
            placeholder="Domain"
            value={unitKind}
            onChange={(v) => { setUnitKind(v); setPage(1); }}
            style={{ width: 160 }}
          >
            {["material", "manufacturing", "transport", "waste", "packaging"].map((u) => (
              <Option key={u} value={u}>{u}</Option>
            ))}
          </Select>
          <Select
            allowClear
            placeholder="Source DB"
            value={sourceDb}
            onChange={(v) => { setSourceDb(v); setPage(1); }}
            style={{ width: 160 }}
          >
            {["BAFU 2025"].map((s) => (
              <Option key={s} value={s}>{s}</Option>
            ))}
          </Select>
          <Button onClick={resetFilters}>Reset</Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <Table<EmissionFactor>
          rowKey="ef_id"
          dataSource={rows}
          columns={columns}
          loading={loading}
          scroll={{ x: 1700 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ["25", "50", "100", "200", "500"],
            showTotal: (t, r) => `${r[0]}–${r[1]} of ${t.toLocaleString()}`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </div>

      {/* Import modal */}
      <Modal
        title="Import Emission Factor Dataset"
        open={importOpen}
        onCancel={() => (importing ? null : setImportOpen(false))}
        footer={[
          <Button key="cancel" onClick={() => setImportOpen(false)} disabled={importing}>
            Cancel
          </Button>,
          <Button
            key="import"
            type="primary"
            danger
            loading={importing}
            disabled={!pendingFile}
            onClick={runImport}
          >
            Import {pendingFile ? `(${pendingFile.name})` : ""}
          </Button>,
        ]}
        width={720}
        destroyOnClose
      >
        <Alert
          type="warning"
          showIcon
          className="mb-4"
          message="This will permanently delete every existing emission factor and replace the dataset with the file you upload. The operation is atomic — if any row fails validation, no changes are saved."
        />

        <Upload.Dragger
          accept=".csv,text/csv"
          beforeUpload={beforeUpload}
          maxCount={1}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <UploadIcon className="mx-auto text-green-600" size={32} />
          </p>
          <p className="ant-upload-text font-medium">
            {pendingFile ? pendingFile.name : "Click or drag a CSV file here"}
          </p>
          <p className="ant-upload-hint text-xs text-gray-500">
            Required columns (8): Category, Sub-category, Group, Specific Type, Dataset Name,
            Geography, Unit, GWP 100. Upload the standard Main DB file (10,305 rows) and the
            domain is filled in automatically by section. Optionally add a <strong>Domain</strong>{" "}
            column (material / manufacturing / packaging / transport / waste) to set it per row.
            Column order and exact spacing/punctuation don't matter — headers match flexibly.
          </p>
        </Upload.Dragger>

        {importSummary && (
          <Alert
            className="mt-4"
            type={importErrors && importErrors.length > 0 ? "error" : "info"}
            message={importSummary}
            showIcon
          />
        )}

        {importErrors && importErrors.length > 0 && (
          <div className="mt-4 max-h-64 overflow-auto border border-red-200 rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-red-50 sticky top-0">
                <tr>
                  <th className="text-left p-2">Row</th>
                  <th className="text-left p-2">Field</th>
                  <th className="text-left p-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {importErrors.slice(0, 200).map((e, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 font-mono">{e.row}</td>
                    <td className="p-2 font-mono">{e.field}</td>
                    <td className="p-2">{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {importErrors.length > 200 && (
              <div className="p-2 text-xs text-red-700 bg-red-50">
                Showing first 200 of {importErrors.length} errors.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmissionFactorsTable;
