import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SuperAdminDashboard from "./SuperAdminDashboard";
import ClientDashboard from "./ClientDashboard";
import Dashboard from "./Dashboard";

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // If a super admin clicked "drill down" into a client, show the client dashboard
  const drillDownClient = location.state?.selectedClient;
  const fromSuperAdmin = location.state?.fromSuperAdmin;

  const isSuperAdmin =
    user?.role?.toLowerCase() === "superadmin" ||
    user?.role?.toLowerCase() === "super admin" ||
    user?.role?.toLowerCase() === "enviguide" ||
    user?.role?.toLowerCase() === "admin";

  // Show client dashboard when drilling down into a specific client
  if (isSuperAdmin && drillDownClient && fromSuperAdmin) {
    return <Dashboard />;
  }

  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  // Non-superadmin users (clients) get the client dashboard
  return <ClientDashboard />;
};

export default DashboardRouter;
