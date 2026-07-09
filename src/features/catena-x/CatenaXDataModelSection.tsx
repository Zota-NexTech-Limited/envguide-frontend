import { useEffect, useMemo, useState } from "react";
import {
  Network,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Boxes,
  Download,
} from "lucide-react";
import {
  CATENA_X_PCF_MODEL,
  REQUIREMENT_META,
  getValueByPath,
  formatFieldValue,
  type CxSection,
} from "../../config/catenaXPcfDataModel";
import pcfService from "../../lib/pcfService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/* ------------------------------------------------------------------ */

type ReqGroup = "mandatory" | "optional" | "conditional" | "derived";

const STATUS: Record<
  ReqGroup,
  { label: string; dot: string; tagBg: string; tagText: string }
> = {
  mandatory: { label: "Mandatory", dot: "#16a34a", tagBg: "#dcfce7", tagText: "#15803d" },
  optional: { label: "Optional", dot: "#94a3b8", tagBg: "#f1f5f9", tagText: "#64748b" },
  conditional: { label: "Conditional", dot: "#f59e0b", tagBg: "#fef3c7", tagText: "#b45309" },
  derived: { label: "Derived", dot: "#6366f1", tagBg: "#eef2ff", tagText: "#4f46e5" },
};

const SECTION_META: Record<
  CxSection["icon"],
  { short: string; accent: string; accentBg: string }
> = {
  scope: { short: "SC", accent: "#4f46e5", accentBg: "#eef2ff" },
  company: { short: "CP", accent: "#1d4ed8", accentBg: "#dbeafe" },
  assessment: { short: "AM", accent: "#b45309", accentBg: "#fef3c7" },
  lifecycle: { short: "LC", accent: "#15803d", accentBg: "#dcfce7" },
};

const SOV_STEPS = [
  {
    n: "1",
    title: "Your platform",
    sub: "PCF is calculated & validated in Enviguide. Nothing leaves until you publish it.",
  },
  {
    n: "2",
    title: "Access policy · BPN",
    sub: "Offered under a usage policy restricted to an authorised Business Partner Number — not pushed.",
  },
  {
    n: "3",
    title: "Catena-X partner",
    sub: "Partner consumes the PCF under the agreed policy. You retain control and can revoke access.",
  },
];

const SOV_POINTS = [
  "Restricted to an authorised BPN",
  "Updatable or revocable anytime",
  "Every transfer is logged & auditable",
];

const RING_R = 40;
const RING_C = 2 * Math.PI * RING_R;

const FILTER_ORDER: ReqGroup[] = [
  "mandatory",
  "optional",
  "conditional",
  "derived",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

interface Stats {
  total: number;
  mapped: number;
  gaps: number;
  pct: number;
  mandatory: number;
  optional: number;
  conditional: number;
  derived: number;
}

const EMPTY_STATS: Stats = {
  total: 0,
  mapped: 0,
  gaps: 0,
  pct: 0,
  mandatory: 0,
  optional: 0,
  conditional: 0,
  derived: 0,
};

/** Coverage / requirement counts for a single submodel over the field catalog. */
function computeStats(submodel: unknown): Stats {
  let total = 0;
  let mapped = 0;
  let gaps = 0;
  const by: Record<ReqGroup, number> = {
    mandatory: 0,
    optional: 0,
    conditional: 0,
    derived: 0,
  };
  for (const section of CATENA_X_PCF_MODEL) {
    for (const group of section.groups) {
      for (const field of group.fields) {
        total += 1;
        const g = REQUIREMENT_META[field.requirement].group;
        by[g] += 1;
        const v = formatFieldValue(getValueByPath(submodel, field.key));
        if (v !== null) mapped += 1;
        if (g === "mandatory" && v === null) gaps += 1;
      }
    }
  }
  const pct = total ? Math.round((mapped / total) * 100) : 0;
  return { total, mapped, gaps, pct, ...by };
}

interface Entry {
  id: string;
  label: string;
  sublabel?: string;
  isProduct: boolean;
  submodel: unknown;
  semanticId?: string;
  specVersion?: string;
}

/** Turn a label into a safe file-name fragment. */
function sanitizeFilename(s: string): string {
  return (
    s
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "export"
  );
}

/** Strip glyphs the default PDF font (WinAnsi) can't render. */
function pdfSafe(s: string): string {
  return s
    .replace(/₂/g, "2") // ₂ subscript
    .replace(/→/g, "->") // →
    .replace(/[–—]/g, "-") // en/em dash
    .replace(/[Ā-￿]/g, ""); // drop remaining non-Latin1 glyphs
}

type AutoTableDoc = jsPDF & { lastAutoTable: { finalY: number } };

/** Build & download a formatted PDF report for the given entries' data models. */
function generateCatenaXPdf(entries: Entry[], requestId?: string): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 40;
  const exportedOn = new Date().toISOString().slice(0, 10);

  entries.forEach((entry, idx) => {
    if (idx > 0) doc.addPage();
    const st = computeStats(entry.submodel);

    // Header band
    doc.setFillColor(12, 107, 59);
    doc.rect(0, 0, pageW, 84, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Catena-X Semantic PCF Data Model", M, 33);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("v3.0.0   Enviguide -> Catena-X data exchange", M, 49);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(pdfSafe(entry.label), M, 70);

    // Meta + coverage
    doc.setTextColor(90, 100, 110);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const meta = [
      requestId ? `Request: ${requestId}` : null,
      entry.sublabel ? pdfSafe(entry.sublabel) : null,
      `Exported: ${exportedOn}`,
    ]
      .filter(Boolean)
      .join("      ");
    doc.text(meta, M, 100);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${st.mapped} of ${st.total} fields mapped  (${st.pct}%)`, M, 118);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 100, 110);
    doc.setFontSize(8.5);
    doc.text(
      `Mandatory ${st.mandatory}     Optional ${st.optional}     Conditional ${st.conditional}     Derived ${st.derived}     Missing mandatory ${st.gaps}`,
      M,
      132,
    );

    let startY = 148;
    for (const section of CATENA_X_PCF_MODEL) {
      const gapFlags: boolean[] = [];
      const body: string[][] = [];
      for (const group of section.groups) {
        for (const field of group.fields) {
          const g = REQUIREMENT_META[field.requirement].group;
          const v = formatFieldValue(getValueByPath(entry.submodel, field.key));
          const isEmpty = v === null;
          const isGap = g === "mandatory" && isEmpty;
          gapFlags.push(isGap);
          body.push([
            pdfSafe(field.label),
            isEmpty ? (isGap ? "Missing - required" : "-") : pdfSafe(v as string),
            REQUIREMENT_META[field.requirement].label,
            isEmpty ? (isGap ? "Missing" : "Empty") : "Mapped",
          ]);
        }
      }
      autoTable(doc, {
        startY,
        head: [[pdfSafe(section.title), "Value", "Requirement", "Status"]],
        body,
        margin: { left: M, right: M },
        styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak", valign: "middle" },
        headStyles: { fillColor: [16, 163, 74], textColor: 255, fontStyle: "bold", fontSize: 8.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 185, fontStyle: "bold" },
          2: { cellWidth: 80 },
          3: { cellWidth: 56 },
        },
        didParseCell: (data: any) => {
          if (
            data.section === "body" &&
            gapFlags[data.row.index] &&
            data.column.index >= 1
          ) {
            data.cell.styles.textColor = [220, 38, 38];
            if (data.column.index === 3) data.cell.styles.fontStyle = "bold";
          }
        },
      });
      startY = (doc as AutoTableDoc).lastAutoTable.finalY + 14;
    }
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(160, 170, 180);
    doc.text(`Page ${i} / ${pages}`, pageW - M, pageH - 16, { align: "right" });
  }

  const filename =
    entries.length === 1
      ? `catena-x-pcf_${sanitizeFilename(entries[0].label)}.pdf`
      : `catena-x-pcf_all-components_${sanitizeFilename(requestId || "request")}.pdf`;
  doc.save(filename);
}

function MiniRing({ pct, accent }: { pct: number; accent: string }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[52px] w-[52px] flex-none">
      <svg
        width="52"
        height="52"
        viewBox="0 0 52 52"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle cx="26" cy="26" r={r} fill="none" stroke="#eef1f5" strokeWidth="5" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${((c * pct) / 100).toFixed(1)} ${c.toFixed(1)}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[12px] font-extrabold tabular-nums text-[#0f172a]">
        {pct}%
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CatenaXDataModelSection({
  requestId,
}: {
  requestId?: string;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Detail UI state
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ReqGroup[]>([]);
  const [gapsOnly, setGapsOnly] = useState(false);
  const [sovOpen, setSovOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;
    setStatus("loading");
    // Reset navigation/filter state so a prior request's drill-down or filters
    // don't bleed into a newly selected request (this component stays mounted
    // across /pcf-request/:id navigation).
    setActiveId(null);
    setQuery("");
    setFilters([]);
    setGapsOnly(false);
    setExpanded({});
    Promise.all([
      pcfService.getQuintariPcfSubmodel(requestId),
      pcfService.getQuintariPcfSubmodelsPerComponent(requestId),
    ])
      .then(([agg, per]) => {
        if (cancelled) return;
        const list: Entry[] = [];
        if (agg.success && agg.data?.submodel) {
          list.push({
            id: "product",
            label: "Product (all components)",
            sublabel: "Aggregate footprint published to Catena-X",
            isProduct: true,
            submodel: agg.data.submodel,
            semanticId: agg.data.semanticId,
            specVersion: agg.data.specVersion,
          });
        }
        if (per.success && Array.isArray(per.data?.components)) {
          for (const c of per.data.components) {
            list.push({
              id: c.bomId,
              label: c.componentName || c.materialNumber || "Component",
              sublabel:
                [c.materialNumber, c.supplierName].filter(Boolean).join(" · ") ||
                c.componentCategory ||
                undefined,
              isProduct: false,
              submodel: c.submodel,
              semanticId: c.semanticId,
              specVersion: c.specVersion,
            });
          }
        }
        if (list.length === 0) {
          setStatus("error");
          return;
        }
        setEntries(list);
        setStatus("loaded");
        // Only the product aggregate (no per-component data) → skip the overview
        // and open it directly, so single-component requests look like before.
        if (list.length === 1) setActiveId(list[0].id);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const loaded = status === "loaded";
  const activeEntry = entries.find((e) => e.id === activeId) ?? null;
  const activeSubmodel = activeEntry?.submodel ?? null;
  const activeIndex = entries.findIndex((e) => e.id === activeId);
  const componentCount = entries.filter((e) => !e.isProduct).length;

  const stats = useMemo<Stats>(
    () => (loaded && activeSubmodel ? computeStats(activeSubmodel) : EMPTY_STATS),
    [loaded, activeSubmodel],
  );

  const filtering =
    query.trim() !== "" || filters.length > 0 || gapsOnly;

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATENA_X_PCF_MODEL.map((section) => {
      const meta = SECTION_META[section.icon];
      let total = 0;
      let mapped = 0;
      const subs = section.groups.map((group) => {
        const rows = [];
        for (const field of group.fields) {
          const g = REQUIREMENT_META[field.requirement].group;
          const value = loaded
            ? formatFieldValue(getValueByPath(activeSubmodel, field.key))
            : null;
          const isEmpty = value === null;
          const isGap = g === "mandatory" && isEmpty;
          total += 1;
          if (!isEmpty) mapped += 1;
          const passQ =
            !q ||
            field.label.toLowerCase().includes(q) ||
            (value ?? "").toLowerCase().includes(q);
          const passF = filters.length === 0 || filters.includes(g);
          const passG = !gapsOnly || isGap;
          if (passQ && passF && passG) {
            rows.push({
              key: `${section.icon}|${group.title}|${field.label}`,
              label: field.label,
              condition: field.condition,
              group: g,
              value,
              isEmpty,
              isGap,
            });
          }
        }
        return { name: group.title, rows };
      });
      const visibleSubs = subs.filter((s) => s.rows.length > 0);
      const pct = total ? Math.round((mapped / total) * 100) : 0;
      return {
        icon: section.icon,
        title: section.title,
        desc: section.blurb,
        meta,
        subs: visibleSubs,
        total,
        mapped,
        pct,
        hasVisible: visibleSubs.length > 0,
      };
    });
  }, [activeSubmodel, loaded, query, filters, gapsOnly]);

  const nothingMatches = sections.every((s) => !s.hasVisible);

  const toggleFilter = (g: ReqGroup) =>
    setFilters((cur) =>
      cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g],
    );
  const toggleGroup = (icon: string) =>
    setExpanded((cur) => ({ ...cur, [icon]: !cur[icon] }));

  // Navigate between overview (null) and a component detail, resetting filters.
  const goTo = (id: string | null) => {
    setActiveId(id);
    setQuery("");
    setFilters([]);
    setGapsOnly(false);
    setExpanded({});
  };

  // Download a PDF for whatever is in view: the specific component when drilled
  // in, otherwise every component + the product aggregate (one page each).
  const handleDownload = () => {
    generateCatenaXPdf(activeEntry ? [activeEntry] : entries, requestId);
  };

  const dash = `${((RING_C * stats.pct) / 100).toFixed(1)} ${RING_C.toFixed(1)}`;
  const showBackBar = entries.length > 1;

  return (
    <div className="mb-5 overflow-hidden rounded-[20px] border border-[#e4e9ee] bg-white shadow-[0_10px_30px_-18px_rgba(16,32,24,.35)]">
      {/* Header */}
      <div
        className="relative overflow-hidden px-6 py-[22px] text-white"
        style={{
          background:
            "linear-gradient(125deg,#0c6b3b 0%,#128a4c 55%,#1cb668 100%)",
        }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/[.06]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/[.16]">
                <Network size={22} />
              </span>
              <h2 className="m-0 text-xl font-extrabold tracking-tight">
                Catena-X Semantic PCF Data Model
              </h2>
              <span className="rounded-md bg-white/[.18] px-2 py-1 text-[11px] font-bold tracking-wide">
                v3.0.0
              </span>
            </div>
            <p className="mt-2.5 max-w-xl text-sm font-medium text-white/85">
              Field mapping for the Enviguide &rarr; Catena-X exchange. Track
              what is mapped and spot missing mandatory values before you
              submit.
            </p>
          </div>
          <div className="flex flex-none items-center gap-2">
            {status === "loaded" && (
              <button
                type="button"
                onClick={handleDownload}
                title={
                  activeEntry
                    ? `Download the "${activeEntry.label}" data model as PDF`
                    : "Download all components' data models as PDF"
                }
                className="flex items-center gap-2 rounded-lg bg-white/[.16] px-3 py-2 text-[12.5px] font-bold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25"
              >
                <Download size={15} />
                Download PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading / error */}
      {status !== "loaded" && (
        <div className="flex items-center gap-3 px-6 py-6 text-[13px] font-medium text-[#64748b]">
          {status === "error" ? (
            <>
              <AlertTriangle size={18} className="text-[#f59e0b]" />
              Live values unavailable — restart / reconnect the backend to load
              the Catena-X submodels.
            </>
          ) : (
            <>
              <Loader2 size={18} className="animate-spin text-[#16a34a]" />
              Loading Catena-X submodels…
            </>
          )}
        </div>
      )}

      {/* Overview — component cards */}
      {loaded && activeId === null && (
        <div className="p-6">
          <div className="mb-3.5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#94a3b8]">
            <Boxes size={14} />
            Overview · {componentCount}{" "}
            {componentCount === 1 ? "component" : "components"} in this bill of
            materials
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {entries.map((e) => {
              const st = computeStats(e.submodel);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => goTo(e.id)}
                  className="group flex items-center gap-3.5 rounded-2xl border border-[#eef1f5] bg-white p-3.5 text-left transition-all hover:border-[#cbd5e1] hover:shadow-sm"
                >
                  <MiniRing
                    pct={st.pct}
                    accent={e.isProduct ? "#0c6b3b" : "#16a34a"}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-bold text-[#0f172a]">
                      {e.label}
                    </div>
                    {e.sublabel && (
                      <div className="truncate text-[11.5px] font-medium tabular-nums text-[#94a3b8]">
                        {e.sublabel}
                      </div>
                    )}
                    <div className="mt-1.5">
                      {st.gaps > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fef2f2] px-2 py-[3px] text-[10.5px] font-bold text-[#dc2626]">
                          <AlertTriangle size={11} />
                          {st.gaps} mandatory {st.gaps === 1 ? "gap" : "gaps"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f0fdf4] px-2 py-[3px] text-[10.5px] font-bold text-[#15803d]">
                          <CheckCircle2 size={11} />
                          ready
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="flex-none text-[#cbd5e1] transition-colors group-hover:text-[#94a3b8]"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail — one entry's meter + accordion */}
      {loaded && activeId !== null && activeEntry && (
        <>
          {showBackBar && (
            <div className="flex items-center gap-3 border-b border-[#eef1f5] px-6 py-[11px]">
              <button
                type="button"
                onClick={() => goTo(null)}
                className="flex flex-none items-center gap-1 rounded-lg border border-[#e4e9ee] px-2.5 py-1.5 text-[12px] font-bold text-[#475569] transition-colors hover:bg-[#f8fafc]"
              >
                <ChevronLeft size={14} />
                All components
              </button>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-bold text-[#0f172a]">
                  {activeEntry.label}
                </div>
                {activeEntry.sublabel && (
                  <div className="truncate text-[11.5px] font-medium text-[#94a3b8]">
                    {activeEntry.sublabel}
                  </div>
                )}
              </div>
              <div className="flex flex-none items-center gap-1.5 text-[12px] font-semibold text-[#64748b]">
                <button
                  type="button"
                  disabled={activeIndex <= 0}
                  onClick={() => goTo(entries[activeIndex - 1].id)}
                  className="rounded-md border border-[#e4e9ee] p-1 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="tabular-nums">
                  {activeIndex + 1} / {entries.length}
                </span>
                <button
                  type="button"
                  disabled={activeIndex >= entries.length - 1}
                  onClick={() => goTo(entries[activeIndex + 1].id)}
                  className="rounded-md border border-[#e4e9ee] p-1 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Coverage meter */}
          <div className="border-b border-[#eef1f5] px-6 py-5">
            <div className="flex items-center gap-[22px]">
              <div className="relative h-24 w-24 flex-none">
                <svg
                  width="96"
                  height="96"
                  viewBox="0 0 96 96"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <circle cx="48" cy="48" r={RING_R} fill="none" stroke="#eef1f5" strokeWidth="10" />
                  <circle
                    cx="48"
                    cy="48"
                    r={RING_R}
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={dash}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[22px] font-extrabold tabular-nums text-[#0f172a]">
                    {stats.pct}%
                  </div>
                  <div className="text-[10px] font-semibold tracking-[.06em] text-[#94a3b8]">
                    MAPPED
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-3 text-[13px] font-medium tabular-nums text-[#475569]">
                  <b className="font-bold text-[#0f172a]">{stats.mapped}</b> of{" "}
                  {stats.total} fields carry a value
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {FILTER_ORDER.map((g) => (
                    <div
                      key={g}
                      className="flex items-center gap-2 rounded-[10px] border border-[#eef1f5] px-[11px] py-[9px]"
                    >
                      <span
                        className="h-[9px] w-[9px] rounded-full"
                        style={{ background: STATUS[g].dot }}
                      />
                      <span className="text-[15px] font-bold tabular-nums text-[#0f172a]">
                        {stats[g]}
                      </span>
                      <span className="text-[12px] font-medium text-[#64748b]">
                        {STATUS[g].label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {stats.gaps > 0 ? (
              <button
                type="button"
                onClick={() => setGapsOnly((v) => !v)}
                className="mt-3.5 flex w-full items-center gap-[11px] rounded-xl border px-3.5 py-3 text-left transition-colors"
                style={{
                  borderColor: gapsOnly ? "#fecaca" : "#eef1f5",
                  background: gapsOnly ? "#fef2f2" : "#fff",
                }}
              >
                <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg bg-[#fee2e2]">
                  <AlertTriangle size={15} className="text-[#dc2626]" />
                </span>
                <span className="flex-1">
                  <span className="text-[13.5px] font-bold tabular-nums text-[#0f172a]">
                    {stats.gaps} mandatory fields still missing values
                  </span>
                  <br />
                  <span className="text-[12px] font-medium text-[#64748b]">
                    {gapsOnly
                      ? "Filtered to mandatory fields without a value"
                      : "Tap to isolate the fields blocking submission"}
                  </span>
                </span>
                <span
                  className="text-[11.5px] font-bold"
                  style={{ color: gapsOnly ? "#dc2626" : "#94a3b8" }}
                >
                  {gapsOnly ? "Showing gaps ✓" : "Show only →"}
                </span>
              </button>
            ) : (
              <div className="mt-3.5 flex items-center gap-[11px] rounded-xl border border-[#d1fae5] bg-[#f0fdf4] px-3.5 py-3">
                <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg bg-[#dcfce7]">
                  <CheckCircle2 size={16} className="text-[#16a34a]" />
                </span>
                <span className="text-[13.5px] font-bold text-[#065f46]">
                  All mandatory fields have values
                </span>
              </div>
            )}
          </div>

          {/* Sovereignty strip */}
          <div className="px-6 pt-3.5">
            <div className="flex items-center gap-[11px] rounded-xl border border-[#d1fae5] bg-[linear-gradient(90deg,#ecfdf5,#f0fdf4)] px-3.5 py-[11px]">
              <ShieldCheck size={16} className="flex-none text-[#059669]" />
              <div className="flex-1 text-[12px] font-semibold text-[#065f46]">
                Data sovereignty — offered under policy, never pushed. Restricted
                to an authorised BPN · revocable anytime.
              </div>
              <button
                type="button"
                onClick={() => setSovOpen((v) => !v)}
                className="flex flex-none items-center gap-1 text-[11.5px] font-bold text-[#059669]"
              >
                How it travels
                <ChevronDown
                  size={13}
                  className={`transition-transform ${sovOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>
            {sovOpen && (
              <div className="px-0.5 pb-1 pt-3.5">
                <div className="flex items-stretch">
                  {SOV_STEPS.map((st) => (
                    <div key={st.n} className="relative flex-1 px-1.5">
                      <div className="mb-1.5 flex items-center gap-[7px]">
                        <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#dcfce7] text-[11px] font-bold text-[#15803d]">
                          {st.n}
                        </span>
                        <span className="text-[12px] font-bold text-[#0f172a]">
                          {st.title}
                        </span>
                      </div>
                      <div className="text-[11px] leading-[1.4] font-medium text-[#64748b]">
                        {st.sub}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SOV_POINTS.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#d1fae5] bg-[#f0fdf4] px-2.5 py-[5px] text-[11px] font-medium text-[#065f46]"
                    >
                      <Check size={12} strokeWidth={3} className="text-[#16a34a]" />
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-[9px] px-6 pb-1 pt-4">
            <div className="relative min-w-[190px] flex-1">
              <Search
                size={15}
                className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fields or values…"
                className="w-full rounded-[10px] border border-[#dfe4ea] py-[9px] pl-[33px] pr-3 text-[13px] font-medium text-[#0f172a] outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/[.12]"
              />
            </div>
            {FILTER_ORDER.map((g) => {
              const active = filters.includes(g);
              const s = STATUS[g];
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleFilter(g)}
                  className="inline-flex items-center gap-1.5 rounded-[9px] border px-[11px] py-1.5 text-[12px] font-semibold transition-colors"
                  style={{
                    borderColor: active ? s.dot : "#e4e9ee",
                    background: active ? s.tagBg : "#fff",
                    color: active ? s.tagText : "#64748b",
                    boxShadow: active ? `0 0 0 1px ${s.dot} inset` : undefined,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: s.dot }}
                  />
                  {s.label}
                  <span className="tabular-nums opacity-60">{stats[g]}</span>
                </button>
              );
            })}
          </div>

          {/* Accordion */}
          <div className="px-4 pb-[18px] pt-2">
            {sections.map((sec) => {
              if (!sec.hasVisible) return null;
              const open = filtering ? sec.hasVisible : !!expanded[sec.icon];
              return (
                <div
                  key={sec.icon}
                  className="my-2 overflow-hidden rounded-[14px] border border-[#eef1f5]"
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(sec.icon)}
                    className="flex w-full items-center gap-3 bg-[#fafbfc] px-[15px] py-3.5 text-left"
                  >
                    <span
                      className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] text-[13px] font-bold"
                      style={{
                        background: sec.meta.accentBg,
                        color: sec.meta.accent,
                      }}
                    >
                      {sec.meta.short}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold text-[#0f172a]">
                        {sec.title}
                      </span>
                      <span className="block truncate text-[11.5px] font-medium text-[#94a3b8]">
                        {sec.desc}
                      </span>
                    </span>
                    <span className="hidden flex-col items-end gap-[5px] sm:flex">
                      <span className="text-[11.5px] font-semibold tabular-nums text-[#475569]">
                        {sec.mapped}/{sec.total} mapped
                      </span>
                      <span className="block h-[5px] w-[70px] overflow-hidden rounded bg-[#eef1f5]">
                        <span
                          className="block h-full bg-[#16a34a]"
                          style={{ width: `${sec.pct}%` }}
                        />
                      </span>
                    </span>
                    <ChevronDown
                      size={15}
                      className={`flex-none text-[#94a3b8] transition-transform ${open ? "" : "-rotate-90"}`}
                    />
                  </button>

                  {open && (
                    <div className="px-[15px] pb-3 pt-0.5">
                      {sec.subs.map((sub) => (
                        <div key={sub.name} className="mt-2.5">
                          <div className="px-0 py-1 text-[10px] font-bold uppercase tracking-[.09em] text-[#94a3b8]">
                            {sub.name}
                          </div>
                          {sub.rows.map((f) => {
                            const s = STATUS[f.group];
                            let displayText: string;
                            let displayColor: string;
                            if (!f.isEmpty) {
                              displayText = f.value as string;
                              displayColor = "#0f172a";
                            } else if (f.isGap) {
                              displayText = "Missing — required";
                              displayColor = "#dc2626";
                            } else {
                              displayText = "Not set";
                              displayColor = "#b6bfca";
                            }
                            return (
                              <div
                                key={f.key}
                                className="grid grid-cols-[9px_1fr_auto] items-center gap-3 border-t border-[#f4f6f9] px-0.5 py-[9px]"
                              >
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ background: s.dot }}
                                />
                                <div className="min-w-0">
                                  <div className="text-[12.5px] font-semibold text-[#0f172a]">
                                    {f.label}
                                  </div>
                                  <div
                                    title={displayText}
                                    className="mt-0.5 truncate text-[12px] font-medium tabular-nums"
                                    style={{ color: displayColor }}
                                  >
                                    {displayText}
                                  </div>
                                </div>
                                <span
                                  title={f.condition || undefined}
                                  className="whitespace-nowrap rounded-md px-2 py-[3px] text-[9.5px] font-bold uppercase tracking-wide"
                                  style={{ background: s.tagBg, color: s.tagText }}
                                >
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {nothingMatches && (
              <div className="py-[34px] text-center text-[13px] font-medium text-[#94a3b8]">
                No fields match your search or filters.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
