import type { MenuItem } from "../types";

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
    permissionKey: "dashboard",
  },
  {
    id: "pcf-request",
    title: "Footprint Connect",
    path: "/pcf-request",
    icon: "FileText",
    permissionKey: "pcf request",
  },
  {
    id: "product-portfolio",
    title: "Product Hub",
    path: "/product-portfolio/all-products",
    icon: "Package",
    permissionKey: "product portfolio",
  },
  {
    id: "components-master",
    title: "Components Catalog",
    path: "/components-master",
    icon: "Puzzle",
    permissionKey: "component master",
  },
  {
    id: "document-master",
    title: "Evidence Vault",
    path: "/document-master",
    icon: "FileText",
    permissionKey: "document master",
  },
  {
    id: "task-management",
    title: "Workflow Center",
    path: "/task-management",
    icon: "CheckSquare",
    permissionKey: "task management",
  },
  {
    id: "reports",
    title: "Analytics Center",
    path: "/reports",
    icon: "BarChart3",
    permissionKey: "reports",
  },
  {
    id: "data-quality-rating",
    title: "Data Trust Score",
    path: "/data-quality-rating",
    icon: "Star",
    permissionKey: "data quality rating",
  },
  {
    id: "settings",
    title: "Settings",
    path: "/settings",
    icon: "Settings",
    permissionKey: "settings",
  },
];
