import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Truck,
  FileText,
  Leaf,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity,
  Globe,
  BarChart3,
  ClipboardList,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { ChartTooltip, chartTooltipCursor } from "../components/DashboardComponents";
import dashboardService from "../lib/dashboardService";

interface Client {
  user_id: string;
  user_name: string;
}

interface PlatformStats {
  totalClients: number;
  activeClients: number;
  totalSuppliers: number;
  totalRequests: number;
  completedRequests: number;
  inProgressRequests: number;
  pendingApprovals: number;
  draftRequests: number;
  rejectedRequests: number;
}

interface StatusSlice {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface TopEmitter {
  name: string;
  emission: number;
}

interface RecentActivity {
  id: string;
  actor: string;
  action: string;
  target: string;
  client: string;
  timestamp: string;
}

const formatTimeAgo = (iso: string): string => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)  return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
};

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<any>;
  iconBg: string;
  iconColor: string;
  trend?: number;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon: Icon, iconBg, iconColor, trend }) => (
  <div className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group">
    <div className={`absolute inset-0 ${iconBg} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`} />
    <div className="relative">
      <div className="flex justify-between items-start mb-4">
        <div className={`${iconBg} ${iconColor} p-3 rounded-2xl shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            trend < 0 ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
          }`}>
            {trend < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            {trend > 0 ? "+" : ""}{trend}%
          </div>
        )}
      </div>
      <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
      <p className="text-sm font-semibold text-gray-500 mt-1.5">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [clientStatusData, setClientStatusData] = useState<StatusSlice[]>([]);
  const [requestStatusData, setRequestStatusData] = useState<StatusSlice[]>([]);
  const [topEmitters, setTopEmitters] = useState<TopEmitter[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  const firstName = user?.name?.split(" ")[0] || "Admin";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const fetchAll = async () => {
      const [
        clientsRes,
        statsRes,
        clientStatusRes,
        requestStatusRes,
        topEmittersRes,
        activitiesRes,
      ] = await Promise.all([
        dashboardService.getClientsDropdown(),
        dashboardService.getPlatformStats(),
        dashboardService.getClientStatusDistribution(),
        dashboardService.getRequestStatusDistribution(),
        dashboardService.getTopEmitters(),
        dashboardService.getRecentActivities(),
      ]);

      if (clientsRes.status === true || clientsRes.success === true || clientsRes.data) {
        const list = Array.isArray(clientsRes.data)
          ? clientsRes.data
          : clientsRes.data?.data && Array.isArray(clientsRes.data.data)
            ? clientsRes.data.data
            : [];
        setClients(list);
      }

      if ((statsRes.status === true || statsRes.success === true) && statsRes.data) {
        setPlatformStats(statsRes.data as PlatformStats);
      }

      if ((clientStatusRes.status === true || clientStatusRes.success === true) && clientStatusRes.data) {
        const d = clientStatusRes.data;
        setClientStatusData([
          { name: "Active",   value: d.active   || 0, color: "#52C41A" },
          { name: "Pending",  value: d.pending  || 0, color: "#FAAD14" },
          { name: "Inactive", value: d.inactive || 0, color: "#FF4D4F" },
        ]);
      }

      if ((requestStatusRes.status === true || requestStatusRes.success === true) && requestStatusRes.data) {
        const d = requestStatusRes.data;
        setRequestStatusData([
          { name: "Completed",   value: d.completed  || 0, color: "#52C41A" },
          { name: "In Progress", value: d.inProgress || 0, color: "#1890FF" },
          { name: "Pending",     value: d.pending    || 0, color: "#FAAD14" },
          { name: "Rejected",    value: d.rejected   || 0, color: "#FF4D4F" },
        ]);
      }

      if ((topEmittersRes.status === true || topEmittersRes.success === true) && Array.isArray(topEmittersRes.data)) {
        setTopEmitters(topEmittersRes.data as TopEmitter[]);
      }

      if ((activitiesRes.status === true || activitiesRes.success === true) && Array.isArray(activitiesRes.data)) {
        setRecentActivities(activitiesRes.data as RecentActivity[]);
      }
    };
    fetchAll();
  }, []);

  const handleClientDrillDown = (clientId: string) => {
    const client = clients.find(c => c.user_id === clientId);
    if (client) {
      navigate("/dashboard", { state: { selectedClient: client, fromSuperAdmin: true } });
    }
  };

  const getActivityIcon = (action: string) => {
    const a = (action || "").toLowerCase();
    if (a.includes("pcf") || a.includes("request")) return <FileText className="w-4 h-4 text-blue-500" />;
    if (a.includes("supplier"))                     return <Truck className="w-4 h-4 text-green-500" />;
    if (a.includes("report"))                       return <BarChart3 className="w-4 h-4 text-purple-500" />;
    if (a.includes("questionnaire"))                return <ClipboardList className="w-4 h-4 text-orange-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1A5D1A] via-[#2E8B2E] to-[#52C41A] p-8 shadow-lg">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-white/5 rounded-full" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="bg-white/20 backdrop-blur-sm p-3.5 rounded-2xl border border-white/20">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {getGreeting()}, {firstName}!
                </h1>
                <p className="text-sm text-green-100 mt-1">
                  Platform Overview - EnviGuide Management Suite
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20 text-center">
                <p className="text-xs font-semibold text-white/80">Active Clients</p>
                <p className="text-xl font-extrabold text-white">
                  {platformStats?.activeClients ?? 0}/{platformStats?.totalClients ?? 0}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20 text-center">
                <p className="text-xs font-semibold text-white/80">Pending Requests</p>
                <p className="text-xl font-extrabold text-amber-300">{platformStats?.pendingApprovals ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Clients"
            value={platformStats?.totalClients ?? 0}
            subtitle={`${platformStats?.activeClients ?? 0} active`}
            icon={Building2}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <KPICard
            title="Total Suppliers"
            value={platformStats?.totalSuppliers ?? 0}
            subtitle="Across all clients"
            icon={Truck}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
          <KPICard
            title="PCF Requests"
            value={platformStats?.totalRequests ?? 0}
            subtitle={`${platformStats?.pendingApprovals ?? 0} pending approval`}
            icon={FileText}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
          />
          <KPICard
            title="Completed"
            value={platformStats?.completedRequests ?? 0}
            subtitle="Approved PCF requests"
            icon={Leaf}
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Status Pie Chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">Client Status</h3>
            <p className="text-xs text-gray-400 mb-4">Distribution by status</p>
            <div className="h-[250px]">
              {clientStatusData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {clientStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "11px", fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">No data</div>
              )}
            </div>
          </div>

          {/* Request Status Pie Chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">PCF Request Status</h3>
            <p className="text-xs text-gray-400 mb-4">Overall request pipeline</p>
            <div className="h-[250px]">
              {requestStatusData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={requestStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {requestStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "11px", fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">No data</div>
              )}
            </div>
          </div>

          {/* Top Emitters Bar Chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">Top Emitting Clients</h3>
            <p className="text-xs text-gray-400 mb-4">By total CO₂e emissions</p>
            <div className="h-[250px]">
              {topEmitters.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topEmitters}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F3F5" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#4B5563" }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#4B5563", fontWeight: 500 }}
                      width={100}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={chartTooltipCursor} />
                    <Bar dataKey="emission" fill="#52C41A" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">No data</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Client Drill-Down + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Drill-Down Selector */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">Client Drill-Down</h3>
            <p className="text-xs text-gray-400 mb-4">
              Select a client to view their detailed carbon footprint dashboard
            </p>
            <Select
              showSearch
              placeholder="Search and select a client..."
              className="w-full"
              size="large"
              filterOption={(input, option) =>
                (option?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => handleClientDrillDown(value)}
              options={clients.map((c) => ({
                value: c.user_id,
                label: c.user_name,
              }))}
              virtual
              notFoundContent={
                <div className="text-center py-4 text-gray-400 text-sm">
                  No clients found
                </div>
              }
            />

            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent Clients</p>
              {clients.slice(0, 5).map((client) => (
                <div
                  key={client.user_id}
                  onClick={() => handleClientDrillDown(client.user_id)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-green-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                      <Building2 className="w-4 h-4 text-gray-500 group-hover:text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                      {client.user_name}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
              {clients.length === 0 && (
                <p className="text-sm text-gray-400 py-2">No clients available</p>
              )}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">Recent Activity</h3>
            <p className="text-xs text-gray-400 mb-4">Latest actions across the platform</p>
            <div className="space-y-1">
              {recentActivities.length === 0 && (
                <p className="text-sm text-gray-400 py-2">No recent activity</p>
              )}
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mt-0.5 shrink-0">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {activity.actor} {activity.action}
                      {activity.target ? <span className="text-gray-500"> — {activity.target}</span> : null}
                    </p>
                    <p className="text-xs text-gray-400">
                      {activity.client ? `${activity.client} · ` : ""}{formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
