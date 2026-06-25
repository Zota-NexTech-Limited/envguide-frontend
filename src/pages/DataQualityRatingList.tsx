import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  Eye,
  Loader,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Select } from "antd";
import supplierQuestionnaireService from "../lib/supplierQuestionnaireService";
import authService from "../lib/authService";

const { Option } = Select;

interface DQRItem {
  sgiq_id: string;
  bom_pcf_id?: string;
  organization_name?: string;
  core_business_activitiy?: string;
  designation?: string;
  email_address?: string;
  created_date?: string;
  update_date?: string;
  supplier_details?: {
    sup_id: string;
    code: string;
    supplier_name: string;
    supplier_email: string;
    supplier_phone_number: string;
  };
  bom?: Array<{
    bom_id: string;
    material_number: string;
    component_name: string;
    production_location: string;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  totalCount: number;
}

interface DQRSummary {
  total_dqr_count: number;
  pending_dqr_count: number;
  completed_dqr_count: number;
}

const DataQualityRatingList: React.FC = () => {
  const navigate = useNavigate();
  const [dqrList, setDqrList] = useState<DQRItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 9,
    totalRecords: 0,
    totalPages: 0,
    totalCount: 0,
  });
  const [dqrSummary, setDqrSummary] = useState<DQRSummary>({
    total_dqr_count: 0,
    pending_dqr_count: 0,
    completed_dqr_count: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when search or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, pageSize]);

  // Fetch data when page, search, or pageSize changes
  useEffect(() => {
    fetchDQRList(currentPage, debouncedSearchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchTerm, pageSize]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const fetchDQRList = async (page: number = 1, search?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!authService.isAuthenticated()) {
        setError("User not authenticated");
        return;
      }

      const result = await supplierQuestionnaireService.listDQRRatings(
        page,
        pageSize,
        undefined,
        search || undefined
      );

      if (result.success && result.data) {
        setDqrList(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
        if (result.dqr_summary) {
          setDqrSummary(result.dqr_summary);
        }
      } else {
        setError(result.message || "Failed to load DQR list");
      }
    } catch (error) {
      console.error("Error fetching DQR list:", error);
      setError("An error occurred while fetching DQR list");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Use dqr_summary from API for stats
  const stats = {
    total: dqrSummary.total_dqr_count,
    completed: dqrSummary.completed_dqr_count,
    pending: dqrSummary.pending_dqr_count,
  };

  if (isLoading && dqrList.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader
            size={48}
            className="animate-spin text-green-500 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading data quality ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-br from-green-200/40 to-emerald-200/30 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 flex-shrink-0">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Data Quality Ratings
              </h1>
              <p className="text-gray-500 text-sm">
                Review and assess data quality from supplier submissions
              </p>
            </div>
          </div>

          {(() => {
            const safeTotal = Math.max(stats.total, 1);
            const completionPct = Math.round((stats.completed / safeTotal) * 100);
            const TILES = [
              { key: "pending", label: "Pending", value: stats.pending, Icon: Clock, bar: "bg-amber-500", iconBg: "bg-amber-50", iconText: "text-amber-600", description: "Awaiting reviewer assessment" },
              { key: "completed", label: "Completed", value: stats.completed, Icon: CheckCircle, bar: "bg-green-500", iconBg: "bg-green-50", iconText: "text-green-600", description: "Assessments fully scored and signed off" },
            ];

            return (
              <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 shadow-lg shadow-slate-900/20">
                  <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 bg-green-500/20 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold">Total Assessments</span>
                      <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-green-400" />
                      </div>
                    </div>
                    <div className="text-5xl font-bold tracking-tight mb-4">{stats.total}</div>
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-slate-400 font-medium">Completion Rate</span>
                        <span className="text-green-400 font-bold">{completionPct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-400 to-emerald-300 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TILES.map((s) => {
                    const pct = Math.round((s.value / safeTotal) * 100);
                    return (
                      <div key={s.key} className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-3.5 transition-all hover:shadow-md flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-7 h-7 rounded-lg ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                              <s.Icon className={`w-3.5 h-3.5 ${s.iconText}`} />
                            </div>
                            <span className="text-xs font-medium text-gray-600 truncate">{s.label}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-gray-400 tabular-nums">{pct}%</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 tabular-nums leading-none">{s.value}</div>
                        <div className="mt-2.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${s.bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-3 text-[11px] text-gray-500 leading-snug">{s.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>


      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
        {/* Top row: heading */}
        <div className="flex justify-between items-center mb-4 gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Assessments</h2>
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by organization, supplier, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-11 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 flex items-center gap-3">
          <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dqrList.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl shadow-sm p-12 border border-gray-100">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Star size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">No assessments found</p>
              <p className="text-sm">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Complete supplier questionnaires to see data quality ratings"}
              </p>
            </div>
          </div>
        ) : (
          dqrList.map((item) => (
            <div
              key={item.sgiq_id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <Building2 size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.organization_name || item.supplier_details?.supplier_name || `ID: ${item.sgiq_id?.slice(0, 8)}...`}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {item.bom?.length || 0} BOM items
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {item.supplier_details && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Supplier</span>
                      <span className="font-medium text-gray-900">
                        {item.supplier_details.supplier_name}
                      </span>
                    </div>
                  )}
                  {item.core_business_activitiy && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Business</span>
                      <span className="font-medium text-gray-900">
                        {item.core_business_activitiy}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-900 font-medium flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(item.created_date)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      sgiq_id: item.sgiq_id,
                    });
                    if (item.bom_pcf_id) {
                      params.append("bom_pcf_id", item.bom_pcf_id);
                    }
                    navigate(`/data-quality-rating/view?${params.toString()}`);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 hover:shadow-lg shadow-lg shadow-green-600/20 transition-all font-medium"
                >
                  <Eye size={18} />
                  <span>View Assessment</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {(pagination.totalRecords > 0 || pagination.totalCount > 0) && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader size={14} className="animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-medium">
                      {Math.min(((currentPage - 1) * pageSize) + 1, pagination.totalRecords || pagination.totalCount)}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, pagination.totalRecords || pagination.totalCount)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {pagination.totalRecords || pagination.totalCount}
                    </span>{" "}
                    assessments
                  </>
                )}
              </span>
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="w-[110px]"
                size="small"
              >
                <Option value={9}>9 / page</Option>
                <Option value={18}>18 / page</Option>
                <Option value={27}>27 / page</Option>
                <Option value={45}>45 / page</Option>
              </Select>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || isLoading}
                  className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoading}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-green-600 text-white"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages || isLoading}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={currentPage === pagination.totalPages || isLoading}
                  className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Last
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataQualityRatingList;
