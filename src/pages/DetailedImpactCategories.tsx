import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Users,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Activity,
    RefreshCw
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
    Cell
} from "recharts";
import {
    DetailedHeader,
    ChartCard,
    ChartModal
} from "../components/DashboardComponents";
import dashboardService from "../lib/dashboardService";

const IMPACT_COLORS = ["#1A5D1A", "#458C21", "#52C41A", "#74B72E", "#B3E699", "#D9F5C5", "#EBFADC"];
const PRODUCTS_PER_PAGE = 5;

const FALLBACK_INDICATORS = [
    { name: "Global Warming (GWP)", value: 1200, unit: "kg CO₂ eq" },
    { name: "Ozone Depletion (ODP)", value: 0.00045, unit: "kg CFC-11 eq" },
    { name: "Acidification (AP)", value: 2.8, unit: "kg SO₂ eq" },
    { name: "Eutrophication (EP)", value: 0.55, unit: "kg PO₄ eq" },
    { name: "Photochemical Ozone (POCP)", value: 1.2, unit: "kg NMVOC eq" },
    { name: "Water Scarcity", value: 75, unit: "m³" },
    { name: "Resource Depletion", value: 50, unit: "kg Sb eq" },
];

const FALLBACK_COMPARISON = [
    { name: "Product A", gwp: 22.5, ap: 0.015, ep: 18.3, pocp: 0.07 },
    { name: "Product B", gwp: 18.3, ap: 0.013, ep: 27.8, pocp: 0.11 },
    { name: "Product C", gwp: 27.8, ap: 0.017, ep: 16.4, pocp: 0.06 },
];

const DetailedImpactCategories: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [impactData, setImpactData] = useState(FALLBACK_INDICATORS);
    const [comparisonData, setComparisonData] = useState<any[]>(FALLBACK_COMPARISON);
    const [comparisonPage, setComparisonPage] = useState(0);

    useEffect(() => { fetchClients(); }, []);

    useEffect(() => {
        if (location.state?.selectedClient) {
            setSelectedClient(location.state.selectedClient);
        }
    }, [location.state]);

    useEffect(() => {
        if (selectedClient) {
            fetchImpactData(selectedClient.user_id);
        } else {
            setImpactData(FALLBACK_INDICATORS);
            setComparisonData(FALLBACK_COMPARISON);
        }
        setComparisonPage(0);
    }, [selectedClient]);

    const fetchClients = async () => {
        const response = await dashboardService.getClientsDropdown();
        if (response.success || response.status) {
            const clientList = Array.isArray(response.data) ? response.data : (response.data?.data ? response.data.data : []);
            setClients(clientList);
        }
    };

    const fetchImpactData = async (clientId: string) => {
        setLoading(true);
        try {
            const res = await dashboardService.getImpactCategories(clientId);
            if (res.success && res.data) {
                const { indicators, productComparison } = res.data;
                if (indicators && indicators.length > 0 && indicators.some((i: any) => i.value > 0)) {
                    setImpactData(indicators);
                } else {
                    setImpactData(FALLBACK_INDICATORS);
                }
                if (productComparison && productComparison.length > 0 && productComparison.some((p: any) => p.gwp > 0 || p.ap > 0)) {
                    setComparisonData(productComparison);
                } else {
                    setComparisonData(FALLBACK_COMPARISON);
                }
            } else {
                setImpactData(FALLBACK_INDICATORS);
                setComparisonData(FALLBACK_COMPARISON);
            }
        } catch {
            setImpactData(FALLBACK_INDICATORS);
            setComparisonData(FALLBACK_COMPARISON);
        }
        setLoading(false);
    };

    // Pagination for comparison chart
    const totalPages = Math.ceil(comparisonData.length / PRODUCTS_PER_PAGE);
    const pagedComparisonData = useMemo(() => {
        const start = comparisonPage * PRODUCTS_PER_PAGE;
        return comparisonData.slice(start, start + PRODUCTS_PER_PAGE);
    }, [comparisonData, comparisonPage]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (isClientDropdownOpen && !target.closest('.client-dropdown-container')) {
                setIsClientDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isClientDropdownOpen]);

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

    const WrappedTickY = ({ x, y, payload }: any) => {
        const name: string = payload.value || "";
        const maxLen = 22;
        if (name.length <= maxLen) {
            return (<text x={x} y={y} textAnchor="end" fontSize={10} fill="#4B5563" fontWeight={500} dominantBaseline="central">{name}</text>);
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
            <text x={x} y={y - ((lines.length - 1) * 6)} textAnchor="end" fontSize={10} fill="#4B5563" fontWeight={500}>
                {lines.map((line, i) => (
                    <tspan key={i} x={x} dy={i === 0 ? 0 : 12}>{line}</tspan>
                ))}
            </text>
        );
    };

    const comparisonChartData = useMemo(() =>
        pagedComparisonData.map(item => ({
            ...item,
            displayName: cleanName(item.name),
        })),
    [pagedComparisonData]);

    const renderImpactIndicators = (isModal = false) => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-full text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />Loading...
                </div>
            );
        }
        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impactData} layout="vertical" margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F3F5" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
                    <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={<WrappedTickY />}
                        width={180}
                    />
                    <Tooltip
                        formatter={(value: any) => {
                            return [`${Number(value).toLocaleString()}`, 'Value'];
                        }}
                    />
                    <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Impact Score" barSize={22}>
                        {impactData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={IMPACT_COLORS[index % IMPACT_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const renderCategoryComparison = (isModal = false) => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-full text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />Loading...
                </div>
            );
        }
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonChartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                            <XAxis
                                dataKey="displayName"
                                axisLine={false}
                                tickLine={false}
                                tick={<WrappedTick />}
                                interval={0}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={formatYAxis} />
                            <Tooltip labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} />
                            <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                            <Bar dataKey="gwp" fill="#1A5D1A" radius={[4, 4, 0, 0]} name="GWP" barSize={18} />
                            <Bar dataKey="ap" fill="#52C41A" radius={[4, 4, 0, 0]} name="Acidification" barSize={18} />
                            <Bar dataKey="ep" fill="#74B72E" radius={[4, 4, 0, 0]} name="Eutrophication" barSize={18} />
                            <Bar dataKey="pocp" fill="#B3E699" radius={[4, 4, 0, 0]} name="POCP" barSize={18} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2 pb-1">
                        <button
                            onClick={() => setComparisonPage(Math.max(0, comparisonPage - 1))}
                            disabled={comparisonPage === 0}
                            className={`p-1.5 rounded-lg transition-colors ${comparisonPage === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-green-50 hover:text-green-600'}`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-medium text-gray-500">
                            {comparisonPage * PRODUCTS_PER_PAGE + 1}-{Math.min((comparisonPage + 1) * PRODUCTS_PER_PAGE, comparisonData.length)} of {comparisonData.length} products
                        </span>
                        <button
                            onClick={() => setComparisonPage(Math.min(totalPages - 1, comparisonPage + 1))}
                            disabled={comparisonPage >= totalPages - 1}
                            className={`p-1.5 rounded-lg transition-colors ${comparisonPage >= totalPages - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-green-50 hover:text-green-600'}`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="Impact Categories - Detailed View"
                    subtitle="Comprehensive overview of environmental impact values across multiple categories"
                    onBack={() => navigate("/dashboard", { state: { selectedClient } })}
                    icon={Activity}
                />

                {/* Client Filter */}
                <div className="flex justify-start mb-8">
                    <div className="w-full md:w-64 relative client-dropdown-container">
                        <label className="text-xs font-bold text-gray-500 block mb-2">Select Client</label>
                        <div
                            className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 cursor-pointer hover:border-green-200 transition-colors"
                            onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{selectedClient ? (selectedClient.company_name || selectedClient.user_name) : "Select Client"}</span>
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
                                            setComparisonPage(0);
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
                </div>

                <div className="space-y-6">
                    <ChartCard title="Environmental Impact Indicators" showExpand onExpand={() => setExpandedChart("indicators")}>
                        {renderImpactIndicators()}
                    </ChartCard>
                    <ChartCard title="Cross-Category Product Comparison" showExpand onExpand={() => setExpandedChart("comparison")}>
                        {renderCategoryComparison()}
                    </ChartCard>
                </div>
            </div>

            <ChartModal isOpen={expandedChart === "indicators"} onClose={() => setExpandedChart(null)} title="Environmental Impact Indicators">
                {renderImpactIndicators(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "comparison"} onClose={() => setExpandedChart(null)} title="Cross-Category Product Comparison">
                {renderCategoryComparison(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedImpactCategories;
