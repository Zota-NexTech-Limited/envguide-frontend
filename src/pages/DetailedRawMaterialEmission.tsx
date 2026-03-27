import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Users,
    ChevronDown,
    Box,
    Truck,
    Search,
    X,
    Filter
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
    Line,
    Legend,
    ComposedChart
} from "recharts";
import {
    DetailedHeader,
    ChartCard,
    ChartModal
} from "../components/DashboardComponents";
import dashboardService from "../lib/dashboardService";
import { getMaterialsMaterialTypeDropdown } from "../lib/ecoInventService";

interface Client {
    user_id: string;
    user_name: string;
}

interface Supplier {
    sup_id: string;
    supplier_name: string;
}

const DEFAULT_MANUFACTURING = [
  { name: "Extrusion", energy: 1.05, emission: 0.82 },
  { name: "Injection Molding", energy: 0.92, emission: 0.71 },
  { name: "Drying", energy: 0.35, emission: 0.27 },
  { name: "Assembly", energy: 0.2, emission: 0.15 },
  { name: "Finishing", energy: 0.15, emission: 0.12 },
];
const DEFAULT_ENERGY = [
  { name: "Electricity", electricity: 850, heating: 120, cooling: 95, steam: 180 },
  { name: "Natural Gas", electricity: 0, heating: 320, cooling: 0, steam: 0 },
];

const DEFAULT_TOP_COUNT = 4;

const DetailedRawMaterialEmission: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    // State for Dropdowns
    const [clients, setClients] = useState<Client[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);

    // State for Graph Data (full API data)
    const [manufacturingData, setManufacturingData] = useState<any[]>(DEFAULT_MANUFACTURING);
    const [processEnergyStateData, setProcessEnergyStateData] = useState<any[]>(DEFAULT_ENERGY);
    const [materialCompData, setMaterialCompData] = useState<any[]>([]);
    const [intensityData, setIntensityData] = useState<any[]>([]);
    const [shareData, setShareData] = useState<any[]>([]);


    // Material filter state
    const [materialSearch, setMaterialSearch] = useState("");
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
    const [showTopOnly, setShowTopOnly] = useState(true);
    const [isMaterialFilterOpen, setIsMaterialFilterOpen] = useState(false);

    // Master materials list from setup/ecoinvent
    const [masterMaterials, setMasterMaterials] = useState<string[]>([]);

    useEffect(() => {
        if (location.state?.selectedClient) {
            setSelectedClient(location.state.selectedClient);
        }
    }, [location.state]);

    // Loading States
    const [isLoadingManufacturing, setIsLoadingManufacturing] = useState(false);
    const [isLoadingEnergy, setIsLoadingEnergy] = useState(false);
    const [isLoadingComp, setIsLoadingComp] = useState(false);
    const [isLoadingIntensity, setIsLoadingIntensity] = useState(false);
    const [isLoadingShare, setIsLoadingShare] = useState(false);

    const COLOR_PALETTE = ["#1A5D1A", "#458C21", "#52C41A", "#74B72E", "#98FB98", "#C1FFC1", "#D9F5C5"];

    // Get all unique material names — merge master setup list + chart data
    const allMaterialNames = useMemo(() => {
        const names = new Set<string>();
        // Add all master materials from ecoinvent setup
        masterMaterials.forEach(n => names.add(n));
        // Also add any from chart data (in case master list didn't load)
        materialCompData.forEach(d => names.add(d.name));
        intensityData.forEach(d => names.add(d.name));
        shareData.forEach(d => names.add(d.name));
        return Array.from(names).sort();
    }, [masterMaterials, materialCompData, intensityData, shareData]);

    // Filtered material names based on search
    const filteredMaterialOptions = useMemo(() => {
        if (!materialSearch) return allMaterialNames;
        return allMaterialNames.filter(n =>
            n.toLowerCase().includes(materialSearch.toLowerCase())
        );
    }, [allMaterialNames, materialSearch]);

    // Apply filter to data: if materials selected, show those. Otherwise show top N.
    const filterMaterialData = (data: any[], sortKey: string) => {
        if (selectedMaterials.length > 0) {
            return data.filter(d => selectedMaterials.includes(d.name));
        }
        if (showTopOnly) {
            return [...data].sort((a, b) => Math.abs(b[sortKey]) - Math.abs(a[sortKey])).slice(0, DEFAULT_TOP_COUNT);
        }
        return data;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const displayedCompData = useMemo(() => filterMaterialData(materialCompData, "contribution"), [materialCompData, selectedMaterials, showTopOnly]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const displayedIntensityData = useMemo(() => filterMaterialData(intensityData, "virgin"), [intensityData, selectedMaterials, showTopOnly]);
    const displayedShareData = useMemo(() => {
        const filtered = filterMaterialData(shareData, "value");
        return filtered.map((item, index) => ({
            ...item,
            color: COLOR_PALETTE[index % COLOR_PALETTE.length]
        }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shareData, selectedMaterials, showTopOnly]);

    // Fetch Clients and Master Materials on Mount
    useEffect(() => {
        const fetchClients = async () => {
            const result = await dashboardService.getClientsDropdown();
            if (result.success && Array.isArray(result.data)) {
                setClients(result.data);
            } else {
                setClients([]);
            }
        };
        const fetchMasterMaterials = async () => {
            const materials = await getMaterialsMaterialTypeDropdown();
            if (Array.isArray(materials)) {
                setMasterMaterials(materials.map(m => m.name).filter(Boolean));
            }
        };
        fetchClients();
        fetchMasterMaterials();
    }, []);

    // Fetch Suppliers and Client-level Graph Data
    useEffect(() => {
        if (selectedClient) {
            // Reset material filter on client change
            setSelectedMaterials([]);
            setShowTopOnly(true);
            setMaterialSearch("");

            const fetchSuppliers = async () => {
                const result = await dashboardService.getSupplierDropdown(selectedClient.user_id);
                if (result.success && Array.isArray(result.data)) {
                    setSuppliers(result.data);
                } else {
                    setSuppliers([]);
                }
            };

            const fetchManufacturing = async () => {
                setIsLoadingManufacturing(true);
                const result = await dashboardService.getManufacturingProcessEmission(selectedClient.user_id);
                if (result.success && Array.isArray(result.data) && result.data.length > 0) {
                    const mapped = result.data.map((item: any) => ({
                        name: item.process_specific_energy_type || item.process_name || item.name,
                        energy: parseFloat(item.quantity_consumed) || parseFloat(item.energy_used) || 0,
                        emission: parseFloat(item.emission_value) || parseFloat(item.carbon_emission) || 0
                    }));
                    setManufacturingData(mapped);
                } else {
                    setManufacturingData([
                        { name: "Extrusion", energy: 1200, emission: 1.05 },
                        { name: "Injection Molding", energy: 980, emission: 0.92 },
                        { name: "Drying", energy: 450, emission: 0.35 },
                        { name: "Assembly", energy: 280, emission: 0.2 },
                        { name: "Finishing", energy: 180, emission: 0.15 },
                    ]);
                }
                setIsLoadingManufacturing(false);
            };

            const fetchEnergy = async () => {
                setIsLoadingEnergy(true);
                const result = await dashboardService.getProcessEnergyEmission(selectedClient.user_id);
                if (result.success && result.data && typeof result.data === 'object' && !Array.isArray(result.data) && Object.keys(result.data).length > 0) {
                    const pivotMap: { [key: string]: any } = {};
                    Object.entries(result.data).forEach(([energyType, processes]: [string, any]) => {
                        if (Array.isArray(processes)) {
                            processes.forEach((item: any) => {
                                const processName = item.process_specific_energy_type || item.process_name || "Unknown";
                                if (!pivotMap[processName]) {
                                    pivotMap[processName] = { name: processName };
                                }
                                pivotMap[processName][energyType] = parseFloat(item.quantity_consumed) || parseFloat(item.value) || 0;
                            });
                        }
                    });
                    const pivoted = Object.values(pivotMap);
                    if (pivoted.length > 0) {
                        setProcessEnergyStateData(pivoted);
                    } else {
                        setProcessEnergyStateData(DEFAULT_ENERGY);
                        }
                } else {
                    // API returned empty — use fallback data
                    setProcessEnergyStateData(DEFAULT_ENERGY);
                }
                setIsLoadingEnergy(false);
            };

            const fetchComp = async () => {
                setIsLoadingComp(true);
                const result = await dashboardService.getMaterialCompositionEmission(selectedClient.user_id);
                if (result.success && Array.isArray(result.data)) {
                    const mapped = result.data.map((item: any) => ({
                        name: item.material_type || item.material_name || item.name,
                        contribution: parseFloat(item.emission_contribution) || parseFloat(item.total_emission_value) || 0,
                        share: parseFloat(item.share_of_total_percentage) || parseFloat(item.share_percentage) || 0
                    }));
                    setMaterialCompData(mapped);
                } else {
                    setMaterialCompData([
                        { name: "Cobalt", contribution: 900, share: 38 },
                        { name: "Silver", contribution: 180, share: 18 },
                        { name: "Gold", contribution: 90, share: 37 },
                        { name: "Palladium", contribution: 270, share: 7 },
                    ]);
                }
                setIsLoadingComp(false);
            };

            const fetchIntensity = async () => {
                setIsLoadingIntensity(true);
                const result = await dashboardService.getMaterialCarbonIntensityEmission(selectedClient.user_id);
                if (result.success && result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
                    const virgin = result.data.virgin_material || [];
                    const recycled = result.data.recycled_material || [];

                    const mergedMap: { [key: string]: any } = {};
                    virgin.forEach((item: any) => {
                        const name = item.material_type || "Unknown";
                        mergedMap[name] = {
                            name,
                            virgin: parseFloat(item.material_emission_factor) || parseFloat(item.carbon_intensity) || 0,
                            recycled: 0
                        };
                    });
                    recycled.forEach((item: any) => {
                        const name = item.material_type || "Unknown";
                        if (!mergedMap[name]) {
                            mergedMap[name] = {
                                name,
                                virgin: 0,
                                recycled: parseFloat(item.material_emission_factor) || parseFloat(item.carbon_intensity) || 0
                            };
                        } else {
                            mergedMap[name].recycled = parseFloat(item.material_emission_factor) || parseFloat(item.carbon_intensity) || 0;
                        }
                    });
                    setIntensityData(Object.values(mergedMap));
                } else if (result.success && Array.isArray(result.data)) {
                    const mapped = result.data.map((item: any) => ({
                        name: item.material_name || item.name || item.material_type,
                        virgin: parseFloat(item.material_emission_factor) || parseFloat(item.virgin_material_intensity) || 0,
                        recycled: parseFloat(item.recycled_material_intensity) || 0
                    }));
                    setIntensityData(mapped);
                } else {
                    setIntensityData([
                        { name: "Cobalt", virgin: 17, recycled: 0 },
                        { name: "Silver", virgin: 40, recycled: 0 },
                        { name: "Gold", virgin: 16500, recycled: 0 },
                        { name: "Palladium", virgin: 9200, recycled: 0 },
                    ]);
                }
                setIsLoadingIntensity(false);
            };

            const fetchShare = async () => {
                setIsLoadingShare(true);
                const result = await dashboardService.getPercentageShareOfTotalEmission(selectedClient.user_id);
                if (result.success && Array.isArray(result.data)) {
                    const mapped = result.data.map((item: any, index: number) => ({
                        name: item.material || item.name || item.material_name || item.material_type || "Unknown",
                        value: parseFloat(item.percentage_share) || parseFloat(item.value) || parseFloat(item.percentage) || parseFloat(item.share_of_total_percentage) || 0,
                        color: COLOR_PALETTE[index % COLOR_PALETTE.length]
                    }));
                    setShareData(mapped);
                } else {
                    setShareData([
                        { name: "Cobalt", value: 50 },
                        { name: "Silver", value: 10 },
                        { name: "Gold", value: 5 },
                        { name: "Palladium", value: 15 },
                        { name: "Tungsten", value: 10 },
                        { name: "Niobium", value: 10 },
                    ]);
                }
                setIsLoadingShare(false);
            };

            fetchSuppliers();
            fetchManufacturing();
            fetchEnergy();
            fetchComp();
            fetchIntensity();
            fetchShare();
            setSelectedSupplier(null);
        } else {
            setSuppliers([]);
            setManufacturingData(DEFAULT_MANUFACTURING);
            setProcessEnergyStateData(DEFAULT_ENERGY);
            setMaterialCompData([
                { name: "Cobalt", contribution: 900, share: 38 },
                { name: "Silver", contribution: 180, share: 18 },
                { name: "Gold", contribution: 90, share: 37 },
                { name: "Palladium", contribution: 270, share: 7 },
            ]);
            setIntensityData([
                { name: "Cobalt", virgin: 17, recycled: 0 },
                { name: "Silver", virgin: 40, recycled: 0 },
                { name: "Gold", virgin: 16500, recycled: 0 },
                { name: "Palladium", virgin: 9200, recycled: 0 },
            ]);
            setShareData([
                { name: "Cobalt", value: 50 },
                { name: "Silver", value: 10 },
                { name: "Gold", value: 5 },
                { name: "Palladium", value: 15 },
                { name: "Tungsten", value: 10 },
                { name: "Niobium", value: 10 },
            ]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClient]);

    // Fetch Supplier-specific Data
    useEffect(() => {
        if (selectedClient && selectedSupplier) {
            // Reset material filter on supplier change
            setSelectedMaterials([]);
            setShowTopOnly(true);
            setMaterialSearch("");

            const fetchSupplierComp = async () => {
                setIsLoadingComp(true);
                const result = await dashboardService.getMaterialCompositionEmission(selectedClient.user_id, selectedSupplier.sup_id);
                if (result.success && Array.isArray(result.data)) {
                    const mapped = result.data.map((item: any) => ({
                        name: item.material_type || item.material_name || item.name,
                        contribution: parseFloat(item.emission_contribution) || parseFloat(item.total_emission_value) || 0,
                        share: parseFloat(item.share_of_total_percentage) || parseFloat(item.share_percentage) || 0
                    }));
                    setMaterialCompData(mapped);
                } else {
                    setMaterialCompData([
                        { name: "Cobalt", contribution: 900, share: 38 },
                        { name: "Silver", contribution: 180, share: 18 },
                        { name: "Gold", contribution: 90, share: 37 },
                        { name: "Palladium", contribution: 270, share: 7 },
                    ]);
                }
                setIsLoadingComp(false);
            };

            const fetchSupplierIntensity = async () => {
                setIsLoadingIntensity(true);
                const result = await dashboardService.getMaterialCarbonIntensityEmission(selectedClient.user_id, selectedSupplier.sup_id);
                if (result.success && result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
                    const virgin = result.data.virgin_material || [];
                    const recycled = result.data.recycled_material || [];

                    const mergedMap: { [key: string]: any } = {};
                    virgin.forEach((item: any) => {
                        const name = item.material_type || "Unknown";
                        mergedMap[name] = {
                            name,
                            virgin: parseFloat(item.material_emission_factor) || parseFloat(item.carbon_intensity) || 0,
                            recycled: 0
                        };
                    });
                    recycled.forEach((item: any) => {
                        const name = item.material_type || "Unknown";
                        if (!mergedMap[name]) {
                            mergedMap[name] = {
                                name,
                                virgin: 0,
                                recycled: parseFloat(item.material_emission_factor) || parseFloat(item.carbon_intensity) || 0
                            };
                        } else {
                            mergedMap[name].recycled = parseFloat(item.material_emission_factor) || parseFloat(item.carbon_intensity) || 0;
                        }
                    });
                    setIntensityData(Object.values(mergedMap));
                } else {
                    setIntensityData([
                        { name: "Cobalt", virgin: 17, recycled: 0 },
                        { name: "Silver", virgin: 40, recycled: 0 },
                        { name: "Gold", virgin: 16500, recycled: 0 },
                        { name: "Palladium", virgin: 9200, recycled: 0 },
                    ]);
                }
                setIsLoadingIntensity(false);
            };

            const fetchSupplierShare = async () => {
                setIsLoadingShare(true);
                const result = await dashboardService.getPercentageShareOfTotalEmission(selectedClient.user_id, selectedSupplier.sup_id);
                if (result.success && Array.isArray(result.data)) {
                    const mapped = result.data.map((item: any, index: number) => ({
                        name: item.material || item.name || item.material_name || item.material_type || "Unknown",
                        value: parseFloat(item.percentage_share) || parseFloat(item.value) || parseFloat(item.percentage) || parseFloat(item.share_of_total_percentage) || 0,
                        color: COLOR_PALETTE[index % COLOR_PALETTE.length]
                    }));
                    setShareData(mapped);
                } else {
                    setShareData([
                        { name: "Cobalt", value: 50 },
                        { name: "Silver", value: 10 },
                        { name: "Gold", value: 5 },
                        { name: "Palladium", value: 15 },
                        { name: "Tungsten", value: 10 },
                        { name: "Niobium", value: 10 },
                    ]);
                }
                setIsLoadingShare(false);
            };

            fetchSupplierComp();
            fetchSupplierIntensity();
            fetchSupplierShare();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSupplier, selectedClient]);

    // Close material filter dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.material-filter-container')) {
                setIsMaterialFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const renderLoader = () => (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
    );

    const renderNoData = (msg: string) => (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
            {msg}
        </div>
    );

    const formatYAxisVal = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`.replace('.0M', 'M');
        if (value >= 1000) return `${(value / 1000).toFixed(1)}k`.replace('.0k', 'k');
        return value.toString();
    };

    const cleanName = (name: string): string => {
        const dashIdx = name.indexOf(" - ");
        if (dashIdx > 0) {
            const afterDash = name.substring(dashIdx + 3);
            if (/[0-9<>=]/.test(afterDash)) return name;
            return name.substring(0, dashIdx).trim();
        }
        return name;
    };

    const WrappedTick = ({ x, y, payload }: any) => {
        const name: string = payload.value || "";
        const maxLen = 10;
        if (name.length <= maxLen) {
            return (<text x={x} y={y + 10} textAnchor="middle" fontSize={9} fill="#4B5563" fontWeight={500}>{name}</text>);
        }
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

    const renderManufacturingProcess = (isModal = false) => {
        if (isLoadingManufacturing) return renderLoader();
        if (manufacturingData.length === 0) return renderNoData("No data available");

        const chartData = manufacturingData.map(d => ({ ...d, displayName: cleanName(d.name || d.process_name || "Unknown") }));

        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxisVal} />
                    <Tooltip cursor={{ fill: '#F9FAFB' }} labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} />
                    <Legend verticalAlign="top" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '10px' }} />
                    <Bar dataKey="energy" fill="#458C21" radius={[4, 4, 0, 0]} barSize={isModal ? 60 : 30} name="Energy Used (kWh/unit)" />
                    <Bar dataKey="emission" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={isModal ? 60 : 30} name="CO₂e (kg/unit)" />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const renderProcessEnergy = (isModal = false) => {
        if (isLoadingEnergy) return renderLoader();
        if (processEnergyStateData.length === 0) return renderNoData("No data available");

        const chartData = processEnergyStateData.map(d => ({ ...d, displayName: cleanName(d.name || d.process_name || "Unknown") }));
        const energyTypes = Object.keys(processEnergyStateData[0] || {}).filter(key => key !== 'name');

        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxisVal} />
                    <Tooltip cursor={{ fill: '#F9FAFB' }} labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} />
                    <Legend verticalAlign="top" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '10px' }} />
                    {energyTypes.map((type, index) => (
                        <Bar key={type} dataKey={type} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} radius={[4, 4, 0, 0]} name={type.charAt(0).toUpperCase() + type.slice(1)} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const renderMaterialComposition = (isModal = false) => {
        if (isLoadingComp) return renderLoader();

        if (displayedCompData.length === 0) return renderNoData("No data available");

        const chartData = displayedCompData.map(d => ({ ...d, displayName: cleanName(d.name || d.process_name || "Unknown") }));

        return (
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
                    <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxisVal} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} />
                    <Legend verticalAlign="top" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '10px' }} />
                    <Bar yAxisId="left" dataKey="contribution" fill="#52C41A" radius={[4, 4, 0, 0]} name="Emission Contribution (kg CO₂e)" barSize={isModal ? 60 : 30} />
                    <Line yAxisId="right" type="monotone" dataKey="share" stroke="#1A5D1A" strokeWidth={3} name="Share of Total (%)" dot={{ fill: '#1A5D1A', r: 4 }} activeDot={{ r: 6 }} />
                </ComposedChart>
            </ResponsiveContainer>
        );
    };

    const renderMaterialCarbonIntensity = (isModal = false) => {
        if (isLoadingIntensity) return renderLoader();

        if (displayedIntensityData.length === 0) return renderNoData("No data available");

        const chartData = displayedIntensityData.map(d => ({ ...d, displayName: cleanName(d.name || d.process_name || "Unknown") }));

        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxisVal} />
                    <Tooltip cursor={{ fill: '#F9FAFB' }} labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} />
                    <Legend verticalAlign="top" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '10px' }} />
                    <Bar dataKey="virgin" fill="#458C21" radius={[4, 4, 0, 0]} barSize={isModal ? 60 : 30} name="Virgin Material (kg CO₂e/kg)" />
                    <Bar dataKey="recycled" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={isModal ? 60 : 30} name="Recycled Material (kg CO₂e/kg)" />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const renderEmissionShare = (isModal = false) => {
        if (isLoadingShare) return renderLoader();

        if (displayedShareData.length === 0) return renderNoData("No data available");

        const chartData = displayedShareData.map(d => ({ ...d, displayName: cleanName(d.name || d.process_name || "Unknown") }));

        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip cursor={{ fill: '#F9FAFB' }} labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} />
                    <Legend verticalAlign="top" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '10px' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={isModal ? 80 : 40} name="Share of Total (%)">
                        {displayedShareData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const renderDropdown = (
        label: string,
        options: any[],
        selected: any,
        setSelected: (val: any) => void,
        isOpen: boolean,
        setIsOpen: (val: boolean) => void,
        icon: React.ReactNode,
        placeholder: string,
        displayKey: string,
        valueKey: string
    ) => (
        <div className="w-full md:w-64 space-y-2 relative">
            <label className="text-xs font-bold text-gray-500 block mb-2">{label}</label>
            <div
                className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 cursor-pointer shadow-sm hover:border-green-200 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">{icon}</span>
                    <span>{selected ? selected[displayKey] : placeholder}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <div
                            key={option[valueKey]}
                            className="px-4 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 cursor-pointer transition-colors"
                            onClick={() => {
                                setSelected(option);
                                setIsOpen(false);
                            }}
                        >
                            {option[displayKey]}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div className="px-4 py-2.5 text-sm text-gray-400">No {label.toLowerCase()} available</div>
                    )}
                </div>
            )}
        </div>
    );

    const toggleMaterial = (name: string) => {
        setSelectedMaterials(prev =>
            prev.includes(name)
                ? prev.filter(m => m !== name)
                : [...prev, name]
        );
    };

    const clearMaterialFilter = () => {
        setSelectedMaterials([]);
        setShowTopOnly(true);
        setMaterialSearch("");
    };

    const renderMaterialFilter = () => {
        if (!selectedClient || allMaterialNames.length === 0) return null;

        return (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-bold text-gray-700">Filter Materials</span>
                        <span className="text-xs text-gray-400">({allMaterialNames.length} total)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setShowTopOnly(true); setSelectedMaterials([]); }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${showTopOnly && selectedMaterials.length === 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Top {DEFAULT_TOP_COUNT}
                        </button>
                        <button
                            onClick={() => { setShowTopOnly(false); setSelectedMaterials([]); }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${!showTopOnly && selectedMaterials.length === 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Show All
                        </button>
                        {selectedMaterials.length > 0 && (
                            <button
                                onClick={clearMaterialFilter}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Search + Dropdown */}
                <div className="relative material-filter-container">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search materials..."
                            value={materialSearch}
                            onChange={(e) => {
                                setMaterialSearch(e.target.value);
                                setIsMaterialFilterOpen(true);
                            }}
                            onFocus={() => setIsMaterialFilterOpen(true)}
                            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                        />
                        {materialSearch && (
                            <X
                                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                                onClick={() => setMaterialSearch("")}
                            />
                        )}
                    </div>

                    {/* Dropdown */}
                    {isMaterialFilterOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {filteredMaterialOptions.map((name) => (
                                <div
                                    key={name}
                                    className={`px-4 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2 ${selectedMaterials.includes(name)
                                        ? 'bg-green-50 text-green-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    onClick={() => toggleMaterial(name)}
                                >
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedMaterials.includes(name) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                        {selectedMaterials.includes(name) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </div>
                                    {name}
                                </div>
                            ))}
                            {filteredMaterialOptions.length === 0 && (
                                <div className="px-4 py-2 text-sm text-gray-400 italic">No materials match "{materialSearch}"</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Selected chips */}
                {selectedMaterials.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {selectedMaterials.map((name) => (
                            <span
                                key={name}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg text-xs font-medium text-green-700"
                            >
                                {name}
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-red-500"
                                    onClick={() => toggleMaterial(name)}
                                />
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="Raw Material Emission Details"
                    subtitle="Comprehensive breakdown of material-specific carbon footprint"
                    onBack={() => navigate("/dashboard", { state: { selectedClient } })}
                    icon={Box}
                />

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    {renderDropdown(
                        "Select Client",
                        clients,
                        selectedClient,
                        setSelectedClient,
                        isClientDropdownOpen,
                        setIsClientDropdownOpen,
                        <Users className="w-4 h-4" />,
                        "Select Client",
                        "user_name",
                        "user_id"
                    )}

                    {renderDropdown(
                        "Supplier",
                        suppliers,
                        selectedSupplier,
                        setSelectedSupplier,
                        isSupplierDropdownOpen,
                        setIsSupplierDropdownOpen,
                        <Truck className="w-4 h-4" />,
                        "Select Supplier",
                        "supplier_name",
                        "sup_id"
                    )}
                </div>

                {/* Manufacturing & Process Energy (top row) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <ChartCard title="Manufacturing Process Emission" showExpand onExpand={() => setExpandedChart("process")}>
                        {renderManufacturingProcess()}
                    </ChartCard>
                    <ChartCard title="Process Energy Emission" showExpand onExpand={() => setExpandedChart("energy")}>
                        {renderProcessEnergy()}
                    </ChartCard>
                </div>

                {/* Material Filter (shared for bottom 3 charts) */}
                {renderMaterialFilter()}

                {/* Material charts (bottom section) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Material Composition" showExpand onExpand={() => setExpandedChart("composition")}>
                        {renderMaterialComposition()}
                    </ChartCard>
                    <ChartCard title="Material Carbon Intensity" showExpand onExpand={() => setExpandedChart("intensity")}>
                        {renderMaterialCarbonIntensity()}
                    </ChartCard>

                    <div className="lg:col-span-2">
                        <ChartCard title="% Share of Total Emission" showExpand onExpand={() => setExpandedChart("share")}>
                            {renderEmissionShare()}
                        </ChartCard>
                    </div>
                </div>
            </div>

            {/* Expansion Modals */}
            <ChartModal isOpen={expandedChart === "process"} onClose={() => setExpandedChart(null)} title="Manufacturing Process Emission">
                {renderManufacturingProcess(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "energy"} onClose={() => setExpandedChart(null)} title="Process Energy Emission">
                {renderProcessEnergy(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "composition"} onClose={() => setExpandedChart(null)} title="Material Composition">
                {renderMaterialComposition(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "intensity"} onClose={() => setExpandedChart(null)} title="Material Carbon Intensity">
                {renderMaterialCarbonIntensity(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "share"} onClose={() => setExpandedChart(null)} title="% Share of Total Emission">
                {renderEmissionShare(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedRawMaterialEmission;
