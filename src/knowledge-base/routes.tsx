/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import KnowledgeBaseLayout from "./KnowledgeBaseLayout";

// The Knowledge Base pages are plain .jsx modules merged from the former
// standalone app. They are lazy-loaded so they don't weigh down the main bundle.
const Support = lazy(() => import("./pages/Support"));
const HelpCentre = lazy(() => import("./pages/HelpCentre"));
const SupplierQuestionnaire = lazy(() => import("./pages/SupplierQuestionnaire"));
const ManufacturerQuestionnaire = lazy(() => import("./pages/ManufacturerQuestionnaire"));
const ArticleWhatIsEnviguide = lazy(() => import("./pages/ArticleWhatIsEnviGuide"));
const ArticlePlatformWalkthrough = lazy(() => import("./pages/ArticlePlatformWalkthrough"));
const ManualsChoice = lazy(() => import("./pages/ManualsChoice"));
const AdminManuals = lazy(() => import("./pages/AdminManuals"));
const ManufacturerManuals = lazy(() => import("./pages/ManufacturerManuals"));
const SupplierManuals = lazy(() => import("./pages/SupplierManuals"));
const ArticleGetAccess = lazy(() => import("./pages/ArticleGetAccess"));
const ArticleAddProduct = lazy(() => import("./pages/ArticleAddProduct"));
const ArticleCreatePCFRequest = lazy(() => import("./pages/ArticleCreatePCFRequest"));
const ArticlePCFWorkflow = lazy(() => import("./pages/ArticlePCFWorkflow"));
const ArticleOwnEmissions = lazy(() => import("./pages/ArticleOwnEmissions"));
const ArticleComponentMaster = lazy(() => import("./pages/ArticleComponentMaster"));
const ArticleDocumentMaster = lazy(() => import("./pages/ArticleDocumentMaster"));
const ArticleSupplierAccess = lazy(() => import("./pages/ArticleSupplierAccess"));
const ArticleCreateManufacturer = lazy(() => import("./pages/ArticleCreateManufacturer"));
const ArticleCreateNewUser = lazy(() => import("./pages/ArticleCreateNewUser"));
const ArticleManageAuthorizations = lazy(() => import("./pages/ArticleManageAuthorizations"));
const ArticleAdminPCFWorkflow = lazy(() => import("./pages/ArticleAdminPCFWorkflow"));
const ArticleDataConfiguration = lazy(() => import("./pages/ArticleDataConfiguration"));
const ArticleMasterDataSetup = lazy(() => import("./pages/ArticleMasterDataSetup"));
const ArticleEcoInventFactors = lazy(() => import("./pages/ArticleEcoInventFactors"));

// Pathless layout route — children resolve to absolute paths (e.g. /help-centre).
// Public: the Knowledge Base is reachable without authentication, matching the
// behaviour of the former standalone app.
export const knowledgeBaseRoute: RouteObject = {
  element: <KnowledgeBaseLayout />,
  children: [
    { path: "support", element: <Support /> },
    { path: "help-centre", element: <HelpCentre /> },
    { path: "supplier-questionnaire-guide", element: <SupplierQuestionnaire /> },
    { path: "manufacturer-questionnaire", element: <ManufacturerQuestionnaire /> },
    { path: "article-what-is-enviguide", element: <ArticleWhatIsEnviguide /> },
    { path: "article-platform-walkthrough", element: <ArticlePlatformWalkthrough /> },
    { path: "manuals-pcf", element: <ManualsChoice /> },
    { path: "manuals-admin", element: <AdminManuals /> },
    { path: "manuals-manufacturer", element: <ManufacturerManuals /> },
    { path: "manuals-supplier", element: <SupplierManuals /> },
    { path: "article-get-access", element: <ArticleGetAccess /> },
    { path: "article-add-product", element: <ArticleAddProduct /> },
    { path: "article-create-pcf-request", element: <ArticleCreatePCFRequest /> },
    { path: "article-pcf-workflow", element: <ArticlePCFWorkflow /> },
    { path: "article-own-emissions", element: <ArticleOwnEmissions /> },
    { path: "article-component-master", element: <ArticleComponentMaster /> },
    { path: "article-document-master", element: <ArticleDocumentMaster /> },
    { path: "article-supplier-access", element: <ArticleSupplierAccess /> },
    { path: "admin-article-create-manufacturer", element: <ArticleCreateManufacturer /> },
    { path: "admin-article-create-new-user", element: <ArticleCreateNewUser /> },
    { path: "admin-article-manage-authorizations", element: <ArticleManageAuthorizations /> },
    { path: "admin-article-add-product", element: <ArticleAddProduct /> },
    { path: "admin-article-pcf-workflow", element: <ArticleAdminPCFWorkflow /> },
    { path: "admin-article-data-config", element: <ArticleDataConfiguration /> },
    { path: "admin-article-master-setup", element: <ArticleMasterDataSetup /> },
    { path: "admin-article-ecoinvent", element: <ArticleEcoInventFactors /> },
  ],
};
