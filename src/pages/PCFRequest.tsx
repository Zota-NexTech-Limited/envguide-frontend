import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Select,
  Space,
  Tag,
  DatePicker,
  Spin,
  message,
  Input,
} from "antd";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Plus,
  Car,
  Battery,
  Lightbulb,
  Microchip,
  Search,
  Pencil,
  Download,
  Send,
} from "lucide-react";
import { Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import pcfService from "../lib/pcfService";
import type { PCFBOMItem } from "../lib/pcfService";
import dayjs from "dayjs";
import { usePermissions } from "../contexts/PermissionContext";
import { useAuth } from "../contexts/AuthContext";

interface PCFRequestItem {
  id: string;
  requestNumber: string;
  productName: string;
  productIcon: React.ReactNode;
  status: string;
  submittedBy: string;
  submittedOn: string;
}

interface PCFFilters {
  search?: string;
  from_date?: string;
  to_date?: string;
  pcf_status?: string;
}

const PCFRequest: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { canCreate } = usePermissions();
  const { user } = useAuth();
  // Report download is a super-admin-only capability — clients only see their
  // own report when an admin emails it to them, not a self-serve download.
  const isSuperAdmin =
    user?.role?.toLowerCase() === "superadmin" ||
    user?.role?.toLowerCase() === "super admin" ||
    user?.role?.toLowerCase() === "enviraan" ||
    user?.role?.toLowerCase() === "admin";
  const [pageSize, setPageSize] = useState(10);
  const [pcfRequests, setPcfRequests] = useState<PCFRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  // Tracks which PCF row is currently downloading so we can show a spinner
  // and disable other actions on that row.
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const handlePublishToQuintari = async (id: string, requestNumber: string) => {
    if (publishingId) return;
    setPublishingId(id);
    try {
      const result = await pcfService.publishToQuintari(id);
      if (result.success) {
        if (result.data?.alreadyPublished) {
          message.info(`${requestNumber} was already published to Quintari`);
        } else {
          message.success(`${requestNumber} published to Quintari`);
        }
      } else {
        message.error(result.message || "Failed to publish to Quintari");
      }
    } finally {
      setPublishingId(null);
    }
  };

  const handleDownloadReport = async (id: string, requestNumber: string) => {
    if (downloadingId) return;
    setDownloadingId(id);
    try {
      const result = await pcfService.downloadPcfReport(id);
      if (result.success) {
        message.success(`Report downloaded for ${requestNumber}`);
      } else {
        message.error(result.message || "Failed to download report");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  // API Stats
  const [apiStats, setApiStats] = useState<{
    total_pcf_count?: string;
    completed_count?: string;
    approved_count?: string;
    in_progress_count?: string;
    rejected_count?: string;
    draft_count?: string;
    pending_count?: string;
  } | null>(null);

  // Debounce search term - waits 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Helper function to get product icon based on category
  const getProductIcon = (categoryName: string): React.ReactNode => {
    const category = categoryName?.toLowerCase() || "";
    if (category.includes("battery") || category.includes("power")) {
      return <Battery className="text-green-600" size={20} />;
    } else if (category.includes("frame") || category.includes("chassis")) {
      return <Car className="text-purple-600" size={20} />;
    } else if (category.includes("light")) {
      return <Lightbulb className="text-yellow-600" size={20} />;
    } else if (category.includes("control") || category.includes("unit")) {
      return <Microchip className="text-blue-600" size={20} />;
    }
    return <Car className="text-indigo-600" size={20} />;
  };

  // Build filters object based on current state
  const buildFilters = useCallback((): PCFFilters => {
    const filters: PCFFilters = {};

    // Status filter - use pcf_status param
    if (statusFilter !== "all") {
      filters.pcf_status = statusFilter;
    }

    // Search filter (using debounced value)
    if (debouncedSearchTerm.trim()) {
      filters.search = debouncedSearchTerm.trim();
    }

    // Date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      filters.from_date = dateRange[0].format("YYYY-MM-DD");
      filters.to_date = dateRange[1].format("YYYY-MM-DD");
    }

    return filters;
  }, [statusFilter, debouncedSearchTerm, dateRange]);

  // Fetch PCF BOM list from API
  const fetchPCFList = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = buildFilters();
      const result = await pcfService.getPCFBOMList(
        currentPage,
        pageSize,
        filters,
      );

      if (result.success && result.data && Array.isArray(result.data)) {
        // Helper function to format date
        const formatDate = (dateString: string): string => {
          try {
            const date = new Date(dateString);
            const months = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            const day = date.getDate();
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? "PM" : "AM";
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes.toString().padStart(2, "0");
            return `${day} ${month} ${year}, ${displayHours}:${displayMinutes} ${ampm}`;
          } catch (error) {
            return "N/A";
          }
        };

        // Transform API data to PCFRequestItem
        const transformedData: PCFRequestItem[] = result.data.map(
          (item: any) => {
            // Extract actual product name from product_details (new field)
            const productName =
              item.product_details?.product_name ||
              item.request_title ||
              "N/A";

            // Extract product category for icon
            const productCategoryName =
              item.product_category?.name ||
              item.product_category_name ||
              item.component_category?.name ||
              item.component_category_name ||
              "N/A";

            // Extract submitted by from nested structure
            const submittedBy =
              item.pcf_request_stages?.pcf_request_created_by?.user_name ||
              item.created_by_name ||
              "Unknown";

            // Extract created date
            const createdDate =
              item.pcf_request_stages?.pcf_request_created_date ||
              item.created_date ||
              item.createdDate;

            return {
              id: item.id,
              requestNumber: item.code || item.request_number || "N/A",
              productName: productName,
              productIcon: getProductIcon(productCategoryName),
              status: item.status || "Unknown",
              submittedBy: submittedBy,
              submittedOn: createdDate ? formatDate(createdDate) : "N/A",
            };
          },
        );

        setPcfRequests(transformedData);
        setTotalCount(result.total_count || transformedData.length);
        setTotalPages(result.total_pages || 1);

        // Set API stats
        if (result.stats) {
          setApiStats(result.stats);
        }

        // Debug logging
        console.log("PCF List fetched:", {
          totalItems: transformedData.length,
          totalCount: result.total_count,
          totalPages: result.total_pages,
          stats: result.stats,
          sampleItem: transformedData[0],
        });
      } else {
        console.error("PCF List fetch failed:", {
          success: result.success,
          hasData: !!result.data,
          isArray: Array.isArray(result.data),
          result,
        });
        message.error(result.message || "Failed to fetch PCF requests");
        setPcfRequests([]);
      }
    } catch (error) {
      console.error("Error fetching PCF list:", error);
      message.error("An error occurred while fetching PCF requests");
      setPcfRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, buildFilters]);

  // Load data on component mount and when page/filters change
  useEffect(() => {
    fetchPCFList();
  }, [fetchPCFList]);

  // Reset to page 1 when filters change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearch = () => {
    // Immediately trigger search on Enter without waiting for debounce
    setDebouncedSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
  ) => {
    setDateRange(dates);
    setCurrentPage(1);
  };

  // Use stats from API response for KPI cards
  const statusCounts = {
    total: parseInt(apiStats?.total_pcf_count || "0", 10),
    completed: parseInt(apiStats?.completed_count || "0", 10),
    inProgress: parseInt(apiStats?.in_progress_count || "0", 10),
    approved: parseInt(apiStats?.approved_count || "0", 10),
    rejected: parseInt(apiStats?.rejected_count || "0", 10),
    draft: parseInt(apiStats?.draft_count || "0", 10),
    pending: parseInt(apiStats?.pending_count || "0", 10),
  };

  const getStatusTag = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    const colorConfig: Record<string, string> = {
      "in-progress": "blue",
      "in progress": "blue",
      completed: "green",
      draft: "gold",
      rejected: "red",
      open: "cyan",
      approved: "green",
      pending: "orange",
    };
    const color = colorConfig[statusLower] || "default";
    return <Tag color={color}>{status || "Unknown"}</Tag>;
  };

  const reportColumn = {
    title: "Report",
    key: "report",
    width: 110,
    render: (_: any, record: PCFRequestItem) => {
      const isCompleted = record.status?.toLowerCase() === "completed";
      const isLoading = downloadingId === record.id;
      const button = (
        <Button
          type="text"
          className="!px-0"
          disabled={!isCompleted || isLoading}
          loading={isLoading}
          onClick={() =>
            handleDownloadReport(record.id, record.requestNumber)
          }
          icon={
            !isLoading ? (
              <Download
                size={16}
                className="flex items-center justify-center"
              />
            ) : undefined
          }
        >
          Download
        </Button>
      );
      return isCompleted ? (
        button
      ) : (
        <Tooltip title="Available only for completed PCF requests">
          <span>{button}</span>
        </Tooltip>
      );
    },
  };

  const columns: ColumnsType<PCFRequestItem> = [
    {
      title: "PCF Request Number",
      dataIndex: "requestNumber",
      key: "requestNumber",
      width: 180,
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      width: 250,
      render: (_, record) => (
        <Space>
          {record.productIcon}
          <span>{record.productName}</span>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Submitted By",
      dataIndex: "submittedBy",
      key: "submittedBy",
      width: 200,
    },
    {
      title: "Submitted On",
      dataIndex: "submittedOn",
      key: "submittedOn",
      width: 200,
    },
    ...(isSuperAdmin ? [reportColumn] : []),
    {
      title: "Actions",
      key: "actions",
      width: isSuperAdmin ? 280 : 150,
      render: (_, record) => {
        const isDraft = record.status?.toLowerCase() === "draft";
        const isCompleted = record.status?.toLowerCase() === "completed";
        const isPublishing = publishingId === record.id;
        return (
          <Space>
            {isDraft ? (
              <Button
                type="text"
                className="!px-0"
                onClick={() => navigate(`/pcf-request/${record.id}/edit`)}
                icon={
                  <Pencil
                    size={16}
                    className="flex items-center justify-center"
                  />
                }
              >
                Edit
              </Button>
            ) : (
              <Button
                type="text"
                className="!px-0"
                onClick={() => navigate(`/pcf-request/${record.id}`)}
                icon={
                  <Eye
                    size={16}
                    className="flex items-center justify-center"
                  />
                }
              >
                View
              </Button>
            )}
            {isSuperAdmin && isCompleted && (
              <Tooltip title="Publish PCF as a Catena-X Digital Twin + PCF v9 Submodel in Quintari">
                <Button
                  type="text"
                  loading={isPublishing}
                  disabled={!!publishingId && !isPublishing}
                  onClick={() =>
                    handlePublishToQuintari(record.id, record.requestNumber)
                  }
                  icon={
                    !isPublishing ? (
                      <Send
                        size={16}
                        className="flex items-center justify-center"
                      />
                    ) : undefined
                  }
                >
                  Publish to Quintari
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          {/* Decorative blur */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-br from-green-200/40 to-emerald-200/30 rounded-full blur-3xl" />

          <div className="relative">
            {/* Title Row */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 flex-shrink-0">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  PCF Request Management
                </h1>
                <p className="text-gray-500 text-sm">
                  Streamlined carbon footprint tracking and approval workflow
                </p>
              </div>
            </div>

            {/* KPI Grid: Hero Total + 6 status cards */}
            {(() => {
              const total = Math.max(statusCounts.total, 1);
              const resolutionPct = Math.round(
                ((statusCounts.completed + statusCounts.approved) / total) * 100
              );
              const STATUS_TILES = [
                {
                  key: "inProgress",
                  label: "In Progress",
                  value: statusCounts.inProgress,
                  Icon: Clock,
                  dot: "bg-blue-500",
                  bar: "bg-blue-500",
                  iconBg: "bg-blue-50",
                  iconText: "text-blue-600",
                },
                {
                  key: "completed",
                  label: "Completed",
                  value: statusCounts.completed,
                  Icon: CheckCircle,
                  dot: "bg-teal-500",
                  bar: "bg-teal-500",
                  iconBg: "bg-teal-50",
                  iconText: "text-teal-600",
                },
                {
                  key: "approved",
                  label: "Approved",
                  value: statusCounts.approved,
                  Icon: CheckCircle,
                  dot: "bg-green-500",
                  bar: "bg-green-500",
                  iconBg: "bg-green-50",
                  iconText: "text-green-600",
                },
                {
                  key: "pending",
                  label: "Open",
                  value: statusCounts.pending,
                  Icon: Clock,
                  dot: "bg-orange-500",
                  bar: "bg-orange-500",
                  iconBg: "bg-orange-50",
                  iconText: "text-orange-600",
                },
                {
                  key: "draft",
                  label: "Draft",
                  value: statusCounts.draft,
                  Icon: AlertCircle,
                  dot: "bg-amber-500",
                  bar: "bg-amber-500",
                  iconBg: "bg-amber-50",
                  iconText: "text-amber-600",
                },
                {
                  key: "rejected",
                  label: "Rejected",
                  value: statusCounts.rejected,
                  Icon: XCircle,
                  dot: "bg-red-500",
                  bar: "bg-red-500",
                  iconBg: "bg-red-50",
                  iconText: "text-red-600",
                },
              ];

              return (
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
                  {/* Hero Total Card */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 shadow-lg shadow-slate-900/20">
                    <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 bg-green-500/20 rounded-full blur-2xl" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold">
                          Total Requests
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                          <ClipboardList className="w-4 h-4 text-green-400" />
                        </div>
                      </div>
                      <div className="text-5xl font-bold tracking-tight mb-4">
                        {statusCounts.total}
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="text-slate-400 font-medium">
                            Resolution Rate
                          </span>
                          <span className="text-green-400 font-bold">
                            {resolutionPct}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-300 rounded-full transition-all duration-500"
                            style={{ width: `${resolutionPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Tiles Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {STATUS_TILES.map((s) => {
                      const pct = Math.round((s.value / total) * 100);
                      return (
                        <div
                          key={s.key}
                          className="group bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-3.5 transition-all hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg ${s.iconBg} flex items-center justify-center flex-shrink-0`}
                              >
                                <s.Icon className={`w-3.5 h-3.5 ${s.iconText}`} />
                              </div>
                              <span className="text-xs font-medium text-gray-600 truncate">
                                {s.label}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-gray-400 tabular-nums">
                              {pct}%
                            </span>
                          </div>
                          <div className="flex items-end justify-between gap-2">
                            <div className="text-2xl font-bold text-gray-900 tabular-nums leading-none">
                              {s.value}
                            </div>
                          </div>
                          <div className="mt-2.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${s.bar} rounded-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Requests Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          {/* Top row: heading + primary action */}
          <div className="flex justify-between items-center mb-4 gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              PCF Requests
            </h2>
            {canCreate("PCF Request") && (
              <Button
                type="primary"
                icon={<Plus size={16} />}
                size="large"
                onClick={() => navigate("/pcf-request/new")}
                style={{ height: 44 }}
                className="shadow-md shadow-green-600/20 flex-shrink-0"
              >
                New Request
              </Button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-3 mb-6">
            <Input
              placeholder="Search code, title, category..."
              prefix={<Search size={16} className="text-gray-400" />}
              size="large"
              style={{ height: 44 }}
              className="flex-1 min-w-0"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
            <DatePicker.RangePicker
              size="large"
              format="DD MMM YYYY"
              placeholder={["Start Date", "End Date"]}
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ width: 260, height: 44 }}
              className="flex-shrink-0"
              allowClear
            />
            <Select
              placeholder="All Status"
              style={{ width: 160, height: 44 }}
              className="flex-shrink-0"
              size="large"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              options={[
                { label: "All Status", value: "all" },
                { label: "In Progress", value: "In Progress" },
                { label: "Completed", value: "Completed" },
                { label: "Open", value: "Open" },
                { label: "Draft", value: "Draft" },
                { label: "Approved", value: "Approved" },
                { label: "Rejected", value: "Rejected" },
              ]}
            />
          </div>

          <Spin
            spinning={isLoading}
            indicator={<LoadingSpinner size="md" />}
          >
            <Table
              columns={columns}
              dataSource={pcfRequests}
              pagination={false}
              scroll={{ x: 1200 }}
              rowKey="id"
              className="rounded-xl overflow-hidden"
            />
          </Spin>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-gray-500 text-sm">
              Showing{" "}
              <span className="font-medium text-gray-900">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-900">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of <span className="font-medium text-gray-900">{totalCount}</span>{" "}
              entries
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              {Array.from(
                { length: Math.min(totalPages, 5) },
                (_, i) => i + 1,
              ).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-lg font-medium transition-all ${
                    currentPage === pageNum
                      ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-600/20"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCFRequest;
