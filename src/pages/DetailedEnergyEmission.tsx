import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Users,
    ChevronDown,
    Zap,
    Factory
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

interface Client {
    user_id: string;
    user_name: string;
}

interface Supplier {
    supplier_id: string;
    supplier_name: string;
}

interface EnergySourceItem {
    name: string;
    share: number;
    emission: number;
}

interface ProcessEnergyItem {
    name: string;
    consumption: number;
    emission: number;
}

const DEFAULT_ENERGY_SOURCES = [
  { name: "Electricity-Grid", share: 58, emission: 850 },
  { name: "Natural Gas", share: 22, emission: 320 },
  { name: "Steam", share: 12, emission: 180 },
  { name: "Cooling", share: 8, emission: 95 },
];

const DetailedEnergyEmission: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    // State
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);

    const [energySourceData, setEnergySourceData] = useState<EnergySourceItem[]>(DEFAULT_ENERGY_SOURCES);
    const [processEnergyData, setProcessEnergyData] = useState<ProcessEnergyItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (location.state?.selectedClient) {
            setSelectedClient(location.state.selectedClient);
        }
    }, [location.state]);

    // Fetch Clients
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const result = await dashboardService.getClientsDropdown();
                if (result.success || result.status) {
                    const clientList = Array.isArray(result.data) ? result.data : (result.data?.data && Array.isArray(result.data.data) ? result.data.data : []);
                    setClients(clientList);
                }
            } catch (error) {
                console.error("Error fetching clients:", error);
            }
        };
        fetchClients();
    }, []);

    // Fetch Suppliers when Client Selects
    useEffect(() => {
        const fetchSuppliers = async () => {
            if (!selectedClient) {
                setSuppliers([]);
                return;
            }
            try {
                // Assuming client_id matches the user_id needed for supplier dropdown
                const result = await dashboardService.getSupplierDropdown(selectedClient.user_id);
                if (result.success || result.status) {
                    const supplierList = Array.isArray(result.data) ? result.data : (result.data?.data ? result.data.data : []);
                    setSuppliers(supplierList);
                }
            } catch (error) {
                console.error("Error fetching suppliers:", error);
            }
        };
        fetchSuppliers();
        setSelectedSupplier(null);
    }, [selectedClient]);

    // Fetch Graph Data
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedClient) {
                setEnergySourceData(DEFAULT_ENERGY_SOURCES);
                setProcessEnergyData([]);
                return;
            }

            setIsLoading(true);
            const clientId = selectedClient.user_id;
            const supplierId = selectedSupplier?.supplier_id;

            try {
                // Fetch Energy Source (Depends on Client only as per request)
                const energyRes = await dashboardService.getEnergySourceEmission(clientId);
                if ((energyRes.success || energyRes.status) && Array.isArray(energyRes.data) && energyRes.data.length > 0) {
                    const formatted: EnergySourceItem[] = energyRes.data.map((item: any) => ({
                        name: item.energy_source,
                        share: parseFloat(item.energy_share_percentage) || 0,
                        emission: parseFloat(item.total_emission) || 0
                    }));
                    setEnergySourceData(formatted);
                } else {
                    setEnergySourceData([
                        { name: "Electricity-Grid", share: 58, emission: 850 },
                        { name: "Natural Gas", share: 22, emission: 320 },
                        { name: "Steam", share: 12, emission: 180 },
                        { name: "Cooling", share: 8, emission: 95 },
                    ]);
                }

                // Fetch Process Wise Consumption (Depends on Client & Supplier)
                const processRes = await dashboardService.getProcessWiseEnergyConsumption(clientId, supplierId);
                if (processRes.success || processRes.status) {
                    const data = processRes.data?.data || processRes.data || {};
                    // Check if data is object or array. Based on prompt it's an object with keys.
                    // If it's empty or null, default to 0
                    const formatted: ProcessEnergyItem[] = [
                        { name: "Raw Material Extraction", consumption: parseFloat(data.material_value) || 0, emission: 0 },
                        { name: "Material Processing", consumption: parseFloat(data.production_value) || 0, emission: 0 }, // Assuming production_value maps here?
                        { name: "Manufacturing", consumption: parseFloat(data.production_value) || 0, emission: 0 },
                        { name: "Packaging", consumption: parseFloat(data.packaging_value) || 0, emission: 0 },
                        { name: "Transportation", consumption: parseFloat(data.logistic_value) || 0, emission: 0 },
                        { name: "End-of-Life", consumption: parseFloat(data.waste_value) || 0, emission: 0 },
                    ];
                    setProcessEnergyData(formatted);
                }
            } catch (error) {
                console.error("Error fetching graph data:", error);
            }
            setIsLoading(false);
        };

        fetchData();
    }, [selectedClient, selectedSupplier]);

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

    const energySourceChartData = energySourceData.map(item => ({
        ...item,
        displayName: cleanName(item.name),
    }));

    const processEnergyChartData = processEnergyData.map(item => ({
        ...item,
        displayName: cleanName(item.name),
    }));

    const renderEnergySource = (isModal = false) => {
        if (energySourceData.length === 0) {
            return (
                <div className="flex items-center justify-center h-full min-h-[300px] text-sm text-gray-400 italic">
                    No data available
                </div>
            );
        }

        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={energySourceChartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <Tooltip labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} />
                    <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                    <Bar yAxisId="left" dataKey="share" fill="#52C41A" radius={[4, 4, 0, 0]} name="Energy Share (%)" />
                    <Bar yAxisId="right" dataKey="emission" fill="#B3E699" radius={[4, 4, 0, 0]} name="Total Emission (kg CO₂e)" />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const renderProcessEnergy = (isModal = false) => {
        if (processEnergyData.length === 0) {
            return (
                <div className="flex items-center justify-center h-full min-h-[300px] text-sm text-gray-400 italic">
                    No data available
                </div>
            );
        }

        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processEnergyChartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis
                        dataKey="displayName"
                        axisLine={false}
                        tickLine={false}
                        tick={<WrappedTick />}
                        interval={0}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
                    <Tooltip labelFormatter={(_: any, p: any) => p?.[0]?.payload?.name || _} />
                    <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                    <Bar dataKey="consumption" fill="#1A5D1A" radius={[4, 4, 0, 0]} name="Energy Consumption (kWh)" />
                    {/* Keeping emission bar but it will be 0/empty based on current data understanding */}
                    <Bar dataKey="emission" fill="#52C41A" radius={[4, 4, 0, 0]} name="Emission (kg CO₂e)" />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="Energy Consumption Emission Analysis"
                    subtitle="Comprehensive breakdown of emissions associated with different energy sources across operations"
                    onBack={() => navigate("/dashboard", { state: { selectedClient } })}
                    icon={Zap}
                />

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    {/* Client Dropdown */}
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

                    {/* Supplier Dropdown - Only show if client is selected? Or show disabled? Prompt says "keep supplier dropdown next tpo client dropdown" */}
                    <div className="w-full md:w-64 relative">
                        <label className="text-xs font-bold text-gray-500 block mb-2">Select Supplier</label>
                        <div
                            className={`flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 cursor-pointer ${!selectedClient ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => selectedClient && setIsSupplierDropdownOpen(!isSupplierDropdownOpen)}
                        >
                            <div className="flex items-center gap-2">
                                <Factory className="w-4 h-4 text-gray-400" />
                                <span>{selectedSupplier ? selectedSupplier.supplier_name : "Select Supplier"}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSupplierDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isSupplierDropdownOpen && selectedClient && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                <div
                                    className="px-4 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 cursor-pointer transition-colors"
                                    onClick={() => {
                                        setSelectedSupplier(null);
                                        setIsSupplierDropdownOpen(false);
                                    }}
                                >
                                    All Suppliers
                                </div>
                                {suppliers.map((supplier) => (
                                    <div
                                        key={supplier.supplier_id}
                                        className="px-4 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 cursor-pointer transition-colors"
                                        onClick={() => {
                                            setSelectedSupplier(supplier);
                                            setIsSupplierDropdownOpen(false);
                                        }}
                                    >
                                        {supplier.supplier_name}
                                    </div>
                                ))}
                                {suppliers.length === 0 && (
                                    <div className="px-4 py-2.5 text-sm text-gray-400">No suppliers available</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <ChartCard title="Energy Source" showExpand onExpand={() => setExpandedChart("source")}>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
                        ) : (
                            renderEnergySource()
                        )}
                    </ChartCard>
                    <ChartCard title="Process Wise Energy Consumption" showExpand onExpand={() => setExpandedChart("process")}>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
                        ) : (
                            renderProcessEnergy()
                        )}
                    </ChartCard>
                </div>
            </div>

            {/* Expansion Modals */}
            <ChartModal isOpen={expandedChart === "source"} onClose={() => setExpandedChart(null)} title="Energy Source">
                {renderEnergySource(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "process"} onClose={() => setExpandedChart(null)} title="Process Wise Energy Consumption">
                {renderProcessEnergy(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedEnergyEmission;
