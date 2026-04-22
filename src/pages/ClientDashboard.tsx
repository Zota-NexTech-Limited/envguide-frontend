import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "antd";
import dashboardService from "../lib/dashboardService";
import {
  Factory,
  Package,
  Leaf,
  TrendingDown,
  TrendingUp,
  FileText,
  Truck,
  Recycle,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  FileCheck2,
  Calendar,
  Bell,
  ExternalLink,
  Award,
  AlertCircle,
  Download,
  Target,
  Lightbulb,
  ChevronRight,
  Globe,
} from "lucide-react";
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
  AreaChart,
  Area,
  Line,
  ReferenceLine,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { ChartTooltip, chartTooltipCursor } from "../components/DashboardComponents";

// ── Mock Data ──────────────────────────────────────────────

const productEmissions = [
  { name: "Steel Frame A1", emission: 3420, target: 3000 },
  { name: "Aluminum Panel B2", emission: 2180, target: 2500 },
  { name: "Plastic Housing C3", emission: 1560, target: 1800 },
  { name: "Copper Wire D4", emission: 980, target: 1200 },
  { name: "Glass Sheet E5", emission: 740, target: 900 },
];

const lifecycleBreakdown = [
  { name: "Raw Materials", value: 38, color: "#3B82F6" },
  { name: "Manufacturing", value: 27, color: "#10B981" },
  { name: "Transportation", value: 18, color: "#F59E0B" },
  { name: "End of Life", value: 12, color: "#8B5CF6" },
  { name: "Packaging", value: 5, color: "#EC4899" },
];

const monthlyTrend = [
  { month: "Sep", emissions: 4800, lastYear: 5200, target: 4500 },
  { month: "Oct", emissions: 4520, lastYear: 5050, target: 4400 },
  { month: "Nov", emissions: 4350, lastYear: 4900, target: 4300 },
  { month: "Dec", emissions: 4100, lastYear: 4700, target: 4200 },
  { month: "Jan", emissions: 3890, lastYear: 4550, target: 4100 },
  { month: "Feb", emissions: 3640, lastYear: 4400, target: 4000 },
  { month: "Mar", emissions: 3420, lastYear: 4250, target: 3900 },
];

// Scope 1/2/3 emissions split (GHG Protocol)
const scopeData = [
  { name: "Scope 1", value: 420, color: "#10B981", description: "Direct emissions" },
  { name: "Scope 2", value: 680, color: "#3B82F6", description: "Purchased energy" },
  { name: "Scope 3", value: 2320, color: "#8B5CF6", description: "Supply chain" },
];

// Net-Zero / SBTi targets
const netZeroProgress = {
  baselineYear: 2020,
  baselineEmissions: 5800,
  currentEmissions: 3420,
  target2030: 2900,
  target2050: 0,
  reductionAchieved: 41,
  reductionRequired2030: 50,
};

// Pending PCF Requests
const pendingPCFs = [
  { id: "PCF-2026-042", product: "Steel Frame A1", customer: "Acme Industries", dueDate: "2026-04-18", priority: "high", status: "Action Required" },
  { id: "PCF-2026-041", product: "Aluminum Panel B2", customer: "BuildCo Ltd", dueDate: "2026-04-22", priority: "medium", status: "In Review" },
  { id: "PCF-2026-040", product: "Copper Wire D4", customer: "ElectroTech", dueDate: "2026-04-25", priority: "medium", status: "Awaiting Data" },
  { id: "PCF-2026-039", product: "Plastic Housing C3", customer: "GadgetCorp", dueDate: "2026-05-02", priority: "low", status: "Draft" },
];

// Compliance & Certifications
const certifications = [
  { name: "ISO 14001", status: "Active", expiryDate: "2027-08-15", daysUntilExpiry: 492, type: "Environmental" },
  { name: "ISO 9001", status: "Active", expiryDate: "2026-11-22", daysUntilExpiry: 226, type: "Quality" },
  { name: "CBAM Declaration", status: "Active", expiryDate: "2026-06-30", daysUntilExpiry: 81, type: "EU Compliance" },
  { name: "EPD Verification", status: "Expiring Soon", expiryDate: "2026-05-12", daysUntilExpiry: 32, type: "Product" },
  { name: "GHG Protocol", status: "Active", expiryDate: "2026-12-31", daysUntilExpiry: 265, type: "Standard" },
  { name: "SBTi Validation", status: "Pending", expiryDate: "2026-07-15", daysUntilExpiry: 96, type: "Climate" },
];

// Top Emission Hotspots
const emissionHotspots = [
  { name: "Plant A — Smelting", emissions: 1240, percentage: 36, trend: -8.2, facility: "Plant A" },
  { name: "Plant B — Casting", emissions: 820, percentage: 24, trend: -3.5, facility: "Plant B" },
  { name: "Plant A — Coating", emissions: 540, percentage: 16, trend: 2.1, facility: "Plant A" },
  { name: "Plant C — Assembly", emissions: 410, percentage: 12, trend: -12.4, facility: "Plant C" },
  { name: "Plant B — Finishing", emissions: 280, percentage: 8, trend: -5.8, facility: "Plant B" },
];

// Reduction Initiatives
const reductionInitiatives = [
  { name: "Solar PV Installation — Plant A", expectedSaving: 480, status: "In Progress", progress: 65, roi: "2.4 yrs" },
  { name: "Heat Recovery System", expectedSaving: 320, status: "Planning", progress: 25, roi: "3.1 yrs" },
  { name: "Supplier Localization (Asia)", expectedSaving: 210, status: "In Progress", progress: 80, roi: "1.8 yrs" },
  { name: "Recycled Aluminum Sourcing", expectedSaving: 180, status: "Completed", progress: 100, roi: "0.9 yrs" },
];

// Industry benchmark
const benchmarks = [
  { label: "Carbon Footprint per Product", you: 1776, industryAvg: 2140, bestInClass: 1200, unit: "kg CO₂e" },
  { label: "Recyclability Rate", you: 73, industryAvg: 61, bestInClass: 88, unit: "%" },
  { label: "Renewable Energy %", you: 42, industryAvg: 28, bestInClass: 75, unit: "%" },
];

interface Supplier {
  id: string;
  name: string;
  logo: string;
  location: string;
  country: string;
  category: string;
  materials: string[];
  linkedProducts: string[];
  score: number;
  grade: "A" | "B" | "C" | "D";
  trend: "up" | "down";
  scope3Contribution: number; // % of total scope 3
  emissionsKg: number; // CO2e kg attributed to this supplier
  contractStatus: "Active" | "Under Review" | "Expired";
  contractValue: string;
  contractEndDate: string;
  certifications: string[];
  cbamStatus: "Compliant" | "Pending" | "Non-Compliant";
  lastAuditDate: string;
  lastQuestionnaireDate: string;
  questionnaireStatus: "Submitted" | "Overdue" | "In Progress";
  dataQualityPrimaryPct: number;
  verification: "3rd-Party Verified" | "Self-Reported";
  responseRate: number;
  avgResponseDays: number;
  openRequests: number;
  riskLevel: "Low" | "Medium" | "High";
  riskFlags: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  lastCommunication: string;
  actionRequired?: string;
}

const supplierScores: Supplier[] = [
  {
    id: "sup-001",
    name: "EcoSteel Corp",
    logo: "ES",
    location: "Pittsburgh, PA",
    country: "USA",
    category: "Metals & Alloys",
    materials: ["Steel", "Iron Ore"],
    linkedProducts: ["Steel Frame A1", "Titanium Rod F6"],
    score: 92,
    grade: "A",
    trend: "up",
    scope3Contribution: 32,
    emissionsKg: 1094,
    contractStatus: "Active",
    contractValue: "$2.4M / yr",
    contractEndDate: "2027-06-30",
    certifications: ["ISO 14001", "ISO 9001", "ResponsibleSteel"],
    cbamStatus: "Compliant",
    lastAuditDate: "2026-02-14",
    lastQuestionnaireDate: "2026-03-22",
    questionnaireStatus: "Submitted",
    dataQualityPrimaryPct: 87,
    verification: "3rd-Party Verified",
    responseRate: 98,
    avgResponseDays: 2,
    openRequests: 0,
    riskLevel: "Low",
    riskFlags: [],
    contactName: "Sarah Mitchell",
    contactEmail: "s.mitchell@ecosteel.com",
    contactPhone: "+1 412 555 0142",
    lastCommunication: "2026-04-05",
  },
  {
    id: "sup-002",
    name: "GreenAlu Ltd",
    logo: "GA",
    location: "Reykjavik",
    country: "Iceland",
    category: "Metals & Alloys",
    materials: ["Aluminum", "Bauxite"],
    linkedProducts: ["Aluminum Panel B2"],
    score: 85,
    grade: "A",
    trend: "up",
    scope3Contribution: 21,
    emissionsKg: 718,
    contractStatus: "Active",
    contractValue: "$1.8M / yr",
    contractEndDate: "2026-12-15",
    certifications: ["ISO 14001", "ASI Performance"],
    cbamStatus: "Compliant",
    lastAuditDate: "2025-11-08",
    lastQuestionnaireDate: "2026-03-10",
    questionnaireStatus: "Submitted",
    dataQualityPrimaryPct: 76,
    verification: "3rd-Party Verified",
    responseRate: 92,
    avgResponseDays: 3,
    openRequests: 1,
    riskLevel: "Low",
    riskFlags: [],
    contactName: "Erik Jonsson",
    contactEmail: "erik@greenalu.is",
    contactPhone: "+354 555 8210",
    lastCommunication: "2026-04-02",
  },
  {
    id: "sup-003",
    name: "PlastPro Inc",
    logo: "PP",
    location: "Shenzhen",
    country: "China",
    category: "Polymers",
    materials: ["ABS Plastic", "Polycarbonate"],
    linkedProducts: ["Plastic Housing C3"],
    score: 71,
    grade: "B",
    trend: "down",
    scope3Contribution: 18,
    emissionsKg: 615,
    contractStatus: "Under Review",
    contractValue: "$960K / yr",
    contractEndDate: "2026-05-30",
    certifications: ["ISO 9001"],
    cbamStatus: "Pending",
    lastAuditDate: "2025-08-22",
    lastQuestionnaireDate: "2026-01-15",
    questionnaireStatus: "Overdue",
    dataQualityPrimaryPct: 54,
    verification: "Self-Reported",
    responseRate: 74,
    avgResponseDays: 9,
    openRequests: 2,
    riskLevel: "Medium",
    riskFlags: ["Questionnaire overdue", "Contract expiring soon"],
    contactName: "Wei Zhang",
    contactEmail: "w.zhang@plastpro.cn",
    contactPhone: "+86 755 8888 0102",
    lastCommunication: "2026-03-18",
    actionRequired: "Q2 questionnaire is 14 days overdue",
  },
  {
    id: "sup-004",
    name: "CopperWorks",
    logo: "CW",
    location: "Antofagasta",
    country: "Chile",
    category: "Metals & Alloys",
    materials: ["Copper", "Copper Alloys"],
    linkedProducts: ["Copper Wire D4"],
    score: 68,
    grade: "C",
    trend: "up",
    scope3Contribution: 14,
    emissionsKg: 478,
    contractStatus: "Active",
    contractValue: "$540K / yr",
    contractEndDate: "2027-01-20",
    certifications: ["ISO 9001"],
    cbamStatus: "Pending",
    lastAuditDate: "2025-06-10",
    lastQuestionnaireDate: "2026-02-28",
    questionnaireStatus: "In Progress",
    dataQualityPrimaryPct: 48,
    verification: "Self-Reported",
    responseRate: 81,
    avgResponseDays: 6,
    openRequests: 1,
    riskLevel: "Medium",
    riskFlags: ["Audit overdue (>9 months)"],
    contactName: "Maria Lopez",
    contactEmail: "m.lopez@copperworks.cl",
    contactPhone: "+56 55 234 7890",
    lastCommunication: "2026-03-28",
    actionRequired: "Annual audit is overdue",
  },
  {
    id: "sup-005",
    name: "GlassTech Mfg",
    logo: "GT",
    location: "Mumbai",
    country: "India",
    category: "Glass & Ceramics",
    materials: ["Tempered Glass", "Silica"],
    linkedProducts: ["Glass Sheet E5"],
    score: 54,
    grade: "D",
    trend: "down",
    scope3Contribution: 8,
    emissionsKg: 273,
    contractStatus: "Expired",
    contractValue: "$320K / yr",
    contractEndDate: "2026-03-31",
    certifications: [],
    cbamStatus: "Non-Compliant",
    lastAuditDate: "2024-12-05",
    lastQuestionnaireDate: "2025-11-12",
    questionnaireStatus: "Overdue",
    dataQualityPrimaryPct: 22,
    verification: "Self-Reported",
    responseRate: 58,
    avgResponseDays: 14,
    openRequests: 3,
    riskLevel: "High",
    riskFlags: [
      "Contract expired",
      "No active certifications",
      "CBAM non-compliant",
    ],
    contactName: "Rajesh Kumar",
    contactEmail: "rajesh@glasstech.in",
    contactPhone: "+91 22 6789 0123",
    lastCommunication: "2026-02-20",
    actionRequired: "Contract expired — renewal or replacement needed",
  },
];

const recentActivities = [
  { action: "PCF report submitted for Steel Frame A1", time: "1 hour ago", type: "pcf", status: "completed" },
  { action: "Supplier questionnaire received from EcoSteel Corp", time: "3 hours ago", type: "supplier", status: "completed" },
  { action: "Emission target breached for Plastic Housing C3", time: "5 hours ago", type: "alert", status: "warning" },
  { action: "New product Titanium Rod F6 added to portfolio", time: "1 day ago", type: "product", status: "completed" },
  { action: "Data quality review pending for Copper Wire D4", time: "1 day ago", type: "review", status: "pending" },
  { action: "Monthly emission report generated", time: "2 days ago", type: "pcf", status: "completed" },
];

// ── KPI Card Component ─────────────────────────────────────

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<any>;
  iconBg: string;
  iconColor: string;
  trend?: number;
  onClick?: () => void;
  tooltip?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon: Icon, iconBg, iconColor, trend, onClick, tooltip }) => (
  <button
    onClick={onClick}
    title={tooltip}
    className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-green-200 transition-all duration-300 overflow-hidden group text-left w-full cursor-pointer"
  >
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
      <p className="text-sm font-semibold text-gray-500 mt-1.5 flex items-center gap-1">
        {title}
        <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all" />
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
  </button>
);

// ── Main Component ──────────────────────────────────────────

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] || "Client";
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"month" | "quarter" | "custom">("month");
  const [customDates, setCustomDates] = useState<[any, any] | null>(null);

  // API-backed data (falls back to hardcoded values above when empty)
  const [apiKpis, setApiKpis] = useState<{
    totalProducts: number; activeSuppliers: number;
    avgCarbonFootprint: number; recyclabilityRate: number;
  } | null>(null);
  const [apiPending, setApiPending] = useState<any[]>([]);
  const [apiActivity, setApiActivity] = useState<any[]>([]);
  const [apiSuppliers, setApiSuppliers] = useState<any[]>([]);
  const [apiHotspots, setApiHotspots] = useState<any[]>([]);
  const [apiEnergy, setApiEnergy] = useState<{ energyKwh: number; wasteKg: number } | null>(null);
  const [apiAlerts, setApiAlerts] = useState<{ count: number; alerts: any[] }>({ count: 0, alerts: [] });
  const [apiProducts, setApiProducts] = useState<{ name: string; emission: number; target: number }[]>([]);
  const [apiLifecycle, setApiLifecycle] = useState<{ name: string; value: number; color: string }[]>([]);
  const [apiTrend, setApiTrend] = useState<{ month: string; emissions: number; lastYear: number; target: number }[]>([]);
  const [apiScope, setApiScope] = useState<{ name: string; value: number; color: string; description: string }[]>([]);

  useEffect(() => {
    const userId = user?.userId || user?.id;
    if (!userId) return;

    const load = async () => {
      const [
        kpisRes, pendingRes, activityRes, suppliersRes, hotspotsRes,
        energyRes, alertsRes, productsRes, lifecycleRes, trendRes, scopeRes,
      ] = await Promise.all([
        dashboardService.getClientKpis(userId),
        dashboardService.getClientPendingPcfRequests(userId),
        dashboardService.getClientRecentActivity(userId),
        dashboardService.getClientTopSuppliers(userId),
        dashboardService.getClientEmissionHotspots(userId),
        dashboardService.getClientEnergyResources(userId),
        dashboardService.getClientAlerts(userId),
        dashboardService.getProductEmissions(userId),
        dashboardService.getProductLifeCycle(userId),
        dashboardService.getMonthlyEmissionTrend(userId),
        dashboardService.getScopeBreakdown(userId),
      ]);

      if ((kpisRes.status === true || kpisRes.success === true) && kpisRes.data) {
        setApiKpis(kpisRes.data);
      }
      if ((pendingRes.status === true || pendingRes.success === true) && Array.isArray(pendingRes.data)) {
        setApiPending(pendingRes.data);
      }
      if ((activityRes.status === true || activityRes.success === true) && Array.isArray(activityRes.data)) {
        setApiActivity(activityRes.data);
      }
      if ((suppliersRes.status === true || suppliersRes.success === true) && Array.isArray(suppliersRes.data)) {
        setApiSuppliers(suppliersRes.data);
      }
      if ((hotspotsRes.status === true || hotspotsRes.success === true) && Array.isArray(hotspotsRes.data)) {
        setApiHotspots(hotspotsRes.data);
      }
      if ((energyRes.status === true || energyRes.success === true) && energyRes.data) {
        setApiEnergy(energyRes.data);
      }
      if ((alertsRes.status === true || alertsRes.success === true) && alertsRes.data) {
        setApiAlerts(alertsRes.data);
      }

      if ((productsRes.status === true || productsRes.success === true) && Array.isArray(productsRes.data)) {
        setApiProducts(
          productsRes.data.map((p: any) => ({
            name: p.name,
            emission: Number(p.emission) || 0,
            target: Math.round((Number(p.emission) || 0) * 0.85),
          }))
        );
      }

      if ((lifecycleRes.status === true || lifecycleRes.success === true) && lifecycleRes.data) {
        const d = lifecycleRes.data;
        const LC_COLOR: Record<string, string> = {
          "Raw Materials": "#3B82F6", "Manufacturing": "#10B981",
          "Transportation": "#F59E0B", "End of Life": "#8B5CF6", "Packaging": "#EC4899",
        };
        const slices = [
          { name: "Raw Materials",  value: Number(d.raw_material)    || 0 },
          { name: "Manufacturing",  value: Number(d.manufacturing)   || 0 },
          { name: "Packaging",      value: Number(d.packaging)       || 0 },
          { name: "Transportation", value: Number(d.transportation)  || 0 },
          { name: "End of Life",    value: Number(d.waste)           || 0 },
        ].filter(s => s.value > 0)
         .map(s => ({ ...s, color: LC_COLOR[s.name] || "#94A3B8" }));
        setApiLifecycle(slices);
      }

      if ((trendRes.status === true || trendRes.success === true) && Array.isArray(trendRes.data)) {
        setApiTrend(
          trendRes.data.map((m: any) => ({
            month: m.month,
            emissions: Number(m.emission) || 0,
            lastYear: 0,
            target: Math.round((Number(m.emission) || 0) * 0.9),
          }))
        );
      }

      if ((scopeRes.status === true || scopeRes.success === true) && scopeRes.data) {
        const d = scopeRes.data;
        setApiScope([
          { name: "Scope 1", value: Number(d.scopeOne)   || 0, color: "#10B981", description: "Direct emissions" },
          { name: "Scope 2", value: Number(d.scopeTwo)   || 0, color: "#3B82F6", description: "Purchased energy" },
          { name: "Scope 3", value: Number(d.scopeThree) || 0, color: "#8B5CF6", description: "Supply chain" },
        ]);
      }
    };
    load();
  }, [user?.userId, user?.id]);

  // Effective data: real when available, hardcoded fallback otherwise
  const effScope      = apiScope.length      > 0 ? apiScope      : scopeData;
  const effLifecycle  = apiLifecycle.length  > 0 ? apiLifecycle  : lifecycleBreakdown;
  const effTrend      = apiTrend.length      > 0 ? apiTrend      : monthlyTrend;
  const effProducts   = apiProducts.length   > 0 ? apiProducts   : productEmissions;

  const formatTimeAgo = (iso: string): string => {
    if (!iso) return "";
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const diffMs = Date.now() - then;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${Math.max(mins, 1)} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  const effPending = apiPending.map((p: any) => ({
    id:       p.id,
    product:  p.product,
    customer: p.customer || "—",
    dueDate:  p.dueDate ? new Date(p.dueDate).toISOString().slice(0, 10) : "—",
    priority: p.priority,
    status:   p.status,
  }));

  const effActivity = apiActivity.length > 0
    ? apiActivity.map((a: any) => ({
        action: a.target ? `${a.description} — ${a.target}` : a.description,
        time:   formatTimeAgo(a.timestamp),
        type:   "pcf",
        status: a.type === "success" ? "completed" : a.type === "warning" ? "warning" : "pending",
      }))
    : recentActivities;

  const effSuppliers = apiSuppliers.length > 0
    ? apiSuppliers.map((s: any, i: number) => ({
        ...supplierScores[i % supplierScores.length],
        id:                  `api-${i}`,
        name:                s.name,
        materials:           [s.category || "Material"],
        scope3Contribution:  Number(s.percentage) || 0,
        emissionsKg:         Number(s.emission) || 0,
      }))
    : [...supplierScores]
        .sort((a, b) => b.scope3Contribution - a.scope3Contribution)
        .slice(0, 5);

  const effHotspots = apiHotspots.length > 0
    ? apiHotspots.map((h: any) => ({
        name:       h.name,
        emissions:  Number(h.emission) || 0,
        percentage: Number(h.percentage) || 0,
        trend:      0,
        facility:   "",
      }))
    : emissionHotspots;

  const totalScope = effScope.reduce((sum, s) => sum + s.value, 0);
  const totalLifecycle = effLifecycle.reduce((sum, l) => sum + l.value, 0);
  const carbonIntensityPerUnit = 1.42; // kg CO2e per unit produced
  const carbonIntensityPerRevenue = 0.18; // kg CO2e per $

  const actionRequiredSuppliers = supplierScores.filter((s) => s.actionRequired);
  const topEmitters = [...supplierScores]
    .sort((a, b) => b.scope3Contribution - a.scope3Contribution)
    .slice(0, 5);

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-50 text-green-700 border border-green-100";
      case "Medium":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "High":
        return "bg-red-50 text-red-700 border border-red-100";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-100";
    }
  };

  const getContractBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-50 text-green-700";
      case "Under Review":
        return "bg-amber-50 text-amber-700";
      case "Expired":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getCbamBadge = (status: string) => {
    switch (status) {
      case "Compliant":
        return "bg-green-50 text-green-700";
      case "Pending":
        return "bg-amber-50 text-amber-700";
      case "Non-Compliant":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const goToSupplierProfile = (id: string) => {
    navigate(`/dashboard/detailed-supplier?supplierId=${id}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "pcf": return <FileText className="w-4 h-4 text-blue-500" />;
      case "supplier": return <Truck className="w-4 h-4 text-green-500" />;
      case "alert": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "product": return <Package className="w-4 h-4 text-purple-500" />;
      case "review": return <Clock className="w-4 h-4 text-orange-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-green-100 text-green-700";
      case "B": return "bg-blue-100 text-blue-700";
      case "C": return "bg-amber-100 text-amber-700";
      case "D": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ── Header Banner ──────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1A5D1A] via-[#2E8B2E] to-[#52C41A] p-6 shadow-lg">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-white/5 rounded-full" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3.5 rounded-2xl border border-white/20">
                <Factory className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {getGreeting()}, {firstName}!
                </h1>
                <p className="text-sm text-green-100 mt-1">
                  Client Dashboard &mdash; Track your carbon footprint &amp; sustainability goals
                </p>
              </div>
            </div>

            {/* Date range + export controls */}
            <div className="flex flex-col items-end gap-2.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-1">
                  {(["month", "quarter", "custom"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setDateRange(r)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                        dateRange === r ? "bg-white text-green-700 shadow" : "text-white/80 hover:text-white"
                      }`}
                    >
                      {r === "month" ? "Month" : r === "quarter" ? "Quarter" : "Custom"}
                    </button>
                  ))}
                </div>
                <button className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-xs font-semibold text-white px-3 py-2 hover:bg-white/20 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              </div>

              {dateRange === "custom" && (
                <DatePicker.RangePicker
                  value={customDates}
                  onChange={(dates) => setCustomDates(dates as [any, any] | null)}
                  size="small"
                  className="!bg-white/15 !backdrop-blur-sm !border-white/20 !rounded-xl !h-8 [&_.ant-picker-input>input]:!text-white [&_.ant-picker-input>input::placeholder]:!text-white/60 [&_.ant-picker-separator]:!text-white/80 [&_.ant-picker-suffix]:!text-white/80 [&_.ant-picker-clear]:!text-white/80 [&_.ant-picker-active-bar]:!bg-white"
                  suffixIcon={<Calendar className="w-3.5 h-3.5 text-white/80" />}
                  style={{ width: 240 }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Alerts Strip ─────────────────────────────── */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Active Alerts</h3>
              <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">{apiAlerts.count > 0 ? apiAlerts.count : 4}</span>
            </div>
            <button className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1">
              View all <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { icon: Target, color: "text-red-600", bg: "bg-red-100", title: "Target breached", desc: "Plastic Housing C3 over target" },
              { icon: FileText, color: "text-amber-600", bg: "bg-amber-100", title: "Questionnaire overdue", desc: "PlastPro Inc — 14 days" },
              { icon: ShieldCheck, color: "text-orange-600", bg: "bg-orange-100", title: "EPD expiring soon", desc: "32 days remaining" },
              { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-100", title: "Data quality low", desc: "GlassTech: 22% primary" },
            ].map((alert, i) => (
              <div key={i} className="bg-white border border-amber-100 rounded-xl p-3 flex items-start gap-2 hover:shadow-sm transition-shadow cursor-pointer">
                <div className={`${alert.bg} p-1.5 rounded-lg shrink-0`}>
                  <alert.icon className={`w-3.5 h-3.5 ${alert.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-800 truncate">{alert.title}</p>
                  <p className="text-[10px] text-gray-500 truncate">{alert.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Products"
            value={apiKpis ? apiKpis.totalProducts : 12}
            subtitle={apiPending.length > 0 ? `${apiPending.length} active PCF requests` : "5 active PCF requests"}
            icon={Package}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            onClick={() => navigate("/product-portfolio")}
          />
          <KPICard
            title="Active Suppliers"
            value={apiKpis ? apiKpis.activeSuppliers : 18}
            subtitle={apiKpis ? "Linked via your PCF requests" : "3 pending questionnaires"}
            icon={Truck}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            onClick={() => navigate("/dashboard/detailed-supplier")}
          />
          <KPICard
            title="Avg. Carbon Footprint"
            value={apiKpis ? `${apiKpis.avgCarbonFootprint.toLocaleString()} kg` : "1,776 kg"}
            subtitle="CO₂e per product (lower is better)"
            icon={Leaf}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            trend={apiKpis ? undefined : -12.4}
            tooltip="Lower is better — green arrow means emissions are decreasing"
            onClick={() => navigate("/dashboard/detailed-pcf-trend")}
          />
          <KPICard
            title="Recyclability Rate"
            value={apiKpis ? `${apiKpis.recyclabilityRate.toFixed(1)}%` : "73%"}
            subtitle={apiKpis ? "Recycled content across materials" : "Above industry avg. (61%)"}
            icon={Recycle}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            trend={apiKpis ? undefined : -5.2}
            onClick={() => navigate("/dashboard/detailed-recyclability")}
          />
        </div>

        {/* ── Scope 1/2/3 + Intensity + Net-Zero Row ─────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Scope 1/2/3 Split */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900">GHG Emissions by Scope</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                GHG Protocol
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Scope 1 / 2 / 3 breakdown (kg CO₂e)</p>
            <div className="space-y-3">
              {effScope.map((scope) => {
                const pct = Math.round((scope.value / totalScope) * 100);
                return (
                  <div key={scope.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: scope.color }} />
                        <p className="text-sm font-bold text-gray-800">{scope.name}</p>
                        <span className="text-[10px] text-gray-400">· {scope.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700">{scope.value.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-gray-400 w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: scope.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total Footprint</p>
                <p className="text-xl font-extrabold text-gray-900">{totalScope.toLocaleString()} <span className="text-xs text-gray-500">kg CO₂e</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Scope 3 Share</p>
                <p className="text-xl font-extrabold text-purple-600">{totalScope > 0 && effScope[2] ? Math.round((effScope[2].value / totalScope) * 100) : 0}%</p>
              </div>
            </div>
          </div>

          {/* Carbon Intensity Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-white">Carbon Intensity</h3>
                <Leaf className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-xs text-slate-400 mb-5">Per unit of output (lower = better)</p>

              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Per unit produced</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-4xl font-extrabold text-white">{carbonIntensityPerUnit}</p>
                  <span className="text-sm text-slate-300 font-semibold">kg CO₂e / unit</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <TrendingDown className="w-3 h-3 text-green-400" />
                  <span className="text-[11px] font-bold text-green-400">-9.6%</span>
                  <span className="text-[10px] text-slate-400">vs last quarter</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Per $ revenue</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-extrabold text-white">{carbonIntensityPerRevenue}</p>
                  <span className="text-xs text-slate-300 font-semibold">kg CO₂e / $</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <TrendingDown className="w-3 h-3 text-green-400" />
                  <span className="text-[11px] font-bold text-green-400">-12.1%</span>
                  <span className="text-[10px] text-slate-400">YoY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net-Zero Progress Tracker */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900">Net-Zero Progress</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                <Target className="w-3 h-3" /> SBTi
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Reduction journey to 2050</p>

            {/* Big number */}
            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-4xl font-extrabold text-gray-900">{netZeroProgress.reductionAchieved}<span className="text-xl text-gray-500">%</span></p>
              <p className="text-xs text-gray-500">of {netZeroProgress.reductionRequired2030}% by 2030</p>
            </div>

            {/* Progress bar with milestones */}
            <div className="relative mb-2">
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${(netZeroProgress.reductionAchieved / 100) * 100}%` }}
                />
              </div>
              {/* Milestone markers */}
              <div className="absolute top-0 h-3 w-0.5 bg-amber-500" style={{ left: "50%" }} />
              <div className="absolute top-0 h-3 w-0.5 bg-red-500" style={{ left: "100%" }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 font-semibold mb-4">
              <span>2020<br/><span className="text-gray-400 font-normal">Baseline</span></span>
              <span className="text-amber-600">2030<br/><span className="text-gray-400 font-normal">-50%</span></span>
              <span className="text-red-600">2050<br/><span className="text-gray-400 font-normal">Net Zero</span></span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Baseline</p>
                <p className="text-sm font-bold text-gray-800">{netZeroProgress.baselineEmissions.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Current</p>
                <p className="text-sm font-bold text-green-600">{netZeroProgress.currentEmissions.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">2030 Target</p>
                <p className="text-sm font-bold text-amber-600">{netZeroProgress.target2030.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Pending PCFs + Compliance Row ───────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Pending PCF Requests Inbox */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">Pending PCF Requests</h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{effPending.length}</span>
              </div>
              <button
                onClick={() => navigate("/pcf-request")}
                className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                View all <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">Action items needing your attention</p>
            <div className="space-y-2">
              {effPending.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No pending PCF requests</p>
                  <p className="text-[11px] text-gray-300 mt-1">You're all caught up</p>
                </div>
              )}
              {effPending.map((pcf: any) => (
                <div
                  key={pcf.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all"
                >
                  <div className={`w-2 h-10 rounded-full ${
                    pcf.priority === "high" ? "bg-red-500" :
                    pcf.priority === "medium" ? "bg-amber-500" : "bg-gray-300"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-gray-400">{pcf.id}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        pcf.status === "Action Required" ? "bg-red-100 text-red-700" :
                        pcf.status === "In Review" ? "bg-blue-100 text-blue-700" :
                        pcf.status === "Awaiting Data" ? "bg-amber-100 text-amber-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {pcf.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 truncate">{pcf.product}</p>
                    <p className="text-[11px] text-gray-500">For {pcf.customer}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Due</p>
                    <p className="text-xs font-bold text-gray-700">{pcf.dueDate}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/pcf-request/${pcf.id}`)}
                    className="text-[11px] font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 flex items-center gap-1 shrink-0"
                  >
                    Open <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance & Certifications */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900">Compliance</h3>
              <ShieldCheck className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xs text-gray-400 mb-4">Certifications & expiry tracking</p>
            <div className="space-y-2.5">
              {certifications.map((cert) => (
                <div key={cert.name} className="flex items-center gap-2">
                  <div className={`w-1.5 h-8 rounded-full ${
                    cert.status === "Active" && cert.daysUntilExpiry > 60 ? "bg-green-500" :
                    cert.status === "Expiring Soon" || cert.daysUntilExpiry < 60 ? "bg-amber-500" :
                    cert.status === "Pending" ? "bg-blue-500" : "bg-gray-300"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-800 truncate">{cert.name}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 shrink-0 ${
                        cert.status === "Active" ? "bg-green-50 text-green-700" :
                        cert.status === "Expiring Soon" ? "bg-amber-50 text-amber-700" :
                        cert.status === "Pending" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"
                      }`}>
                        {cert.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-400">{cert.type}</p>
                      <p className={`text-[10px] font-semibold ${
                        cert.daysUntilExpiry < 60 ? "text-amber-600" : "text-gray-500"
                      }`}>
                        {cert.daysUntilExpiry}d left
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Charts Row 1 ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Emission Trend */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900">Emission Trend</h3>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                <TrendingDown className="w-3 h-3" /> -28.8% over 6 months
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Monthly CO₂e (kg) — actual vs. target vs. last year</p>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={effTrend} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emissionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="emissions"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fill="url(#emissionGradient)"
                    dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                    name="emissions"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                    name="target"
                  />
                  <Line
                    type="monotone"
                    dataKey="lastYear"
                    stroke="#9CA3AF"
                    strokeWidth={1.5}
                    strokeDasharray="2 4"
                    dot={false}
                    name="lastYear"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 px-2">
              <div className="flex items-center gap-1.5"><div className="w-3 h-2 bg-green-500 rounded-sm" /><span className="text-[11px] text-gray-500 font-medium">Actual</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-amber-500 rounded-sm" /><span className="text-[11px] text-gray-500 font-medium">Target</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-gray-400 rounded-sm" /><span className="text-[11px] text-gray-500 font-medium">Last Year</span></div>
            </div>
          </div>

          {/* Lifecycle Breakdown */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">Lifecycle Breakdown</h3>
            <p className="text-xs text-gray-400 mb-4">Emission distribution by phase</p>
            <div className="h-[260px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={effLifecycle}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {effLifecycle.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", fontWeight: 600 }}
                    formatter={(value: string) => {
                      const entry = effLifecycle.find((d) => d.name === value);
                      return entry ? `${value} (${entry.value}%)` : value;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: "60px" }}>
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Total</p>
                <p className="text-2xl font-extrabold text-gray-900 leading-tight">3,420</p>
                <p className="text-[10px] text-gray-500 font-semibold">kg CO₂e</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{totalLifecycle}% mapped</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Charts Row 2 ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Product Emissions vs Target */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">Product Emissions vs Target</h3>
            <p className="text-xs text-gray-400 mb-4">CO₂e per product (kg) &mdash; actual vs. target</p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={effProducts}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F3F5" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#374151", fontWeight: 500 }}
                    width={150}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={chartTooltipCursor}
                  />
                  <Bar dataKey="emission" radius={[0, 4, 4, 0]} barSize={14} name="emission">
                    {effProducts.map((entry, index) => (
                      <Cell
                        key={`cell-pe-${index}`}
                        fill={entry.emission > entry.target ? "#EF4444" : "#3B82F6"}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="target" fill="#D1D5DB" radius={[0, 4, 4, 0]} barSize={14} name="target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 px-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                <span className="text-xs text-gray-500 font-medium">Within target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-sm" />
                <span className="text-xs text-gray-500 font-medium">Over target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-gray-300 rounded-sm" />
                <span className="text-xs text-gray-500 font-medium">Target</span>
              </div>
            </div>
          </div>

          {/* Top Suppliers by Emission Contribution */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900">Top Suppliers by Emission Contribution</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                Scope 3
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Share of your supply-chain CO₂e footprint</p>
            <div className="space-y-3">
              {effSuppliers.map((supplier: any, idx: number) => (
                <div key={supplier.id} className="px-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 w-4">#{idx + 1}</span>
                      <p className="text-sm font-semibold text-gray-800 truncate">{supplier.name}</p>
                      <span className="text-[10px] text-gray-400">·</span>
                      <span className="text-[11px] text-gray-500">{supplier.materials[0]}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-gray-700">{supplier.scope3Contribution}%</span>
                      <span className="text-[10px] text-gray-400">{supplier.emissionsKg.toLocaleString()} kg</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${(supplier.scope3Contribution / (effSuppliers[0]?.scope3Contribution || 1)) * 100}%`,
                        backgroundColor:
                          supplier.grade === "A" ? "#10B981" :
                          supplier.grade === "B" ? "#3B82F6" :
                          supplier.grade === "C" ? "#F59E0B" : "#EF4444",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Supplier Action Required Strip ─────────────── */}
        {actionRequiredSuppliers.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 via-amber-50 to-white border border-amber-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Suppliers Needing Action</h3>
                  <p className="text-xs text-gray-500">{actionRequiredSuppliers.length} supplier{actionRequiredSuppliers.length > 1 ? "s" : ""} require your attention</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard/detailed-supplier")}
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
              >
                View all <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {actionRequiredSuppliers.map((s) => (
                <div key={s.id} className="bg-white border border-amber-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold flex items-center justify-center">
                        {s.logo}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{s.name}</p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {s.location}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getRiskBadge(s.riskLevel)}`}>
                      {s.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mb-3">{s.actionRequired}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Supplier Sustainability Scores (Expandable) ─ */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-gray-900">Supplier Sustainability Scores</h3>
            <button
              onClick={() => navigate("/dashboard/detailed-supplier")}
              className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              View all suppliers <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4">Click any row to view full supplier details</p>
          <div className="space-y-2">
            {supplierScores.map((supplier) => {
              const isExpanded = expandedSupplier === supplier.id;
              return (
                <div
                  key={supplier.id}
                  className={`border rounded-xl transition-all ${
                    isExpanded ? "border-green-200 bg-green-50/30" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {/* Row Header */}
                  <button
                    onClick={() => setExpandedSupplier(isExpanded ? null : supplier.id)}
                    className="w-full flex items-center gap-4 px-4 py-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {supplier.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800 truncate">{supplier.name}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getGradeColor(supplier.grade)}`}>
                          {supplier.grade}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getRiskBadge(supplier.riskLevel)}`}>
                          {supplier.riskLevel.toUpperCase()} RISK
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {supplier.location}, {supplier.country}
                        </span>
                        <span className="text-[11px] text-gray-400">·</span>
                        <span className="text-[11px] text-gray-500">{supplier.category}</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 max-w-md">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${supplier.score}%`,
                            backgroundColor:
                              supplier.score >= 80 ? "#10B981" :
                              supplier.score >= 60 ? "#F59E0B" : "#EF4444",
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Score</p>
                        <div className="flex items-center gap-1">
                          <span className="text-base font-bold text-gray-800">{supplier.score}</span>
                          {supplier.trend === "up" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-green-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">

                        {/* Materials & Products */}
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2 flex items-center gap-1">
                            <Package className="w-3 h-3" /> Materials & Products
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {supplier.materials.map((m) => (
                              <span key={m} className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                {m}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-gray-500 mb-1">Linked Products:</p>
                          <ul className="text-xs text-gray-700 space-y-0.5">
                            {supplier.linkedProducts.map((p) => (
                              <li key={p}>• {p}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Carbon Contribution */}
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2 flex items-center gap-1">
                            <Leaf className="w-3 h-3" /> Carbon Contribution
                          </p>
                          <p className="text-2xl font-extrabold text-gray-900">{supplier.emissionsKg.toLocaleString()}<span className="text-xs font-bold text-gray-500 ml-1">kg CO₂e</span></p>
                          <p className="text-[11px] text-gray-500 mt-1">{supplier.scope3Contribution}% of your Scope 3 footprint</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-gray-500">Data quality:</span>
                            <span className="text-[10px] font-bold text-gray-800">{supplier.dataQualityPrimaryPct}% primary</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">{supplier.verification}</p>
                        </div>

                        {/* Contract */}
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2 flex items-center gap-1">
                            <FileCheck2 className="w-3 h-3" /> Contract
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getContractBadge(supplier.contractStatus)}`}>
                            {supplier.contractStatus}
                          </span>
                          <p className="text-sm font-bold text-gray-800 mt-2">{supplier.contractValue}</p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" /> Ends {supplier.contractEndDate}
                          </p>
                        </div>

                        {/* Compliance */}
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Compliance
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-semibold text-gray-500">CBAM:</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getCbamBadge(supplier.cbamStatus)}`}>
                              {supplier.cbamStatus}
                            </span>
                          </div>
                          {supplier.certifications.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {supplier.certifications.map((c) => (
                                <span key={c} className="text-[10px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Award className="w-2.5 h-2.5" /> {c}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-red-500 font-semibold">No active certifications</p>
                          )}
                          <p className="text-[10px] text-gray-500 mt-2">Last audit: {supplier.lastAuditDate}</p>
                        </div>

                        {/* Engagement */}
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Engagement
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[10px] text-gray-500">Response rate</p>
                              <p className="text-sm font-bold text-gray-800">{supplier.responseRate}%</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500">Avg response</p>
                              <p className="text-sm font-bold text-gray-800">{supplier.avgResponseDays}d</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500">Open requests</p>
                              <p className="text-sm font-bold text-gray-800">{supplier.openRequests}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500">Last Q sent</p>
                              <p className="text-[11px] font-bold text-gray-800">{supplier.lastQuestionnaireDate}</p>
                            </div>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> Primary Contact
                          </p>
                          <p className="text-sm font-bold text-gray-800">{supplier.contactName}</p>
                          <p className="text-[11px] text-gray-600 flex items-center gap-1 mt-1">
                            <Mail className="w-2.5 h-2.5" /> {supplier.contactEmail}
                          </p>
                          <p className="text-[11px] text-gray-600 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" /> {supplier.contactPhone}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">Last contact: {supplier.lastCommunication}</p>
                        </div>
                      </div>

                      {/* Risk flags */}
                      {supplier.riskFlags.length > 0 && (
                        <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-red-600 mb-1.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Risk Flags
                          </p>
                          <ul className="space-y-0.5">
                            {supplier.riskFlags.map((f) => (
                              <li key={f} className="text-xs text-red-700">• {f}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Top Emission Hotspots + Reduction Initiatives ─ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top Emission Hotspots */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900">Top Emission Hotspots</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded">
                Priority
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Facilities & processes contributing most CO₂e</p>
            <div className="space-y-3">
              {effHotspots.map((hotspot: any, idx: number) => (
                <div key={hotspot.name} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{hotspot.name}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-gray-700">{hotspot.emissions.toLocaleString()} kg</span>
                        <span className={`text-[10px] font-bold ${hotspot.trend < 0 ? "text-green-600" : "text-red-600"}`}>
                          {hotspot.trend > 0 ? "+" : ""}{hotspot.trend}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-red-400 to-red-600"
                        style={{ width: `${(hotspot.percentage / (effHotspots[0]?.percentage || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reduction Initiatives Tracker */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900">Reduction Initiatives</h3>
              <Lightbulb className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xs text-gray-400 mb-4">Active sustainability projects</p>
            <div className="space-y-3">
              {reductionInitiatives.map((init) => (
                <div key={init.name} className="border border-gray-100 rounded-xl p-3 hover:border-green-200 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-bold text-gray-800 flex-1 pr-2">{init.name}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      init.status === "Completed" ? "bg-green-100 text-green-700" :
                      init.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {init.status}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                    <div
                      className={`h-1.5 rounded-full ${
                        init.progress === 100 ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${init.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500">
                      <span className="font-bold text-green-600">-{init.expectedSaving}t</span> CO₂e/yr
                    </span>
                    <span className="text-gray-500">ROI: <span className="font-bold text-gray-700">{init.roi}</span></span>
                    <span className="text-gray-500">{init.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Industry Benchmarks ─────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <h3 className="text-base font-bold text-gray-900">Industry Benchmarks</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
              Sector: Metals & Manufacturing
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4">How you compare against your peers</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {benchmarks.map((b) => {
              const isLowerBetter = b.label.includes("Carbon Footprint");
              const youBetter = isLowerBetter ? b.you < b.industryAvg : b.you > b.industryAvg;
              const max = Math.max(b.you, b.industryAvg, b.bestInClass);
              return (
                <div key={b.label} className="border border-gray-100 rounded-xl p-4">
                  <p className="text-[11px] font-semibold text-gray-500 mb-3">{b.label}</p>

                  {/* You */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-bold text-gray-700">You</span>
                      <span className={`text-xs font-extrabold ${youBetter ? "text-green-600" : "text-amber-600"}`}>
                        {b.you.toLocaleString()} {b.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${youBetter ? "bg-green-500" : "bg-amber-500"}`} style={{ width: `${(b.you / max) * 100}%` }} />
                    </div>
                  </div>

                  {/* Industry avg */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-gray-500">Industry avg</span>
                      <span className="text-[11px] font-bold text-gray-600">{b.industryAvg.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1">
                      <div className="h-1 rounded-full bg-gray-400" style={{ width: `${(b.industryAvg / max) * 100}%` }} />
                    </div>
                  </div>

                  {/* Best in class */}
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-gray-500">Best in class</span>
                      <span className="text-[11px] font-bold text-blue-600">{b.bestInClass.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1">
                      <div className="h-1 rounded-full bg-blue-500" style={{ width: `${(b.bestInClass / max) * 100}%` }} />
                    </div>
                  </div>

                  <div className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${youBetter ? "text-green-600" : "text-amber-600"}`}>
                    {youBetter ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {youBetter ? "Above industry average" : "Room to improve"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom Row ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quick Stats */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">Energy & Resources</h3>
            <div className="space-y-4">
              {[
                { label: "Energy Consumption", value: apiEnergy ? `${apiEnergy.energyKwh.toLocaleString()} kWh` : "12,480 kWh", change: "-6.2%", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
                { label: "Water Usage", value: "8,340 L", change: "-3.1%", icon: Leaf, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Waste Generated", value: apiEnergy ? `${apiEnergy.wasteKg.toLocaleString()} kg` : "1,240 kg", change: "-14.7%", icon: Recycle, color: "text-green-500", bg: "bg-green-50" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50/50">
                  <div className={`${item.bg} p-2.5 rounded-xl`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                    <p className="text-sm font-bold text-gray-800">{item.value}</p>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{item.change}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">Recent Activity</h3>
            <p className="text-xs text-gray-400 mb-4">Latest updates from your operations</p>
            <div className="space-y-1">
              {effActivity.map((activity: any, index: number) => {
                const route =
                  activity.type === "pcf" ? "/pcf-request" :
                  activity.type === "supplier" ? "/dashboard/detailed-supplier" :
                  activity.type === "product" ? "/product-portfolio" :
                  activity.type === "review" ? "/data-quality-rating" :
                  "/dashboard";
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mt-0.5 shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                    </div>
                    <div className="shrink-0 mt-1 flex items-center gap-2">
                      {getStatusBadge(activity.status)}
                      <button
                        onClick={() => navigate(route)}
                        className="text-[10px] font-semibold text-green-600 hover:text-green-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5"
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
