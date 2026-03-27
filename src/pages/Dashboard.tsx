import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Leaf,
  Truck,
  Factory,
  RefreshCw,
  Users,
  ChevronDown
} from "lucide-react";
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
} from "recharts";
import {
  StatCard,
  ChartCard,
  DashboardHeader,
  ChartModal
} from "../components/DashboardComponents";
import { useDashboardPermissions } from "../contexts/PermissionContext";
import Welcome from "./Welcome";
import dashboardService from "../lib/dashboardService";

const COLOR_MAP: Record<string, string> = {
  "Raw Material": "#1A5D1A",
  "Manufacturing": "#458C21",
  "Packaging": "#74B72E",
  "Transportation": "#98FB98",
  "End of Life": "#C1FFC1",
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
  const { canViewDashboard, loading: permissionsLoading } = useDashboardPermissions();

  // Client State
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  // Restore selected client when navigating back from detail pages
  React.useEffect(() => {
    if (location.state?.selectedClient) {
      setSelectedClient(location.state.selectedClient);
    } else {
      const saved = localStorage.getItem('dashboard_selected_client');
      if (saved) {
        try {
          setSelectedClient(JSON.parse(saved));
        } catch {}
      }
    }
  }, [location.state]);

  // Persist selected client to localStorage
  React.useEffect(() => {
    if (selectedClient) {
      localStorage.setItem('dashboard_selected_client', JSON.stringify(selectedClient));
    } else {
      localStorage.removeItem('dashboard_selected_client');
    }
  }, [selectedClient]);

  // Data States
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

  // Stat card data derived from API responses
  const [statCardData, setStatCardData] = useState<{
    totalEmissions: number;
    manufacturingEmissions: number;
    manufacturingPercent: number;
    recyclabilityRate: number;
    transportEmissions: number;
    transportPercent: number;
  } | null>(null);

  // Loading States
  const [loading, setLoading] = useState({
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

  // Default demo data shown when no client is selected
  const defaultLifeCycleData: LifeCycleDataItem[] = [
    { name: "Raw Material", value: 1520, color: COLOR_MAP["Raw Material"] },
    { name: "Manufacturing", value: 1243, color: COLOR_MAP["Manufacturing"] },
    { name: "Packaging", value: 42, color: COLOR_MAP["Packaging"] },
    { name: "Transportation", value: 487, color: COLOR_MAP["Transportation"] },
    { name: "End of Life", value: 6, color: COLOR_MAP["End of Life"] },
  ];
  const defaultSupplierData = [
    { name: "Gear Shaft", value: 4010 },
    { name: "Motor Mount", value: 9955 },
    { name: "Bearing Housing", value: 5748 },
  ];
  const defaultRawMaterialData = [
    { name: "Extrusion", value: 1.05 },
    { name: "Injection Molding", value: 0.92 },
    { name: "Drying", value: 0.35 },
    { name: "Assembly", value: 0.2 },
    { name: "Finishing", value: 0.15 },
  ];
  const defaultPackagingData = [
    { name: "Cardboard", value: 120 },
    { name: "Film", value: 60 },
    { name: "Pallet", value: 40 },
    { name: "Tape", value: 14 },
  ];
  const defaultTransportationData = [
    { name: "Container Ship", value: 3.84 },
    { name: "Heavy Truck", value: 4.25 },
    { name: "Electric Train", value: 0.98 },
  ];
  const defaultEnergyData = [
    { name: "Electricity", value: 850 },
    { name: "Natural Gas", value: 320 },
    { name: "Steam", value: 180 },
    { name: "Cooling", value: 95 },
  ];
  const defaultRecyclabilityData = [
    { name: "Cobalt", value: 0.9 },
    { name: "Palladium", value: 0.8 },
    { name: "Silver", value: 0.18 },
    { name: "Carbon", value: 0.24 },
  ];
  const defaultWasteData = [
    { name: "Recycling", value: 50 },
    { name: "Landfill", value: 250 },
    { name: "Incineration", value: 400 },
  ];
  const defaultImpactData = [
    { name: "GWP", value: 100 },
    { name: "ODP", value: 20 },
    { name: "AP", value: 45 },
    { name: "EP", value: 60 },
    { name: "POCP", value: 35 },
  ];
  const defaultPcfTrendData = [
    { month: "2022", value: 3500 },
    { month: "2023", value: 3200 },
    { month: "2024", value: 2847 },
    { month: "2025", value: 2650 },
  ];

  React.useEffect(() => {
    if (!selectedClient) {
      // Show demo data when no client is selected
      setLifeCycleData(defaultLifeCycleData);
      setSupplierEmissionData(defaultSupplierData);
      setRawMaterialData(defaultRawMaterialData);
      setPackagingData(defaultPackagingData);
      setTransportationData(defaultTransportationData);
      setEnergyData(defaultEnergyData);
      setRecyclabilityData(defaultRecyclabilityData);
      setWasteData(defaultWasteData);
      setImpactCategoriesData(defaultImpactData);
      setPcfTrendData(defaultPcfTrendData);
      setStatCardData({
        totalEmissions: 2847,
        manufacturingEmissions: 1243,
        manufacturingPercent: 43.7,
        recyclabilityRate: 72.5,
        transportEmissions: 487,
        transportPercent: 17.1,
      });
      return;
    }

    const fetchAllData = async () => {
      const clientId = selectedClient.user_id;

      // 1. Life Cycle + Stat Cards
      setLoading(prev => ({ ...prev, lifeCycle: true }));
      try {
        const res = await dashboardService.getProductLifeCycle(clientId);
        if (res.data?.data || res.data) {
          const data = res.data?.data || res.data;
          const rawMat = parseFloat(data.raw_material) || 0;
          const mfg = parseFloat(data.manufacturing) || 0;
          const pkg = parseFloat(data.packaging) || 0;
          const transport = parseFloat(data.transportation) || 0;
          const waste = parseFloat(data.waste) || 0;
          const total = rawMat + mfg + pkg + transport + waste;

          setLifeCycleData([
            { name: "Raw Material", value: rawMat, color: COLOR_MAP["Raw Material"] },
            { name: "Manufacturing", value: mfg, color: COLOR_MAP["Manufacturing"] },
            { name: "Packaging", value: pkg, color: COLOR_MAP["Packaging"] },
            { name: "Transportation", value: transport, color: COLOR_MAP["Transportation"] },
            { name: "End of Life", value: waste, color: COLOR_MAP["End of Life"] },
          ]);

          // Compute stat card values from lifecycle data
          setStatCardData({
            totalEmissions: total,
            manufacturingEmissions: mfg,
            manufacturingPercent: total > 0 ? parseFloat(((mfg / total) * 100).toFixed(1)) : 0,
            recyclabilityRate: 0, // will be updated by recyclability fetch below
            transportEmissions: transport,
            transportPercent: total > 0 ? parseFloat(((transport / total) * 100).toFixed(1)) : 0,
          });
        }
      } catch (e) {
        setLifeCycleData(defaultLifeCycleData);
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
            setSupplierEmissionData(formatted.length > 0 ? formatted : defaultSupplierData);
          } else {
            setSupplierEmissionData(defaultSupplierData);
          }
        } else {
          setSupplierEmissionData(defaultSupplierData);
        }
      } catch (e) {
        setSupplierEmissionData(defaultSupplierData);
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
          setRawMaterialData(defaultRawMaterialData);
        }
      } catch (e) {
        setRawMaterialData(defaultRawMaterialData);
      }
      setLoading(prev => ({ ...prev, rawMaterial: false }));

      // 4. Packaging (from waste API - packaging waste treatment data)
      setLoading(prev => ({ ...prev, packaging: true }));
      try {
        const res = await dashboardService.getWasteEmissionDetails(clientId);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((item: any) => ({
            name: (item.treatment_type || "Unknown").substring(0, 15),
            value: parseFloat(item.total_waste_weight) || parseFloat(item.total_co2_emission) || 0
          })).filter((item: any) => item.value > 0);
          setPackagingData(formatted.length > 0 ? formatted : defaultPackagingData);
        } else {
          setPackagingData(defaultPackagingData);
        }
      } catch (e) {
        setPackagingData(defaultPackagingData);
      }
      setLoading(prev => ({ ...prev, packaging: false }));

      // 5. Transportation
      setLoading(prev => ({ ...prev, transportation: true }));
      try {
        const res = await dashboardService.getModeOfTransportationEmission(clientId);
        if (res.data) {
          const formatted = res.data.map((item: any) => ({
            name: item.mode_of_transport || "Unknown",
            value: parseFloat(item.co2e_kg) || 0
          }));
          setTransportationData(formatted);
        } else {
          setTransportationData(defaultTransportationData);
        }
      } catch (e) {
        setTransportationData(defaultTransportationData);
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
          setEnergyData(defaultEnergyData);
        }
      } catch (e) {
        setEnergyData(defaultEnergyData);
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
              recycledKg: parseFloat(item.total_recycled_content_used_in_kg) || 0,
            }))
            .sort((a: any, b: any) => b.value - a.value);

          // Calculate overall recyclability rate
          const totalUsed = formatted.reduce((sum: number, item: any) => sum + item.value, 0);
          const totalRecycled = formatted.reduce((sum: number, item: any) => sum + item.recycledKg, 0);
          const recyclabilityRate = totalUsed > 0 ? parseFloat(((totalRecycled / totalUsed) * 100).toFixed(1)) : 0;

          // Update stat card with recyclability rate
          setStatCardData(prev => prev ? { ...prev, recyclabilityRate } : prev);

          setRecyclabilityData(formatted.slice(0, 4).map(({ name, value }: any) => ({ name, value })));
        } else {
          setRecyclabilityData(defaultRecyclabilityData);
        }
      } catch (e) {
        setRecyclabilityData(defaultRecyclabilityData);
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
          setWasteData(defaultWasteData);
        }
      } catch (e) {
        setWasteData(defaultWasteData);
      }
      setLoading(prev => ({ ...prev, waste: false }));

      // 9. Impact Categories
      setLoading(prev => ({ ...prev, impact: true }));
      try {
        const res = await dashboardService.getImpactCategories(clientId);
        if (res.success && res.data?.indicators && res.data.indicators.length > 0) {
          const formatted = res.data.indicators.map((item: any) => ({
            name: item.name.includes("(") ? item.name.split("(")[1]?.replace(")", "").trim() || item.name : item.name,
            value: item.value
          }));
          setImpactCategoriesData(formatted);
        } else {
          setImpactCategoriesData(defaultImpactData);
        }
      } catch {
        setImpactCategoriesData(defaultImpactData);
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
          setPcfTrendData(formatted);
        } else {
          setPcfTrendData(defaultPcfTrendData);
        }
      } catch (e) {
        setPcfTrendData(defaultPcfTrendData);
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
    const top4 = [...lifeCycleData].sort((a, b) => b.value - a.value).slice(0, 4);
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top4} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
          <Tooltip cursor={{ fill: '#F9FAFB' }} />
          <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} name="Emission (kg CO₂e)">
            {top4.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderSupplierEmission = () => {
    const top4 = [...supplierEmissionData].sort((a, b) => b.value - a.value).slice(0, 4).map(d => ({ ...d, displayName: cleanName(d.name) }));
    const values = top4.map(d => d.value).filter(v => v > 0);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const useLog = maxVal > 0 && minVal > 0 && (maxVal / minVal) > 50;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top4} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
          <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} scale={useLog ? "log" : "auto"} domain={useLog ? [1, 'dataMax * 1.2'] : [0, 'dataMax * 1.2']} allowDataOverflow />
          <Tooltip cursor={{ fill: '#F9FAFB' }} formatter={(value: any) => [`${Number(value).toFixed(2)} kg`, 'Emission']} labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} />
          <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '4px' }} />
          <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Emission (kg CO₂e)" />
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
          <Tooltip cursor={{ fill: '#F9FAFB' }} labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} />
          <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
          <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Emission (kg CO₂e)" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPackagingEmission = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={packagingData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
        <Tooltip cursor={{ fill: '#F9FAFB' }} />
        <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
        <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Emission (kg CO₂e)" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderTransportationEmission = () => {
    const top4 = [...transportationData].sort((a, b) => b.value - a.value).slice(0, 4).map(d => ({ ...d, displayName: cleanName(d.name) }));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top4} margin={{ top: 10, right: 20, left: 10, bottom: 45 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
          <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
          <Tooltip cursor={{ fill: '#F9FAFB' }} labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} />
          <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
          <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Emission (kg CO₂e)" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderEnergyEmission = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={energyData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} interval={0} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
        <Tooltip cursor={{ fill: '#F9FAFB' }} />
        <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
        <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Energy Emission (kg CO₂e)" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderRecyclability = () => {
    const cleaned = recyclabilityData.map(d => ({ ...d, displayName: cleanName(d.name) }));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={cleaned} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
          <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
          <Tooltip cursor={{ fill: '#F9FAFB' }} labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} />
          <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
          <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Material Used (kg)" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderWasteEmission = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={wasteData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} interval={0} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
        <Tooltip cursor={{ fill: '#F9FAFB' }} />
        <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
        <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Waste Emission (kg CO₂e)" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderImpact = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={impactCategoriesData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
        <Tooltip cursor={{ fill: '#F9FAFB' }} />
        <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
        <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Impact (kg CO₂e)" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPCFTrend = () => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={pcfTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#4B5563', fontWeight: 500 }} interval={Math.max(0, Math.floor(pcfTrendData.length / 8))} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
        <Tooltip />
        <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
        <Line type="linear" dataKey="value" stroke="#52C41A" strokeWidth={2} dot={{ fill: '#52C41A', strokeWidth: 1, r: 2 }} activeDot={{ r: 5 }} name="Total Emission (kg CO₂e)" />
      </LineChart>
    </ResponsiveContainer>
  );

  const navigateToDetail = (path: string) => {
    if (selectedClient) {
      navigate(path, { state: { selectedClient } });
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
        <DashboardHeader />

        {/* Client Selection Dropdown */}
        <div className="flex justify-end mb-6">
          <div className="w-full md:w-72 relative">
            <div
              className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 cursor-pointer shadow-sm hover:border-green-200 transition-colors"
              onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Users className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">{selectedClient ? selectedClient.user_name : "Select Client"}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isClientDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {clients.map((client) => (
                  <div
                    key={client.user_id}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedClient(client);
                      setIsClientDropdownOpen(false);
                    }}
                  >
                    {client.user_name}
                  </div>
                ))}
                {clients.length === 0 && (
                  <div className="px-4 py-2.5 text-sm text-gray-400">No clients available</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total CO₂e Emissions"
            value={statCardData ? `${statCardData.totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg` : "Loading..."}
            subValue={statCardData ? "All lifecycle stages" : ""}
            trend={-12.3}
            icon={Leaf}
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            title="Manufacturing Emissions"
            value={statCardData ? `${statCardData.manufacturingEmissions.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg` : "Loading..."}
            subValue={statCardData ? `${statCardData.manufacturingPercent}% of total` : ""}
            trend={5.2}
            icon={Factory}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Recyclability Rate"
            value={statCardData ? `${statCardData.recyclabilityRate}%` : "Loading..."}
            subValue="Recycled content ratio"
            trend={8.1}
            icon={RefreshCw}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatCard
            title="Transport Emissions"
            value={statCardData ? `${statCardData.transportEmissions.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg` : "Loading..."}
            subValue={statCardData ? `${statCardData.transportPercent}% of total` : ""}
            trend={-18.4}
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
