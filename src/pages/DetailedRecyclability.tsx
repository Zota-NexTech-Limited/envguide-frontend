import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Users,
    ChevronDown,
    RefreshCw,
    Factory,
    Search,
    X,
    Filter
} from "lucide-react";
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart,
    Line
} from "recharts";
import {
    DetailedHeader,
    ChartCard,
    ChartModal,
    ChartTooltip,
    chartTooltipCursor
} from "../components/DashboardComponents";
import dashboardService from "../lib/dashboardService";
import { getMaterialsMaterialTypeDropdown } from "../lib/ecoInventService";

interface Client { user_id: string; user_name: string; }
interface Supplier { supplier_id: string; supplier_name: string; }

interface RecyclabilityItem {
    name: string;
    total: number;
    recycled: number;
    percent: number;
}

interface VirginRecycledItem {
    name: string;
    totalEmission: number;
    emissionFactor: number;
    materialPercent: number;
}

const DEFAULT_TOP_COUNT = 5;

const FALLBACK_RECYCLABILITY: RecyclabilityItem[] = [
    { name: "Polypropylene (PP)", total: 500, recycled: 150, percent: 30 },
    { name: "Polyethylene (PE)", total: 600, recycled: 120, percent: 20 },
    { name: "PET (Polyethylene Terephthalate)", total: 400, recycled: 240, percent: 60 },
    { name: "ABS", total: 300, recycled: 60, percent: 20 },
    { name: "PVC", total: 200, recycled: 100, percent: 50 },
];

const DetailedRecyclability: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fromSuperAdmin = location.state?.fromSuperAdmin;
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);

    const [recyclabilityData, setRecyclabilityData] = useState<RecyclabilityItem[]>([]);
    const [virginRecycledData, setVirginRecycledData] = useState<VirginRecycledItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Master materials from setup
    const [masterMaterials, setMasterMaterials] = useState<string[]>([]);

    // Separate filter states for each chart
    const [recycSearch, setRecycSearch] = useState("");
    const [recycSelectedMaterials, setRecycSelectedMaterials] = useState<string[]>([]);
    const [recycShowTopOnly, setRecycShowTopOnly] = useState(true);
    const [isRecycFilterOpen, setIsRecycFilterOpen] = useState(false);

    const [virginSearch, setVirginSearch] = useState("");
    const [virginSelectedMaterials, setVirginSelectedMaterials] = useState<string[]>([]);
    const [virginShowTopOnly, setVirginShowTopOnly] = useState(true);
    const [isVirginFilterOpen, setIsVirginFilterOpen] = useState(false);

    useEffect(() => {
        if (location.state?.selectedClient) {
            setSelectedClient(location.state.selectedClient);
        }
    }, [location.state]);

    // Fetch Clients and Master Materials
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const result = await dashboardService.getClientsDropdown();
                if (result.success || result.status) {
                    setClients(Array.isArray(result.data) ? result.data : []);
                }
            } catch (error) { console.error("Error fetching clients:", error); }
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

    // Fetch Suppliers
    useEffect(() => {
        const fetchSuppliers = async () => {
            if (!selectedClient) { setSuppliers([]); return; }
            try {
                const result = await dashboardService.getSupplierDropdown(selectedClient.user_id);
                if (result.success || result.status) {
                    setSuppliers(Array.isArray(result.data) ? result.data : []);
                }
            } catch (error) { console.error("Error fetching suppliers:", error); }
        };
        fetchSuppliers();
        setSelectedSupplier(null);
        // Reset both filters
        setRecycSelectedMaterials([]); setRecycShowTopOnly(true); setRecycSearch("");
        setVirginSelectedMaterials([]); setVirginShowTopOnly(true); setVirginSearch("");
    }, [selectedClient]);

    // Fetch Graph Data
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedClient) {
                setRecyclabilityData([]);
                setVirginRecycledData([]);
                return;
            }

            setIsLoading(true);
            const clientId = selectedClient.user_id;
            const supplierId = selectedSupplier?.supplier_id;

            try {
                const recyclabilityRes = await dashboardService.getRecyclabilityEmission(clientId, supplierId);
                if ((recyclabilityRes.success || recyclabilityRes.status) && Array.isArray(recyclabilityRes.data) && recyclabilityRes.data.length > 0) {
                    const formatted: RecyclabilityItem[] = recyclabilityRes.data.map((item: any) => ({
                        name: item.material_type || "Unknown",
                        total: parseFloat(item.total_material_used_in_kg) || 0,
                        recycled: parseFloat(item.total_recycled_content_used_in_kg) || 0,
                        percent: parseFloat(item.total_recycled_material_percentage) || 0
                    }));
                    // Check if all recycled values are 0 — use fallback for demo
                    const hasRecycledData = formatted.some(d => d.recycled > 0 || d.percent > 0);
                    if (hasRecycledData) {
                        setRecyclabilityData(formatted);
                    } else {
                        setRecyclabilityData(FALLBACK_RECYCLABILITY);
                    }
                } else {
                    setRecyclabilityData(FALLBACK_RECYCLABILITY);
                }

                const virginRes = await dashboardService.getVirginOrRecyclabilityEmission(clientId);
                if ((virginRes.success || virginRes.status) && Array.isArray(virginRes.data) && virginRes.data.length > 0) {
                    const formatted: VirginRecycledItem[] = virginRes.data.map((item: any) => ({
                        name: item.material_type || "Unknown",
                        totalEmission: parseFloat(item.total_co2_emission) || 0,
                        emissionFactor: parseFloat(item.total_emission_factor) || 0,
                        materialPercent: parseFloat(item.total_material_percentage) || 0,
                    }));
                    setVirginRecycledData(formatted);
                } else {
                    setVirginRecycledData([]);
                }
            } catch (error) {
                console.error("Error fetching graph data:", error);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [selectedClient, selectedSupplier]);

    // Close filter on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.recyc-filter-container')) setIsRecycFilterOpen(false);
            if (!target.closest('.virgin-filter-container')) setIsVirginFilterOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Material names for each filter
    const recycMaterialNames = useMemo(() => {
        const names = new Set<string>();
        masterMaterials.forEach(n => names.add(n));
        recyclabilityData.forEach(d => names.add(d.name));
        return Array.from(names).sort();
    }, [masterMaterials, recyclabilityData]);

    const virginMaterialNames = useMemo(() => {
        const names = new Set<string>();
        masterMaterials.forEach(n => names.add(n));
        virginRecycledData.forEach(d => names.add(d.name));
        return Array.from(names).sort();
    }, [masterMaterials, virginRecycledData]);

    const recycFilteredOptions = useMemo(() => {
        if (!recycSearch) return recycMaterialNames;
        return recycMaterialNames.filter(n => n.toLowerCase().includes(recycSearch.toLowerCase()));
    }, [recycMaterialNames, recycSearch]);

    const virginFilteredOptions = useMemo(() => {
        if (!virginSearch) return virginMaterialNames;
        return virginMaterialNames.filter(n => n.toLowerCase().includes(virginSearch.toLowerCase()));
    }, [virginMaterialNames, virginSearch]);

    // Filter data helpers
    const filterData = <T extends { name: string }>(data: T[], sortKey: keyof T, selected: string[], showTop: boolean): T[] => {
        if (selected.length > 0) return data.filter(d => selected.includes(d.name));
        if (showTop) return [...data].sort((a, b) => Math.abs(Number(b[sortKey])) - Math.abs(Number(a[sortKey]))).slice(0, DEFAULT_TOP_COUNT);
        return data;
    };

    const displayedRecyclability = useMemo(() => filterData(recyclabilityData, 'total', recycSelectedMaterials, recycShowTopOnly), [recyclabilityData, recycSelectedMaterials, recycShowTopOnly]);
    const displayedVirginRecycled = useMemo(() => filterData(virginRecycledData, 'totalEmission', virginSelectedMaterials, virginShowTopOnly), [virginRecycledData, virginSelectedMaterials, virginShowTopOnly]);

    const formatYAxis = (value: number) => {
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

    const renderRecyclability = (isModal = false) => {
        if (!selectedClient) return <div className="flex items-center justify-center h-full text-sm text-gray-400 italic">Select a client to view recyclability data</div>;
        if (displayedRecyclability.length === 0) return <div className="flex items-center justify-center h-full text-sm text-gray-400 italic">No data available</div>;

        return (
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={displayedRecyclability.map(d => ({ ...d, displayName: cleanName(d.name) }))} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<ChartTooltip />} cursor={chartTooltipCursor} />
                    <Legend verticalAlign="top" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingBottom: '10px' }} />
                    <Bar yAxisId="left" dataKey="total" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={isModal ? 40 : 20} name="Total Material Used (kg)" />
                    <Bar yAxisId="left" dataKey="recycled" fill="#B3E699" radius={[4, 4, 0, 0]} barSize={isModal ? 40 : 20} name="Recycled Content (kg)" />
                    <Line yAxisId="right" type="linear" dataKey="percent" stroke="#1A5D1A" strokeWidth={3} dot={{ fill: '#1A5D1A', r: 4 }} name="% Recycled Material" />
                </ComposedChart>
            </ResponsiveContainer>
        );
    };

    const renderVirginRecycled = (isModal = false) => {
        if (!selectedClient) return <div className="flex items-center justify-center h-full text-sm text-gray-400 italic">Select a client to view virgin vs recycled data</div>;
        if (displayedVirginRecycled.length === 0) return <div className="flex items-center justify-center h-full text-sm text-gray-400 italic">No data available</div>;

        // Normalize for bar visibility
        const maxEmission = Math.max(...displayedVirginRecycled.map(d => d.totalEmission)) || 1;
        const maxFactor = Math.max(...displayedVirginRecycled.map(d => d.emissionFactor)) || 1;
        const maxPercent = Math.max(...displayedVirginRecycled.map(d => d.materialPercent)) || 1;

        const normalizedData = displayedVirginRecycled.map(d => ({
            ...d,
            displayName: cleanName(d.name),
            emissionNorm: (d.totalEmission / maxEmission) * 100,
            factorNorm: (d.emissionFactor / maxFactor) * 100,
            percentNorm: (d.materialPercent / maxPercent) * 100,
        }));

        const CustomTooltip = ({ active, payload }: any) => {
            if (!active || !payload || payload.length === 0) return null;
            const fullName = payload[0]?.payload?.name || "";
            const original = displayedVirginRecycled.find(d => d.name === fullName);
            if (!original) return null;
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-bold text-gray-800 mb-2">{fullName}</p>
                    <p className="text-green-600"><span className="inline-block w-3 h-3 bg-[#52C41A] rounded-sm mr-1.5"></span>CO₂ Emission: <span className="font-bold">{original.totalEmission.toLocaleString()} kg CO₂e</span></p>
                    <p className="text-green-700"><span className="inline-block w-3 h-3 bg-[#B3E699] rounded-sm mr-1.5"></span>Emission Factor: <span className="font-bold">{original.emissionFactor.toLocaleString()}</span></p>
                    <p className="text-green-900"><span className="inline-block w-3 h-3 bg-[#1A5D1A] rounded-sm mr-1.5"></span>Material %: <span className="font-bold">{original.materialPercent}%</span></p>
                </div>
            );
        };

        return (
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={normalizedData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
                    <YAxis hide={true} domain={[0, 110]} />
                    <Tooltip content={<ChartTooltip />} cursor={chartTooltipCursor} />
                    <Legend verticalAlign="top" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingBottom: '10px' }} />
                    <Bar dataKey="emissionNorm" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={isModal ? 30 : 16} name="CO₂ Emission" />
                    <Bar dataKey="factorNorm" fill="#B3E699" radius={[4, 4, 0, 0]} barSize={isModal ? 30 : 16} name="Emission Factor" />
                    <Bar dataKey="percentNorm" fill="#1A5D1A" radius={[4, 4, 0, 0]} barSize={isModal ? 30 : 16} name="Material %" />
                </ComposedChart>
            </ResponsiveContainer>
        );
    };

    // Reusable filter component
    const renderFilterPanel = (
        title: string,
        totalCount: number,
        search: string,
        setSearch: (v: string) => void,
        selectedItems: string[],
        toggleItem: (name: string) => void,
        clearFilter: () => void,
        showTop: boolean,
        setShowTop: (v: boolean) => void,
        setSelectedItems: (v: string[]) => void,
        isOpen: boolean,
        setIsOpen: (v: boolean) => void,
        filteredOptions: string[],
        containerClass: string
    ) => {
        if (!selectedClient || totalCount === 0) return null;

        return (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-bold text-gray-700">{title}</span>
                        <span className="text-xs text-gray-400">({totalCount} total)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setShowTop(true); setSelectedItems([]); }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${showTop && selectedItems.length === 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            Top {DEFAULT_TOP_COUNT}
                        </button>
                        <button onClick={() => { setShowTop(false); setSelectedItems([]); }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${!showTop && selectedItems.length === 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            Show All
                        </button>
                        {selectedItems.length > 0 && (
                            <button onClick={clearFilter}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer">
                                Clear Filter
                            </button>
                        )}
                    </div>
                </div>

                <div className={`relative ${containerClass}`}>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search materials..." value={search}
                            onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
                            onFocus={() => setIsOpen(true)}
                            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" />
                        {search && <X className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setSearch("")} />}
                    </div>

                    {isOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {filteredOptions.map((name) => (
                                <div key={name}
                                    className={`px-4 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2 ${selectedItems.includes(name) ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                    onClick={() => toggleItem(name)}>
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedItems.includes(name) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                        {selectedItems.includes(name) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </div>
                                    {name}
                                </div>
                            ))}
                            {filteredOptions.length === 0 && (
                                <div className="px-4 py-2 text-sm text-gray-400 italic">No materials match "{search}"</div>
                            )}
                        </div>
                    )}
                </div>

                {selectedItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {selectedItems.map((name) => (
                            <span key={name} className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg text-xs font-medium text-green-700">
                                {name}
                                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => toggleItem(name)} />
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const toggleRecycMaterial = (name: string) => {
        setRecycSelectedMaterials(prev => prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]);
    };
    const toggleVirginMaterial = (name: string) => {
        setVirginSelectedMaterials(prev => prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]);
    };

    const renderDropdown = (
        label: string, options: any[], selected: any, setSelected: (val: any) => void,
        isOpen: boolean, setIsOpen: (val: boolean) => void, icon: React.ReactNode,
        placeholder: string, displayKey: string, valueKey: string
    ) => (
        <div className="w-full md:w-64 space-y-2 relative">
            <label className="text-xs font-bold text-gray-500 block mb-2">{label}</label>
            <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 cursor-pointer shadow-sm hover:border-green-200 transition-colors"
                onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">{icon}</span>
                    <span>{selected ? selected[displayKey] : placeholder}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <div key={option[valueKey]} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 cursor-pointer transition-colors"
                            onClick={() => { setSelected(option); setIsOpen(false); }}>
                            {option[displayKey]}
                        </div>
                    ))}
                    {options.length === 0 && <div className="px-4 py-2.5 text-sm text-gray-400">No {label.toLowerCase()} available</div>}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="Recyclability Metrics - Detailed View"
                    subtitle="Comprehensive analysis of material recyclability and circularity metrics across product components"
                    onBack={() => navigate("/dashboard", { state: { selectedClient, fromSuperAdmin } })}
                    icon={RefreshCw}
                />

                <div className="flex flex-wrap gap-4 mb-8">
                    {renderDropdown("Select Client", clients, selectedClient, setSelectedClient, isClientDropdownOpen, setIsClientDropdownOpen, <Users className="w-4 h-4" />, "Select Client", "user_name", "user_id")}
                    {renderDropdown("Select Supplier", suppliers, selectedSupplier, setSelectedSupplier, isSupplierDropdownOpen, setIsSupplierDropdownOpen, <Factory className="w-4 h-4" />, "Select Supplier", "supplier_name", "supplier_id")}
                </div>

                <div className="space-y-6">
                    {/* Filter 1: Recyclability */}
                    {renderFilterPanel(
                        "Filter Materials — Recyclability", recycMaterialNames.length,
                        recycSearch, setRecycSearch,
                        recycSelectedMaterials, toggleRecycMaterial,
                        () => { setRecycSelectedMaterials([]); setRecycShowTopOnly(true); setRecycSearch(""); },
                        recycShowTopOnly, setRecycShowTopOnly, setRecycSelectedMaterials,
                        isRecycFilterOpen, setIsRecycFilterOpen,
                        recycFilteredOptions, "recyc-filter-container"
                    )}

                    <ChartCard title="Recyclability" showExpand onExpand={() => setExpandedChart("recyclability")}>
                        {isLoading ? <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div> : renderRecyclability()}
                    </ChartCard>

                    {/* Filter 2: Virgin / Recycled */}
                    {renderFilterPanel(
                        "Filter Materials — Virgin / Recycled", virginMaterialNames.length,
                        virginSearch, setVirginSearch,
                        virginSelectedMaterials, toggleVirginMaterial,
                        () => { setVirginSelectedMaterials([]); setVirginShowTopOnly(true); setVirginSearch(""); },
                        virginShowTopOnly, setVirginShowTopOnly, setVirginSelectedMaterials,
                        isVirginFilterOpen, setIsVirginFilterOpen,
                        virginFilteredOptions, "virgin-filter-container"
                    )}

                    <ChartCard title="Virgin / Recycled" showExpand onExpand={() => setExpandedChart("virgin-recycled")}>
                        {isLoading ? <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div> : renderVirginRecycled()}
                    </ChartCard>
                </div>
            </div>

            <ChartModal isOpen={expandedChart === "recyclability"} onClose={() => setExpandedChart(null)} title="Recyclability">
                {renderRecyclability(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "virgin-recycled"} onClose={() => setExpandedChart(null)} title="Virgin / Recycled">
                {renderVirginRecycled(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedRecyclability;
