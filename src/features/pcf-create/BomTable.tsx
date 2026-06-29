import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Package,
  User,
  Leaf,
  MapPin,
  Factory,
  Tag,
  FileText,
  Scale,
  Banknote,
  ClipboardList,
} from "lucide-react";

interface BomTableProps {
  bomData: any[];
  readOnly?: boolean;
  showCalculatedEmissions?: boolean; // When true, uses actual emission data from pcf_total_emission_calculation
  variant?: "default" | "detail"; // "detail" matches the D2 results design (no Price col, bar-chart expand, strip footer)
  onExpandedChange?: (anyExpanded: boolean) => void; // fired when row expand/collapse changes
}

const BomTable: React.FC<BomTableProps> = ({
  bomData,
  readOnly = false,
  showCalculatedEmissions = false,
  variant = "default",
  onExpandedChange,
}) => {
  const isDetail = variant === "detail";
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (key: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(key)) {
      newExpandedRows.delete(key);
    } else {
      newExpandedRows.add(key);
    }
    setExpandedRows(newExpandedRows);
    onExpandedChange?.(newExpandedRows.size > 0);
  };

  const calculateTotals = () => {
    return bomData.reduce(
      (acc, item) => {
        const weight = parseFloat(item.totalWeight || item.weight || "0");
        const cost = parseFloat(item.totalPrice || item.price || "0");
        // Use calculated emissions when available
        const emission = showCalculatedEmissions && item.pcf_total_emission_calculation
          ? (item.pcf_total_emission_calculation.total_pcf_value || 0)
          : parseFloat(item.emission || "0");

        return {
          totalWeight: acc.totalWeight + (isNaN(weight) ? 0 : weight),
          totalCost: acc.totalCost + (isNaN(cost) ? 0 : cost),
          totalEmission: acc.totalEmission + (isNaN(emission) ? 0 : emission),
        };
      },
      { totalWeight: 0, totalCost: 0, totalEmission: 0 }
    );
  };

  const totals = calculateTotals();

  // Per-stage emission rows for the expanded view (Materials/Production/Packaging/Logistics/Waste)
  const getEmissionRows = (item: any) => {
    const emissionCalc = item.pcf_total_emission_calculation;
    const hasCalculatedData = showCalculatedEmissions && emissionCalc;
    const totalEmission = hasCalculatedData
      ? (emissionCalc.total_pcf_value || 0)
      : parseFloat(item.emission || "0");
    const emissionRows = hasCalculatedData
      ? [
          { label: "Materials", value: emissionCalc.material_value || 0 },
          { label: "Production", value: emissionCalc.production_value || 0 },
          { label: "Packaging", value: emissionCalc.packaging_value || 0 },
          { label: "Logistics", value: emissionCalc.logistic_value || 0 },
          { label: "Waste", value: emissionCalc.waste_value || 0 },
        ]
      : [
          { label: "Materials", value: totalEmission * 0.5 },
          { label: "Production", value: totalEmission * 0.2 },
          { label: "Packaging", value: totalEmission * 0.1 },
          { label: "Logistics", value: totalEmission * 0.15 },
          { label: "Waste", value: totalEmission * 0.05 },
        ];
    return { emissionRows, totalEmission };
  };

  if (bomData.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white border-2 border-dashed border-gray-200 rounded-2xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
          <ClipboardList className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium mb-1">No BOM data available</p>
        <p className="text-sm text-gray-400">Import a CSV file to add components</p>
      </div>
    );
  }

  // Column spans (detail layout drops the Price column to match the D2 design)
  const col = isDetail
    ? { name: "col-span-7", mat: "col-span-5", qty: "col-span-2", wt: "col-span-4", em: "col-span-3", st: "col-span-3" }
    : { name: "col-span-6", mat: "col-span-4", qty: "col-span-2", wt: "col-span-3", em: "col-span-3", st: "col-span-3" };

  const tableCard = (
    <div
      className={`border border-gray-200 overflow-hidden shadow-sm ${
        isDetail ? "rounded-[14px]" : "rounded-2xl flex flex-col"
      }`}
      style={isDetail ? undefined : { height: "500px" }}
    >
      {/* Table Header */}
      <div
        className={`bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 ${
          isDetail ? "" : "sticky top-0 z-10 flex-shrink-0"
        }`}
      >
        <div className="grid grid-cols-24 gap-2 font-semibold text-xs text-white/90 uppercase tracking-wider">
          <div className={`${col.name} pl-8`}>{isDetail ? "Component" : "Component Name"}</div>
          <div className={col.mat}>{isDetail ? "Material No." : "Material Number"}</div>
          <div className={`${col.qty} text-center`}>Qty</div>
          <div className={`${col.wt} text-right`}>{isDetail ? "Weight" : "Weight (g)"}</div>
          {!isDetail && <div className="col-span-3 text-right">Price</div>}
          <div className={`${col.em} text-right`}>Emission</div>
          <div className={`${col.st} text-center`}>Status</div>
        </div>
      </div>

      {/* Table Body */}
      <div className={`bg-white divide-y divide-gray-100 ${isDetail ? "" : "flex-1 overflow-y-auto"}`}>
        {bomData.map((item) => {
          const isExpanded = expandedRows.has(item.key || item.id);
          return (
            <div key={item.key || item.id} className="transition-all duration-200">
              {/* Main Row */}
              <div
                className={`px-6 py-4 cursor-pointer transition-all duration-200 ${
                  isExpanded
                    ? "bg-green-50 border-l-4 border-green-500"
                    : "hover:bg-gray-50 border-l-4 border-transparent"
                }`}
                onClick={() => toggleRowExpansion(item.key || item.id)}
              >
                <div className="grid grid-cols-24 gap-2 items-center text-sm">
                  <div className={`${col.name} flex items-center gap-3`}>
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                        isExpanded
                          ? "bg-green-200 text-green-700"
                          : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                      }`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`font-medium truncate ${isExpanded ? "text-green-900" : "text-gray-900"}`}>
                      {item.componentName || "-"}
                    </span>
                  </div>
                  <div className={col.mat}>
                    <span className="text-gray-600 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {item.materialNumber || "-"}
                    </span>
                  </div>
                  <div className={`${col.qty} text-center`}>
                    <span className="text-gray-900 font-medium">{item.quantity || "-"}</span>
                  </div>
                  <div className={`${col.wt} text-right`}>
                    <span className="text-gray-900">
                      {parseFloat(item.totalWeight || item.weight || "0").toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {!isDetail && (
                    <div className="col-span-3 text-right">
                      <span className="text-gray-900">
                        ₹{parseFloat(item.totalPrice || item.price || "0").toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  <div className={`${col.em} text-right`}>
                    <span className="text-gray-900">
                      {(() => {
                        const emissionValue = showCalculatedEmissions && item.pcf_total_emission_calculation
                          ? item.pcf_total_emission_calculation.total_pcf_value
                          : parseFloat(item.emission || "0");
                        return emissionValue
                          ? emissionValue.toLocaleString("en-US", {
                              minimumFractionDigits: 4,
                              maximumFractionDigits: 4,
                            })
                          : "-";
                      })()}
                    </span>
                  </div>
                  <div className={`${col.st} text-center`}>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.questionerStatus === "Completed"
                          ? "bg-green-100 text-green-700 ring-1 ring-green-600/20"
                          : "bg-amber-100 text-amber-700 ring-1 ring-amber-600/20"
                      }`}
                    >
                      {item.questionerStatus || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded &&
                (isDetail ? (
                  // ---- Detail layout: Component Details + Emissions Graph (bar chart) ----
                  <div className="px-6 pb-6 pt-3 bg-gradient-to-b from-green-50/50 to-white border-t border-green-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Component Details Card */}
                      <div className="bg-white p-5 rounded-[14px] border border-[#EEF1F5] shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 bg-[#ECFDF3] rounded-[10px] flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#16A34A]" />
                          </div>
                          <h4 className="text-sm font-extrabold text-gray-900">Component Details</h4>
                        </div>
                        <div className="flex flex-col">
                          {[
                            { icon: Tag, label: "Category", value: item.category },
                            { icon: FileText, label: "Description", value: item.detailedDescription },
                            { icon: MapPin, label: "Location", value: item.productionLocation },
                            { icon: Factory, label: "Manufacturer", value: item.manufacturer },
                          ].map((r, i, arr) => (
                            <div
                              key={r.label}
                              className={`flex items-center justify-between gap-3 text-sm py-2.5 ${
                                i < arr.length - 1 ? "border-b border-[#F1F5F9]" : ""
                              }`}
                            >
                              <span className="text-gray-400 font-semibold flex items-center gap-1.5 flex-shrink-0">
                                <r.icon className="w-3.5 h-3.5" />
                                {r.label}
                              </span>
                              <span
                                className="text-gray-800 font-bold text-right max-w-[160px] truncate"
                                title={r.value}
                              >
                                {r.value || "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Emissions Graph Card (vertical bar chart) */}
                      <div className="bg-white p-5 rounded-[14px] border border-[#EEF1F5] shadow-sm">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-9 h-9 bg-[#ECFDF3] rounded-[10px] flex items-center justify-center">
                            <Leaf className="w-4 h-4 text-[#16A34A]" />
                          </div>
                          <h4 className="text-sm font-extrabold text-gray-900">Emissions Graph</h4>
                        </div>
                        <div className="text-[11.5px] text-gray-400 mb-4 ml-12">
                          Carbon emission by stage (kg CO₂e)
                        </div>
                        {(() => {
                          const { emissionRows, totalEmission } = getEmissionRows(item);
                          const maxVal = Math.max(...emissionRows.map((r) => r.value), 0.0000001);
                          return (
                            <>
                              <div className="flex items-end gap-3.5 h-[182px] px-1 border-b-2 border-[#EEF1F5]">
                                {emissionRows.map((r) => (
                                  <div
                                    key={r.label}
                                    className="flex-1 flex flex-col items-center justify-end h-full"
                                  >
                                    <div className="text-xs font-extrabold text-[#15803D] mb-1.5">
                                      {r.value.toFixed(4)}
                                    </div>
                                    <div
                                      className="w-full max-w-[44px] rounded-t-md"
                                      style={{
                                        height: `${Math.max((r.value / maxVal) * 150, 4)}px`,
                                        background: "linear-gradient(180deg,#22C55E,#15803D)",
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-3.5 mt-2 px-1">
                                {emissionRows.map((r) => (
                                  <div
                                    key={r.label}
                                    className="flex-1 text-center text-[11px] font-semibold text-[#64748B]"
                                  >
                                    {r.label}
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-[#EEF1F5]">
                                <span className="text-[13.5px] font-extrabold text-gray-900">Total</span>
                                <span className="text-[15px] font-extrabold text-[#15803D]">
                                  {totalEmission.toFixed(4)} kgCO₂e
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  // ---- Default layout: Component Details + Supplier + Emissions Breakdown ----
                  <div className="px-6 pb-6 pt-3 bg-gradient-to-b from-green-50/50 to-white border-t border-green-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Component Details Card */}
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-green-600" />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900">Component Details</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5" />
                              Category
                            </span>
                            <span className="text-gray-900 font-medium text-right">{item.category || "-"}</span>
                          </div>
                          <div className="flex items-start justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" />
                              Description
                            </span>
                            <span className="text-gray-900 font-medium text-right max-w-[140px] truncate" title={item.detailedDescription}>
                              {item.detailedDescription || "-"}
                            </span>
                          </div>
                          <div className="flex items-start justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              Location
                            </span>
                            <span className="text-gray-900 font-medium text-right">{item.productionLocation || "-"}</span>
                          </div>
                          <div className="flex items-start justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-1.5">
                              <Factory className="w-3.5 h-3.5" />
                              Manufacturer
                            </span>
                            <span className="text-gray-900 font-medium text-right">{item.manufacturer || "-"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Supplier Card */}
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900">Supplier Information</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Supplier Name</span>
                            <span className="text-gray-900 font-medium">{item.supplierName || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Email</span>
                            <span className="text-gray-900 font-medium truncate max-w-[140px]" title={item.supplierEmail}>
                              {item.supplierEmail || "-"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Phone</span>
                            <span className="text-gray-900 font-medium">{item.supplierNumber || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Questionnaire</span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.questionerStatus === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {item.questionerStatus || "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Emissions Breakdown Card */}
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Leaf className="w-4 h-4 text-emerald-600" />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900">Emissions Breakdown</h4>
                        </div>
                        <div className="space-y-2">
                          {(() => {
                            const { emissionRows, totalEmission } = getEmissionRows(item);
                            return emissionRows.map((row) => {
                              const percentage = totalEmission > 0 ? (row.value / totalEmission * 100) : 0;
                              return (
                                <div key={row.label} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">{row.label}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-gray-900 font-medium w-20 text-right">
                                      {row.value.toFixed(4)} kg
                                    </span>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                          <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-sm">
                            <span className="text-gray-700 font-medium">Total</span>
                            <span className="text-emerald-600 font-semibold">
                              {(showCalculatedEmissions && item.pcf_total_emission_calculation
                                ? item.pcf_total_emission_calculation.total_pcf_value
                                : parseFloat(item.emission || "0")
                              ).toFixed(4)} kgCO₂e
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      {/* Footer Totals — default layout only (sticky inside the scroll box) */}
      {!isDetail && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 sticky bottom-0 z-10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Components</p>
                <p className="text-lg font-bold text-gray-900">{bomData.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-200">
                <Scale className="w-4 h-4 text-gray-400" />
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Weight</p>
                  <p className="font-semibold text-gray-900">
                    {totals.totalWeight.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} g
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-200">
                <Banknote className="w-4 h-4 text-gray-400" />
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Cost</p>
                  <p className="font-semibold text-gray-900">
                    ₹{totals.totalCost.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <Leaf className="w-4 h-4 text-emerald-500" />
                <div className="text-right">
                  <p className="text-xs text-emerald-600">Total Emission</p>
                  <p className="font-semibold text-emerald-700">
                    {totals.totalEmission.toLocaleString("en-US", {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4,
                    })} kgCO₂e
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isDetail) {
    return tableCard;
  }

  // Detail layout: auto-height table card + separate 3-metric footprint strip (matches D2 design)
  return (
    <div className="flex flex-col gap-4">
      {tableCard}
      <div className="flex flex-wrap gap-4 bg-[#F8FAFB] border border-[#EEF1F5] rounded-[14px] px-5 py-4">
        <div className="flex items-center gap-3 flex-1 min-w-[150px]">
          <div className="w-9 h-9 rounded-[10px] bg-[#ECFDF3] flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-semibold">Components</div>
            <div className="text-base font-extrabold text-gray-900">{bomData.length}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-[150px]">
          <div className="w-9 h-9 rounded-[10px] bg-[#EFF5FF] flex items-center justify-center flex-shrink-0">
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-semibold">Total Weight</div>
            <div className="text-base font-extrabold text-gray-900">
              {totals.totalWeight.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} g
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-[150px]">
          <div className="w-9 h-9 rounded-[10px] bg-[#FFF4EC] flex items-center justify-center flex-shrink-0">
            <Banknote className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-semibold">Total Cost</div>
            <div className="text-base font-extrabold text-gray-900">
              ₹{totals.totalCost.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BomTable;
