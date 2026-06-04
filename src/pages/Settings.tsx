import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { usePermissions } from "../contexts/PermissionContext";
import { useAuth } from "../contexts/AuthContext";

const SCROLL_STORAGE_KEY = "settings-scroll-position";
import {
  Settings as SettingsIcon,
  Users,
  UserPlus,
  Package,
  Puzzle,
  Building2,
  ChevronRight,
  Search,
  ScrollText,
  Shield,
  Bell,
  HardDrive,
  RefreshCw,
  FileText,
  Award,
  Zap,
  Factory,
  Droplets,
  Truck,
  Layers,
  Battery,
  Activity,
  GaugeCircle,
  FileCheck,
  Leaf,
  Database,
  Globe,
  Tag,
  Clock,
  Ruler,
  Scale,
  Thermometer,
} from "lucide-react";
import {
  dataSetupGroups,
  masterDataSetupGroups,
} from "../config/dataSetupGroups";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { hasModuleAccess, loading: permissionsLoading } = usePermissions();

  // Icon mapping for master data setup groups
  const masterDataIconMap: Record<string, any> = {
    materials: Layers,
    energy: Battery,
    transport: Truck,
    "water-waste": Droplets,
    units: Ruler,
    standards: FileCheck,
    lifecycle: Activity,
    manufacturing: Factory,
    geography: Globe,
    organization: Building2,
  };

  const settingsGroups = [
    {
      title: "User Management",
      description: "Manage users, permissions, and access controls",
      icon: Users,
      permissionKey: "user management",
      items: [
        {
          name: "Manage Users",
          description:
            "View, edit, and manage existing user accounts and their permissions",
          path: "/settings/users",
          icon: Users,
          badge: null,
          cardType: "default",
          permissionKey: "manage users",
        },
        {
          name: "Authorizations",
          description:
            "Configure module-level access permissions for roles and users",
          path: "/settings/authorizations",
          icon: Shield,
          badge: "NEW",
          cardType: "default",
          permissionKey: "authorization",
        },
        {
          name: "Create New User",
          description: "Add a new user to the system with custom permissions",
          path: "/settings/users/create",
          icon: UserPlus,
          badge: null,
          cardType: "default",
          permissionKey: "create new user",
        },
      ],
    },
    {
      title: "Data Configuration",
      description:
        "Configure core data entities with code, name, and description",
      icon: Database,
      permissionKey: "data configuration",
      items: [
        {
          name: "Products",
          description:
            "Manage product categories, types, and organizational structure",
          path: "/settings/products",
          icon: Package,
          badge: null,
          cardType: "default",
        },
        {
          name: "Components",
          description:
            "Configure component types, specifications, and attributes",
          path: "/settings/components",
          icon: Puzzle,
          badge: null,
          cardType: "default",
        },
        ...dataSetupGroups.map((group) => ({
          name: group.title,
          description: group.description,
          path: `/settings/data-setup/${group.key}/${group.tabs[0]?.key || ""}`,
          icon:
            group.key === "emissions"
              ? Factory
              : group.key === "electricity"
                ? Zap
                : group.key === "components"
                  ? Puzzle
                  : group.key === "products"
                    ? Package
                    : group.key === "industry"
                      ? Building2
                      : Package,
          badge: null,
          cardType: "default" as const,
        })),
      ],
    },
    {
      title: "Master Data Setup",
      description: "Configure reference data and lookup values",
      icon: Layers,
      permissionKey: "master data setup",
      items: masterDataSetupGroups.map((group) => ({
        name: group.title,
        description: group.description,
        path: `/settings/master-data-setup/${group.key}/${group.tabs[0]?.key || ""}`,
        icon: masterDataIconMap[group.key] || Tag,
        badge: null,
        cardType: "default" as const,
      })),
    },
    {
      title: "Emission Factors",
      description: "Unified emission factor master (BAFU 2025)",
      icon: Leaf,
      permissionKey: "emission factors",
      items: [
        {
          name: "Emission Factors",
          description:
            "Browse and manage the BAFU 2025 emission factor dataset used across PCF calculations.",
          path: "/settings/emission-factors",
          icon: Leaf,
          badge: "NEW",
          cardType: "default",
          permissionKey: "emission factors",
        },
      ],
    },
    {
      title: "Alert Management",
      description: "Configure system alerts and notification rules",
      icon: Bell,
      permissionKey: "alert management",
      items: [
        {
          name: "Alert Management",
          description:
            "Create and manage automated alerts and notifications",
          path: "/settings/alert-management",
          icon: Bell,
          badge: "NEW",
          cardType: "default",
          permissionKey: "alert management",
        },
      ],
    },
  ];

  const quickActions = [
    {
      label: "Supplier Questionnaire",
      icon: FileText,
      action: () => navigate("/supplier-questionnaire"),
    },
    {
      label: "Data Quality Rating",
      icon: Award,
      action: () => navigate("/data-quality-rating"),
    },
    { label: "View Logs", icon: ScrollText, action: () => {} },
    { label: "Security Settings", icon: Shield, action: () => {} },
    { label: "Notifications", icon: Bell, action: () => {} },
    { label: "Backup Data", icon: HardDrive, action: () => {} },
    { label: "System Updates", icon: RefreshCw, action: () => {} },
  ];

  // Filter groups and items based on permissions and search query
  const filteredGroups = useMemo(() => {
    if (permissionsLoading) {
      return [];
    }

    return settingsGroups
      .filter((group) => {
        // Check if user has access to the group
        if (group.permissionKey && !hasModuleAccess(group.permissionKey)) {
          return false;
        }
        return true;
      })
      .map((group) => ({
        ...group,
        items: group.items.filter((item: any) => {
          // Check permission for item if it has a permissionKey
          if (item.permissionKey && !hasModuleAccess(item.permissionKey)) {
            return false;
          }
          // Apply search filter
          return (
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, hasModuleAccess, permissionsLoading]);

  // Restore scroll position after returning to /settings from a sub-page
  useEffect(() => {
    if (permissionsLoading) return;
    const saved = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    if (saved === null) return;
    sessionStorage.removeItem(SCROLL_STORAGE_KEY);
    const scrollY = parseInt(saved, 10);
    if (Number.isNaN(scrollY)) return;
    requestAnimationFrame(() => {
      const main = document.querySelector("main");
      if (main) main.scrollTop = scrollY;
      else window.scrollTo(0, scrollY);
    });
  }, [permissionsLoading]);

  const handleCardNavigate = (path: string) => {
    const main = document.querySelector("main");
    const scrollTop = main ? main.scrollTop : window.scrollY;
    sessionStorage.setItem(SCROLL_STORAGE_KEY, String(scrollTop));
    navigate(path);
  };

  // Color config - all green
  const colors = {
    gradient: "from-green-500 to-green-600",
    shadow: "shadow-green-500/30",
    border: "hover:border-green-500/30",
    hover: "group-hover:text-green-500",
  };

  // Show loading state while permissions are loading
  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Compute hero stats from accessible groups
  const categoryCount = filteredGroups.filter((g) => g.items.length > 0).length;
  const settingsCount = filteredGroups.reduce(
    (sum, g) => sum + g.items.length,
    0,
  );
  const roleLabel = (user?.role || "Member").replace(/(^\w|\s\w)/g, (m) =>
    m.toUpperCase(),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-5">
      <div className="mx-6 space-y-6">
        {/* Hero Header */}
        <div className="bg-white rounded-2xl shadow-sm relative overflow-hidden border border-gray-100">
          {/* Decorative blurs */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-green-200/40 to-emerald-200/30 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-br from-emerald-200/20 to-green-200/20 rounded-full blur-3xl" />

          <div className="relative p-7">
            {/* Title + Stats Row */}
            <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 flex-shrink-0">
                  <SettingsIcon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                    Settings
                  </h1>
                  <p className="text-slate-500 text-sm">
                    Configure your system and manage your application
                  </p>
                </div>
              </div>

              {/* Stat chips */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold text-green-700 tabular-nums">
                    {categoryCount}
                  </span>
                  <span className="text-xs text-green-600/80">Categories</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold text-blue-700 tabular-nums">
                    {settingsCount}
                  </span>
                  <span className="text-xs text-blue-600/80">Settings</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Integrated Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl bg-white/80 backdrop-blur text-[14px] placeholder:text-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {filteredGroups.map((group) => {
            const GroupIcon = group.icon;

            // Don't render section if no items match search
            if (group.items.length === 0) return null;

            return (
              <div key={group.title} className="space-y-5">
                {/* Section Header */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg ${colors.shadow}`}
                  >
                    <GroupIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-700">
                      {group.title}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {group.description}
                    </p>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;

                    return (
                      <div
                        key={item.name}
                        className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-300 border-2 border-transparent relative overflow-hidden group hover:translate-y-[-4px] hover:shadow-xl hover:shadow-green-500/10 ${colors.border}`}
                        onClick={() => handleCardNavigate(item.path)}
                      >
                        {/* Top border gradient on hover */}
                        <div
                          className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${colors.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                        ></div>

                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              item.cardType === "primary"
                                ? `bg-gradient-to-br ${colors.gradient} shadow-lg ${colors.shadow}`
                                : item.cardType === "secondary"
                                  ? `bg-gradient-to-br ${colors.gradient} shadow-lg ${colors.shadow}`
                                  : `bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 group-hover:border-green-500 group-hover:bg-gradient-to-br group-hover:from-green-500/10 group-hover:to-green-600/10`
                            }`}
                          >
                            <ItemIcon
                              className={`w-5 h-5 transition-colors duration-300 ${
                                item.cardType === "default"
                                  ? `text-slate-700 ${colors.hover}`
                                  : "text-white"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0 pr-8">
                            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                              {item.name}
                              {item.badge && (
                                <span
                                  className={`text-[10px] px-2 py-0.5 bg-gradient-to-br ${colors.gradient} text-white rounded-md font-bold`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Arrow Icon */}
                        <div
                          className={`absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 text-xl transition-all duration-300 ${colors.hover} group-hover:translate-x-1`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        {/* <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-base font-semibold text-slate-700 mb-4">
            Quick Actions
          </h3>
          <div className="flex gap-3 flex-wrap">
            {quickActions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={index}
                  className="px-5 py-2.5 border-2 border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 cursor-pointer transition-all duration-200 hover:border-green-500 hover:text-green-500 hover:bg-green-500/5 active:scale-[0.98] flex items-center gap-2"
                  onClick={action.action}
                >
                  <ActionIcon className="w-4 h-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Settings;
