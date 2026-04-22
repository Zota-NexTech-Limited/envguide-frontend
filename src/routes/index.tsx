/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import ProtectedRoute from "../components/ProtectedRoute";
import PermissionRoute from "../components/PermissionRoute";
import {
  dataSetupGroups,
  masterDataSetupGroups,
  ecoInventSetupGroups,
} from "../config/dataSetupGroups";

// Lazy-loaded page components for code splitting
const DashboardRouter = lazy(() => import("../pages/DashboardRouter"));
const VisitorManagement = lazy(() => import("../pages/VisitorManagement"));
const SuiteManagement = lazy(() => import("../pages/SuiteManagement"));
const Bookings = lazy(() => import("../pages/Bookings"));
const HardwareManagement = lazy(() => import("../pages/HardwareManagement"));
const DocumentsManagement = lazy(() => import("../pages/DocumentsManagement"));
const Settings = lazy(() => import("../pages/Settings"));

// Auth pages
const Login = lazy(() => import("../pages/auth/Login"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const ForgotMFA = lazy(() => import("../pages/auth/ForgotMFA"));
const MFAVerification = lazy(() => import("../pages/auth/MFAVerification"));

// Settings pages
const Users = lazy(() => import("../pages/settings/Users"));
const UsersCreate = lazy(() => import("../pages/settings/UsersCreate"));
const UsersEdit = lazy(() => import("../pages/settings/UsersEdit"));
const Authorizations = lazy(() => import("../pages/settings/Authorizations"));
const AlertManagement = lazy(() => import("../pages/settings/AlertManagement"));
const AlertManagementCreate = lazy(() => import("../pages/settings/AlertManagementCreate"));
const ManufacturerOnboardingForm = lazy(() => import("../pages/settings/ManufacturerOnboardingForm"));
const SupplierOnboardingForm = lazy(() => import("../pages/settings/SupplierOnboardingForm"));
const Products = lazy(() => import("../pages/settings/Products"));
const Components = lazy(() => import("../pages/settings/Components"));
const DataSetup = lazy(() => import("../pages/settings/DataSetup"));
const DataSetupTabs = lazy(() => import("../pages/settings/DataSetupTabs"));
const MasterDataSetupTabs = lazy(() => import("../pages/settings/MasterDataSetupTabs"));
const EcoInventSetupTabs = lazy(() => import("../pages/settings/EcoInventSetupTabs"));

// Public pages
const PublicManufacturerOnboarding = lazy(() => import("../pages/PublicManufacturerOnboarding"));
const PublicSupplierOnboarding = lazy(() => import("../pages/PublicSupplierOnboarding"));

// Feature pages
const PCFRequest = lazy(() => import("../pages/PCFRequest"));
const ProductPortfolio = lazy(() => import("../pages/ProductPortfolio"));
const AllProducts = lazy(() => import("../pages/AllProducts"));
const ProductCreate = lazy(() => import("../pages/ProductCreate"));
const ProductView = lazy(() => import("../pages/ProductView"));
const ProductEdit = lazy(() => import("../pages/ProductEdit"));
const ComponentsMaster = lazy(() => import("../pages/ComponentsMaster"));
const ComponentsMasterView = lazy(() => import("../pages/ComponentsMasterView"));
const DocumentMaster = lazy(() => import("../pages/DocumentMaster"));
const TaskManagement = lazy(() => import("../pages/TaskManagement"));
const TaskCreate = lazy(() => import("../pages/TaskCreate"));
const ReportsMain = lazy(() => import("../pages/Reports"));
const SupplierQuestionnaire = lazy(() => import("../pages/SupplierQuestionnaire"));
const SupplierQuestionnaireList = lazy(() => import("../pages/SupplierQuestionnaireList"));
const DataQualityRating = lazy(() => import("../pages/DataQualityRating"));
const DataQualityRatingList = lazy(() => import("../pages/DataQualityRatingList"));
const PCFRequestCreate = lazy(() => import("../pages/PCFRequestCreate"));
const PCFRequestView = lazy(() => import("../pages/PCFRequestView"));
const PCFRequestEdit = lazy(() => import("../pages/PCFRequestEdit"));
const TaskView = lazy(() => import("../pages/TaskView"));
const ReportView = lazy(() => import("../pages/ReportView"));

// Detailed Dashboard Pages
const DetailedLifeCycle = lazy(() => import("../pages/DetailedLifeCycle"));
const DetailedSupplierEmission = lazy(() => import("../pages/DetailedSupplierEmission"));
const DetailedRawMaterialEmission = lazy(() => import("../pages/DetailedRawMaterialEmission"));
const DetailedPackagingEmission = lazy(() => import("../pages/DetailedPackagingEmission"));
const DetailedTransportationEmission = lazy(() => import("../pages/DetailedTransportationEmission"));
const DetailedEnergyEmission = lazy(() => import("../pages/DetailedEnergyEmission"));
const DetailedRecyclability = lazy(() => import("../pages/DetailedRecyclability"));
const DetailedWasteEmission = lazy(() => import("../pages/DetailedWasteEmission"));
const DetailedImpactCategories = lazy(() => import("../pages/DetailedImpactCategories"));
const DetailedPCFTrend = lazy(() => import("../pages/DetailedPCFTrend"));

// Suspense wrapper for lazy components
const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <S><Login /></S>,
  },
  {
    path: "/signup",
    element: <S><Signup /></S>,
  },
  {
    path: "/forgot-password",
    element: <S><ForgotPassword /></S>,
  },
  {
    path: "/reset-password",
    element: <S><ResetPassword /></S>,
  },
  {
    path: "/forgot-mfa",
    element: <S><ForgotMFA /></S>,
  },
  {
    path: "/mfa-verification",
    element: <S><MFAVerification /></S>,
  },
  // Public supplier questionnaire route (no login required when accessed via link with sup_id and bom_pcf_id)
  {
    path: "/supplier-questionnaire",
    element: <S><SupplierQuestionnaire /></S>,
  },
  // Public manufacturer onboarding form (no login required)
  {
    path: "/manufacturer-onboarding",
    element: <S><PublicManufacturerOnboarding /></S>,
  },
  // Public supplier onboarding form (no login required)
  {
    path: "/supplier-onboarding",
    element: <S><PublicSupplierOnboarding /></S>,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <S><DashboardRouter /></S>,
      },
      {
        path: "dashboard/detailed-lifecycle",
        element: <S><DetailedLifeCycle /></S>,
      },
      {
        path: "dashboard/detailed-supplier",
        element: <S><DetailedSupplierEmission /></S>,
      },
      {
        path: "dashboard/detailed-raw-material",
        element: <S><DetailedRawMaterialEmission /></S>,
      },
      {
        path: "dashboard/detailed-packaging",
        element: <S><DetailedPackagingEmission /></S>,
      },
      {
        path: "dashboard/detailed-transportation",
        element: <S><DetailedTransportationEmission /></S>,
      },
      {
        path: "dashboard/detailed-energy",
        element: <S><DetailedEnergyEmission /></S>,
      },
      {
        path: "dashboard/detailed-recyclability",
        element: <S><DetailedRecyclability /></S>,
      },
      {
        path: "dashboard/detailed-waste",
        element: <S><DetailedWasteEmission /></S>,
      },
      {
        path: "dashboard/detailed-impact",
        element: <S><DetailedImpactCategories /></S>,
      },
      {
        path: "dashboard/detailed-pcf-trend",
        element: <S><DetailedPCFTrend /></S>,
      },
      {
        path: "pcf-request",
        element: (
          <PermissionRoute permissionKey="pcf request">
            <S><PCFRequest /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "pcf-request/new",
        element: (
          <PermissionRoute permissionKey="pcf request" action="create">
            <S><PCFRequestCreate /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "pcf-request/:id",
        element: (
          <PermissionRoute permissionKey="pcf request">
            <S><PCFRequestView /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "pcf-request/:id/edit",
        element: (
          <PermissionRoute permissionKey="pcf request" action="update">
            <S><PCFRequestEdit /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "product-portfolio",
        element: (
          <PermissionRoute permissionKey="product portfolio">
            <S><AllProducts /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "product-portfolio/all-products",
        element: (
          <PermissionRoute permissionKey="product portfolio">
            <S><AllProducts /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "product-portfolio/new",
        element: (
          <PermissionRoute permissionKey="product portfolio" action="create">
            <S><ProductCreate /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "product-portfolio/view/:id",
        element: (
          <PermissionRoute permissionKey="product portfolio">
            <S><ProductView /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "product-portfolio/edit/:id",
        element: (
          <PermissionRoute permissionKey="product portfolio" action="update">
            <S><ProductEdit /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "components-master",
        element: (
          <PermissionRoute permissionKey="component master">
            <S><ComponentsMaster /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "components-master/view/:id",
        element: (
          <PermissionRoute permissionKey="component master">
            <S><ComponentsMasterView /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "document-master",
        element: (
          <PermissionRoute permissionKey="document master">
            <S><DocumentMaster /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "task-management",
        element: (
          <PermissionRoute permissionKey="task management">
            <S><TaskManagement /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "task-management/new",
        element: (
          <PermissionRoute permissionKey="task management" action="create">
            <S><TaskCreate /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "task-management/view/:id",
        element: (
          <PermissionRoute permissionKey="task management">
            <S><TaskView /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <PermissionRoute permissionKey="reports">
            <S><ReportsMain /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "reports/:id",
        element: (
          <PermissionRoute permissionKey="reports">
            <S><ReportView /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "visitor-management",
        element: <S><VisitorManagement /></S>,
      },
      {
        path: "suite-management",
        element: <S><SuiteManagement /></S>,
      },
      {
        path: "bookings",
        element: <S><Bookings /></S>,
      },
      {
        path: "hardware-management",
        element: <S><HardwareManagement /></S>,
      },
      {
        path: "documents-management",
        element: <S><DocumentsManagement /></S>,
      },
      {
        path: "settings",
        element: (
          <PermissionRoute permissionKey="settings">
            <S><Settings /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "settings/users",
        element: (
          <PermissionRoute permissionKey="manage users">
            <S><Users /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "settings/users/create",
        element: (
          <PermissionRoute permissionKey="create new user" action="create">
            <S><UsersCreate /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "settings/users/edit/:userId",
        element: (
          <PermissionRoute permissionKey="manage users" action="update">
            <S><UsersEdit /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "settings/manufacturer-onboarding",
        element: (
          <PermissionRoute permissionKey="settings">
            <S><ManufacturerOnboardingForm /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "settings/manufacturer-onboarding/:id",
        element: (
          <PermissionRoute permissionKey="settings">
            <S><ManufacturerOnboardingForm /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "settings/supplier-onboarding",
        element: (
          <PermissionRoute permissionKey="settings">
            <S><SupplierOnboardingForm /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "settings/supplier-onboarding/:id",
        element: (
          <PermissionRoute permissionKey="settings">
            <S><SupplierOnboardingForm /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "settings/authorizations",
        element: (
          <PermissionRoute permissionKey="authorization">
            <S><Authorizations /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "settings/alert-management",
        element: (
          <PermissionRoute permissionKey="alert management">
            <S><AlertManagement /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "settings/alert-management/new",
        element: (
          <PermissionRoute permissionKey="alert management" action="create">
            <S><AlertManagementCreate /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "settings/alert-management/edit/:id",
        element: (
          <PermissionRoute permissionKey="alert management" action="update">
            <S><AlertManagementCreate /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "settings/products/:tab?",
        element: (
          <PermissionRoute permissionKey="data configuration">
            <S><Products /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "settings/components/:tab?",
        element: (
          <PermissionRoute permissionKey="data configuration">
            <S><Components /></S>
          </PermissionRoute>
        ),
      },
      // All data setup pages (single entity or grouped with tabs)
      {
        path: "settings/data-setup/:entity",
        element: (
          <PermissionRoute permissionKey="data configuration">
            <S><DataSetup /></S>
          </PermissionRoute>
        ),
      },
      // Tabbed data setup pages (uses /api/data-setup)
      ...dataSetupGroups.map((group) => ({
        path: `settings/data-setup/${group.key}/:tab?`,
        element: (
          <PermissionRoute permissionKey="data configuration">
            <S>
              <DataSetupTabs
                title={group.title}
                description={group.description}
                tabs={group.tabs}
                defaultTab={group.tabs[0]?.key || ""}
              />
            </S>
          </PermissionRoute>
        ),
      })),
      // Master Data Setup pages (uses /api/master-data-setup)
      ...masterDataSetupGroups.map((group) => ({
        path: `settings/master-data-setup/${group.key}/:tab?`,
        element: (
          <PermissionRoute permissionKey="master data setup">
            <S>
              <MasterDataSetupTabs
                title={group.title}
                description={group.description}
                tabs={group.tabs}
                defaultTab={group.tabs[0]?.key || ""}
              />
            </S>
          </PermissionRoute>
        ),
      })),
      // ECOInvent Emission Factor pages (uses /api/ecoinvent-emission-factor-data-setup)
      ...ecoInventSetupGroups.map((group) => ({
        path: `settings/ecoinvent-setup/${group.key}/:tab?`,
        element: (
          <PermissionRoute permissionKey="eco invent emission factors">
            <S>
              <EcoInventSetupTabs
                title={group.title}
                description={group.description}
                tabs={group.tabs}
                defaultTab={group.tabs[0]?.key || ""}
              />
            </S>
          </PermissionRoute>
        ),
      })),
      {
        path: "data-quality-rating",
        element: (
          <PermissionRoute permissionKey="data quality rating">
            <S><DataQualityRatingList /></S>
          </PermissionRoute>
        ),
      },
      {
        path: "data-quality-rating/view",
        element: (
          <PermissionRoute permissionKey="data quality rating">
            <S><DataQualityRating /></S>
          </PermissionRoute>
        ),
      },
    ],
  },
]);
