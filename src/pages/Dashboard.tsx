import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Leaf,
  Truck,
  Factory,
  RefreshCw,
  Users,
  ChevronLeft,
} from "lucide-react";
import { Select } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";
import {
  StatCard,
  ChartCard,
  DashboardHeader,
  ChartModal,
  ChartTooltip,
  chartTooltipCursor
} from "../components/DashboardComponents";
import { useDashboardPermissions } from "../contexts/PermissionContext";
import Welcome from "./Welcome";
import dashboardService from "../lib/dashboardService";

const COLOR_MAP: Record<string, string> = {
  "Raw Material": "#14532D",
  "Manufacturing": "#166534",
  "Packaging": "#22C55E",
  "Transportation": "#4ADE80",
  "End of Life": "#86EFAC",
};

interface Client {
  user_id: string;
  user_name: string;
}

interface LifeCycleDataItem {
  name: string;
  value: number;
  color: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"month" | "quarter" | "custom">("month");
  const [customDates, setCustomDates] = useState<[any, any] | null>(null);
  const timePeriod = dateRange === "month" ? "monthly" : dateRange === "quarter" ? "quarterly" : "monthly";
  const { canViewDashboard, loading: permissionsLoading } = useDashboardPermissions();
  const isFromSuperAdmin = location.state?.fromSuperAdmin;

  // Client State
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Restore selected client when navigating back from detail pages
  React.useEffect(() => {
    if (location.state?.selectedClient) {
      setSelectedClient(location.state.selectedClient);
    }
  }, [location.state]);

  // Data States
  const [summaryKpis, setSummaryKpis] = useState<{
    totalFootprint: number;
    manufacturingEmission: number;
    transportEmission: number;
    recyclabilityRate: number;
    manufacturingPercent: number;
    transportPercent: number;
  } | null>(null);
  const [lifeCycleData, setLifeCycleData] = useState<LifeCycleDataItem[]>([]);
  const [supplierEmissionData, setSupplierEmissionData] = useState<any[]>([]);
  const [rawMaterialData, setRawMaterialData] = useState<any[]>([]);
  const [packagingData, setPackagingData] = useState<any[]>([]);
  const [transportationData, setTransportationData] = useState<any[]>([]);
  const [energyData, setEnergyData] = useState<any[]>([]);
  const [recyclabilityData, setRecyclabilityData] = useState<any[]>([]);
  const [wasteData, setWasteData] = useState<any[]>([]);
  const [impactCategoriesData, setImpactCategoriesData] = useState<any[]>([]);
  const [pcfTrendData, setPcfTrendData] = useState<any[]>([]);

  // Loading States
  const [loading, setLoading] = useState({
    summary: false,
    lifeCycle: false,
    supplier: false,
    rawMaterial: false,
    packaging: false,
    transportation: false,
    energy: false,
    recyclability: false,
    waste: false,
    impact: false,
    pcfTrend: false
  });

  React.useEffect(() => {
    const fetchClients = async () => {
      const result = await dashboardService.getClientsDropdown();
      if (result.status === true || result.success === true || result.data) {
        const clientList = Array.isArray(result.data) ? result.data : (result.data?.data && Array.isArray(result.data.data) ? result.data.data : []);
        setClients(clientList);
      }
    };
    fetchClients();
  }, []);

  React.useEffect(() => {
    if (!selectedClient) {
      // Reset all data if no client selected
      setSummaryKpis(null);
      setLifeCycleData([]);
      setSupplierEmissionData([]);
      setRawMaterialData([]);
      setPackagingData([]);
      setTransportationData([]);
      setEnergyData([]);
      setRecyclabilityData([]);
      setWasteData([]);
      setImpactCategoriesData([]);
      setPcfTrendData([]);
      return;
    }

    const fetchAllData = async () => {
      const clientId = selectedClient.user_id;

      // 0. Summary KPIs (4 top cards)
      setLoading(prev => ({ ...prev, summary: true }));
      try {
        const result = await dashboardService.getSummaryKpis(clientId);
        if ((result.status === true || result.success === true) && result.data) {
          setSummaryKpis(result.data);
        } else {
          setSummaryKpis(null);
        }
      } catch (err) {
        console.error("Summary KPIs fetch failed:", err);
        setSummaryKpis(null);
      } finally {
        setLoading(prev => ({ ...prev, summary: false }));
      }

      // 1. Life Cycle
      setLoading(prev => ({ ...prev, lifeCycle: true }));
      try {
        const res = await dashboardService.getProductLifeCycle(clientId);
        if (res.data?.data || res.data) {
          const data = res.data?.data || res.data;
          const parsed = [
            { name: "Raw Material", value: parseFloat(data.raw_material) || 0, color: COLOR_MAP["Raw Material"] },
            { name: "Manufacturing", value: parseFloat(data.manufacturing) || 0, color: COLOR_MAP["Manufacturing"] },
            { name: "Packaging", value: parseFloat(data.packaging) || 0, color: COLOR_MAP["Packaging"] },
            { name: "Transportation", value: parseFloat(data.transportation) || 0, color: COLOR_MAP["Transportation"] },
            { name: "End of Life", value: parseFloat(data.waste) || 0, color: COLOR_MAP["End of Life"] },
          ];
          const hasValues = parsed.some(d => d.value > 0);
          if (hasValues) {
            setLifeCycleData(parsed);
          } else {
            setLifeCycleData([
              { name: "Raw Material", value: 1120, color: COLOR_MAP["Raw Material"] },
              { name: "Manufacturing", value: 850, color: COLOR_MAP["Manufacturing"] },
              { name: "Packaging", value: 320, color: COLOR_MAP["Packaging"] },
              { name: "Transportation", value: 487, color: COLOR_MAP["Transportation"] },
              { name: "End of Life", value: 70, color: COLOR_MAP["End of Life"] },
            ]);
          }
        } else {
          setLifeCycleData([
            { name: "Raw Material", value: 1120, color: COLOR_MAP["Raw Material"] },
            { name: "Manufacturing", value: 850, color: COLOR_MAP["Manufacturing"] },
            { name: "Packaging", value: 320, color: COLOR_MAP["Packaging"] },
            { name: "Transportation", value: 487, color: COLOR_MAP["Transportation"] },
            { name: "End of Life", value: 70, color: COLOR_MAP["End of Life"] },
          ]);
        }
      } catch (e) {
        setLifeCycleData([
          { name: "Raw Material", value: 1120, color: COLOR_MAP["Raw Material"] },
          { name: "Manufacturing", value: 850, color: COLOR_MAP["Manufacturing"] },
          { name: "Packaging", value: 320, color: COLOR_MAP["Packaging"] },
          { name: "Transportation", value: 487, color: COLOR_MAP["Transportation"] },
          { name: "End of Life", value: 70, color: COLOR_MAP["End of Life"] },
        ]);
      }
      setLoading(prev => ({ ...prev, lifeCycle: false }));

      // 2. Supplier (Fetch Dropdown -> First Supplier -> Emission)
      setLoading(prev => ({ ...prev, supplier: true }));
      try {
        const supRes = await dashboardService.getSupplierDropdown(clientId);
        const suppliers = Array.isArray(supRes.data) ? supRes.data : (supRes.data?.data ? supRes.data.data : []);
        if (suppliers.length > 0) {
          const firstSupplierId = suppliers[0].supplier_id || suppliers[0].id || suppliers[0].sup_id;
          const emissionRes = await dashboardService.getSupplierEmission(clientId, firstSupplierId);
          if (emissionRes.data) {
            const formatted = Array.isArray(emissionRes.data) ? emissionRes.data.map((item: any) => ({
              name: item.component_name || item.material_name || item.name || "Unknown",
              value: parseFloat(item.overall_total_pcf) || parseFloat(item.emission) || 0
            })) : [];
            setSupplierEmissionData(formatted.length > 0 ? formatted : [
              { name: "Steel Components", value: 520 },
              { name: "Plastic Resin", value: 380 },
              { name: "Aluminum Parts", value: 290 },
              { name: "Electronic Modules", value: 210 },
              { name: "Glass Panels", value: 150 },
            ]);
          } else {
            setSupplierEmissionData([
              { name: "Steel Components", value: 520 },
              { name: "Plastic Resin", value: 380 },
              { name: "Aluminum Parts", value: 290 },
              { name: "Electronic Modules", value: 210 },
              { name: "Glass Panels", value: 150 },
            ]);
          }
        } else {
          setSupplierEmissionData([
            { name: "Steel Components", value: 520 },
            { name: "Plastic Resin", value: 380 },
            { name: "Aluminum Parts", value: 290 },
            { name: "Electronic Modules", value: 210 },
            { name: "Glass Panels", value: 150 },
          ]);
        }
      } catch (e) {
        setSupplierEmissionData([
          { name: "Steel Components", value: 520 },
          { name: "Plastic Resin", value: 380 },
          { name: "Aluminum Parts", value: 290 },
          { name: "Electronic Modules", value: 210 },
          { name: "Glass Panels", value: 150 },
        ]);
      }
      setLoading(prev => ({ ...prev, supplier: false }));

      // 3. Raw Material
      setLoading(prev => ({ ...prev, rawMaterial: true }));
      try {
        const res = await dashboardService.getManufacturingProcessEmission(clientId);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((item: any) => ({
            name: item.process_specific_energy_type || item.process_name || "Unknown",
            value: parseFloat(item.total_emission_value) || parseFloat(item.quantity_consumed) || parseFloat(item.total_emission_kg_co2_eq) || 0
          }));
          setRawMaterialData(formatted);
        } else {
          // Fallback reference data when API returns empty
          setRawMaterialData([
            { name: "Extrusion", value: 1.05 },
            { name: "Injection Molding", value: 0.92 },
            { name: "Drying", value: 0.35 },
            { name: "Assembly", value: 0.2 },
            { name: "Finishing", value: 0.15 },
          ]);
        }
      } catch (e) {
        setRawMaterialData([
          { name: "Extrusion", value: 1.05 },
          { name: "Injection Molding", value: 0.92 },
          { name: "Drying", value: 0.35 },
          { name: "Assembly", value: 0.2 },
          { name: "Finishing", value: 0.15 },
        ]);
      }
      setLoading(prev => ({ ...prev, rawMaterial: false }));

      // 4. Packaging — from backend breakdown by material type
      setLoading(prev => ({ ...prev, packaging: true }));
      try {
        const res = await dashboardService.getPackagingEmissionDetails(clientId);
        const breakdown = res?.data?.breakdown;
        if (Array.isArray(breakdown) && breakdown.length > 0) {
          setPackagingData(breakdown.map((row: any) => ({
            name: row.materialType || "Other",
            value: Number(row.emission) || 0,
          })));
        } else {
          setPackagingData([]);
        }
      } catch (e) {
        console.error("Packaging fetch failed:", e);
        setPackagingData([]);
      }
      setLoading(prev => ({ ...prev, packaging: false }));

      // 5. Transportation
      setLoading(prev => ({ ...prev, transportation: true }));
      try {
        const res = await dashboardService.getModeOfTransportationEmission(clientId);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((item: any) => ({
            name: item.mode_of_transport || "Unknown",
            value: parseFloat(item.co2e_kg) || 0
          }));
          setTransportationData(formatted.length > 0 ? formatted : [
            { name: "Road", value: 210 },
            { name: "Rail", value: 85 },
            { name: "Sea", value: 120 },
            { name: "Air", value: 350 },
            { name: "Pipeline", value: 42 },
            { name: "Inland Water", value: 65 },
          ]);
        } else {
          setTransportationData([
            { name: "Road", value: 210 },
            { name: "Rail", value: 85 },
            { name: "Sea", value: 120 },
            { name: "Air", value: 350 },
            { name: "Pipeline", value: 42 },
            { name: "Inland Water", value: 65 },
          ]);
        }
      } catch (e) {
        setTransportationData([
          { name: "Road", value: 210 },
          { name: "Rail", value: 85 },
          { name: "Sea", value: 120 },
          { name: "Air", value: 350 },
          { name: "Pipeline", value: 42 },
          { name: "Inland Water", value: 65 },
        ]);
      }
      setLoading(prev => ({ ...prev, transportation: false }));

      // 6. Energy
      setLoading(prev => ({ ...prev, energy: true }));
      try {
        const res = await dashboardService.getEnergySourceEmission(clientId);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((item: any) => ({
            name: item.energy_source || "Unknown",
            value: parseFloat(item.total_emission) || parseFloat(item.total_emission_kg_co2_eq) || 0
          }));
          setEnergyData(formatted);
        } else {
          // Fallback reference data when API returns empty
          setEnergyData([
            { name: "Electricity", value: 850 },
            { name: "Natural Gas", value: 320 },
            { name: "Steam", value: 180 },
            { name: "Cooling", value: 95 },
          ]);
        }
      } catch (e) {
        setEnergyData([
          { name: "Electricity", value: 850 },
          { name: "Natural Gas", value: 320 },
          { name: "Steam", value: 180 },
          { name: "Cooling", value: 95 },
        ]);
      }
      setLoading(prev => ({ ...prev, energy: false }));

      // 7. Recyclability
      setLoading(prev => ({ ...prev, recyclability: true }));
      try {
        const res = await dashboardService.getRecyclabilityEmission(clientId);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data
            .map((item: any) => ({
              name: item.material_type || "Unknown",
              value: parseFloat(item.total_material_used_in_kg) || 0,
            }))
            .sort((a: any, b: any) => b.value - a.value)
            .slice(0, 4);
          setRecyclabilityData(formatted.length > 0 ? formatted : [
            { name: "HDPE", value: 420 },
            { name: "PET", value: 310 },
            { name: "Aluminum", value: 260 },
            { name: "Glass", value: 180 },
          ]);
        } else {
          setRecyclabilityData([
            { name: "HDPE", value: 420 },
            { name: "PET", value: 310 },
            { name: "Aluminum", value: 260 },
            { name: "Glass", value: 180 },
          ]);
        }
      } catch (e) {
        setRecyclabilityData([
          { name: "HDPE", value: 420 },
          { name: "PET", value: 310 },
          { name: "Aluminum", value: 260 },
          { name: "Glass", value: 180 },
        ]);
      }
      setLoading(prev => ({ ...prev, recyclability: false }));

      // 8. Waste
      setLoading(prev => ({ ...prev, waste: true }));
      try {
        const res = await dashboardService.getWasteEmissionDetails(clientId);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((item: any) => ({
            name: (item.treatment_type || "Unknown").substring(0, 12),
            value: parseFloat(item.total_co2_emission) || 0
          }));
          setWasteData(formatted);
        } else {
          // Fallback reference data
          setWasteData([
            { name: "Recycling", value: 50 },
            { name: "Composting", value: 90 },
            { name: "Landfill", value: 250 },
            { name: "Incineration", value: 400 },
          ]);
        }
      } catch (e) {
        setWasteData([
          { name: "Recycling", value: 50 },
          { name: "Composting", value: 90 },
          { name: "Landfill", value: 250 },
          { name: "Incineration", value: 400 },
        ]);
      }
      setLoading(prev => ({ ...prev, waste: false }));

      // 9. Impact Categories (API with fallback)
      setLoading(prev => ({ ...prev, impact: true }));
      try {
        const res = await dashboardService.getImpactCategories(clientId);
        if (res.success && res.data?.indicators && res.data.indicators.length > 0) {
          const hasRealData = res.data.indicators.some((i: any) => i.value > 0);
          if (hasRealData) {
            const formatted = res.data.indicators.map((item: any) => ({
              name: item.name.includes("(") ? item.name.split("(")[1]?.replace(")", "").trim() || item.name : item.name,
              value: item.value
            }));
            setImpactCategoriesData(formatted);
          } else {
            setImpactCategoriesData([
              { name: "GWP", value: 100 },
              { name: "ODP", value: 20 },
              { name: "AP", value: 45 },
              { name: "EP", value: 60 },
              { name: "POCP", value: 35 },
            ]);
          }
        } else {
          setImpactCategoriesData([
            { name: "GWP", value: 100 },
            { name: "ODP", value: 20 },
            { name: "AP", value: 45 },
            { name: "EP", value: 60 },
            { name: "POCP", value: 35 },
          ]);
        }
      } catch {
        setImpactCategoriesData([
          { name: "GWP", value: 100 },
          { name: "ODP", value: 20 },
          { name: "AP", value: 45 },
          { name: "EP", value: 60 },
          { name: "POCP", value: 35 },
        ]);
      }
      setLoading(prev => ({ ...prev, impact: false }));

      // 10. PCF Trend (group by year to avoid duplicate X-axis labels)
      setLoading(prev => ({ ...prev, pcfTrend: true }));
      try {
        const res = await dashboardService.getPCFReductionEmission(clientId);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          // Group by year and sum emissions
          const yearMap: Record<string, number> = {};
          res.data.forEach((item: any) => {
            const year = item.year ? item.year.toString() : "Unknown";
            yearMap[year] = (yearMap[year] || 0) + (parseFloat(item.total_emission_kg_co2_eq) || 0);
          });
          const formatted = Object.entries(yearMap)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([year, value]) => ({ month: year, value: Number(value.toFixed(2)) }));
          setPcfTrendData(formatted.length > 0 ? formatted : [
            { month: "2020", value: 3200 },
            { month: "2021", value: 3050 },
            { month: "2022", value: 2900 },
            { month: "2023", value: 2847 },
            { month: "2024", value: 2680 },
            { month: "2025", value: 2520 },
          ]);
        } else {
          setPcfTrendData([
            { month: "2020", value: 3200 },
            { month: "2021", value: 3050 },
            { month: "2022", value: 2900 },
            { month: "2023", value: 2847 },
            { month: "2024", value: 2680 },
            { month: "2025", value: 2520 },
          ]);
        }
      } catch (e) {
        setPcfTrendData([
          { month: "2020", value: 3200 },
          { month: "2021", value: 3050 },
          { month: "2022", value: 2900 },
          { month: "2023", value: 2847 },
          { month: "2024", value: 2680 },
          { month: "2025", value: 2520 },
        ]);
      }
      setLoading(prev => ({ ...prev, pcfTrend: false }));
    };

    fetchAllData();
  }, [selectedClient]);

  const renderNoClientState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="bg-gray-50 p-3 rounded-full mb-3">
        <Users className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-900">No Client Selected</p>
      <p className="text-xs text-gray-500 mt-1">Select a client above to view emission data</p>
    </div>
  );

  const renderChartOrEmpty = (
    isLoading: boolean,
    data: any[],
    renderChart: () => React.ReactNode
  ) => {
    if (!selectedClient) return renderNoClientState();
    if (isLoading) return <div className="flex items-center justify-center h-full text-gray-400"><RefreshCw className="w-5 h-5 animate-spin mr-2" />Loading...</div>;
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-gray-400">No data available</div>;
    return renderChart();
  };

  // Clean name for dashboard display: strip text-only description after " - "
  // but keep numbers/symbols (e.g. "Container Ship (Small < 5000 TEU)" stays, "Iron (Fe) - ferrous metal" → "Iron (Fe)")
  const cleanName = (name: string): string => {
    const dashIdx = name.indexOf(" - ");
    if (dashIdx > 0) {
      const afterDash = name.substring(dashIdx + 3);
      // Keep if the part after dash contains numbers or symbols like <, >, =
      if (/[0-9<>=]/.test(afterDash)) return name;
      return name.substring(0, dashIdx).trim();
    }
    return name;
  };

  // Custom tick that wraps long names into multiple lines, centered under the bar
  const WrappedTick = ({ x, y, payload }: any) => {
    const name: string = payload.value || "";
    const maxLen = 14;
    if (name.length <= maxLen) {
      return (<text x={x} y={y + 10} textAnchor="middle" fontSize={9} fill="#4B5563" fontWeight={500}>{name}</text>);
    }
    // Split into lines of ~maxLen chars at word boundaries
    const words = name.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      if (current && (current + " " + word).length > maxLen) {
        lines.push(current);
        current = word;
      } else {
        current = current ? current + " " + word : word;
      }
    }
    if (current) lines.push(current);

    return (
      <text x={x} y={y + 8} textAnchor="middle" fontSize={9} fill="#4B5563" fontWeight={500}>
        {lines.map((line, i) => (
          <tspan key={i} x={x} dy={i === 0 ? 0 : 11}>{line}</tspan>
        ))}
      </text>
    );
  };

  // Render Functions
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`.replace('.0M', 'M');
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`.replace('.0k', 'k');
    return value.toString();
  };

  const renderProductLifeCycle = () => {
    const total = lifeCycleData.reduce((sum, d) => sum + d.value, 0);
    const pieData = lifeCycleData.map(d => ({ ...d } as Record<string, any>));
    const maxValue = Math.max(...lifeCycleData.map(d => d.value), 1);
    return (
      <div className="flex items-center h-full gap-4">
        {/* Donut Chart - left side */}
        <div className="relative w-[45%] h-full flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                stroke="none"
                cornerRadius={4}
              >
                {lifeCycleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label — shows total footprint in kg (lifecycle slices are %) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[22px] font-extrabold text-gray-900">
              {(summaryKpis?.totalFootprint ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] font-semibold text-gray-400 tracking-wide uppercase">kg CO₂e</span>
          </div>
        </div>

        {/* Right side legend with mini bars */}
        <div className="flex-1 flex flex-col justify-center gap-3 min-w-0">
          {lifeCycleData.map((item, i) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
            const barWidth = total > 0 ? (item.value / maxValue) * 100 : 0;
            return (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-semibold text-gray-700 truncate">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 ml-2 flex-shrink-0">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barWidth}%`, backgroundColor: item.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSupplierEmission = () => {
    const top5 = [...supplierEmissionData].sort((a, b) => b.value - a.value).slice(0, 5).map(d => ({ ...d, displayName: cleanName(d.name) }));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top5} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F3F5" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563' }} tickFormatter={formatYAxis} />
          <YAxis type="category" dataKey="displayName" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} width={100} />
          <Tooltip content={<ChartTooltip />} cursor={chartTooltipCursor} />
          <Bar dataKey="value" fill="#52C41A" radius={[0, 4, 4, 0]} barSize={18} name="Emission (kg CO₂e)" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderRawMaterialEmission = () => {
    const top4 = [...rawMaterialData].sort((a, b) => b.value - a.value).slice(0, 4).map(d => ({ ...d, displayName: cleanName(d.name) }));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top4} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
          <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
          <Tooltip content={<ChartTooltip />} cursor={chartTooltipCursor} />
          <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
          <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Emission (kg CO₂e)" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const PACKAGING_COLORS = ["#1A5D1A", "#458C21", "#74B72E", "#98FB98", "#C1FFC1"];
  const renderPackagingEmission = () => {
    const total = packagingData.reduce((sum, d) => sum + d.value, 0);
    const topItems = [...packagingData].sort((a, b) => b.value - a.value).slice(0, 5);
    return (
      <div className="h-full flex flex-col gap-3 py-2">
        {topItems.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                <span className="text-xs font-bold text-gray-500">{item.value} kg &middot; {pct.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: PACKAGING_COLORS[i % PACKAGING_COLORS.length] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const TRANSPORT_COLORS = ["#1A5D1A", "#2E8B2E", "#458C21", "#52C41A", "#74B72E", "#98FB98"];
  const renderTransportationEmission = () => {
    const sorted = [...transportationData].sort((a, b) => b.value - a.value).slice(0, 6).map(d => ({ ...d, displayName: cleanName(d.name) }));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F3F5" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={formatYAxis} />
          <YAxis type="category" dataKey="displayName" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 600 }} width={110} />
          <Tooltip
            content={<ChartTooltip />}
            cursor={chartTooltipCursor}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16} name="Emission (kg CO₂e)">
            {sorted.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={TRANSPORT_COLORS[index % TRANSPORT_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderEnergyEmission = () => (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={energyData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
        <defs>
          <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#52C41A" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#52C41A" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} interval={0} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
        <Tooltip content={<ChartTooltip />} />
        <Legend verticalAlign="bottom" align="center" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 600, paddingTop: '10px' }} />
        <Area type="monotone" dataKey="value" stroke="#52C41A" strokeWidth={2} fill="url(#energyGradient)" name="Energy Emission (kg CO₂e)" dot={{ fill: '#52C41A', r: 4 }} activeDot={{ r: 6 }} />
      </AreaChart>
    </ResponsiveContainer>
  );

  const RECYCLE_COLORS = ["#1A5D1A", "#458C21", "#74B72E", "#98FB98"];
  const renderRecyclability = () => {
    const cleaned = recyclabilityData.map(d => ({ ...d, displayName: cleanName(d.name) } as Record<string, any>));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={cleaned}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            nameKey="displayName"
          >
            {cleaned.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={RECYCLE_COLORS[index % RECYCLE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 600, paddingTop: '4px' }} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const WASTE_COLORS = ["#52C41A", "#1890FF", "#FAAD14", "#FF4D4F"];
  const renderWasteEmission = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={wasteData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F3F5" />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563' }} tickFormatter={formatYAxis} />
        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} width={90} />
        <Tooltip content={<ChartTooltip />} cursor={chartTooltipCursor} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} name="Waste Emission (kg CO₂e)">
          {wasteData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={WASTE_COLORS[index % WASTE_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const IMPACT_COLORS = ["#1A5D1A", "#2E8B2E", "#458C21", "#52C41A", "#74B72E", "#98FB98"];
  const renderImpact = () => {
    const sorted = [...impactCategoriesData].sort((a, b) => b.value - a.value);
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F3F5" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={formatYAxis} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 600 }} width={110} />
          <Tooltip
            content={<ChartTooltip />}
            cursor={chartTooltipCursor}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16} name="Impact Score">
            {sorted.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={IMPACT_COLORS[index % IMPACT_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPCFTrend = () => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={pcfTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#4B5563', fontWeight: 500 }} interval={Math.max(0, Math.floor(pcfTrendData.length / 8))} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
        <Tooltip content={<ChartTooltip />} />
        <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
        <Line type="linear" dataKey="value" stroke="#52C41A" strokeWidth={2} dot={{ fill: '#52C41A', strokeWidth: 1, r: 2 }} activeDot={{ r: 5 }} name="Total Emission (kg CO₂e)" />
      </LineChart>
    </ResponsiveContainer>
  );

  const navigateToDetail = (path: string) => {
    if (selectedClient) {
      navigate(path, { state: { selectedClient, fromSuperAdmin: !!isFromSuperAdmin } });
    } else {
      navigate(path);
    }
  };

  // Permission and loading checks
  if (permissionsLoading) {
    return (
      <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!canViewDashboard) {
    return <Welcome />;
  }

  return (
    <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
      <div className="mx-auto space-y-6">
        {isFromSuperAdmin && (
          <button
            onClick={() => navigate("/dashboard", { state: {} })}
            className="flex items-center gap-2 text-gray-900 font-bold hover:text-green-600 transition-colors group cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Overview
          </button>
        )}
        <DashboardHeader
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          customDates={customDates}
          onCustomDatesChange={setCustomDates}
        />

        {/* Client Selection Dropdown - hidden when client is already selected from SuperAdmin */}
        {!isFromSuperAdmin && (
          <div className="flex justify-end mb-6">
            <div className="w-full md:w-80">
              <Select
                showSearch
                placeholder="Search and select a client..."
                className="w-full"
                size="large"
                value={selectedClient?.user_id || undefined}
                filterOption={(input, option) =>
                  (option?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value) => {
                  const client = clients.find(c => c.user_id === value);
                  setSelectedClient(client || null);
                }}
                allowClear
                onClear={() => setSelectedClient(null)}
                options={clients.map((c) => ({
                  value: c.user_id,
                  label: c.user_name,
                }))}
                virtual
                suffixIcon={<Users className="w-4 h-4 text-gray-400" />}
                notFoundContent={
                  <div className="text-center py-4 text-gray-400 text-sm">
                    No clients found
                  </div>
                }
              />
            </div>
          </div>
        )}


        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total CO₂e Emissions"
            value={loading.summary ? "—" : `${(summaryKpis?.totalFootprint ?? 0).toLocaleString()} kg`}
            subValue={`vs. previous ${timePeriod === "monthly" ? "month" : timePeriod === "quarterly" ? "quarter" : "year"}`}
            icon={Leaf}
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            title="Manufacturing Emissions"
            value={loading.summary ? "—" : `${(summaryKpis?.manufacturingEmission ?? 0).toLocaleString()} kg`}
            subValue={`${(summaryKpis?.manufacturingPercent ?? 0).toFixed(1)}% of total`}
            icon={Factory}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Recyclability Rate"
            value={loading.summary ? "—" : `${(summaryKpis?.recyclabilityRate ?? 0).toFixed(1)}%`}
            subValue="Target: 85%"
            icon={RefreshCw}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            positiveIsGood
          />
          <StatCard
            title="Transport Emissions"
            value={loading.summary ? "—" : `${(summaryKpis?.transportEmission ?? 0).toLocaleString()} kg`}
            subValue={`${(summaryKpis?.transportPercent ?? 0).toFixed(1)}% of total`}
            icon={Truck}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Product Life Cycle Emission"
            subtitle={selectedClient ? "Emission Breakdown" : ""}
            onViewDetails={() => navigateToDetail("/dashboard/detailed-lifecycle")}
          >
            {renderChartOrEmpty(loading.lifeCycle, lifeCycleData, renderProductLifeCycle)}
          </ChartCard>

          <ChartCard
            title="Supplier Emission"
            subtitle={selectedClient ? "First Supplier Emission" : ""}
            onViewDetails={() => navigateToDetail("/dashboard/detailed-supplier")}
          >
            {renderChartOrEmpty(loading.supplier, supplierEmissionData, renderSupplierEmission)}
          </ChartCard>

          <ChartCard
            title="Raw Material Emission"
            subtitle={selectedClient ? "Manufacturing Process" : ""}
            onViewDetails={() => navigateToDetail("/dashboard/detailed-raw-material")}
          >
            {renderChartOrEmpty(loading.rawMaterial, rawMaterialData, renderRawMaterialEmission)}
          </ChartCard>

          <ChartCard
            title="Packaging Emission"
            subtitle={selectedClient ? "Packaging Details" : ""}
            onViewDetails={() => navigateToDetail("/dashboard/detailed-packaging")}
          >
            {renderChartOrEmpty(loading.packaging, packagingData, renderPackagingEmission)}
          </ChartCard>

          <ChartCard
            title="Transportation Emission"
            subtitle={selectedClient ? "Mode of Transport" : ""}
            onViewDetails={() => navigateToDetail("/dashboard/detailed-transportation")}
          >
            {renderChartOrEmpty(loading.transportation, transportationData, renderTransportationEmission)}
          </ChartCard>

          <ChartCard title="Energy Emission" subtitle={selectedClient ? "Energy Sources" : ""} onViewDetails={() => navigateToDetail("/dashboard/detailed-energy")}>
            {renderChartOrEmpty(loading.energy, energyData, renderEnergyEmission)}
          </ChartCard>

          <ChartCard title="Recyclability" subtitle={selectedClient ? "Material Recyclability" : ""} onViewDetails={() => navigateToDetail("/dashboard/detailed-recyclability")}>
            {renderChartOrEmpty(loading.recyclability, recyclabilityData, renderRecyclability)}
          </ChartCard>

          <ChartCard title="Waste Emission" subtitle={selectedClient ? "Waste Treatment" : ""} onViewDetails={() => navigateToDetail("/dashboard/detailed-waste")}>
            {renderChartOrEmpty(loading.waste, wasteData, renderWasteEmission)}
          </ChartCard>

          <ChartCard title="Impact Categories" subtitle={selectedClient ? "Impact Analysis" : ""} onViewDetails={() => navigateToDetail("/dashboard/detailed-impact")}>
            {renderChartOrEmpty(loading.impact, impactCategoriesData, renderImpact)}
          </ChartCard>

          <ChartCard title="PCF Dashboard Graph" subtitle={selectedClient ? "Emission Trend" : ""} onViewDetails={() => navigateToDetail("/dashboard/detailed-pcf-trend")}>
            {renderChartOrEmpty(loading.pcfTrend, pcfTrendData, renderPCFTrend)}
          </ChartCard>
        </div>
      </div>

      <ChartModal isOpen={expandedChart === "lifecycle"} onClose={() => setExpandedChart(null)} title="Product Life Cycle Emission">
        <div className="h-full">{renderChartOrEmpty(loading.lifeCycle, lifeCycleData, renderProductLifeCycle)}</div>
      </ChartModal>
      <ChartModal isOpen={expandedChart === "supplier"} onClose={() => setExpandedChart(null)} title="Supplier Emission">
        <div className="h-full">{renderChartOrEmpty(loading.supplier, supplierEmissionData, renderSupplierEmission)}</div>
      </ChartModal>
      <ChartModal isOpen={expandedChart === "raw-material"} onClose={() => setExpandedChart(null)} title="Raw Material Emission">
        <div className="h-full">{renderChartOrEmpty(loading.rawMaterial, rawMaterialData, renderRawMaterialEmission)}</div>
      </ChartModal>
      <ChartModal isOpen={expandedChart === "packaging"} onClose={() => setExpandedChart(null)} title="Packaging Emission">
        <div className="h-full">{renderChartOrEmpty(loading.packaging, packagingData, renderPackagingEmission)}</div>
      </ChartModal>
      <ChartModal isOpen={expandedChart === "transportation"} onClose={() => setExpandedChart(null)} title="Transportation Emission">
        <div className="h-full">{renderChartOrEmpty(loading.transportation, transportationData, renderTransportationEmission)}</div>
      </ChartModal>
    </div>
  );
};

export default Dashboard;
