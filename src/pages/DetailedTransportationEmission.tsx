import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Users,
    ChevronDown,
    Truck,
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
    ComposedChart
} from "recharts";
import {
    DetailedHeader,
    ChartCard,
    ChartModal
} from "../components/DashboardComponents";
import dashboardService from "../lib/dashboardService";
import { getVehicleTypeDropdown } from "../lib/ecoInventService";

interface Client {
    user_id: string;
    user_name: string;
}

interface Supplier {
    sup_id: string;
    supplier_name: string;
}

interface ModeData {
    name: string;
    distance: number;
    emission: number;
    share: number;
}

interface AggregatedCorrelation {
    name: string;
    avgDistance: number;
    avgEmissionFactor: number;
    totalEmission: number;
    count: number;
}

const COLOR_PALETTE = ["#D9F5C5", "#B3E699", "#8CD76D", "#66C841", "#40B915", "#1A5D1A", "#347C17"];

const DetailedTransportationEmission: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    // Dropdown State
    const [clients, setClients] = useState<Client[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);

    // Chart Data State
    const [modeData, setModeData] = useState<ModeData[]>([]);
    const [rawCorrelationData, setRawCorrelationData] = useState<any[]>([]);
    const [isLoadingMode, setIsLoadingMode] = useState(false);
    const [isLoadingCorrelation, setIsLoadingCorrelation] = useState(false);

    // Mode of Transport filter (for Mode of Transportation Emission chart)
    const [modeFilterSearch, setModeFilterSearch] = useState("");
    const [selectedModeFilters, setSelectedModeFilters] = useState<string[]>([]);
    const [isModeFilterOpen, setIsModeFilterOpen] = useState(false);
    const [showTopOnlyMode, setShowTopOnlyMode] = useState(true);

    // Transport mode filter for correlation chart
    const [transportSearch, setTransportSearch] = useState("");
    const [selectedTransportModes, setSelectedTransportModes] = useState<string[]>([]);
    const [isTransportFilterOpen, setIsTransportFilterOpen] = useState(false);

    // Master vehicle types from setup
    const [masterVehicleTypes, setMasterVehicleTypes] = useState<string[]>([]);

    // Set Client from Navigation
    useEffect(() => {
        if (location.state?.selectedClient) {
            setSelectedClient(location.state.selectedClient);
        }
    }, [location.state]);

    // Fetch Clients and Master Vehicle Types on Mount
    useEffect(() => {
        const fetchClients = async () => {
            const result = await dashboardService.getClientsDropdown();
            if (result.success && result.data) {
                setClients(result.data);
            }
        };
        const fetchVehicleTypes = async () => {
            const types = await getVehicleTypeDropdown();
            if (Array.isArray(types)) {
                setMasterVehicleTypes(types.map(t => t.name).filter(Boolean));
            }
        };
        fetchClients();
        fetchVehicleTypes();
    }, []);

    // Fetch Suppliers and Mode Data when Client changes
    useEffect(() => {
        if (selectedClient) {
            const fetchSuppliers = async () => {
                const result = await dashboardService.getSupplierDropdown(selectedClient.user_id);
                if (result.success && result.data) {
                    setSuppliers(result.data);
                }
            };

            const fetchModeData = async () => {
                setIsLoadingMode(true);
                const result = await dashboardService.getModeOfTransportationEmission(selectedClient.user_id);
                if (result.success && result.data) {
                    const formatted = result.data.map((item: any) => ({
                        name: item.mode_of_transport || item.name || "Unknown",
                        distance: parseFloat(item.distance_km) || 0,
                        emission: parseFloat(item.co2e_kg) || 0,
                        share: parseFloat(item.share_percentage) || 0
                    }));
                    setModeData(formatted);
                }
                setIsLoadingMode(false);
            };

            fetchSuppliers();
            fetchModeData();
            setSelectedSupplier(null);
            setRawCorrelationData([]);
            setSelectedTransportModes([]);
            setTransportSearch("");
            setSelectedModeFilters([]);
            setModeFilterSearch("");
            setShowTopOnlyMode(true);
        } else {
            setSuppliers([]);
            setModeData([]);
            setRawCorrelationData([]);
        }
    }, [selectedClient]);

    // Fetch Correlation Data when Client or Supplier changes
    useEffect(() => {
        if (selectedClient) {
            const fetchCorrelationData = async () => {
                setIsLoadingCorrelation(true);
                const result = await dashboardService.getDistanceVsCorrelationEmission(
                    selectedClient.user_id,
                    selectedSupplier?.sup_id
                );
                if (result.success && Array.isArray(result.data)) {
                    setRawCorrelationData(result.data);
                } else {
                    setRawCorrelationData([]);
                }
                setIsLoadingCorrelation(false);
            };
            fetchCorrelationData();
            setSelectedTransportModes([]);
            setTransportSearch("");
        }
    }, [selectedClient, selectedSupplier]);

    // Aggregate correlation data by transport mode
    const aggregatedCorrelation: AggregatedCorrelation[] = useMemo(() => {
        if (!rawCorrelationData.length) return [];

        const grouped: { [key: string]: { distances: number[]; factors: number[]; totals: number[]; count: number } } = {};

        rawCorrelationData.forEach((item: any) => {
            const mode = item.mode_of_transport || "Unknown";
            if (!grouped[mode]) {
                grouped[mode] = { distances: [], factors: [], totals: [], count: 0 };
            }
            grouped[mode].distances.push(parseFloat(item.distance_km) || 0);
            grouped[mode].factors.push(parseFloat(item.transport_mode_emission_factor_value_kg_co2e_t_km) || 0);
            grouped[mode].totals.push(parseFloat(item.total_emission) || 0);
            grouped[mode].count += 1;
        });

        return Object.entries(grouped).map(([name, data]) => ({
            name,
            avgDistance: Math.round(data.distances.reduce((a, b) => a + b, 0) / data.distances.length),
            avgEmissionFactor: parseFloat((data.factors.reduce((a, b) => a + b, 0) / data.factors.length).toFixed(4)),
            totalEmission: parseFloat(data.totals.reduce((a, b) => a + b, 0).toFixed(2)),
            count: data.count
        })).sort((a, b) => b.totalEmission - a.totalEmission);
    }, [rawCorrelationData]);

    // All transport mode names — merge master setup list + aggregated data
    const allTransportModes = useMemo(() => {
        const names = new Set<string>();
        masterVehicleTypes.forEach(n => names.add(n));
        aggregatedCorrelation.forEach(d => names.add(d.name));
        return Array.from(names).sort();
    }, [masterVehicleTypes, aggregatedCorrelation]);

    const filteredTransportOptions = useMemo(() => {
        if (!transportSearch) return allTransportModes;
        return allTransportModes.filter(n => n.toLowerCase().includes(transportSearch.toLowerCase()));
    }, [allTransportModes, transportSearch]);

    // Filtered correlation data
    const displayedCorrelation = useMemo(() => {
        if (selectedTransportModes.length > 0) {
            return aggregatedCorrelation.filter(d => selectedTransportModes.includes(d.name));
        }
        return aggregatedCorrelation;
    }, [aggregatedCorrelation, selectedTransportModes]);

    // All mode names for the Mode chart filter — merge master setup + chart data
    const allModeFilterOptions = useMemo(() => {
        const names = new Set<string>();
        masterVehicleTypes.forEach(n => names.add(n));
        modeData.forEach(d => names.add(d.name));
        return Array.from(names).sort();
    }, [masterVehicleTypes, modeData]);

    const filteredModeFilterOptions = useMemo(() => {
        if (!modeFilterSearch) return allModeFilterOptions;
        return allModeFilterOptions.filter(n => n.toLowerCase().includes(modeFilterSearch.toLowerCase()));
    }, [allModeFilterOptions, modeFilterSearch]);

    // Filtered mode data for the Mode of Transportation chart
    const filteredModeData = useMemo(() => {
        let data = [...modeData];
        if (selectedModeFilters.length > 0) {
            data = data.filter(d => selectedModeFilters.includes(d.name));
        }
        const sorted = data.sort((a, b) => b.emission - a.emission);
        return showTopOnlyMode ? sorted.slice(0, 5) : sorted;
    }, [modeData, selectedModeFilters, showTopOnlyMode]);

    // Close filter dropdowns on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.transport-filter-container')) {
                setIsTransportFilterOpen(false);
            }
            if (!target.closest('.mode-filter-container')) {
                setIsModeFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

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

    const renderTransportMode = (isModal = false) => {
        if (isLoadingMode) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
            );
        }

        if (filteredModeData.length === 0) {
            return (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                    {selectedClient ? "No data found for this selection" : "Select a client to view emission data"}
                </div>
            );
        }

        // Normalize each metric to 0-100% of its own max so all 3 bars are visible
        const maxDistance = Math.max(...filteredModeData.map(d => d.distance)) || 1;
        const maxEmission = Math.max(...filteredModeData.map(d => d.emission)) || 1;
        const maxShare = Math.max(...filteredModeData.map(d => d.share)) || 1;

        const normalizedData = filteredModeData.map(d => ({
            ...d,
            displayName: cleanName(d.name),
            distanceNorm: (d.distance / maxDistance) * 100,
            emissionNorm: (d.emission / maxEmission) * 100,
            shareNorm: (d.share / maxShare) * 100,
        }));

        const CustomModeTooltip = ({ active, payload }: any) => {
            if (!active || !payload || payload.length === 0) return null;
            const fullName = payload[0]?.payload?.name;
            const original = modeData.find(d => d.name === fullName);
            if (!original) return null;
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-bold text-gray-800 mb-2">{fullName}</p>
                    <p className="text-green-600"><span className="inline-block w-3 h-3 bg-[#52C41A] rounded-sm mr-1.5"></span>Distance: <span className="font-bold">{original.distance.toLocaleString()} km</span></p>
                    <p className="text-green-700"><span className="inline-block w-3 h-3 bg-[#B3E699] rounded-sm mr-1.5"></span>CO₂e: <span className="font-bold">{original.emission.toLocaleString()} kg</span></p>
                    <p className="text-green-900"><span className="inline-block w-3 h-3 bg-[#1A5D1A] rounded-sm mr-1.5"></span>Share: <span className="font-bold">{original.share}%</span></p>
                </div>
            );
        };

        return (
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={normalizedData} margin={{ top: 20, right: 20, left: 20, bottom: 45 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
                    <YAxis hide={true} domain={[0, 110]} />
                    <Tooltip content={<CustomModeTooltip />} cursor={{ fill: '#F9FAFB' }} />
                    <Legend verticalAlign="top" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingBottom: '10px' }} />
                    <Bar dataKey="distanceNorm" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={isModal ? 30 : 16} name="Distance (km)" />
                    <Bar dataKey="emissionNorm" fill="#B3E699" radius={[4, 4, 0, 0]} barSize={isModal ? 30 : 16} name="CO₂e (kg)" />
                    <Bar dataKey="shareNorm" fill="#1A5D1A" radius={[4, 4, 0, 0]} barSize={isModal ? 30 : 16} name="Share (%)" />
                </ComposedChart>
            </ResponsiveContainer>
        );
    };

    const renderDistanceCorrelation = (isModal = false) => {
        if (isLoadingCorrelation) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
            );
        }

        if (displayedCorrelation.length === 0) {
            return (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                    {selectedClient ? "No correlation data found" : "Select a client to view correlation data"}
                </div>
            );
        }

        // Normalize so all 3 metrics are visible
        const maxDist = Math.max(...displayedCorrelation.map(d => d.avgDistance)) || 1;
        const maxFactor = Math.max(...displayedCorrelation.map(d => d.avgEmissionFactor)) || 1;
        const maxTotal = Math.max(...displayedCorrelation.map(d => d.totalEmission)) || 1;

        const normalizedData = displayedCorrelation.map((d, index) => ({
            ...d,
            displayName: cleanName(d.name),
            distNorm: (d.avgDistance / maxDist) * 100,
            factorNorm: (d.avgEmissionFactor / maxFactor) * 100,
            totalNorm: (d.totalEmission / maxTotal) * 100,
            color: COLOR_PALETTE[index % COLOR_PALETTE.length]
        }));

        const CustomCorrelationTooltip = ({ active, payload }: any) => {
            if (!active || !payload || payload.length === 0) return null;
            const fullName = payload[0]?.payload?.name;
            const original = displayedCorrelation.find(d => d.name === fullName);
            if (!original) return null;
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-bold text-gray-800 mb-2">{fullName}</p>
                    <p className="text-gray-500 mb-2">{original.count} shipment{original.count > 1 ? 's' : ''}</p>
                    <p className="text-green-600"><span className="inline-block w-3 h-3 bg-[#52C41A] rounded-sm mr-1.5"></span>Avg Distance: <span className="font-bold">{original.avgDistance.toLocaleString()} km</span></p>
                    <p className="text-green-700"><span className="inline-block w-3 h-3 bg-[#B3E699] rounded-sm mr-1.5"></span>Avg Emission Factor: <span className="font-bold">{original.avgEmissionFactor} kg CO₂e/t·km</span></p>
                    <p className="text-green-900"><span className="inline-block w-3 h-3 bg-[#1A5D1A] rounded-sm mr-1.5"></span>Total Emission: <span className="font-bold">{original.totalEmission.toLocaleString()} kg CO₂e</span></p>
                </div>
            );
        };

        return (
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={normalizedData} margin={{ top: 20, right: 20, left: 20, bottom: 45 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
                    <YAxis hide={true} domain={[0, 110]} />
                    <Tooltip content={<CustomCorrelationTooltip />} cursor={{ fill: '#F9FAFB' }} />
                    <Legend verticalAlign="top" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingBottom: '10px' }} />
                    <Bar dataKey="distNorm" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={isModal ? 30 : 18} name="Avg Distance (km)" />
                    <Bar dataKey="factorNorm" fill="#B3E699" radius={[4, 4, 0, 0]} barSize={isModal ? 30 : 18} name="Avg Emission Factor" />
                    <Bar dataKey="totalNorm" fill="#1A5D1A" radius={[4, 4, 0, 0]} barSize={isModal ? 30 : 18} name="Total Emission (kg CO₂e)" />
                </ComposedChart>
            </ResponsiveContainer>
        );
    };

    const toggleModeFilter = (name: string) => {
        setSelectedModeFilters(prev =>
            prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
        );
    };

    const renderModeFilter = () => {
        if (!selectedClient || allModeFilterOptions.length === 0) return null;

        return (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-bold text-gray-700">Filter Transport Modes</span>
                        <span className="text-xs text-gray-400">({allModeFilterOptions.length} modes)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setShowTopOnlyMode(true); setSelectedModeFilters([]); }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${showTopOnlyMode && selectedModeFilters.length === 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Top 5
                        </button>
                        <button
                            onClick={() => { setShowTopOnlyMode(false); setSelectedModeFilters([]); }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${!showTopOnlyMode && selectedModeFilters.length === 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Show All
                        </button>
                        {selectedModeFilters.length > 0 && (
                            <button
                                onClick={() => { setSelectedModeFilters([]); setShowTopOnlyMode(true); setModeFilterSearch(""); }}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative mode-filter-container">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search transport modes..."
                            value={modeFilterSearch}
                            onChange={(e) => { setModeFilterSearch(e.target.value); setIsModeFilterOpen(true); }}
                            onFocus={() => setIsModeFilterOpen(true)}
                            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                        />
                        {modeFilterSearch && (
                            <X className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setModeFilterSearch("")} />
                        )}
                    </div>

                    {isModeFilterOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {filteredModeFilterOptions.map((name) => (
                                <div
                                    key={name}
                                    className={`px-4 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2 ${selectedModeFilters.includes(name) ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                    onClick={() => toggleModeFilter(name)}
                                >
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedModeFilters.includes(name) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                        {selectedModeFilters.includes(name) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </div>
                                    {name}
                                </div>
                            ))}
                            {filteredModeFilterOptions.length === 0 && (
                                <div className="px-4 py-2 text-sm text-gray-400 italic">No modes match "{modeFilterSearch}"</div>
                            )}
                        </div>
                    )}
                </div>

                {selectedModeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {selectedModeFilters.map((name) => (
                            <span key={name} className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg text-xs font-medium text-green-700">
                                {name}
                                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => toggleModeFilter(name)} />
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const toggleTransportMode = (name: string) => {
        setSelectedTransportModes(prev =>
            prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
        );
    };

    const renderTransportFilter = () => {
        if (!selectedClient || allTransportModes.length === 0) return null;

        return (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-bold text-gray-700">Filter Transport Modes</span>
                        <span className="text-xs text-gray-400">({allTransportModes.length} modes)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedTransportModes([])}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${selectedTransportModes.length === 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Show All
                        </button>
                        {selectedTransportModes.length > 0 && (
                            <button
                                onClick={() => { setSelectedTransportModes([]); setTransportSearch(""); }}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative transport-filter-container">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search transport modes..."
                            value={transportSearch}
                            onChange={(e) => { setTransportSearch(e.target.value); setIsTransportFilterOpen(true); }}
                            onFocus={() => setIsTransportFilterOpen(true)}
                            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                        />
                        {transportSearch && (
                            <X className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setTransportSearch("")} />
                        )}
                    </div>

                    {isTransportFilterOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {filteredTransportOptions.map((name) => (
                                <div
                                    key={name}
                                    className={`px-4 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2 ${selectedTransportModes.includes(name) ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                    onClick={() => toggleTransportMode(name)}
                                >
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedTransportModes.includes(name) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                        {selectedTransportModes.includes(name) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </div>
                                    {name}
                                </div>
                            ))}
                            {filteredTransportOptions.length === 0 && (
                                <div className="px-4 py-2 text-sm text-gray-400 italic">No modes match "{transportSearch}"</div>
                            )}
                        </div>
                    )}
                </div>

                {selectedTransportModes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {selectedTransportModes.map((name) => (
                            <span key={name} className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg text-xs font-medium text-green-700">
                                {name}
                                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => toggleTransportMode(name)} />
                            </span>
                        ))}
                    </div>
                )}
            </div>
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

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="Transportation Emission Details"
                    subtitle="Comprehensive analysis of emissions from various transportation methods"
                    onBack={() => navigate("/dashboard", { state: { selectedClient } })}
                    icon={Truck}
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

                <div className="space-y-6">
                    {/* Mode of Transportation Filter + Chart */}
                    {renderModeFilter()}
                    <ChartCard title="Mode of Transportation Emission" showExpand onExpand={() => setExpandedChart("mode")}>
                        {renderTransportMode()}
                    </ChartCard>

                    {/* Transport Mode Filter for Correlation chart */}
                    {renderTransportFilter()}

                    <ChartCard title="Distance vs Emission Correlation" showExpand onExpand={() => setExpandedChart("correlation")}>
                        {renderDistanceCorrelation()}
                    </ChartCard>
                </div>
            </div>

            {/* Expansion Modals */}
            <ChartModal isOpen={expandedChart === "mode"} onClose={() => setExpandedChart(null)} title="Mode of Transportation Emission">
                {renderTransportMode(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "correlation"} onClose={() => setExpandedChart(null)} title="Distance vs Emission Correlation">
                {renderDistanceCorrelation(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedTransportationEmission;
