import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Users,
    ChevronDown,
    Factory,
    LineChart as LineChartIcon,
    RefreshCw,
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
    Legend,
    ComposedChart,
    Line
} from "recharts";
import {
    DetailedHeader,
    ChartCard,
    ChartModal
} from "../components/DashboardComponents";
import dashboardService from "../lib/dashboardService";

interface ReductionData {
    name: string;
    emission: number;
    reduction: number;
    product: string;
    year: number;
}

interface ActualEmissionData {
    name: string;
    actual: number;
}

interface ForecastedData {
    name: string;
    emission: number;
}

const DEFAULT_REDUCTION: ReductionData[] = [
  { name: "2021", emission: 3800, reduction: 0, product: "All Products", year: 2021 },
  { name: "2022", emission: 3500, reduction: 7.9, product: "All Products", year: 2022 },
  { name: "2023", emission: 3200, reduction: 8.6, product: "All Products", year: 2023 },
  { name: "2024", emission: 2847, reduction: 11.0, product: "All Products", year: 2024 },
  { name: "2025", emission: 2650, reduction: 6.9, product: "All Products", year: 2025 },
];
const DEFAULT_ACTUAL: ActualEmissionData[] = [
  { name: "Gear Shaft", actual: 4010 },
  { name: "Motor Mount", actual: 9955 },
  { name: "Bearing Housing", actual: 5748 },
  { name: "Assembly Unit", actual: 2200 },
];
const DEFAULT_FORECASTED: ForecastedData[] = [
  { name: "2023", emission: 3200 },
  { name: "2024", emission: 2847 },
  { name: "2025", emission: 2650 },
  { name: "2026", emission: 2400 },
  { name: "2027", emission: 2150 },
  { name: "2028", emission: 1900 },
  { name: "2029", emission: 1700 },
  { name: "2030", emission: 1500 },
];

const DetailedPCFTrend: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    // Dropdown state
    const [clients, setClients] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);

    // Filter state
    const [selectedProduct, setSelectedProduct] = useState<string>("all");
    const [selectedYearRange, setSelectedYearRange] = useState<string>("all");
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

    // Data state
    const [reductionData, setReductionData] = useState<ReductionData[]>(DEFAULT_REDUCTION);
    const [actualEmissionData, setActualEmissionData] = useState<ActualEmissionData[]>(DEFAULT_ACTUAL);
    const [forecastedEmissionData, setForecastedEmissionData] = useState<ForecastedData[]>(DEFAULT_FORECASTED);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (location.state?.selectedClient) {
            setSelectedClient(location.state.selectedClient);
        }
    }, [location.state]);

    useEffect(() => {
        if (selectedClient) {
            fetchSuppliers(selectedClient.user_id);
            fetchGraphData(selectedClient.user_id);
        } else {
            setReductionData(DEFAULT_REDUCTION);
            setActualEmissionData(DEFAULT_ACTUAL);
            setForecastedEmissionData(DEFAULT_FORECASTED);
            setSuppliers([]);
            setSelectedSupplier(null);
            setSelectedProduct("all");
            setSelectedYearRange("all");
        }
    }, [selectedClient]);

    const fetchClients = async () => {
        const response = await dashboardService.getClientsDropdown();
        if (response.success || response.status) {
            const clientList = Array.isArray(response.data) ? response.data : (response.data?.data ? response.data.data : []);
            setClients(clientList);
        }
    };

    const fetchSuppliers = async (clientId: string) => {
        const response = await dashboardService.getSupplierDropdown(clientId);
        if (response.success || response.status) {
            const supplierList = Array.isArray(response.data) ? response.data : (response.data?.data ? response.data.data : []);
            setSuppliers(supplierList);
        }
    };

    const fetchGraphData = async (clientId: string) => {
        setLoading(true);

        // PCF Reduction Emission
        try {
            const reductionRes = await dashboardService.getPCFReductionEmission(clientId);
            if (reductionRes.success && reductionRes.data && reductionRes.data.length > 0) {
                const formatted = reductionRes.data.map((item: any) => ({
                    name: `${item.product_name} (${item.year})`,
                    emission: item.total_emission_kg_co2_eq,
                    reduction: item.reduction_from_previous_period_percentage || 0,
                    product: item.product_name,
                    year: item.year
                }));
                setReductionData(formatted);
            } else {
                setReductionData(DEFAULT_REDUCTION);
            }
        } catch {
            setReductionData(DEFAULT_REDUCTION);
        }

        // Actual PCF Emission
        try {
            const actualRes = await dashboardService.getActualPCFEmission(clientId);
            if (actualRes.success && actualRes.data && actualRes.data.length > 0) {
                const formatted = actualRes.data.map((item: any) => ({
                    name: item.product_name,
                    actual: item.total_overall_pcf_emission
                }));
                setActualEmissionData(formatted);
            } else {
                setActualEmissionData(DEFAULT_ACTUAL);
            }
        } catch {
            setActualEmissionData(DEFAULT_ACTUAL);
        }

        // Forecasted Emission
        try {
            const forecastedRes = await dashboardService.getForecastedEmission(clientId);
            if (forecastedRes.success && forecastedRes.data && forecastedRes.data.length > 0) {
                const formatted = forecastedRes.data.map((item: any) => ({
                    name: item.year.toString(),
                    emission: item.total_forecasted_emission_kg_co2_eq
                }));
                setForecastedEmissionData(formatted);
            } else {
                setForecastedEmissionData(DEFAULT_FORECASTED);
            }
        } catch {
            setForecastedEmissionData(DEFAULT_FORECASTED);
        }

        setLoading(false);
    };

    // Derive available products and years from reduction data
    const availableProducts = useMemo(() => {
        const products = [...new Set(reductionData.map(d => d.product))];
        return products.sort();
    }, [reductionData]);

    const availableYears = useMemo(() => {
        const years = [...new Set(reductionData.map(d => d.year))];
        return years.sort((a, b) => a - b);
    }, [reductionData]);

    const yearRangeOptions = useMemo(() => {
        if (availableYears.length === 0) return [];
        const options: { label: string; value: string }[] = [{ label: "All Years", value: "all" }];
        // Last 3 years, Last 5 years
        const maxYear = Math.max(...availableYears);
        if (availableYears.length > 3) options.push({ label: `Last 3 Years (${maxYear - 2}-${maxYear})`, value: "3" });
        if (availableYears.length > 5) options.push({ label: `Last 5 Years (${maxYear - 4}-${maxYear})`, value: "5" });
        return options;
    }, [availableYears]);

    // When "All Products" is selected, show only top 5 products by emission (to avoid overcrowding)
    const top5Products = useMemo(() => {
        // Get total emission per product
        const productTotals: Record<string, number> = {};
        reductionData.forEach(d => {
            productTotals[d.product] = (productTotals[d.product] || 0) + d.emission;
        });
        return Object.entries(productTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([name]) => name);
    }, [reductionData]);

    // Filtered reduction data
    const filteredReductionData = useMemo(() => {
        let data = reductionData;
        if (selectedProduct !== "all") {
            data = data.filter(d => d.product === selectedProduct);
        } else if (availableProducts.length > 4) {
            // Default: show top 4 products only
            data = data.filter(d => top5Products.includes(d.product));
        }
        if (selectedYearRange !== "all") {
            const maxYear = Math.max(...reductionData.map(d => d.year));
            const range = parseInt(selectedYearRange);
            data = data.filter(d => d.year >= maxYear - range + 1);
        }
        return data;
    }, [reductionData, selectedProduct, selectedYearRange, top5Products, availableProducts]);

    // Filtered actual emission data (by product filter)
    const filteredActualData = useMemo(() => {
        if (selectedProduct !== "all") {
            return actualEmissionData.filter(d => d.name === selectedProduct);
        }
        if (actualEmissionData.length > 4) {
            // Default: show top 4 by emission
            return [...actualEmissionData].sort((a, b) => b.actual - a.actual).slice(0, 4);
        }
        return actualEmissionData;
    }, [actualEmissionData, selectedProduct]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (isClientDropdownOpen && !target.closest('.client-dropdown-container')) setIsClientDropdownOpen(false);
            if (isSupplierDropdownOpen && !target.closest('.supplier-dropdown-container')) setIsSupplierDropdownOpen(false);
            if (isProductDropdownOpen && !target.closest('.product-dropdown-container')) setIsProductDropdownOpen(false);
            if (isYearDropdownOpen && !target.closest('.year-dropdown-container')) setIsYearDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isClientDropdownOpen, isSupplierDropdownOpen, isProductDropdownOpen, isYearDropdownOpen]);

    const formatYAxis = (v: number) => {
        if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
        if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
        return v.toString();
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

    const reductionChartData = useMemo(() =>
        filteredReductionData.map(item => ({
            ...item,
            displayName: item.product || item.name.replace(/\s*\(\d{4}\)\s*$/, ''),
        })),
    [filteredReductionData]);

    const actualChartData = useMemo(() =>
        filteredActualData.map(item => ({
            ...item,
            displayName: cleanName(item.name),
        })),
    [filteredActualData]);

    const renderReductionGraph = (isModal = false) => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-full min-h-[300px] text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />Loading...
                </div>
            );
        }
        const data = filteredReductionData;
        if (data.length === 0) {
            return <div className="flex items-center justify-center h-full min-h-[300px] text-sm text-gray-400">No data available</div>;
        }
        return (
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={reductionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis
                        dataKey="displayName"
                        axisLine={false}
                        tickLine={false}
                        tick={<WrappedTick />}
                        interval={reductionChartData.length > 20 ? Math.floor(reductionChartData.length / 15) : 0}
                        height={70}
                    />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={(v) => `${v.toFixed(1)}%`} />
                    <Tooltip
                        labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _}
                        formatter={(value: any, name: any) => {
                            if (name === "% Reduction") return [`${Number(value).toFixed(2)}%`, name];
                            return [Number(value).toLocaleString(), name];
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="center"
                        iconType="square"
                        iconSize={10}
                        wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '10px' }}
                    />
                    <Bar yAxisId="left" dataKey="emission" fill="#74D14C" radius={[4, 4, 0, 0]} name="Total Emission (kg CO₂e)" maxBarSize={40} />
                    <Line yAxisId="right" type="monotone" dataKey="reduction" stroke="#1A5D1A" strokeWidth={2} dot={{ fill: '#1A5D1A', r: 3 }} name="% Reduction" />
                </ComposedChart>
            </ResponsiveContainer>
        );
    };

    const renderActualEmission = (isModal = false) => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-full min-h-[300px] text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />Loading...
                </div>
            );
        }
        const data = filteredActualData;
        if (data.length === 0) {
            return <div className="flex items-center justify-center h-full min-h-[300px] text-sm text-gray-400">No data available</div>;
        }
        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actualChartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis
                        dataKey="displayName"
                        axisLine={false}
                        tickLine={false}
                        tick={<WrappedTick />}
                        interval={actualChartData.length > 15 ? Math.floor(actualChartData.length / 12) : 0}
                        height={70}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
                    <Tooltip labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} formatter={(value: any) => [Number(value).toLocaleString() + ' kg CO₂e', 'Actual Emission']} />
                    <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                    <Bar dataKey="actual" fill="#52C41A" radius={[4, 4, 0, 0]} name="Actual Emission (kg CO₂e)" maxBarSize={50} />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const renderForecastedEmission = (isModal = false) => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-full min-h-[300px] text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />Loading...
                </div>
            );
        }
        const data = forecastedEmissionData;
        if (data.length === 0) {
            return <div className="flex items-center justify-center h-full min-h-[300px] text-sm text-gray-400">No data available</div>;
        }
        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
                    <Tooltip formatter={(value: any) => [Number(value).toLocaleString() + ' kg CO₂e', 'Forecasted Emission']} />
                    <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                    <Bar dataKey="emission" fill="#74D14C" radius={[4, 4, 0, 0]} name="Forecasted Emission (kg CO₂e)" maxBarSize={60} />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const DropdownFilter = ({ label, value, options, isOpen, setIsOpen, onSelect, containerClass, icon }: {
        label: string;
        value: string;
        options: { label: string; value: string }[];
        isOpen: boolean;
        setIsOpen: (v: boolean) => void;
        onSelect: (v: string) => void;
        containerClass: string;
        icon: React.ReactNode;
    }) => (
        <div className={`w-full md:w-64 relative ${containerClass}`}>
            <label className="text-xs font-bold text-gray-500 block mb-2">{label}</label>
            <div
                className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 cursor-pointer hover:border-green-200 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {icon}
                    <span className="truncate">{options.find(o => o.value === value)?.label || value}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                                value === opt.value ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                            }`}
                            onClick={() => { onSelect(opt.value); setIsOpen(false); }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="PCF Visualisation Trends"
                    subtitle="Detailed emission insights across life cycle stages"
                    onBack={() => navigate("/dashboard", { state: { selectedClient } })}
                    icon={LineChartIcon}
                />

                {/* Primary Filters - Client & Supplier */}
                <div className="flex flex-wrap gap-4 mb-4">
                    {/* Client Dropdown */}
                    <div className="w-full md:w-64 relative client-dropdown-container">
                        <label className="text-xs font-bold text-gray-500 block mb-2">Select Client</label>
                        <div
                            className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 cursor-pointer hover:border-green-200 transition-colors"
                            onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{selectedClient ? (selectedClient.company_name || selectedClient.user_name) : "Select Client"}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isClientDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                {clients.map((client) => (
                                    <div
                                        key={client.user_id}
                                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                                            selectedClient?.user_id === client.user_id
                                                ? 'bg-green-50 text-green-600 font-medium'
                                                : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                                        }`}
                                        onClick={() => {
                                            setSelectedClient(client);
                                            setIsClientDropdownOpen(false);
                                            setSelectedSupplier(null);
                                            setSelectedProduct("all");
                                            setSelectedYearRange("all");
                                        }}
                                    >
                                        {client.company_name || client.user_name}
                                    </div>
                                ))}
                                {clients.length === 0 && (
                                    <div className="px-4 py-2.5 text-sm text-gray-400">No clients available</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Supplier Dropdown */}
                    <div className="w-full md:w-64 relative supplier-dropdown-container">
                        <label className="text-xs font-bold text-gray-500 block mb-2">Select Supplier</label>
                        <div
                            className={`flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 cursor-pointer transition-colors ${!selectedClient ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-200'}`}
                            onClick={() => selectedClient && setIsSupplierDropdownOpen(!isSupplierDropdownOpen)}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <Factory className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{selectedSupplier ? (selectedSupplier.name || selectedSupplier.supplier_name) : "All Suppliers"}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSupplierDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isSupplierDropdownOpen && selectedClient && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                <div
                                    className="px-4 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 cursor-pointer transition-colors"
                                    onClick={() => { setSelectedSupplier(null); setIsSupplierDropdownOpen(false); }}
                                >
                                    All Suppliers
                                </div>
                                {suppliers.map((supplier) => (
                                    <div
                                        key={supplier.id || supplier.supplier_id}
                                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                                            selectedSupplier?.supplier_id === supplier.supplier_id
                                                ? 'bg-green-50 text-green-600 font-medium'
                                                : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                                        }`}
                                        onClick={() => { setSelectedSupplier(supplier); setIsSupplierDropdownOpen(false); }}
                                    >
                                        {supplier.name || supplier.supplier_name}
                                    </div>
                                ))}
                                {suppliers.length === 0 && (
                                    <div className="px-4 py-2.5 text-sm text-gray-400">No suppliers available</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Secondary Filters - Product & Year Range */}
                {selectedClient && (
                    <div className="flex flex-wrap gap-4 mb-8">
                        <DropdownFilter
                            label="Filter by Product"
                            value={selectedProduct}
                            options={[
                                { label: availableProducts.length > 4 ? `Top 4 Products` : "All Products", value: "all" },
                                ...availableProducts.map(p => ({ label: p, value: p }))
                            ]}
                            isOpen={isProductDropdownOpen}
                            setIsOpen={setIsProductDropdownOpen}
                            onSelect={setSelectedProduct}
                            containerClass="product-dropdown-container"
                            icon={<Filter className="w-4 h-4 text-gray-400" />}
                        />
                        {yearRangeOptions.length > 1 && (
                            <DropdownFilter
                                label="Year Range"
                                value={selectedYearRange}
                                options={yearRangeOptions}
                                isOpen={isYearDropdownOpen}
                                setIsOpen={setIsYearDropdownOpen}
                                onSelect={setSelectedYearRange}
                                containerClass="year-dropdown-container"
                                icon={<Filter className="w-4 h-4 text-gray-400" />}
                            />
                        )}
                        {(selectedProduct !== "all" || selectedYearRange !== "all") && (
                            <div className="flex items-end pb-0.5">
                                <button
                                    className="px-4 py-2.5 text-sm text-green-600 bg-green-50 rounded-xl hover:bg-green-100 transition-colors font-medium"
                                    onClick={() => { setSelectedProduct("all"); setSelectedYearRange("all"); }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="PCF Reduction Graph" showExpand onExpand={() => setExpandedChart("reduction")}>
                        {renderReductionGraph()}
                    </ChartCard>
                    <ChartCard title="Actual Emission Graph" showExpand onExpand={() => setExpandedChart("target")}>
                        {renderActualEmission()}
                    </ChartCard>
                </div>

                <div className="mt-6">
                    <ChartCard title="Forecasted Emission" showExpand onExpand={() => setExpandedChart("forecast")}>
                        {renderForecastedEmission()}
                    </ChartCard>
                </div>
            </div>

            {/* Expansion Modals */}
            <ChartModal isOpen={expandedChart === "reduction"} onClose={() => setExpandedChart(null)} title="PCF Reduction Graph">
                {renderReductionGraph(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "target"} onClose={() => setExpandedChart(null)} title="Actual Emission Graph">
                {renderActualEmission(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "forecast"} onClose={() => setExpandedChart(null)} title="Forecasted Emission">
                {renderForecastedEmission(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedPCFTrend;
