import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Users,
    ChevronDown,
    Package,
    RefreshCw,
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
    Legend
} from "recharts";
import {
    DetailedHeader,
    ChartCard,
    ChartModal
} from "../components/DashboardComponents";
import dashboardService from "../lib/dashboardService";
import { getMaterialsMaterialTypeDropdown, getWasteTreatmentTypeDropdown, getTreatmentTypeDropdown } from "../lib/ecoInventService";

interface Client {
    user_id: string;
    user_name: string;
}

const DetailedPackagingEmission: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    // State
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

    // Data states
    const [wasteData, setWasteData] = useState<any[]>([]);
    const [recyclabilityData, setRecyclabilityData] = useState<any[]>([]);
    const [loadingWaste, setLoadingWaste] = useState(false);
    const [loadingRecyclability, setLoadingRecyclability] = useState(false);
    const [showTopOnly, setShowTopOnly] = useState(true);

    // Material filter state
    const [masterMaterials, setMasterMaterials] = useState<string[]>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
    const [materialSearch, setMaterialSearch] = useState("");
    const [isMaterialFilterOpen, setIsMaterialFilterOpen] = useState(false);

    // Waste type filter state
    const [wasteTypeOptions, setWasteTypeOptions] = useState<string[]>([]);
    const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
    const [wasteTypeSearch, setWasteTypeSearch] = useState("");
    const [isWasteTypeFilterOpen, setIsWasteTypeFilterOpen] = useState(false);
    const [showTopOnlyWaste, setShowTopOnlyWaste] = useState(true);

    // Fetch Clients, Master Materials, and Master Waste Types
    useEffect(() => {
        const fetchClients = async () => {
            const result = await dashboardService.getClientsDropdown();
            if (result.status === true || result.success === true || result.data) {
                const clientList = Array.isArray(result.data) ? result.data : (result.data?.data && Array.isArray(result.data.data) ? result.data.data : []);
                setClients(clientList);
            }
        };
        const fetchMasterMaterials = async () => {
            const materials = await getMaterialsMaterialTypeDropdown();
            if (Array.isArray(materials)) {
                setMasterMaterials(materials.map(m => m.name).filter(Boolean));
            }
        };
        const fetchTreatmentTypes = async () => {
            // Fetch BOTH packaging treatment types AND waste treatment types, then combine
            const [packagingTreatments, wasteTreatments] = await Promise.all([
                getTreatmentTypeDropdown(),
                getWasteTreatmentTypeDropdown()
            ]);
            const allNames = new Set<string>();
            if (Array.isArray(packagingTreatments)) {
                packagingTreatments.forEach(p => { if (p.name) allNames.add(p.name); });
            }
            if (Array.isArray(wasteTreatments)) {
                wasteTreatments.forEach(w => { if (w.name) allNames.add(w.name); });
            }
            setWasteTypeOptions(Array.from(allNames).sort());
        };
        fetchClients();
        fetchMasterMaterials();
        fetchTreatmentTypes();
    }, []);

    // Set Client from Navigation
    useEffect(() => {
        if (location.state?.selectedClient) {
            setSelectedClient(location.state.selectedClient);
        }
    }, [location.state]);

    // Fetch data when client changes
    useEffect(() => {
        if (!selectedClient) {
            setRecyclabilityData([
                { name: "Cobalt", displayName: "Cobalt", totalUsed: 0.9, recycledPercent: 0, recycledKg: 0 },
                { name: "Silver", displayName: "Silver", totalUsed: 0.18, recycledPercent: 0, recycledKg: 0 },
                { name: "Gold", displayName: "Gold", totalUsed: 0.09, recycledPercent: 0, recycledKg: 0 },
                { name: "Palladium", displayName: "Palladium", totalUsed: 0.27, recycledPercent: 0, recycledKg: 0 },
            ]);
            return;
        }

        // Reset material filter on client change
        setSelectedMaterials([]);
        setShowTopOnly(true);
        setMaterialSearch("");

        // Reset waste type filter on client change
        setSelectedWasteTypes([]);
        setShowTopOnlyWaste(true);
        setWasteTypeSearch("");

        const clientId = selectedClient.user_id;

        // Waste data is fetched in a separate effect that responds to waste type filter changes

        // Fetch recyclability data for packaging materials
        const fetchRecyclability = async () => {
            setLoadingRecyclability(true);
            try {
                const res = await dashboardService.getRecyclabilityEmission(clientId);
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    const formatted = res.data.map((item: any) => ({
                        name: item.material_type || "Unknown",
                        displayName: cleanName(item.material_type || "Unknown"),
                        totalUsed: parseFloat(item.total_material_used_in_kg) || 0,
                        recycledPercent: parseFloat(item.total_recycled_material_percentage) || 0,
                        recycledKg: parseFloat(item.total_recycled_content_used_in_kg) || 0,
                    })).filter((item: any) => item.totalUsed > 0);
                    setRecyclabilityData(formatted);
                } else {
                    setRecyclabilityData([
                        { name: "Cobalt", displayName: "Cobalt", totalUsed: 0.9, recycledPercent: 0, recycledKg: 0 },
                        { name: "Silver", displayName: "Silver", totalUsed: 0.18, recycledPercent: 0, recycledKg: 0 },
                        { name: "Gold", displayName: "Gold", totalUsed: 0.09, recycledPercent: 0, recycledKg: 0 },
                        { name: "Palladium", displayName: "Palladium", totalUsed: 0.27, recycledPercent: 0, recycledKg: 0 },
                    ]);
                }
            } catch {
                setRecyclabilityData([
                    { name: "Cobalt", displayName: "Cobalt", totalUsed: 0.9, recycledPercent: 0, recycledKg: 0 },
                    { name: "Silver", displayName: "Silver", totalUsed: 0.18, recycledPercent: 0, recycledKg: 0 },
                    { name: "Gold", displayName: "Gold", totalUsed: 0.09, recycledPercent: 0, recycledKg: 0 },
                    { name: "Palladium", displayName: "Palladium", totalUsed: 0.27, recycledPercent: 0, recycledKg: 0 },
                ]);
            }
            setLoadingRecyclability(false);
        };

        fetchRecyclability();
    }, [selectedClient]);

    // Fetch waste data once when client changes (no backend filtering by waste type)
    useEffect(() => {
        if (!selectedClient) {
            setWasteData([]);
            return;
        }

        const clientId = selectedClient.user_id;

        const fetchWaste = async () => {
            setLoadingWaste(true);
            try {
                const res = await dashboardService.getWasteEmissionDetails(clientId);
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    const formatted = res.data.map((item: any) => ({
                        name: item.treatment_type || "Unknown",
                        displayName: cleanName(item.treatment_type || "Unknown"),
                        weight: parseFloat(item.total_waste_weight) || 0,
                        emission: parseFloat(item.total_co2_emission) || 0,
                    })).filter((item: any) => item.weight > 0 || item.emission !== 0);
                    setWasteData(formatted);
                } else {
                    setWasteData([]);
                }
            } catch {
                setWasteData([]);
            }
            setLoadingWaste(false);
        };

        fetchWaste();
    }, [selectedClient]);

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
        const maxLen = 14;
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

    const renderLoading = () => (
        <div className="flex items-center justify-center h-full min-h-[300px] text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />Loading...
        </div>
    );

    const renderNoClient = () => (
        <div className="flex items-center justify-center h-full min-h-[300px] text-sm text-gray-400 italic">
            Select a client to view data
        </div>
    );

    const renderEmpty = () => (
        <div className="flex items-center justify-center h-full min-h-[300px] text-sm text-gray-400">
            No data available
        </div>
    );

    // Get all unique material names — merge master setup list + chart data
    const allMaterialNames = useMemo(() => {
        const names = new Set<string>();
        masterMaterials.forEach(n => names.add(n));
        recyclabilityData.forEach(d => names.add(d.name));
        return Array.from(names).sort();
    }, [masterMaterials, recyclabilityData]);

    // Filtered material names based on search
    const filteredMaterialOptions = useMemo(() => {
        if (!materialSearch) return allMaterialNames;
        return allMaterialNames.filter(n =>
            n.toLowerCase().includes(materialSearch.toLowerCase())
        );
    }, [allMaterialNames, materialSearch]);

    // Close filter dropdowns on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.material-filter-container')) {
                setIsMaterialFilterOpen(false);
            }
            if (!target.closest('.waste-type-filter-container')) {
                setIsWasteTypeFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

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

    // Waste type filter helpers
    const filteredWasteTypeOptions = useMemo(() => {
        if (!wasteTypeSearch) return wasteTypeOptions;
        return wasteTypeOptions.filter(n =>
            n.toLowerCase().includes(wasteTypeSearch.toLowerCase())
        );
    }, [wasteTypeOptions, wasteTypeSearch]);

    const toggleWasteType = (name: string) => {
        setSelectedWasteTypes(prev =>
            prev.includes(name)
                ? prev.filter(w => w !== name)
                : [...prev, name]
        );
    };

    const clearWasteTypeFilter = () => {
        setSelectedWasteTypes([]);
        setShowTopOnlyWaste(true);
        setWasteTypeSearch("");
    };

    // Filtered waste data for chart (Top 5 / Show All + treatment type filter)
    const filteredWasteData = useMemo(() => {
        let data = [...wasteData];
        if (selectedWasteTypes.length > 0) {
            // Normalize for comparison (collapse whitespace, lowercase)
            const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
            const selectedNorm = selectedWasteTypes.map(normalize);
            data = data.filter(d => selectedNorm.includes(normalize(d.name)));
        }
        const sorted = data.sort((a, b) => Math.abs(b.emission) - Math.abs(a.emission));
        return showTopOnlyWaste ? sorted.slice(0, 5) : sorted;
    }, [wasteData, showTopOnlyWaste, selectedWasteTypes]);

    // Sort by totalUsed descending, apply material filter, and optionally slice to top 5
    const filteredRecyclabilityData = React.useMemo(() => {
        if (selectedMaterials.length > 0) {
            return recyclabilityData.filter(d => selectedMaterials.includes(d.name));
        }
        const sorted = [...recyclabilityData].sort((a, b) => b.totalUsed - a.totalUsed);
        return showTopOnly ? sorted.slice(0, 5) : sorted;
    }, [recyclabilityData, showTopOnly, selectedMaterials]);

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
                            Top 5
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

    const renderWasteTypeFilter = () => {
        if (!selectedClient || wasteTypeOptions.length === 0) return null;

        return (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-bold text-gray-700">Filter Treatment Types</span>
                        <span className="text-xs text-gray-400">({wasteTypeOptions.length} total)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setShowTopOnlyWaste(true); setSelectedWasteTypes([]); }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${showTopOnlyWaste && selectedWasteTypes.length === 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Top 5
                        </button>
                        <button
                            onClick={() => { setShowTopOnlyWaste(false); setSelectedWasteTypes([]); }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${!showTopOnlyWaste && selectedWasteTypes.length === 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Show All
                        </button>
                        {selectedWasteTypes.length > 0 && (
                            <button
                                onClick={clearWasteTypeFilter}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Search + Dropdown */}
                <div className="relative waste-type-filter-container">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search treatment types..."
                            value={wasteTypeSearch}
                            onChange={(e) => {
                                setWasteTypeSearch(e.target.value);
                                setIsWasteTypeFilterOpen(true);
                            }}
                            onFocus={() => setIsWasteTypeFilterOpen(true)}
                            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                        />
                        {wasteTypeSearch && (
                            <X
                                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                                onClick={() => setWasteTypeSearch("")}
                            />
                        )}
                    </div>

                    {/* Dropdown */}
                    {isWasteTypeFilterOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {filteredWasteTypeOptions.map((name) => (
                                <div
                                    key={name}
                                    className={`px-4 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2 ${selectedWasteTypes.includes(name)
                                        ? 'bg-green-50 text-green-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    onClick={() => toggleWasteType(name)}
                                >
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedWasteTypes.includes(name) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                        {selectedWasteTypes.includes(name) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </div>
                                    {name}
                                </div>
                            ))}
                            {filteredWasteTypeOptions.length === 0 && (
                                <div className="px-4 py-2 text-sm text-gray-400 italic">No treatment types match "{wasteTypeSearch}"</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Selected chips */}
                {selectedWasteTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {selectedWasteTypes.map((name) => (
                            <span
                                key={name}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg text-xs font-medium text-green-700"
                            >
                                {name}
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-red-500"
                                    onClick={() => toggleWasteType(name)}
                                />
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderRecyclability = () => {
        if (!selectedClient) return renderNoClient();
        if (loadingRecyclability) return renderLoading();
        if (recyclabilityData.length === 0) return renderEmpty();

        return (
            <div className="h-full flex flex-col">
                <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredRecyclabilityData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} />
                    <Tooltip labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} />
                    <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                    <Bar dataKey="totalUsed" fill="#52C41A" radius={[4, 4, 0, 0]} name="Total Used (kg)" />
                    <Bar dataKey="recycledPercent" fill="#D9F5C5" radius={[4, 4, 0, 0]} name="Recycled (%)" />
                </BarChart>
            </ResponsiveContainer>
                </div>
            </div>
        );
    };

    const renderWasteEmission = () => {
        if (!selectedClient) return renderNoClient();
        if (loadingWaste) return renderLoading();
        if (wasteData.length === 0) return renderEmpty();

        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredWasteData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} />
                    <Tooltip labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} />
                    <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                    <Bar dataKey="weight" fill="#D9F5C5" radius={[4, 4, 0, 0]} name="Waste Weight (kg)" />
                    <Bar dataKey="emission" fill="#52C41A" radius={[4, 4, 0, 0]} name="Emission (kg CO₂e)" />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="Packaging Emission Details"
                    subtitle="In-depth analysis of packaging carbon footprint"
                    onBack={() => navigate("/dashboard", { state: { selectedClient } })}
                    icon={Package}
                />

                {/* Filters */}
                <div className="flex justify-start mb-8">
                    <div className="w-full md:w-64 relative">
                        <label className="text-xs font-bold text-gray-500 block mb-2">Select Client</label>
                        <div
                            className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 cursor-pointer"
                            onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{selectedClient ? selectedClient.user_name : "Select Client"}</span>
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

                <div className="space-y-6">
                    {/* Material Recyclability Section */}
                    {renderMaterialFilter()}
                    <ChartCard title="Material Recyclability" showExpand onExpand={() => setExpandedChart("recyclability")}>
                        {renderRecyclability()}
                    </ChartCard>

                    {/* Packaging & Waste Emission Section */}
                    {renderWasteTypeFilter()}
                    <ChartCard title="Packaging & Waste Emission by Treatment" showExpand onExpand={() => setExpandedChart("emission")}>
                        {renderWasteEmission()}
                    </ChartCard>
                </div>
            </div>

            {/* Expansion Modals */}
            <ChartModal isOpen={expandedChart === "recyclability"} onClose={() => setExpandedChart(null)} title="Material Recyclability">
                {renderRecyclability()}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "emission"} onClose={() => setExpandedChart(null)} title="Packaging & Waste Emission by Treatment">
                {renderWasteEmission()}
            </ChartModal>
        </div>
    );
};

export default DetailedPackagingEmission;
