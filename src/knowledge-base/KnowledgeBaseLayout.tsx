import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import EcoChat from "./components/EcoChat";
import "./kb.css";

/**
 * Wrapper for all Knowledge Base routes. Provides:
 * - the `.kb-root` scope so the KB's global styling never leaks into the
 *   main PCF app,
 * - scroll-to-top on navigation (the standalone KB app's behaviour),
 * - a Suspense boundary for the lazy-loaded KB pages.
 */
export default function KnowledgeBaseLayout() {
  return (
    <div className="kb-root">
      <ScrollToTop />
      <Suspense fallback={<div className="kb-loading">Loading…</div>}>
        <Outlet />
      </Suspense>
      <EcoChat />
    </div>
  );
}
