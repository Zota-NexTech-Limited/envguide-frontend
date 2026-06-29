import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Steps,
  Card,
  Button,
  Tag,
  Avatar,
  List,
  Input,
  Form,
  Modal,
  message,
  Spin,
  Divider,
  Row,
  Col,
  Typography,
  Tabs,
  Switch,
  Collapse,
  Table,
  Descriptions,
} from "antd";
import {
  Check,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  FileText,
  Calendar,
  Layers,
  Box,
  Cpu,
  Hash,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  ChevronLeft,
  Mail,
  Phone,
  XCircle,
  Database,
  Star,
  ExternalLink,
  Calculator,
  Play,
  Loader2,
  Leaf,
  Truck,
  PieChart,
  Scale,
  Factory,
  Package,
  Flame,
  Trash2,
  MapPin,
  Activity,
  Weight,
  Banknote,
  TrendingUp,
  BarChart3,
  Eye,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import pcfService from "../lib/pcfService";
import authService from "../lib/authService";
import taskService, { type TaskItem } from "../lib/taskService";
import supplierQuestionnaireService from "../lib/supplierQuestionnaireService";
import { getApiBaseUrl } from "../lib/apiBaseUrl";
import {
  getFuelTypeDropdown,
  getSubFuelTypeDropdown,
  getEnergySourceDropdown,
  getEnergyTypeDropdown,
  getRefrigerantTypeDropdown,
  getProcessSpecificEnergyDropdown,
  getTransportModeDropdown,
  type DropdownItem,
} from "../lib/questionnaireDropdownService";
import { usePermissions } from "../contexts/PermissionContext";
import { CheckSquare, ArrowRight, ClipboardList } from "lucide-react";
import BomTable from "../features/pcf-create/BomTable";

const { Step } = Steps;
const { TextArea } = Input;
const { Title, Text } = Typography;

const PCFRequestView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canUpdate } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [newComment, setNewComment] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [calculatingPCF, setCalculatingPCF] = useState(false);
  const [submittingInternally, setSubmittingInternally] = useState(false);
  const [resultValidationTab, setResultValidationTab] = useState("overview");
  const [expandedTransportRow, setExpandedTransportRow] = useState<
    string | null
  >(null);
  const [dqrList, setDqrList] = useState<any[]>([]);
  const [resendingSupId, setResendingSupId] = useState<string | null>(null);
  const [resendModal, setResendModal] = useState<{
    open: boolean;
    sup_id: string;
    supplierName: string;
    supplierEmail: string;
  } | null>(null);
  // DQR stages now come from pcf_data_dqr_rating_stage in getById response

  // Questionnaire response modal state
  const [questionnaireModalVisible, setQuestionnaireModalVisible] =
    useState(false);
  const [questionnaireLoading, setQuestionnaireLoading] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<any>(null);
  const [selectedSupplierName, setSelectedSupplierName] = useState<string>("");

  // Lookup maps for questionnaire response display
  const [questionnaireLookups, setQuestionnaireLookups] = useState<{
    fuelTypes: Map<string, string>;
    subFuelTypes: Map<string, string>;
    energySources: Map<string, string>;
    energyTypes: Map<string, string>;
    refrigerantTypes: Map<string, string>;
    processSpecificEnergy: Map<string, string>;
    transportModes: Map<string, string>;
  }>({
    fuelTypes: new Map(),
    subFuelTypes: new Map(),
    energySources: new Map(),
    energyTypes: new Map(),
    refrigerantTypes: new Map(),
    processSpecificEnergy: new Map(),
    transportModes: new Map(),
  });

  // Helper function to get name from lookup map or return original value
  const getLookupName = (
    lookupMap: Map<string, string>,
    id: string | undefined | null
  ): string => {
    if (!id) return "N/A";
    return lookupMap.get(id) || id;
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  // Fetch DQR list when in DQR stage to get sgiq_id for each supplier
  useEffect(() => {
    const stages = requestData?.pcf_request_stages;
    const dataCollectionStages = requestData?.pcf_data_collection_stage || [];
    // Check if ANY data collection stage is completed (not ALL)
    // This allows viewing responses for completed suppliers even if others are pending
    const hasAnyCompletedDataCollection =
      stages?.is_data_collected ||
      (dataCollectionStages.length > 0 &&
        dataCollectionStages.some(
          (stage: any) =>
            stage.is_submitted === true && stage.completed_date !== null,
        ));

    if (id && hasAnyCompletedDataCollection) {
      fetchDqrList(id);
    }
  }, [
    id,
    requestData?.pcf_request_stages,
    requestData?.pcf_data_collection_stage,
  ]);

  const fetchDqrList = async (pcfId: string) => {
    try {
      const result = await pcfService.getDQRListByBomPcfId(pcfId);
      if (result.success && result.data) {
        setDqrList(result.data);
      }
    } catch (error) {
      console.error("Error fetching DQR list:", error);
    }
  };

  // Helper to get sgiq_id by supplier id
  const getSgiqIdBySupplier = (sup_id: string): string | null => {
    const dqrItem = dqrList.find((item) => item.sup_id === sup_id);
    return dqrItem?.sgiq_id || null;
  };

  // Resend the supplier-questionnaire email to a single pending supplier
  const handleResendSupplierEmail = (
    sup_id: string,
    supplierName: string,
    supplierEmail: string,
  ) => {
    if (!id) {
      message.error("Missing PCF ID — cannot resend");
      return;
    }
    setResendModal({ open: true, sup_id, supplierName, supplierEmail });
  };

  const confirmResendSupplierEmail = async () => {
    if (!id || !resendModal) return;
    const { sup_id } = resendModal;
    setResendingSupId(sup_id);
    try {
      const result = await taskService.resendSupplierEmail(id, sup_id);
      if (result.success) {
        message.success(result.message || "Email resent successfully");
      } else {
        message.error(result.message || "Failed to resend email");
      }
    } catch (err: any) {
      message.error(err?.message || "Failed to resend email");
    } finally {
      setResendingSupId(null);
      setResendModal(null);
    }
  };

  // Fetch questionnaire responses for a supplier
  const fetchQuestionnaireResponses = async (
    sup_id: string,
    supplierName: string,
  ) => {
    const sgiq_id = getSgiqIdBySupplier(sup_id);
    if (!sgiq_id) {
      console.warn("View Responses failed — no sgiq_id found for sup_id:", sup_id, "| dqrList has", dqrList.length, "entries:", dqrList.map((d: any) => d.sup_id));
      message.warning("Questionnaire data not found for this supplier. Please refresh the page and try again.");
      return;
    }

    setSelectedSupplierName(supplierName);
    setQuestionnaireModalVisible(true);
    setQuestionnaireLoading(true);

    try {
      const token = authService.getToken();

      // Fetch questionnaire data and all lookup dropdowns in parallel
      const [questionnaireResult, fuelTypes, subFuelTypes, energySources, energyTypes, refrigerantTypes, processSpecificEnergy, transportModes] = await Promise.all([
        fetch(
          `${getApiBaseUrl()}/api/supplier-input-questions-get-by-id?sgiq_id=${sgiq_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token || "",
            },
          },
        ).then((res) => res.json()),
        getFuelTypeDropdown().catch(() => [] as DropdownItem[]),
        getSubFuelTypeDropdown().catch(() => [] as DropdownItem[]),
        getEnergySourceDropdown().catch(() => [] as DropdownItem[]),
        getEnergyTypeDropdown().catch(() => [] as DropdownItem[]),
        getRefrigerantTypeDropdown().catch(() => [] as DropdownItem[]),
        getProcessSpecificEnergyDropdown().catch(() => [] as DropdownItem[]),
        getTransportModeDropdown().catch(() => [] as DropdownItem[]),
      ]);

      // Build lookup maps from dropdown data
      const buildLookupMap = (items: DropdownItem[]): Map<string, string> => {
        const map = new Map<string, string>();
        items.forEach((item) => {
          if (item.id && item.name) {
            map.set(item.id, item.name);
          }
        });
        return map;
      };

      setQuestionnaireLookups({
        fuelTypes: buildLookupMap(fuelTypes),
        subFuelTypes: buildLookupMap(subFuelTypes),
        energySources: buildLookupMap(energySources),
        energyTypes: buildLookupMap(energyTypes),
        refrigerantTypes: buildLookupMap(refrigerantTypes),
        processSpecificEnergy: buildLookupMap(processSpecificEnergy),
        transportModes: buildLookupMap(transportModes),
      });

      if (questionnaireResult.status && questionnaireResult.data) {
        setQuestionnaireData(questionnaireResult.data);
      } else {
        message.error(
          questionnaireResult.message || "Failed to fetch questionnaire responses",
        );
        setQuestionnaireModalVisible(false);
      }
    } catch (error) {
      console.error("Error fetching questionnaire responses:", error);
      message.error("Failed to fetch questionnaire responses");
      setQuestionnaireModalVisible(false);
    } finally {
      setQuestionnaireLoading(false);
    }
  };

  // Fetch tasks only when in Data Collection stage (step 3)
  useEffect(() => {
    const stages = requestData?.pcf_request_stages;
    const dataCollectionStages = requestData?.pcf_data_collection_stage || [];
    const isDataCollectionDone =
      stages?.is_data_collected ||
      (dataCollectionStages.length > 0 &&
        dataCollectionStages.every(
          (stage: any) =>
            stage.is_submitted === true && stage.completed_date !== null,
        ));

    // Only fetch tasks when BOM is verified but Data Collection is not complete
    const isInDataCollectionStage =
      stages?.is_bom_verified && !isDataCollectionDone;

    if (id && isInDataCollectionStage) {
      fetchTasks(id);
    }
  }, [
    id,
    requestData?.pcf_request_stages,
    requestData?.pcf_data_collection_stage,
  ]);

  const fetchData = async (pcfId: string) => {
    setLoading(true);
    try {
      const [requestResult, commentsResult] = await Promise.all([
        pcfService.getPCFBOMById(pcfId),
        pcfService.listPCFComments(pcfId),
      ]);

      if (requestResult.success && requestResult.data) {
        // Handle array response (API returns array of 1 item)
        const data = Array.isArray(requestResult.data)
          ? requestResult.data[0]
          : requestResult.data;
        console.log("PCF Request Data:", data);
        console.log("BOM List Data:", data.bom_list);
        setRequestData(data);
      } else {
        message.error(
          requestResult.message || "Failed to load request details",
        );
      }

      if (commentsResult.success && commentsResult.data) {
        setComments(commentsResult.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (pcfId: string) => {
    setTasksLoading(true);
    try {
      const result = await taskService.getTasksByBomPcfId(pcfId);
      if (result.success && result.data) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      const result = await pcfService.verifyPCFRequest(id);
      if (result.success) {
        message.success("PCF Request approved successfully");
        fetchData(id); // Refresh data
      } else {
        message.error(result.message || "Failed to approve request");
      }
    } catch (error) {
      message.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectReason.trim()) {
      message.warning("Please provide a reason for rejection");
      return;
    }
    setSubmitting(true);
    try {
      const result = await pcfService.rejectPCFRequest(id, rejectReason);
      if (result.success) {
        message.success("PCF Request rejected successfully");
        setRejectModalVisible(false);
        setRejectReason("");
        fetchData(id); // Refresh data
      } else {
        message.error(result.message || "Failed to reject request");
      }
    } catch (error) {
      message.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!id || !newComment.trim()) return;
    setCommentLoading(true);
    try {
      const result = await pcfService.addPCFComment(id, newComment);
      if (result.success) {
        message.success("Comment added");
        setNewComment("");
        // Refresh comments
        const commentsResult = await pcfService.listPCFComments(id);
        if (commentsResult.success && commentsResult.data) {
          setComments(commentsResult.data);
        }
      } else {
        message.error(result.message || "Failed to add comment");
      }
    } catch (error) {
      message.error("An error occurred");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCalculatePCF = async () => {
    if (!id) return;
    setCalculatingPCF(true);
    message.info(
      "PCF calculation is being upgraded to the new emission-factor matching engine. This action is temporarily unavailable.",
    );
    setCalculatingPCF(false);
  };

  const handleSubmitInternally = async () => {
    if (!id) return;
    setSubmittingInternally(true);
    try {
      const result = await pcfService.submitPCFRequestInternally(id);
      if (result.success) {
        message.success(result.message || "PCF request submitted successfully");
        fetchData(id); // Refresh data to update stages
      } else {
        message.error(result.message || "Failed to submit PCF request");
      }
    } catch (error) {
      message.error("An error occurred while submitting PCF request");
    } finally {
      setSubmittingInternally(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" label="Loading PCF request..." />
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="p-6 text-center">
        <Title level={4}>Request not found</Title>
        <Button onClick={() => navigate("/pcf-requests")}>Go Back</Button>
      </div>
    );
  }

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if all suppliers have completed data collection
  const isDataCollectionComplete = () => {
    const dataCollectionStages = requestData.pcf_data_collection_stage || [];
    if (dataCollectionStages.length === 0) return false;
    return dataCollectionStages.every(
      (stage: any) =>
        stage.is_submitted === true && stage.completed_date !== null,
    );
  };

  // Check if all suppliers have completed DQR using pcf_data_dqr_rating_stage from getById response
  const isDqrComplete = () => {
    const dqrStages = requestData.pcf_data_dqr_rating_stage || [];
    if (dqrStages.length === 0) return false;
    return dqrStages.every(
      (stage: any) =>
        stage.is_submitted === true && stage.completed_date !== null,
    );
  };

  // Determine current IN-PROGRESS step (the step being worked on now)
  const getCurrentStep = () => {
    const stages = requestData.pcf_request_stages || {};
    const status = requestData.status?.toLowerCase() || "";
    const isDraft = requestData.is_draft;

    // Return the step that is currently IN PROGRESS
    if (stages.is_result_submitted) return 8; // All done - return beyond last index so all steps show as completed (green)
    if (stages.is_result_validation_verified) return 7; // Result Submitted in progress
    if (stages.is_pcf_calculated) return 6; // Result Validation in progress
    if (stages.is_dqr_completed || isDqrComplete()) return 5; // PCF Calculation in progress
    if (stages.is_data_collected || isDataCollectionComplete()) return 4; // DQR in progress
    if (stages.is_bom_verified) return 3; // Data Collection in progress

    // For early stages, use status field
    // "open" status means PCF is submitted, now in BOM Verification stage
    if (status.toLowerCase() === "open" || stages.is_pcf_request_submitted)
      return 2; // BOM Verification in progress

    // "draft" status means PCF is created, now in Submission stage
    if (
      status.toLowerCase() === "draft" ||
      isDraft ||
      stages.is_pcf_request_created
    )
      return 1; // PCF Request Submission in progress

    return 0; // PCF Request Creation in progress
  };

  // Get count of completed steps (steps before current)
  const getCompletedStepsCount = () => {
    return getCurrentStep();
  };

  const steps = [
    { title: "PCF Request Created", icon: <CheckCircle size={16} /> },
    { title: "PCF Request Submitted", icon: <Send size={16} /> },
    { title: "BOM Verified", icon: <CheckCircle size={16} /> },
    { title: "Data Collection", icon: <Layers size={16} /> },
    { title: "Data Quality Rating", icon: <User size={16} /> },
    { title: "PCF Calculation", icon: <Cpu size={16} /> },
    { title: "Result Validation", icon: <CheckCircle size={16} /> },
    { title: "Result Submitted", icon: <FileText size={16} /> },
  ];

  // ---- D2 header-band metrics (computed from BOM list) ----
  const bomList = requestData.bom_list || [];
  const grandTotalEmission = bomList.reduce(
    (sum: number, item: any) =>
      sum + (Number(item.pcf_total_emission_calculation?.total_pcf_value) || 0),
    0,
  );
  const totalWeightGms = bomList.reduce(
    (sum: number, item: any) => sum + (Number(item.weight_gms) || 0),
    0,
  );
  const totalCost = bomList.reduce(
    (sum: number, item: any) => sum + (Number(item.price) || 0),
    0,
  );
  const isPcfCalculated = !!requestData?.pcf_request_stages?.is_pcf_calculated;
  const heroCurrentStep = getCurrentStep();
  const isAllComplete = heroCurrentStep >= steps.length;
  const heroStageLabel = isAllComplete
    ? "Completed"
    : steps[heroCurrentStep]?.title || "In Progress";
  const completedStagesCount = Math.min(getCompletedStepsCount(), steps.length);
  const formatWeight = (g: number) =>
    Number.isInteger(g) ? g.toLocaleString("en-IN") : g.toFixed(2);
  // Show only the region + state of a long address: drops the street, a trailing
  // country (when 3+ segments), and postal codes — e.g.
  // "Plot 45, Gachibowli, Hyderabad, Telangana 500032, India" -> "Hyderabad, Telangana".
  const mainAddress = (addr: string) => {
    let parts = String(addr || "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return String(addr || "-");
    if (parts.length >= 3) parts = parts.slice(0, -1); // drop trailing country
    const cleaned = parts
      .slice(-2) // keep region + state
      .map((p) =>
        p
          .replace(/\b\d[\d\s-]*\b/g, "") // strip postal codes
          .replace(/\s+/g, " ")
          .trim(),
      )
      .filter(Boolean);
    return cleaned.join(", ") || String(addr || "-");
  };
  const isHighPriority = ["high", "critical", "urgent"].includes(
    (requestData.priority || "").toLowerCase(),
  );
  const dataCollectionStages = requestData.pcf_data_collection_stage || [];
  const primarySupplier =
    dataCollectionStages[0]?.supplier || bomList[0]?.supplier || null;
  const primarySupplierSubmitted = !!dataCollectionStages[0]?.is_submitted;
  const currentUserObj: any = authService.getCurrentUser();
  const currentUserInitial = String(
    currentUserObj?.user_name ||
      currentUserObj?.name ||
      currentUserObj?.email ||
      "U",
  )
    .charAt(0)
    .toUpperCase();

  return (
    <div className="bg-[#F4F6F9] min-h-screen px-4 sm:px-6 lg:px-9 py-6 pb-14">
      <div className="max-w-[1240px] mx-auto">
      {/* Breadcrumb */}
      <div
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 font-semibold cursor-pointer w-fit mb-4 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft size={18} />
        Back to Footprint Connect
      </div>

      {/* Rejection Banner */}
      {requestData?.is_rejected && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle size={24} className="text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Text className="text-lg font-semibold text-red-800">
                  Request Rejected
                </Text>
                <Tag color="red" className="!m-0">
                  Rejected
                </Tag>
              </div>
              <Text className="text-red-700 block">
                <span className="font-medium">Reason: </span>
                {requestData.reject_reason || "No reason provided"}
              </Text>
            </div>
          </div>
        </div>
      )}

      {/* Header Card — D2 green header band */}
      <div className="mb-5 bg-white border border-[#E6EAF0] rounded-[18px] shadow-sm overflow-hidden">
        {/* Gradient hero band */}
        <div
          className="relative overflow-hidden px-7 py-6 text-white"
          style={{
            background:
              "linear-gradient(120deg,#15803D 0%,#16A34A 55%,#0E9F6E 100%)",
          }}
        >
          {/* decorative circle */}
          <div
            className="absolute -right-[50px] -top-[50px] w-[230px] h-[230px] rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,.07)" }}
          />

          {/* Title row */}
          <div className="relative flex items-center gap-4">
            <div
              className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,.18)" }}
            >
              <Box size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-extrabold tracking-tight truncate">
                {requestData.request_title || "PCF Request"}
              </div>
              <div
                className="font-mono text-xs mt-1 truncate"
                style={{ color: "#D1FADF" }}
              >
                {requestData.code}
                {requestData.product_code ? ` · ${requestData.product_code}` : ""}
              </div>
            </div>
            <span
              className="inline-flex items-center gap-[7px] rounded-full px-[15px] py-[7px] text-[13px] font-bold flex-shrink-0"
              style={{
                background: "rgba(255,255,255,.2)",
                border: "1px solid rgba(255,255,255,.35)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: isAllComplete ? "#86EFAC" : "#FCD34D" }}
              />
              {heroStageLabel}
            </span>
          </div>

          {/* Metrics row */}
          <div className="relative flex items-end gap-[26px] mt-[22px] flex-wrap">
            <div>
              <div
                className="text-[11.5px] font-bold uppercase tracking-wide"
                style={{ color: "#D1FADF" }}
              >
                Total Carbon Footprint
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-5xl font-extrabold leading-none tracking-tighter">
                  {isPcfCalculated ? grandTotalEmission.toFixed(4) : "—"}
                </span>
                <span className="text-[15px]" style={{ color: "#D1FADF" }}>
                  kg CO₂e
                </span>
              </div>
            </div>
            <div className="flex gap-[11px] ml-auto flex-wrap">
              {[
                {
                  label: "Weight",
                  value: totalWeightGms
                    ? `${formatWeight(totalWeightGms)} g`
                    : "N/A",
                  highlight: false,
                },
                {
                  label: "Stages",
                  value: `${completedStagesCount}/${steps.length}`,
                  highlight: false,
                },
                {
                  label: "Cost",
                  value: totalCost
                    ? `₹${totalCost.toLocaleString("en-IN")}`
                    : "N/A",
                  highlight: false,
                },
                {
                  label: "Priority",
                  value: requestData.priority || "N/A",
                  highlight: isHighPriority,
                },
              ].map((chip) => (
                <div
                  key={chip.label}
                  className="rounded-xl px-4 py-[11px]"
                  style={{ background: "rgba(255,255,255,.14)" }}
                >
                  <div
                    className="text-[10.5px] font-semibold"
                    style={{ color: "#D1FADF" }}
                  >
                    {chip.label}
                  </div>
                  <div
                    className="text-[17px] font-extrabold"
                    style={chip.highlight ? { color: "#FCD34D" } : undefined}
                  >
                    {chip.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-7 gap-y-[22px] px-[26px] py-[22px]">
          {[
            { label: "Reference Number", value: requestData.code, accent: false },
            {
              label: "Submitted On",
              value: formatDate(requestData.created_date),
              accent: false,
            },
            {
              label: "Due Date",
              value: formatDate(requestData.due_date),
              accent: false,
            },
            {
              label: "Current Stage",
              value: heroStageLabel,
              accent: isAllComplete,
            },
            {
              label: "Product Category",
              value: requestData.product_category?.name || "N/A",
              accent: false,
            },
            {
              label: "Component Category",
              value: requestData.component_category?.name || "N/A",
              accent: false,
            },
            {
              label: "Component Type",
              value: requestData.component_type?.name || "N/A",
              accent: false,
            },
            {
              label: "Product Code",
              value: requestData.product_code || "N/A",
              accent: false,
            },
          ].map((cell) => (
            <div key={cell.label}>
              <div className="text-[11.5px] uppercase tracking-wide text-gray-400 font-bold">
                {cell.label}
              </div>
              <div
                className={`text-sm font-bold mt-1.5 ${
                  cell.accent ? "text-green-700" : "text-gray-800"
                }`}
              >
                {cell.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Stepper — custom horizontal tracker */}
      <div className="mb-5 bg-white border border-[#E6EAF0] rounded-[18px] shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-7 flex-wrap">
          <h2 className="m-0 text-[17px] font-extrabold text-gray-900">
            PCF Request Stages
          </h2>
          <span className="text-[12.5px] text-gray-400 font-semibold">
            {isAllComplete
              ? `All ${steps.length} stages complete`
              : `${completedStagesCount} of ${steps.length} stages complete`}
          </span>
        </div>

        {/* Tracker */}
        <div className="overflow-x-auto pb-1">
          <div className="relative flex items-start justify-between gap-1 min-w-[660px]">
            {/* base line */}
            <div className="absolute top-[17px] left-[5%] right-[5%] h-[3px] bg-gray-200 rounded" />
            {/* progress line */}
            <div
              className="absolute top-[17px] left-[5%] h-[3px] rounded"
              style={{
                width: `${Math.min(
                  (completedStagesCount / Math.max(steps.length - 1, 1)) * 90,
                  90,
                )}%`,
                background: "linear-gradient(90deg,#16A34A,#22C55E)",
              }}
            />
            {steps.map((step, index) => {
              const isCompleted = index < heroCurrentStep;
              const isCurrent = index === heroCurrentStep;
              return (
                <div
                  key={index}
                  className="relative z-[1] flex-1 flex flex-col items-center gap-2.5"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-4 border-white ${
                      isCompleted
                        ? "bg-[#16A34A] text-white"
                        : isCurrent
                          ? "bg-amber-400 text-white"
                          : "bg-gray-200 text-gray-400"
                    }`}
                    style={{
                      boxShadow: isCompleted
                        ? "0 0 0 1px #BBF7D0"
                        : isCurrent
                          ? "0 0 0 1px #FDE68A"
                          : "0 0 0 1px #E5E7EB",
                    }}
                  >
                    {isCompleted ? (
                      <Check size={17} strokeWidth={3} />
                    ) : isCurrent ? (
                      <Clock size={15} />
                    ) : (
                      <span className="text-[11px] font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-[11.5px] font-bold text-gray-700 text-center leading-tight max-w-[92px]">
                    {step.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion banner */}
        <div
          className={`mt-6 flex items-center gap-4 rounded-[14px] px-5 py-[18px] ${
            isAllComplete
              ? "bg-[#ECFDF3] border border-[#BBF7D0]"
              : "bg-amber-50 border border-amber-200"
          }`}
        >
          <div
            className={`w-[42px] h-[42px] rounded-[11px] flex items-center justify-center flex-shrink-0 ${
              isAllComplete ? "bg-[#16A34A]" : "bg-amber-400"
            }`}
          >
            {isAllComplete ? (
              <Check size={22} strokeWidth={3} className="text-white" />
            ) : (
              <Clock size={20} className="text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className={`text-[15px] font-extrabold ${
                isAllComplete ? "text-[#14532D]" : "text-amber-900"
              }`}
            >
              {isAllComplete
                ? "All stages completed"
                : steps[heroCurrentStep]?.title || "In Progress"}
            </div>
            <div
              className={`text-[13px] mt-0.5 ${
                isAllComplete ? "text-[#3F6B4E]" : "text-amber-700"
              }`}
            >
              {isAllComplete
                ? "The PCF calculation has been completed and results submitted successfully."
                : `In this stage, we are processing the ${
                    steps[heroCurrentStep]?.title?.toLowerCase() || "request"
                  }.`}
            </div>
          </div>
          <span
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold border ${
              isAllComplete
                ? "bg-white text-[#15803D] border-[#BBF7D0]"
                : "bg-white text-amber-700 border-amber-200"
            }`}
          >
            {isAllComplete ? "Completed" : "In Progress"}
          </span>
        </div>
      </div>

      {/* Supplier Information summary card */}
      {primarySupplier && (
        <div className="mb-5 bg-white border border-[#E6EAF0] rounded-[18px] shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#EFF5FF] flex items-center justify-center flex-shrink-0">
              <User size={22} className="text-blue-600" />
            </div>
            <div className="text-base font-extrabold text-gray-900">
              Supplier Information
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <div className="flex items-center justify-between gap-4 py-2.5 border-b border-[#EEF1F5]">
              <span className="text-[13.5px] text-gray-400 font-semibold">
                Supplier Name
              </span>
              <span className="text-sm font-bold text-gray-800 text-right">
                {primarySupplier.supplier_name || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5 border-b border-[#EEF1F5]">
              <span className="text-[13.5px] text-gray-400 font-semibold">
                Email
              </span>
              <span
                className="text-sm font-bold text-gray-800 text-right truncate"
                title={primarySupplier.supplier_email || ""}
              >
                {primarySupplier.supplier_email || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5 border-b border-[#EEF1F5]">
              <span className="text-[13.5px] text-gray-400 font-semibold">
                Phone
              </span>
              <span className="text-sm font-bold text-gray-800 font-mono text-right">
                {primarySupplier.supplier_phone_number || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5 border-b border-[#EEF1F5]">
              <span className="text-[13.5px] text-gray-400 font-semibold">
                Questionnaire
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold border ${
                  primarySupplierSubmitted
                    ? "bg-[#ECFDF3] text-[#15803D] border-[#BBF7D0]"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {primarySupplierSubmitted ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  <Clock size={12} />
                )}
                {primarySupplierSubmitted ? "Completed" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Task Management Section - Show only in Data Collection stage (step 3) */}
      {getCurrentStep() === 3 && (
        <Card className="!mb-5 !rounded-[18px] !border-[#E6EAF0] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckSquare size={24} className="text-green-600" />
            </div>
            <Title level={4} className="m-0">
              Workflow Center
            </Title>
          </div>

          <Spin spinning={tasksLoading} indicator={<LoadingSpinner size="md" />}>
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Title level={5} className="m-0">
                            {task.task_title}
                          </Title>
                          <Tag
                            color={
                              task.priority === "High"
                                ? "red"
                                : task.priority === "Medium"
                                  ? "orange"
                                  : "green"
                            }
                          >
                            {task.priority}
                          </Tag>
                          <Tag
                            color={
                              task.status === "Completed"
                                ? "green"
                                : task.status === "In Progress"
                                  ? "blue"
                                  : task.status === "Under Review"
                                    ? "orange"
                                    : "default"
                            }
                          >
                            {task.status}
                          </Tag>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <Text
                              type="secondary"
                              className="block text-xs mb-1"
                            >
                              Task Code
                            </Text>
                            <Text className="font-medium">{task.code}</Text>
                          </div>
                          <div>
                            <Text
                              type="secondary"
                              className="block text-xs mb-1"
                            >
                              Category
                            </Text>
                            <Text className="font-medium">
                              {task.category_name || "N/A"}
                            </Text>
                          </div>
                          <div>
                            <Text
                              type="secondary"
                              className="block text-xs mb-1"
                            >
                              Due Date
                            </Text>
                            <Text className="font-medium">
                              {task.due_date
                                ? formatDate(task.due_date)
                                : "N/A"}
                            </Text>
                          </div>
                          <div>
                            <Text
                              type="secondary"
                              className="block text-xs mb-1"
                            >
                              Progress
                            </Text>
                            <Text className="font-medium">
                              {task.progress ?? 0}%
                            </Text>
                          </div>
                        </div>
                        {task.description && (
                          <div className="mt-3">
                            <Text
                              type="secondary"
                              className="block text-xs mb-1"
                            >
                              Description
                            </Text>
                            <Text className="text-gray-700">
                              {task.description}
                            </Text>
                          </div>
                        )}
                        {task.assigned_entities &&
                          task.assigned_entities.length > 0 && (
                            <div className="mt-3">
                              <Text
                                type="secondary"
                                className="block text-xs mb-1"
                              >
                                Assigned To
                              </Text>
                              <div className="flex flex-wrap gap-2">
                                {task.assigned_entities.map((entity) => (
                                  <Tag key={entity.id} color="blue">
                                    {entity.name} ({entity.type})
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                      <Button
                        type="link"
                        icon={<ArrowRight size={16} />}
                        onClick={() =>
                          navigate(`/task-management/view/${task.id}`)
                        }
                        className="ml-4"
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4">
                  <CheckSquare size={48} className="text-gray-400 mx-auto" />
                </div>
                <Text type="secondary" className="block mb-4">
                  No tasks have been created for this PCF request yet.
                </Text>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckSquare size={18} />}
                  onClick={() =>
                    navigate(`/task-management/new?bom_pcf_id=${id}`)
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  Create Task
                </Button>
              </div>
            )}
          </Spin>
        </Card>
      )}

      {/* Status cards: Data Collection + Data Quality Rating (2-col) */}
      {(requestData?.pcf_request_stages?.is_bom_verified ||
        getCurrentStep() >= 4) && (
        <div
          className={`mb-5 grid gap-5 items-stretch ${
            requestData?.pcf_request_stages?.is_bom_verified &&
            getCurrentStep() >= 4
              ? "lg:grid-cols-2"
              : "grid-cols-1"
          }`}
        >
          {/* Data Collection */}
          {requestData?.pcf_request_stages?.is_bom_verified && (
            <div className="bg-white border border-[#E6EAF0] rounded-[18px] shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#EFF5FF] flex items-center justify-center flex-shrink-0">
                  <Database size={22} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-extrabold text-gray-900">
                    Data Collection
                  </div>
                  <div className="text-[12.5px] text-gray-400 font-semibold mt-0.5">
                    {(() => {
                      const stages =
                        requestData.pcf_data_collection_stage || [];
                      const submitted = stages.filter(
                        (s: any) => s.is_submitted,
                      ).length;
                      return `${submitted} / ${stages.length} suppliers submitted`;
                    })()}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-bold border flex-shrink-0 ${
                    isDataCollectionComplete()
                      ? "bg-[#ECFDF3] text-[#15803D] border-[#BBF7D0]"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {isDataCollectionComplete() ? (
                    <Check size={13} strokeWidth={3} />
                  ) : (
                    <Clock size={13} />
                  )}
                  {isDataCollectionComplete() ? "All Completed" : "In Progress"}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {(requestData.pcf_data_collection_stage || []).map(
                  (stage: any, index: number) => (
                    <div
                      key={stage.id || index}
                      className="bg-[#F8FAFB] border border-[#EEF1F5] rounded-[13px] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            stage.is_submitted
                              ? "bg-[#ECFDF3] text-[#16A34A]"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {stage.is_submitted ? (
                            <Check size={15} strokeWidth={3} />
                          ) : (
                            <XCircle size={15} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                              <div className="text-[14.5px] font-extrabold text-gray-900">
                                {stage.supplier?.supplier_name ||
                                  "Unknown Supplier"}
                              </div>
                              <div className="font-mono text-xs text-gray-400">
                                {stage.supplier?.code || "N/A"}
                              </div>
                            </div>
                            {stage.is_submitted ? (
                              <Button
                                type="primary"
                                size="small"
                                icon={<Eye size={15} />}
                                onClick={() =>
                                  fetchQuestionnaireResponses(
                                    stage.supplier?.sup_id,
                                    stage.supplier?.supplier_name || "Supplier",
                                  )
                                }
                                className="!bg-[#16A34A] hover:!bg-[#15803D] !border-[#16A34A] !rounded-[10px] !font-bold"
                              >
                                View Responses
                              </Button>
                            ) : (
                              stage.supplier?.sup_id &&
                              id && (
                                <Button
                                  size="small"
                                  icon={<Send size={14} />}
                                  loading={
                                    resendingSupId === stage.supplier.sup_id
                                  }
                                  disabled={!stage.supplier?.supplier_email}
                                  onClick={() =>
                                    handleResendSupplierEmail(
                                      stage.supplier.sup_id,
                                      stage.supplier.supplier_name ||
                                        "this supplier",
                                      stage.supplier?.supplier_email || "",
                                    )
                                  }
                                  className="!rounded-[10px] !font-bold"
                                >
                                  Resend Email
                                </Button>
                              )
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[12.5px] text-gray-500">
                            <span className="inline-flex items-center gap-1.5 min-w-0">
                              <Mail
                                size={14}
                                className="text-gray-400 flex-shrink-0"
                              />
                              <span className="truncate">
                                {stage.supplier?.supplier_email || "N/A"}
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Phone size={14} className="text-gray-400" />
                              {stage.supplier?.supplier_phone_number || "N/A"}
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 mt-2 text-xs font-semibold ${
                              stage.completed_date
                                ? "text-[#15803D]"
                                : "text-gray-400"
                            }`}
                          >
                            <Clock size={13} />
                            {stage.completed_date
                              ? `Completed ${formatDate(stage.completed_date)}`
                              : "Not yet submitted"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                )}

                {(requestData.pcf_data_collection_stage || []).length === 0 && (
                  <div className="text-center py-8">
                    <Database size={48} className="text-gray-300 mx-auto mb-4" />
                    <Text type="secondary">
                      No data collection requests have been sent yet.
                    </Text>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Quality Rating */}
          {getCurrentStep() >= 4 && (
            <div className="bg-white border border-[#E6EAF0] rounded-[18px] shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#F5F0FF] flex items-center justify-center flex-shrink-0">
                  <Star size={22} className="text-[#7C3AED]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-extrabold text-gray-900">
                    Data Quality Rating
                  </div>
                  <div className="text-[12.5px] text-gray-400 font-semibold mt-0.5">
                    {(() => {
                      const dqrStages =
                        requestData.pcf_data_dqr_rating_stage || [];
                      const completed = dqrStages.filter(
                        (s: any) => s.is_submitted && s.completed_date,
                      ).length;
                      return `${completed} / ${dqrStages.length} assessments completed`;
                    })()}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-bold border flex-shrink-0 ${
                    isDqrComplete()
                      ? "bg-[#ECFDF3] text-[#15803D] border-[#BBF7D0]"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {isDqrComplete() ? (
                    <Check size={13} strokeWidth={3} />
                  ) : (
                    <Clock size={13} />
                  )}
                  {isDqrComplete() ? "All Completed" : "In Progress"}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {(requestData.pcf_data_dqr_rating_stage || []).map(
                  (item: any, index: number) => {
                    const done = item.is_submitted && item.completed_date;
                    return (
                      <div
                        key={item.id || index}
                        className="bg-[#F8FAFB] border border-[#EEF1F5] rounded-[13px] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              done
                                ? "bg-[#ECFDF3] text-[#16A34A]"
                                : "bg-amber-100 text-amber-600"
                            }`}
                          >
                            {done ? (
                              <Check size={15} strokeWidth={3} />
                            ) : (
                              <Star size={14} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div>
                                <div className="text-[14.5px] font-extrabold text-gray-900">
                                  {item.supplier?.supplier_name ||
                                    "Unknown Supplier"}
                                </div>
                                <div className="font-mono text-xs text-gray-400">
                                  {item.supplier?.code || "N/A"}
                                </div>
                              </div>
                              <Button
                                size="small"
                                icon={<ExternalLink size={14} />}
                                onClick={() => {
                                  const sgiq_id = getSgiqIdBySupplier(
                                    item.supplier?.sup_id,
                                  );
                                  if (sgiq_id) {
                                    navigate(
                                      `/data-quality-rating/view?sgiq_id=${sgiq_id}&bom_pcf_id=${id}`,
                                    );
                                  } else {
                                    message.warning(
                                      "DQR data not found for this supplier",
                                    );
                                  }
                                }}
                                disabled={
                                  !getSgiqIdBySupplier(item.supplier?.sup_id)
                                }
                                className="!rounded-[10px] !font-bold !bg-white !text-[#2563EB] !border-[#BFD3FE] hover:!bg-[#EFF5FF]"
                              >
                                {done ? "View" : "Assess"}
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[12.5px] text-gray-500">
                              <span className="inline-flex items-center gap-1.5 min-w-0">
                                <Mail
                                  size={14}
                                  className="text-gray-400 flex-shrink-0"
                                />
                                <span className="truncate">
                                  {item.supplier?.supplier_email || "N/A"}
                                </span>
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Phone size={14} className="text-gray-400" />
                                {item.supplier?.supplier_phone_number || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs font-semibold">
                              <span
                                className={`inline-flex items-center gap-1.5 ${
                                  done ? "text-[#15803D]" : "text-amber-600"
                                }`}
                              >
                                <Clock size={13} />
                                {item.completed_date
                                  ? `Completed ${formatDate(item.completed_date)}`
                                  : `Created ${formatDate(item.created_date)}`}
                              </span>
                              {item.submittedBy && (
                                <span className="inline-flex items-center gap-1.5 text-gray-400">
                                  <User size={13} />
                                  Submitted by{" "}
                                  {item.submittedBy.user_name || "Unknown"} (
                                  {item.submittedBy.user_role || "N/A"})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}

                {(requestData.pcf_data_dqr_rating_stage || []).length === 0 && (
                  <div className="text-center py-8">
                    <Star size={48} className="text-gray-300 mx-auto mb-4" />
                    <Text type="secondary">
                      No DQR assessments available. Complete data collection
                      first.
                    </Text>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PCF Calculation Section - Show when in PCF Calculation stage (step 5) */}
      {getCurrentStep() === 5 && (
        <Card className="!mb-5 !rounded-[18px] !border-[#E6EAF0] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Calculator size={24} className="text-emerald-600" />
              </div>
              <div>
                <Title level={4} className="m-0">
                  PCF Calculation
                </Title>
                <Text type="secondary" className="text-sm">
                  Calculate the Product Carbon Footprint for all BOM items
                </Text>
              </div>
            </div>
            {requestData?.pcf_request_stages?.is_pcf_calculated ? (
              <Tag color="success" className="text-sm px-3 py-1">
                <CheckCircle size={14} className="inline mr-1" />
                Calculated
              </Tag>
            ) : (
              <Tag color="warning" className="text-sm px-3 py-1">
                <Clock size={14} className="inline mr-1" />
                Pending
              </Tag>
            )}
          </div>

          {!requestData?.pcf_request_stages?.is_pcf_calculated ? (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Cpu size={24} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Ready for PCF Calculation
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    All prerequisites have been completed. Data quality ratings
                    are finalized and the system is ready to calculate the
                    Product Carbon Footprint values for each BOM component
                    including material, production, packaging, logistics, and
                    waste emissions.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      type="primary"
                      size="large"
                      icon={
                        calculatingPCF ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Play size={18} />
                        )
                      }
                      onClick={handleCalculatePCF}
                      loading={calculatingPCF}
                      className="!bg-emerald-600 hover:!bg-emerald-700 !border-emerald-600 shadow-lg shadow-emerald-600/20"
                    >
                      {calculatingPCF
                        ? "Calculating..."
                        : "Start PCF Calculation"}
                    </Button>
                    <Text type="secondary" className="text-sm">
                      This may take a few moments
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">
                    PCF Calculation Complete
                  </h4>
                  <p className="text-green-700 text-sm">
                    Product Carbon Footprint values have been calculated for all
                    BOM components. The results are now ready for validation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Result Validation Section - Show when PCF is calculated (step 6 or beyond) */}
      {requestData?.pcf_request_stages?.is_pcf_calculated && (
        <Card className="!mb-5 !rounded-[18px] !border-[#E6EAF0] shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-[13px] bg-[#ECFDF3] flex items-center justify-center flex-shrink-0">
                <BarChart3 size={24} className="text-[#16A34A]" />
              </div>
              <div>
                <h2 className="m-0 text-lg font-extrabold text-gray-900">
                  PCF Results &amp; Validation
                </h2>
                <div className="text-[13px] text-gray-400 mt-0.5">
                  Review calculated carbon footprint data for all components
                </div>
              </div>
            </div>
            {!requestData?.pcf_request_stages?.is_result_submitted ? (
              <Button
                type="primary"
                size="large"
                icon={
                  submittingInternally ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )
                }
                onClick={handleSubmitInternally}
                loading={submittingInternally}
                className="!bg-green-600 hover:!bg-green-700 !border-green-600 shadow-lg shadow-green-600/20"
              >
                {submittingInternally ? "Submitting..." : "Submit PCF Results"}
              </Button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold bg-[#ECFDF3] text-[#15803D] border border-[#BBF7D0]">
                <Check size={14} strokeWidth={3} />
                Results Submitted
              </span>
            )}
          </div>

          <Tabs
            activeKey={resultValidationTab}
            onChange={setResultValidationTab}
            type="line"
            className="result-validation-tabs"
            items={[
              {
                key: "overview",
                label: (
                  <span className="flex items-center gap-2">
                    <Eye size={16} />
                    Footprint Overview
                  </span>
                ),
                children: (
                  <div className="pt-4">
                    {/* Overview Tab - BomTable with expandable rows */}
                    <BomTable
                      bomData={(requestData?.bom_list || []).map(
                        (item: any) => ({
                          key: item.id,
                          id: item.id,
                          componentName: item.component_name || "-",
                          materialNumber: item.material_number || "-",
                          quantity: item.quantity?.toString() || "1",
                          totalWeight: (item.weight_gms || 0).toString(),
                          totalPrice: (item.price || 0).toString(),
                          emission: (
                            item.pcf_total_emission_calculation
                              ?.total_pcf_value || 0
                          ).toString(),
                          productionLocation: item.production_location || "-",
                          manufacturer: item.manufacturer || "-",
                          detailedDescription: item.detail_description || "-",
                          category: item.component_category || "-",
                          supplierEmail: item.supplier?.supplier_email || "-",
                          supplierName: item.supplier?.supplier_name || "-",
                          supplierNumber:
                            item.supplier?.supplier_phone_number || "-",
                          questionerStatus: "Completed",
                          // Pass the calculated emission data
                          pcf_total_emission_calculation:
                            item.pcf_total_emission_calculation,
                        }),
                      )}
                      readOnly={true}
                      showCalculatedEmissions={true}
                      variant="detail"
                    />

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
                      {[
                        {
                          label: "Total Materials",
                          value: (requestData?.bom_list || []).reduce(
                            (sum: number, item: any) =>
                              sum +
                              (Number(item.pcf_total_emission_calculation
                                ?.material_value) || 0),
                            0,
                          ),
                          color: "blue",
                        },
                        {
                          label: "Total Production",
                          value: (requestData?.bom_list || []).reduce(
                            (sum: number, item: any) =>
                              sum +
                              (Number(item.pcf_total_emission_calculation
                                ?.production_value) || 0),
                            0,
                          ),
                          color: "purple",
                        },
                        {
                          label: "Total Packaging",
                          value: (requestData?.bom_list || []).reduce(
                            (sum: number, item: any) =>
                              sum +
                              (Number(item.pcf_total_emission_calculation
                                ?.packaging_value) || 0),
                            0,
                          ),
                          color: "orange",
                        },
                        {
                          label: "Total Waste",
                          value: (requestData?.bom_list || []).reduce(
                            (sum: number, item: any) =>
                              sum +
                              (Number(item.pcf_total_emission_calculation
                                ?.waste_value) || 0),
                            0,
                          ),
                          color: "red",
                        },
                        {
                          label: "Total Logistics",
                          value: (requestData?.bom_list || []).reduce(
                            (sum: number, item: any) =>
                              sum +
                              (Number(item.pcf_total_emission_calculation
                                ?.logistic_value) || 0),
                            0,
                          ),
                          color: "cyan",
                        },
                        {
                          label: "Grand Total",
                          value: (requestData?.bom_list || []).reduce(
                            (sum: number, item: any) =>
                              sum +
                              (Number(item.pcf_total_emission_calculation
                                ?.total_pcf_value) || 0),
                            0,
                          ),
                          color: "green",
                        },
                      ].map((card, idx) => {
                        const isGrand = card.color === "green";
                        return (
                          <div
                            key={idx}
            className={`p-4 rounded-[13px] ${isGrand ? "bg-[linear-gradient(135deg,#15803D,#0E6E33)]" : card.color === "blue" ? "bg-[#EFF5FF]" : card.color === "purple" ? "bg-[#F5F0FF]" : card.color === "orange" ? "bg-[#FFF4EC]" : card.color === "red" ? "bg-[#FEF1F1]" : "bg-[#ECFAFF]"}`}
                          >
                            <div
                              className={`text-xl font-extrabold tracking-tight ${isGrand ? "text-white" : card.color === "blue" ? "text-[#2563EB]" : card.color === "purple" ? "text-[#7C3AED]" : card.color === "orange" ? "text-[#EA580C]" : card.color === "red" ? "text-[#DC2626]" : "text-[#0891B2]"}`}
                            >
                              {card.value.toFixed(4)}
                            </div>
                            <div
                              className={`text-xs mt-1.5 font-bold ${isGrand ? "text-[#D1FADF]" : "text-[#334155]"}`}
                            >
                              {card.label}
                            </div>
                            <div
                              className={`text-[10.5px] ${isGrand ? "text-[#A7F3C8]" : "text-gray-400"}`}
                            >
                              kg CO₂e
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ),
              },
              {
                key: "emissions",
                label: (
                  <span className="flex items-center gap-2">
                    <Leaf size={16} />
                    Emissions Breakdown
                  </span>
                ),
                children: (
                  <div className="pt-4">
                    {/* Emissions Breakdown — per-component / per-stage table (D2 design) */}
                    <div className="border border-[#EEF1F5] rounded-[14px] overflow-hidden">
                      <div
                        className="grid text-white text-[10.5px] font-bold uppercase tracking-wide"
                        style={{
                          gridTemplateColumns:
                            "1.4fr 1fr repeat(6, 0.85fr) 0.7fr",
                          background: "linear-gradient(90deg,#16A34A,#0E9F6E)",
                        }}
                      >
                        <div className="px-4 py-[13px]">Component</div>
                        <div className="px-2 py-[13px]">Material No.</div>
                        <div className="px-2 py-[13px] text-right">Material</div>
                        <div className="px-2 py-[13px] text-right">Production</div>
                        <div className="px-2 py-[13px] text-right">Packaging</div>
                        <div className="px-2 py-[13px] text-right">Waste</div>
                        <div className="px-2 py-[13px] text-right">Logistics</div>
                        <div className="px-2 py-[13px] text-right">Total PCF</div>
                        <div className="px-3.5 py-[13px] text-right">% Total</div>
                      </div>
                      <div className="divide-y divide-[#EEF1F5]">
                        {(() => {
                          const bomList = requestData?.bom_list || [];
                          const grandTotal = bomList.reduce(
                            (sum: number, item: any) =>
                              sum +
                              (item.pcf_total_emission_calculation
                                ?.total_pcf_value || 0),
                            0,
                          );
                          return bomList.map((item: any, index: number) => {
                            const e =
                              item.pcf_total_emission_calculation || {};
                            const pct =
                              grandTotal > 0
                                ? ((e.total_pcf_value || 0) / grandTotal) * 100
                                : 0;
                            return (
                              <div
                                key={item.id || index}
                                className="grid items-center text-[13px] hover:bg-[#F8FAFB]"
                                style={{
                                  gridTemplateColumns:
                                    "1.4fr 1fr repeat(6, 0.85fr) 0.7fr",
                                }}
                              >
                                <div className="px-4 py-[15px] font-bold text-gray-900">
                                  {item.component_name || "-"}
                                </div>
                                <div className="px-2 py-[15px] font-mono text-[11.5px] text-[#64748B]">
                                  {item.material_number || "-"}
                                </div>
                                <div className="px-2 py-[15px] text-right text-gray-900">
                                  {(e.material_value || 0).toFixed(4)}
                                </div>
                                <div className="px-2 py-[15px] text-right text-gray-900">
                                  {(e.production_value || 0).toFixed(4)}
                                </div>
                                <div className="px-2 py-[15px] text-right text-gray-900">
                                  {(e.packaging_value || 0).toFixed(4)}
                                </div>
                                <div className="px-2 py-[15px] text-right text-gray-900">
                                  {(e.waste_value || 0).toFixed(4)}
                                </div>
                                <div className="px-2 py-[15px] text-right text-gray-900">
                                  {(e.logistic_value || 0).toFixed(4)}
                                </div>
                                <div className="px-2 py-[15px] text-right font-extrabold text-[#15803D]">
                                  {(e.total_pcf_value || 0).toFixed(4)}
                                </div>
                                <div className="px-3.5 py-[15px] text-right font-extrabold text-[#15803D]">
                                  {pct.toFixed(1)}%
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Material Breakdown for each component */}
                    <div className="mt-8">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Package size={18} className="text-green-600" />
                        Material Composition Breakdown
                      </h4>
                      <div className="space-y-4">
                        {(requestData?.bom_list || []).map(
                          (item: any, idx: number) => (
                            <div
                              key={item.id || idx}
                              className="bg-white rounded-[14px] p-5 border border-[#EEF1F5]"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h5 className="font-medium text-gray-900">
                                    {item.component_name}
                                  </h5>
                                  <p className="text-xs text-gray-500">
                                    {item.material_number}
                                  </p>
                                </div>
                                <Tag color="green">
                                  {(
                                    item.pcf_total_emission_calculation
                                      ?.material_value || 0
                                  ).toFixed(4)}{" "}
                                  kg CO₂e
                                </Tag>
                              </div>
                              {item.material_emission &&
                              item.material_emission.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                  {item.material_emission.map(
                                    (mat: any, mIdx: number) => (
                                      <div key={mat.id || mIdx}>
                                        <div className="flex items-baseline justify-between gap-3 mb-1.5">
                                          <div className="text-[13.5px] font-bold text-gray-800">
                                            {mat.material_type}
                                          </div>
                                          <div className="flex items-baseline gap-2.5 flex-shrink-0">
                                            <span className="text-[13px] text-gray-400">
                                              EF {mat.material_emission_factor}
                                            </span>
                                            <span className="text-sm font-extrabold text-[#15803D]">
                                              {(mat.material_emission || 0).toFixed(4)}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                          <div className="flex-1 h-[9px] bg-[#F1F5F9] rounded-[5px] overflow-hidden">
                                            <div
                                              className="h-full rounded-[5px]"
                                              style={{
                                                width: `${Math.min(Number(mat.material_composition) || 0, 100)}%`,
                                                background:
                                                  "linear-gradient(90deg,#22C55E,#15803D)",
                                              }}
                                            />
                                          </div>
                                          <span className="text-xs font-bold text-gray-500 w-[46px] text-right">
                                            {mat.material_composition}%
                                          </span>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  No material breakdown available
                                </p>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "transport",
                label: (
                  <span className="flex items-center gap-2">
                    <Truck size={16} />
                    Logistics Impact
                  </span>
                ),
                children: (
                  <div className="pt-4">
                    {/* Transport Summary Table */}
                    <div className="overflow-x-auto border border-[#EEF1F5] rounded-[14px]">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-green-600 to-emerald-600">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-12"></th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                              Component
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                              Material No.
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                              Segments
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                              Distance
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                              Emissions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {(requestData?.bom_list || []).map(
                            (item: any, index: number) => {
                              const transportDetails =
                                item.transportation_details || [];
                              // logistic_emission_calculation is now an array of per-leg records
                              const logisticCalcArr = Array.isArray(item.logistic_emission_calculation)
                                ? item.logistic_emission_calculation
                                : item.logistic_emission_calculation ? [item.logistic_emission_calculation] : [];
                              const isExpanded =
                                expandedTransportRow === item.id;
                              const totalDistance = transportDetails.reduce(
                                (sum: number, t: any) =>
                                  sum + (parseFloat(t.distance) || 0),
                                0,
                              );
                              // Sum all leg emissions for total transport emission per component
                              const totalTransportEmission = logisticCalcArr.reduce(
                                (sum: number, leg: any) =>
                                  sum + (parseFloat(leg.leg_wise_transport_emissions_per_unit_kg_co2e) || 0),
                                0,
                              );

                              return (
                                <React.Fragment key={item.id || index}>
                                  <tr
                                    className={`hover:bg-gray-50 cursor-pointer ${isExpanded ? "bg-green-50" : ""}`}
                                    onClick={() =>
                                      setExpandedTransportRow(
                                        isExpanded ? null : item.id,
                                      )
                                    }
                                  >
                                    <td
                                      className="px-4 py-3"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Switch
                                        size="small"
                                        checked={isExpanded}
                                        onChange={(checked) =>
                                          setExpandedTransportRow(
                                            checked ? item.id : null,
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                      {item.component_name || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                                      {item.material_number || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                      {transportDetails.length}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                      {totalDistance.toLocaleString()} km
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-green-700 text-right">
                                      {totalTransportEmission.toFixed(4)}
                                    </td>
                                  </tr>
                                  {isExpanded &&
                                    transportDetails.length > 0 && (
                                      <tr>
                                        <td
                                          colSpan={6}
                                          className="px-4 py-4 bg-gradient-to-b from-green-50 to-white"
                                        >
                                          <div className="ml-8">
                                            <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                              <Activity
                                                size={16}
                                                className="text-green-600"
                                              />
                                              Transport Journey
                                            </h5>
                                            <div className="flex items-stretch gap-2">
                                              {transportDetails.map(
                                                (leg: any, legIdx: number) => (
                                                  <React.Fragment
                                                    key={
                                                      leg.motuft_id || legIdx
                                                    }
                                                  >
                                                    <div className="flex-1 min-w-0 bg-white rounded-[13px] p-4 border border-[#E6EAF0] shadow-sm">
                                                      <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">
                                                        Leg {legIdx + 1}
                                                      </div>
                                                      <div
                                                        className="text-[13px] font-bold text-gray-900 leading-snug"
                                                        title={`${leg.source_point} → ${leg.drop_point}`}
                                                      >
                                                        {mainAddress(leg.source_point)}{" "}
                                                        <span className="text-gray-400">
                                                          →
                                                        </span>{" "}
                                                        {mainAddress(leg.drop_point)}
                                                      </div>
                                                      <div className="flex items-baseline gap-2 mt-2">
                                                        <span className="text-xl font-extrabold text-gray-900">
                                                          {parseFloat(
                                                            leg.distance || "0",
                                                          ).toLocaleString()}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                          km ·{" "}
                                                          {Number(
                                                            logisticCalcArr[legIdx]
                                                              ?.leg_wise_transport_emissions_per_unit_kg_co2e ||
                                                              0,
                                                          ).toFixed(5)}{" "}
                                                          kg CO₂e
                                                        </span>
                                                      </div>
                                                    </div>
                                                    {legIdx <
                                                      transportDetails.length -
                                                        1 && (
                                                      <ArrowRight
                                                        size={20}
                                                        className="text-gray-400 flex-shrink-0 self-center"
                                                      />
                                                    )}
                                                  </React.Fragment>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                </React.Fragment>
                              );
                            },
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Transport Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-[18px]">
                      <div className="bg-[#EFF5FF] rounded-[14px] p-[18px]">
                        <div className="text-[26px] font-extrabold tracking-tight text-[#2563EB]">
                          {(requestData?.bom_list || []).reduce(
                            (sum: number, item: any) =>
                              sum + (item.transportation_details?.length || 0),
                            0,
                          )}
                        </div>
                        <div className="text-[13px] font-bold text-[#334155] mt-1">
                          Total Segments
                        </div>
                      </div>
                      <div className="bg-[#F5F0FF] rounded-[14px] p-[18px]">
                        <div className="text-[26px] font-extrabold tracking-tight text-[#7C3AED]">
                          {(requestData?.bom_list || [])
                            .reduce((sum: number, item: any) => {
                              const details = item.transportation_details || [];
                              return (
                                sum +
                                details.reduce(
                                  (s: number, t: any) =>
                                    s + (parseFloat(t.distance) || 0),
                                  0,
                                )
                              );
                            }, 0)
                            .toLocaleString()}
                        </div>
                        <div className="text-[13px] font-bold text-[#334155] mt-1">
                          Total Distance (km)
                        </div>
                      </div>
                      <div className="bg-[#FFF4EC] rounded-[14px] p-[18px]">
                        <div className="text-[26px] font-extrabold tracking-tight text-[#EA580C]">
                          {(requestData?.bom_list || [])
                            .reduce(
                              (sum: number, item: any) => {
                                const calcArr = Array.isArray(item.logistic_emission_calculation)
                                  ? item.logistic_emission_calculation
                                  : item.logistic_emission_calculation ? [item.logistic_emission_calculation] : [];
                                // mass_transported_kg is the same for all legs of a component, so take from first leg
                                return sum + (calcArr.length > 0 ? (parseFloat(calcArr[0]?.mass_transported_kg) || 0) : 0);
                              },
                              0,
                            )
                            .toFixed(2)}
                        </div>
                        <div className="text-[13px] font-bold text-[#334155] mt-1">
                          Mass Transported (kg)
                        </div>
                      </div>
                      <div className="bg-[#ECFDF3] rounded-[14px] p-[18px]">
                        <div className="text-[26px] font-extrabold tracking-tight text-[#15803D]">
                          {(requestData?.bom_list || [])
                            .reduce(
                              (sum: number, item: any) =>
                                sum +
                                (item.pcf_total_emission_calculation
                                  ?.logistic_value || 0),
                              0,
                            )
                            .toFixed(4)}
                        </div>
                        <div className="text-[13px] font-bold text-[#334155] mt-1">
                          Logistics Emission
                        </div>
                        <div className="text-[11px] text-gray-400">kg CO₂e</div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "allocation",
                label: (
                  <span className="flex items-center gap-2">
                    <PieChart size={16} />
                    Allocation Method
                  </span>
                ),
                children: (
                  <div className="pt-4">
                    {/* Allocation Methods Table */}
                    <div className="overflow-x-auto border border-[#EEF1F5] rounded-[14px]">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-green-600 to-emerald-600">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                              Component
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                              Material No.
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                              Allocation Method
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                              Econ. Ratio
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                              PCF
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                              Weight
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                              Price
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {(requestData?.bom_list || []).map(
                            (item: any, index: number) => {
                              const allocation =
                                item.allocation_methodology || {};
                              const productionCalc =
                                item.production_emission_calculation || {};
                              const allocationMethod =
                                productionCalc.allocation_methodology ||
                                (item.economic_ratio <= 5
                                  ? allocation.check_er_less_than_five
                                  : allocation.econ_allocation_er_greater_than_five) ||
                                "Physical";

                              return (
                                <tr
                                  key={item.id || index}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {item.component_name || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                                    {item.material_number || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-left">
                                    <Tag
                                      color={
                                        allocationMethod?.includes("Economic")
                                          ? "blue"
                                          : "green"
                                      }
                                    >
                                      {allocationMethod}
                                    </Tag>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                    {Number(item.economic_ratio || 0).toFixed(2)}%
                                  </td>
                                  <td className="px-4 py-3 text-sm font-semibold text-green-700 text-right">
                                    {(
                                      item.pcf_total_emission_calculation
                                        ?.total_pcf_value || 0
                                    ).toFixed(4)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                    {(item.weight_gms || 0).toFixed(2)} g
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                    ₹
                                    {Number(item.price || 0).toLocaleString(
                                      "en-IN",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      },
                                    )}
                                  </td>
                                </tr>
                              );
                            },
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Allocation Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-[18px]">
                      <div className="bg-[#FFF8E8] rounded-[14px] p-[18px]">
                        <div className="text-[26px] font-extrabold tracking-tight text-[#B45309]">
                          {(() => {
                            const bomList = requestData?.bom_list || [];
                            const totalER = bomList.reduce(
                              (sum: number, item: any) =>
                                sum + (item.economic_ratio || 0),
                              0,
                            );
                            return bomList.length > 0
                              ? (totalER / bomList.length).toFixed(2)
                              : "0";
                          })()}
                        </div>
                        <div className="text-[13px] font-bold text-[#334155] mt-1">
                          Avg Economic Ratio
                        </div>
                      </div>
                      <div className="bg-[#ECFDF3] rounded-[14px] p-[18px]">
                        <div className="text-[26px] font-extrabold tracking-tight text-[#15803D]">
                          {
                            (requestData?.bom_list || []).filter(
                              (item: any) => {
                                const method =
                                  item.production_emission_calculation
                                    ?.allocation_methodology || "";
                                return method
                                  .toLowerCase()
                                  .includes("physical");
                              },
                            ).length
                          }
                        </div>
                        <div className="text-[13px] font-bold text-[#334155] mt-1">
                          Physical Allocation
                        </div>
                      </div>
                      <div className="bg-[#EFF5FF] rounded-[14px] p-[18px]">
                        <div className="text-[26px] font-extrabold tracking-tight text-[#2563EB]">
                          {
                            (requestData?.bom_list || []).filter(
                              (item: any) => {
                                const method =
                                  item.production_emission_calculation
                                    ?.allocation_methodology || "";
                                return method
                                  .toLowerCase()
                                  .includes("economic");
                              },
                            ).length
                          }
                        </div>
                        <div className="text-[13px] font-bold text-[#334155] mt-1">
                          Economic Allocation
                        </div>
                      </div>
                      <div className="bg-[#F5F0FF] rounded-[14px] p-[18px]">
                        <div className="text-[26px] font-extrabold tracking-tight text-[#7C3AED]">
                          {
                            (requestData?.bom_list || []).filter(
                              (item: any) =>
                                item.allocation_methodology?.split_allocation,
                            ).length
                          }
                        </div>
                        <div className="text-[13px] font-bold text-[#334155] mt-1">
                          Split Allocation
                        </div>
                      </div>
                    </div>

                    {/* Production Details for each component */}
                    <div className="mt-8">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Factory size={18} className="text-green-600" />
                        Production & Allocation Details
                      </h4>
                      <div className="space-y-4">
                        {(requestData?.bom_list || []).map(
                          (item: any, idx: number) => {
                            const production =
                              item.production_emission_calculation || {};
                            const allocation =
                              item.allocation_methodology || {};

                            return (
                              <div
                                key={item.id || idx}
                                className="bg-white rounded-[14px] p-5 border border-[#EEF1F5]"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h5 className="font-medium text-gray-900">
                                      {item.component_name}
                                    </h5>
                                    <p className="text-xs text-gray-500">
                                      {item.material_number}
                                    </p>
                                  </div>
                                  <Tag
                                    color={
                                      production.allocation_methodology?.includes(
                                        "Economic",
                                      )
                                        ? "blue"
                                        : "green"
                                    }
                                  >
                                    {production.allocation_methodology ||
                                      "Physical"}{" "}
                                    Method
                                  </Tag>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Component Weight
                                    </p>
                                    <p className="text-base font-extrabold text-gray-900 mt-1">
                                      {(
                                        production.component_weight_kg || 0
                                      ).toFixed(4)}{" "}
                                      kg
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Factory Total Weight
                                    </p>
                                    <p className="text-base font-extrabold text-gray-900 mt-1">
                                      {(
                                        production.total_weight_produced_at_factory_level_kg ||
                                        0
                                      ).toLocaleString()}{" "}
                                      kg
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Products Produced
                                    </p>
                                    <p className="text-base font-extrabold text-gray-900 mt-1">
                                      {Number(
                                        production.no_of_products_current_component_produced ||
                                          0,
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Total Energy
                                    </p>
                                    <p className="text-base font-extrabold text-gray-900 mt-1">
                                      {(
                                        production.total_energy_consumed_at_factory_level_kwh ||
                                        0
                                      ).toLocaleString()}{" "}
                                      kWh
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-[#EEF1F5] grid grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-xs text-gray-400">
                                      Electricity EF
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">
                                      {production.emission_factor_of_electricity ||
                                        0}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400">Heat EF</p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">
                                      {production.emission_factor_of_heat || 0}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400">Steam EF</p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">
                                      {production.emission_factor_of_steam || 0}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400">Cooling EF</p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">
                                      {production.emission_factor_of_cooling ||
                                        0}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      )}

      {/* Completed Stages List */}
      {/* <Card className="!mb-5 !rounded-[18px] !border-[#E6EAF0] shadow-sm">
        <Title level={4} className="mb-6">
          Completed Stages
        </Title>
        <div className="space-y-4">
          {getCurrentStep() > 0 && (
            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-full text-green-600">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-800">
                    {steps[getCurrentStep() - 1].title}
                  </div>
                  <div className="text-xs text-gray-500">
                    Completed on {formatDate(new Date().toISOString())}
                  </div>
                </div>
              </div>
              <Tag color="success">Approved</Tag>
            </div>
          )}

        </div>
      </Card> */}

      {/* BOM Table - Show when approve buttons are visible (at PCF Request Submitted stage) */}
      {(() => {
        const stages = requestData?.pcf_request_stages || {};
        const showApproveButtons =
          !requestData?.is_rejected && !requestData?.is_approved;
        // Show BOM at "PCF Request Submitted" stage (step 1) when approve buttons are visible
        const isSubmittedStage =
          stages.is_pcf_request_submitted && !stages.is_bom_verified;
        const shouldShowBOM = showApproveButtons && isSubmittedStage;

        // Get BOM data from bom_list field (as per API response structure)
        const bomData = requestData?.bom_list || [];

        console.log("BOM Table Check:", {
          showApproveButtons,
          isSubmittedStage,
          shouldShowBOM,
          bomDataLength: bomData.length,
          stages,
          currentStep: getCurrentStep(),
          bomData: bomData,
        });

        // Transform BOM data to match BomTable expected format
        const transformedBomData = bomData.map((item: any) => {
          // Handle supplier object structure
          const supplier = item.supplier || {};

          // Calculate total weight and price if quantity is available
          const quantity = parseFloat(item.quantity) || 1;
          const weightGms = parseFloat(item.weight_gms) || 0;
          const price = parseFloat(item.price) || 0;
          const totalWeight =
            item.total_weight_gms && item.total_weight_gms !== "NaN"
              ? parseFloat(item.total_weight_gms)
              : weightGms * quantity;
          const totalPrice =
            item.total_price && item.total_price !== "NaN"
              ? parseFloat(item.total_price)
              : price * quantity;

          return {
            key: item.id || Math.random().toString(),
            id: item.id,
            componentName: item.component_name || "-",
            materialNumber: item.material_number || "-",
            quantity: item.quantity?.toString() || "1",
            totalWeight: totalWeight.toString(),
            totalPrice: totalPrice.toString(),
            emission: item.emission?.toString() || "0",
            productionLocation: item.production_location || "-",
            manufacturer: item.manufacturer || "-",
            detailedDescription: item.detail_description || "-",
            category: item.component_category || "-",
            supplierEmail: supplier.supplier_email || "-",
            supplierName: supplier.supplier_name || "-",
            supplierNumber: supplier.supplier_phone_number || "-",
            weight: weightGms.toString(),
            price: price.toString(),
          };
        });

        if (shouldShowBOM) {
          if (transformedBomData.length > 0) {
            return (
              <Card className="!mb-5 !rounded-[18px] !border-[#E6EAF0] shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Layers size={24} className="text-green-600" />
                  </div>
                  <Title level={4} className="m-0">
                    Bill of Materials
                  </Title>
                </div>
                <BomTable bomData={transformedBomData} readOnly={true} />
              </Card>
            );
          } else {
            // Show empty state if no BOM data
            return (
              <Card className="!mb-5 !rounded-[18px] !border-[#E6EAF0] shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Layers size={24} className="text-green-600" />
                  </div>
                  <Title level={4} className="m-0">
                    Bill of Materials
                  </Title>
                </div>
                <div className="text-center py-8 text-gray-500">
                  No BOM data available
                </div>
              </Card>
            );
          }
        }
        return null;
      })()}

      {/* Action Buttons */}
      {canUpdate("PCF Request") && (
        <div className="flex justify-end gap-4 mb-8">
          {/* Show Submit button when in Result Validation stage */}
          {requestData?.pcf_request_stages?.is_pcf_calculated &&
          !requestData?.pcf_request_stages?.is_result_submitted ? (
            <Button
              type="primary"
              size="large"
              icon={
                submittingInternally ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )
              }
              onClick={handleSubmitInternally}
              loading={submittingInternally}
              className="!bg-green-600 hover:!bg-green-700 !border-green-600"
            >
              {submittingInternally ? "Submitting..." : "Submit PCF Results"}
            </Button>
          ) : requestData?.pcf_request_stages?.is_result_submitted ? (
            <Tag color="success" className="text-base px-4 py-2">
              <CheckCircle size={16} className="inline mr-2" />
              Results Submitted
            </Tag>
          ) : (
            <>
              <Button
                danger
                size="large"
                icon={<ThumbsDown size={18} />}
                onClick={() => setRejectModalVisible(true)}
                disabled={requestData.is_rejected || requestData.is_approved}
              >
                Reject
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<ThumbsUp size={18} />}
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                loading={submitting}
                disabled={requestData.is_rejected || requestData.is_approved}
              >
                Approve
              </Button>
            </>
          )}
        </div>
      )}

      {/* Comments Section */}
      <div className="mb-5 bg-white border border-[#E6EAF0] rounded-[18px] shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <MessageSquare size={20} className="text-[#16A34A]" />
          <h2 className="m-0 text-[17px] font-extrabold text-gray-900">
            Comments
          </h2>
        </div>

        {comments.length > 0 ? (
          <div className="space-y-4 mb-6">
            {comments.map((item: any, idx: number) => (
              <div key={item.id || idx} className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {String(item.user_name || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-gray-800 text-sm">
                      {item.user_name || "User"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(item.commented_at)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap break-words">
                    {item.comment}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail size={44} strokeWidth={1.7} className="text-gray-300 mb-2.5" />
            <div className="text-sm text-gray-400 font-medium">
              No comments yet
            </div>
          </div>
        )}

        {/* Add comment */}
        <div className="flex gap-3 items-end pt-4 border-t border-[#EEF1F5]">
          <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {currentUserInitial}
          </div>
          <div className="flex-1">
            <TextArea
              rows={2}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <Button
            type="primary"
            icon={<Send size={16} />}
            onClick={handleAddComment}
            loading={commentLoading}
            className="!bg-[#16A34A] hover:!bg-[#15803D] !border-[#16A34A] !rounded-[11px] !font-bold !h-auto !py-2.5"
          >
            Comment
          </Button>
        </div>
      </div>

      {/* Resend Supplier Email Modal */}
      <Modal
        title="Resend questionnaire email?"
        open={!!resendModal?.open}
        onOk={confirmResendSupplierEmail}
        onCancel={() => setResendModal(null)}
        confirmLoading={!!resendingSupId}
        okText="Resend"
        cancelText="Cancel"
        okButtonProps={{
          className: "!bg-green-600 hover:!bg-green-700 !border-green-600",
        }}
      >
        <p className="mb-2">
          Send the supplier questionnaire link to{" "}
          <strong>{resendModal?.supplierName}</strong>?
        </p>
        {resendModal?.supplierEmail && (
          <p className="text-xs text-gray-500">
            Email: <span className="font-mono">{resendModal.supplierEmail}</span>
          </p>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Request"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => setRejectModalVisible(false)}
        confirmLoading={submitting}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <p className="mb-4">
          Please provide a reason for rejecting this request:
        </p>
        <TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Enter rejection reason..."
        />
      </Modal>

      {/* Questionnaire Responses Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <ClipboardList size={24} className="text-green-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                Questionnaire Responses
              </div>
              <div className="text-sm text-gray-500 font-normal">
                {selectedSupplierName}
              </div>
            </div>
          </div>
        }
        open={questionnaireModalVisible}
        onCancel={() => {
          setQuestionnaireModalVisible(false);
          setQuestionnaireData(null);
        }}
        footer={
          <div className="flex justify-end">
            <Button
              type="primary"
              onClick={() => {
                setQuestionnaireModalVisible(false);
                setQuestionnaireData(null);
              }}
              className="!bg-green-600 hover:!bg-green-700 !border-green-600"
            >
              Close
            </Button>
          </div>
        }
        width={1000}
        style={{ top: 20 }}
        styles={{
          body: {
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto",
            padding: "16px",
          },
        }}
      >
        {questionnaireLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="md" label="Loading questionnaire responses..." />
          </div>
        ) : questionnaireData ? (
          <Collapse
            defaultActiveKey={["general", "organization"]}
            className="bg-white"
            expandIconPosition="end"
          >
            {/* Supplier General Information */}
            {questionnaireData.supplier_general_info && (
              <Collapse.Panel
                header={
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <User size={16} className="text-green-600" />
                    </div>
                    <span className="font-medium">General Information</span>
                  </div>
                }
                key="general"
              >
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="Organization Name">
                    {questionnaireData.supplier_general_info
                      .organization_name || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Designation">
                    {questionnaireData.supplier_general_info.designation ||
                      "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email Address">
                    {questionnaireData.supplier_general_info.email_address ||
                      "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Core Business Activity">
                    {questionnaireData.supplier_general_info
                      .core_business_activitiy || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Number of Employees">
                    {questionnaireData.supplier_general_info.no_of_employees ||
                      "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Annual Revenue">
                    {questionnaireData.supplier_general_info.annual_revenue ||
                      "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Annual Reporting Period">
                    {questionnaireData.supplier_general_info
                      .annual_reporting_period || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Emissions Data Available">
                    <Tag
                      color={
                        questionnaireData.supplier_general_info
                          .availability_of_scope_one_two_three_emissions_data
                          ? "green"
                          : "red"
                      }
                    >
                      {questionnaireData.supplier_general_info
                        .availability_of_scope_one_two_three_emissions_data
                        ? "Yes"
                        : "No"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="GDPR Acknowledgement">
                    <Tag
                      color={
                        questionnaireData.supplier_general_info.dc_acknowledge
                          ? "green"
                          : "red"
                      }
                    >
                      {questionnaireData.supplier_general_info.dc_acknowledge
                        ? "Acknowledged"
                        : "Not Acknowledged"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="RE Technologies Acknowledgement">
                    <Tag
                      color={
                        questionnaireData.supplier_general_info.ere_acknowledge
                          ? "green"
                          : "red"
                      }
                    >
                      {questionnaireData.supplier_general_info.ere_acknowledge
                        ? "Acknowledged"
                        : "Not Acknowledged"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Collapse.Panel>
            )}

            {/* Emissions Data */}
            {questionnaireData.availability_of_scope_one_two_three_emissions
              ?.length > 0 && (
              <Collapse.Panel
                header={
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 size={16} className="text-blue-600" />
                    </div>
                    <span className="font-medium">
                      Scope 1, 2, 3 Emissions Data
                    </span>
                    <Tag color="blue">
                      {
                        questionnaireData
                          .availability_of_scope_one_two_three_emissions.length
                      }{" "}
                      entries
                    </Tag>
                  </div>
                }
                key="emissions"
              >
                <Table
                  dataSource={
                    questionnaireData.availability_of_scope_one_two_three_emissions
                  }
                  columns={[
                    {
                      title: "Country",
                      dataIndex: "country_iso_three",
                      key: "country",
                    },
                    {
                      title: "Scope 1",
                      dataIndex: "scope_one",
                      key: "scope_one",
                      render: (v: number) => `${v} tCO₂e`,
                    },
                    {
                      title: "Scope 2",
                      dataIndex: "scope_two",
                      key: "scope_two",
                      render: (v: number) => `${v} tCO₂e`,
                    },
                    {
                      title: "Scope 3",
                      dataIndex: "scope_three",
                      key: "scope_three",
                      render: (v: number) => `${v} tCO₂e`,
                    },
                  ]}
                  pagination={false}
                  size="small"
                  rowKey="aosotte_id"
                />
              </Collapse.Panel>
            )}

            {/* Product Questions */}
            {questionnaireData.supplier_product_questions?.length > 0 && (
              <Collapse.Panel
                header={
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package size={16} className="text-purple-600" />
                    </div>
                    <span className="font-medium">Product Details</span>
                  </div>
                }
                key="product"
              >
                {questionnaireData.supplier_product_questions.map(
                  (pq: any, idx: number) => (
                    <div key={idx} className="space-y-4">
                      <Descriptions bordered size="small" column={2}>
                        <Descriptions.Item label="Existing PCF Report">
                          <Tag
                            color={
                              pq.do_you_have_an_existing_pcf_report
                                ? "green"
                                : "red"
                            }
                          >
                            {pq.do_you_have_an_existing_pcf_report
                              ? "Yes"
                              : "No"}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="PCF Methodology Used">
                          {pq.pcf_methodology_used?.join(", ") || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item
                          label="Environmental Impact Methods"
                          span={2}
                        >
                          {pq.required_environmental_impact_methods?.map(
                            (m: string) => (
                              <Tag key={m} color="blue" className="mb-1">
                                {m}
                              </Tag>
                            ),
                          ) || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Co-Products with Economic Value">
                          <Tag
                            color={
                              pq.any_co_product_have_economic_value
                                ? "green"
                                : "red"
                            }
                          >
                            {pq.any_co_product_have_economic_value
                              ? "Yes"
                              : "No"}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>

                      {pq.production_site_details_questions?.length > 0 && (
                        <div className="mt-4">
                          <Text strong className="block mb-2">
                            Production Site Details
                          </Text>
                          <Table
                            dataSource={pq.production_site_details_questions}
                            columns={[
                              {
                                title: "Product Name",
                                dataIndex: "product_name",
                                key: "product_name",
                              },
                              {
                                title: "Material Number",
                                dataIndex: "material_number",
                                key: "material_number",
                              },
                              {
                                title: "Location",
                                dataIndex: "location",
                                key: "location",
                              },
                            ]}
                            pagination={false}
                            size="small"
                            rowKey="psd_id"
                          />
                        </div>
                      )}

                      {pq.product_component_manufactured_questions?.length >
                        0 && (
                        <div className="mt-4">
                          <Text strong className="block mb-2">
                            Products Manufactured
                          </Text>
                          <Table
                            dataSource={
                              pq.product_component_manufactured_questions
                            }
                            columns={[
                              {
                                title: "Product",
                                dataIndex: "product_name",
                                key: "product_name",
                              },
                              {
                                title: "Material #",
                                dataIndex: "material_number",
                                key: "material_number",
                              },
                              {
                                title: "Period",
                                dataIndex: "production_period",
                                key: "production_period",
                              },
                              {
                                title: "Weight/Unit",
                                dataIndex: "weight_per_unit",
                                key: "weight_per_unit",
                                render: (v: number, r: any) => `${v} ${r.unit}`,
                              },
                              {
                                title: "Quantity",
                                dataIndex: "quantity",
                                key: "quantity",
                              },
                              {
                                title: "Price",
                                dataIndex: "price",
                                key: "price",
                                render: (v: number) => `$${v}`,
                              },
                            ]}
                            pagination={false}
                            size="small"
                            rowKey="pcm_id"
                          />
                        </div>
                      )}
                    </div>
                  ),
                )}
              </Collapse.Panel>
            )}

            {/* Scope 1 - Direct Emissions */}
            {questionnaireData.scope_one_direct_emissions_questions?.length >
              0 && (
              <Collapse.Panel
                header={
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Flame size={16} className="text-red-600" />
                    </div>
                    <span className="font-medium">
                      Scope 1 - Direct Emissions
                    </span>
                  </div>
                }
                key="scope1"
              >
                {questionnaireData.scope_one_direct_emissions_questions.map(
                  (s1: any, idx: number) => (
                    <div key={idx} className="space-y-4">
                      {s1.stationary_combustion_on_site_energy_use_questions
                        ?.length > 0 && (
                        <div>
                          <Text strong className="block mb-2 text-gray-700">
                            Stationary Combustion (On-site Energy Use)
                          </Text>
                          {s1.stationary_combustion_on_site_energy_use_questions.map(
                            (sc: any, i: number) => (
                              <div
                                key={i}
                                className="bg-gray-50 p-3 rounded-lg mb-2"
                              >
                                <Text strong>{getLookupName(questionnaireLookups.fuelTypes, sc.fuel_type)}</Text>
                                {sc.sub_fuel_types?.length > 0 && (
                                  <Table
                                    dataSource={sc.sub_fuel_types}
                                    columns={[
                                      {
                                        title: "Sub Fuel Type",
                                        dataIndex: "sub_fuel_type",
                                        key: "sub_fuel_type",
                                        render: (v: string) =>
                                          getLookupName(questionnaireLookups.subFuelTypes, v),
                                      },
                                      {
                                        title: "Consumption",
                                        dataIndex: "consumption_quantity",
                                        key: "consumption_quantity",
                                        render: (v: number, r: any) =>
                                          `${v} ${r.unit}`,
                                      },
                                    ]}
                                    pagination={false}
                                    size="small"
                                    rowKey="ssft_id"
                                    className="mt-2"
                                  />
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      )}

                      {s1.mobile_combustion_company_owned_vehicles_questions
                        ?.length > 0 && (
                        <div>
                          <Text strong className="block mb-2 text-gray-700">
                            Mobile Combustion (Company Owned Vehicles)
                          </Text>
                          <Table
                            dataSource={
                              s1.mobile_combustion_company_owned_vehicles_questions
                            }
                            columns={[
                              {
                                title: "Fuel Type",
                                dataIndex: "fuel_type",
                                key: "fuel_type",
                                render: (v: string) =>
                                  getLookupName(questionnaireLookups.subFuelTypes, v),
                              },
                              {
                                title: "Quantity",
                                dataIndex: "quantity",
                                key: "quantity",
                                render: (v: number, r: any) => `${v} ${r.unit}`,
                              },
                            ]}
                            pagination={false}
                            size="small"
                            rowKey="mccov_id"
                          />
                        </div>
                      )}

                      {s1.refrigerant_top_ups_performed &&
                        s1.refrigerants_questions?.length > 0 && (
                          <div>
                            <Text strong className="block mb-2 text-gray-700">
                              Refrigerants
                            </Text>
                            <Table
                              dataSource={s1.refrigerants_questions}
                              columns={[
                                {
                                  title: "Refrigerant Type",
                                  dataIndex: "refrigerant_type",
                                  key: "refrigerant_type",
                                  render: (v: string) =>
                                    getLookupName(questionnaireLookups.refrigerantTypes, v),
                                },
                                {
                                  title: "Quantity",
                                  dataIndex: "quantity",
                                  key: "quantity",
                                  render: (v: number, r: any) =>
                                    `${v} ${r.unit}`,
                                },
                              ]}
                              pagination={false}
                              size="small"
                              rowKey="refr_id"
                            />
                          </div>
                        )}

                      {s1.industrial_process_emissions_present &&
                        s1.process_emissions_sources_questions?.length > 0 && (
                          <div>
                            <Text strong className="block mb-2 text-gray-700">
                              Process Emissions Sources
                            </Text>
                            <Table
                              dataSource={
                                s1.process_emissions_sources_questions
                              }
                              columns={[
                                {
                                  title: "Source",
                                  dataIndex: "source",
                                  key: "source",
                                },
                                {
                                  title: "Gas Type",
                                  dataIndex: "gas_type",
                                  key: "gas_type",
                                },
                                {
                                  title: "Quantity",
                                  dataIndex: "quantity",
                                  key: "quantity",
                                  render: (v: number, r: any) =>
                                    `${v} ${r.unit}`,
                                },
                              ]}
                              pagination={false}
                              size="small"
                              rowKey="pes_id"
                            />
                          </div>
                        )}
                    </div>
                  ),
                )}
              </Collapse.Panel>
            )}

            {/* Scope 2 - Indirect Emissions */}
            {questionnaireData.scope_two_indirect_emissions_questions?.length >
              0 && (
              <Collapse.Panel
                header={
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Cpu size={16} className="text-yellow-600" />
                    </div>
                    <span className="font-medium">
                      Scope 2 - Indirect Emissions
                    </span>
                  </div>
                }
                key="scope2"
              >
                {questionnaireData.scope_two_indirect_emissions_questions.map(
                  (s2: any, idx: number) => (
                    <div key={idx} className="space-y-4">
                      {s2
                        .scope_two_indirect_emissions_from_purchased_energy_questions
                        ?.length > 0 && (
                        <div>
                          <Text strong className="block mb-2 text-gray-700">
                            Purchased Energy
                          </Text>
                          <Table
                            dataSource={
                              s2.scope_two_indirect_emissions_from_purchased_energy_questions
                            }
                            columns={[
                              {
                                title: "Energy Source",
                                dataIndex: "energy_source",
                                key: "energy_source",
                                render: (v: string) =>
                                  getLookupName(questionnaireLookups.energySources, v),
                              },
                              {
                                title: "Energy Type",
                                dataIndex: "energy_type",
                                key: "energy_type",
                                render: (v: string) =>
                                  getLookupName(questionnaireLookups.energyTypes, v),
                              },
                              {
                                title: "Quantity",
                                dataIndex: "quantity",
                                key: "quantity",
                                render: (v: number, r: any) => `${v} ${r.unit}`,
                              },
                            ]}
                            pagination={false}
                            size="small"
                            rowKey="stidefpe_id"
                          />
                        </div>
                      )}

                      {s2.process_specific_energy_usage &&
                        s2.process_specific_energy_usage_questions?.length >
                          0 && (
                          <div>
                            <Text strong className="block mb-2 text-gray-700">
                              Process Specific Energy Usage
                            </Text>
                            <Table
                              dataSource={
                                s2.process_specific_energy_usage_questions
                              }
                              columns={[
                                {
                                  title: "Energy Type",
                                  dataIndex: "process_specific_energy_type",
                                  key: "process_specific_energy_type",
                                  render: (v: string) =>
                                    getLookupName(questionnaireLookups.processSpecificEnergy, v),
                                },
                                {
                                  title: "Quantity Consumed",
                                  dataIndex: "quantity_consumed",
                                  key: "quantity_consumed",
                                  render: (v: number, r: any) =>
                                    `${v} ${r.unit}`,
                                },
                              ]}
                              pagination={false}
                              size="small"
                              rowKey="pseu_id"
                            />
                          </div>
                        )}

                      {s2.do_you_acquired_standardized_re_certificates &&
                        s2.scope_two_indirect_emissions_certificates_questions
                          ?.length > 0 && (
                          <div>
                            <Text strong className="block mb-2 text-gray-700">
                              RE Certificates
                            </Text>
                            <Table
                              dataSource={
                                s2.scope_two_indirect_emissions_certificates_questions
                              }
                              columns={[
                                {
                                  title: "Certificate Name",
                                  dataIndex: "certificate_name",
                                  key: "certificate_name",
                                },
                                {
                                  title: "Mechanism",
                                  dataIndex: "mechanism",
                                  key: "mechanism",
                                },
                                {
                                  title: "Generator Name",
                                  dataIndex: "generator_name",
                                  key: "generator_name",
                                },
                                {
                                  title: "Location",
                                  dataIndex: "generator_location",
                                  key: "generator_location",
                                },
                              ]}
                              pagination={false}
                              size="small"
                              rowKey="stidec_id"
                            />
                          </div>
                        )}

                      <Descriptions
                        bordered
                        size="small"
                        column={2}
                        className="mt-4"
                      >
                        <Descriptions.Item label="Uses Abatement Systems">
                          <Tag
                            color={
                              s2.do_you_use_any_abatement_systems
                                ? "green"
                                : "red"
                            }
                          >
                            {s2.do_you_use_any_abatement_systems ? "Yes" : "No"}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Destructive Testing">
                          <Tag
                            color={
                              s2.do_you_perform_destructive_testing
                                ? "green"
                                : "red"
                            }
                          >
                            {s2.do_you_perform_destructive_testing
                              ? "Yes"
                              : "No"}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item
                          label="IT Systems for Production Control"
                          span={2}
                        >
                          {s2.it_system_use_for_production_control?.map(
                            (it: string) => (
                              <Tag key={it} color="blue" className="mb-1">
                                {it}
                              </Tag>
                            ),
                          ) || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cloud-based Production System">
                          <Tag
                            color={
                              s2.do_you_use_cloud_based_system_for_production
                                ? "green"
                                : "red"
                            }
                          >
                            {s2.do_you_use_cloud_based_system_for_production
                              ? "Yes"
                              : "No"}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Cooling System for Server">
                          <Tag
                            color={
                              s2.do_you_use_any_cooling_sysytem_for_server
                                ? "green"
                                : "red"
                            }
                          >
                            {s2.do_you_use_any_cooling_sysytem_for_server
                              ? "Yes"
                              : "No"}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    </div>
                  ),
                )}
              </Collapse.Panel>
            )}

            {/* Scope 3 - Other Indirect Emissions */}
            {questionnaireData.scope_three_other_indirect_emissions_questions
              ?.length > 0 && (
              <Collapse.Panel
                header={
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Truck size={16} className="text-orange-600" />
                    </div>
                    <span className="font-medium">
                      Scope 3 - Other Indirect Emissions
                    </span>
                  </div>
                }
                key="scope3"
              >
                {questionnaireData.scope_three_other_indirect_emissions_questions.map(
                  (s3: any, idx: number) => (
                    <div key={idx} className="space-y-4">
                      <Descriptions bordered size="small" column={2}>
                        <Descriptions.Item label="ISO 14001/50001 Certified">
                          <Tag
                            color={
                              s3.iso_14001_or_iso_50001_certified
                                ? "green"
                                : "red"
                            }
                          >
                            {s3.iso_14001_or_iso_50001_certified ? "Yes" : "No"}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Reports to CDP/SBTi">
                          <Tag
                            color={
                              s3.do_you_report_to_cdp_sbti_or_other
                                ? "green"
                                : "red"
                            }
                          >
                            {s3.do_you_report_to_cdp_sbti_or_other
                              ? "Yes"
                              : "No"}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Uses Recycled Materials">
                          <Tag
                            color={
                              s3.use_of_recycled_secondary_materials
                                ? "green"
                                : "red"
                            }
                          >
                            {s3.use_of_recycled_secondary_materials
                              ? "Yes"
                              : "No"}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tracks Transport Emissions">
                          <Tag
                            color={
                              s3.do_you_track_emission_from_transport
                                ? "green"
                                : "red"
                            }
                          >
                            {s3.do_you_track_emission_from_transport
                              ? "Yes"
                              : "No"}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="By-Products Generated">
                          <Tag
                            color={
                              s3.any_by_product_generated ? "green" : "red"
                            }
                          >
                            {s3.any_by_product_generated ? "Yes" : "No"}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Grade of Metal Used">
                          {s3.grade_of_metal_used || "N/A"}
                        </Descriptions.Item>
                      </Descriptions>

                      {s3.mode_of_transport_used_for_transportation_questions
                        ?.length > 0 && (
                        <div className="mt-4">
                          <Text strong className="block mb-2 text-gray-700">
                            Transport Details
                          </Text>
                          <Table
                            dataSource={
                              s3.mode_of_transport_used_for_transportation_questions
                            }
                            columns={[
                              {
                                title: "Mode",
                                dataIndex: "mode_of_transport",
                                key: "mode_of_transport",
                                render: (v: string) =>
                                  getLookupName(questionnaireLookups.transportModes, v),
                              },
                              {
                                title: "Source",
                                dataIndex: "source_point",
                                key: "source_point",
                              },
                              {
                                title: "Destination",
                                dataIndex: "drop_point",
                                key: "drop_point",
                              },
                              {
                                title: "Distance",
                                dataIndex: "distance",
                                key: "distance",
                              },
                              {
                                title: "Weight",
                                dataIndex: "weight_transported",
                                key: "weight_transported",
                              },
                            ]}
                            pagination={false}
                            size="small"
                            rowKey="motuft_id"
                          />
                        </div>
                      )}

                      {s3.recycled_materials_with_percentage_questions?.length >
                        0 && (
                        <div className="mt-4">
                          <Text strong className="block mb-2 text-gray-700">
                            Recycled Materials
                          </Text>
                          <Table
                            dataSource={
                              s3.recycled_materials_with_percentage_questions
                            }
                            columns={[
                              {
                                title: "Material Name",
                                dataIndex: "material_name",
                                key: "material_name",
                              },
                              {
                                title: "Material Number",
                                dataIndex: "material_number",
                                key: "material_number",
                              },
                              {
                                title: "Percentage",
                                dataIndex: "percentage",
                                key: "percentage",
                                render: (v: string) => `${v}%`,
                              },
                            ]}
                            pagination={false}
                            size="small"
                            rowKey="rmwp_id"
                          />
                        </div>
                      )}

                      {s3.weight_of_packaging_per_unit_product_questions
                        ?.length > 0 && (
                        <div className="mt-4">
                          <Text strong className="block mb-2 text-gray-700">
                            Packaging Weight per Unit
                          </Text>
                          <Table
                            dataSource={
                              s3.weight_of_packaging_per_unit_product_questions
                            }
                            columns={[
                              {
                                title: "Component",
                                dataIndex: "component_name",
                                key: "component_name",
                              },
                              {
                                title: "Material Number",
                                dataIndex: "material_number",
                                key: "material_number",
                              },
                              {
                                title: "Packaging Weight",
                                dataIndex: "packagin_weight",
                                key: "packagin_weight",
                                render: (v: string, r: any) => `${v} ${r.unit}`,
                              },
                            ]}
                            pagination={false}
                            size="small"
                            rowKey="woppup_id"
                          />
                        </div>
                      )}

                      {s3.destination_plant_component_transportation_questions
                        ?.length > 0 && (
                        <div className="mt-4">
                          <Text strong className="block mb-2 text-gray-700">
                            Destination Plants
                          </Text>
                          <Table
                            dataSource={
                              s3.destination_plant_component_transportation_questions
                            }
                            columns={[
                              { title: "City", dataIndex: "city", key: "city" },
                              {
                                title: "State",
                                dataIndex: "state",
                                key: "state",
                              },
                              {
                                title: "Country",
                                dataIndex: "country",
                                key: "country",
                              },
                              {
                                title: "Pincode",
                                dataIndex: "pincode",
                                key: "pincode",
                              },
                            ]}
                            pagination={false}
                            size="small"
                            rowKey="dpct_id"
                          />
                        </div>
                      )}
                    </div>
                  ),
                )}
              </Collapse.Panel>
            )}

            {/* Scope 4 - Avoided Emissions */}
            {questionnaireData.scope_four_avoided_emissions_questions?.length >
              0 && (
              <Collapse.Panel
                header={
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Leaf size={16} className="text-teal-600" />
                    </div>
                    <span className="font-medium">
                      Scope 4 - Avoided Emissions
                    </span>
                  </div>
                }
                key="scope4"
              >
                {questionnaireData.scope_four_avoided_emissions_questions.map(
                  (s4: any, idx: number) => (
                    <div key={idx} className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Text strong className="block mb-2 text-gray-700">
                          Renewable Energy & Carbon Offset Projects
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {s4.renewable_energy_carbon_offset_projects_implemented ||
                            "N/A"}
                        </Text>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Text strong className="block mb-2 text-gray-700">
                          Products/Services Reducing Customer Emissions
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {s4.products_or_services_that_help_reduce_customer_emissions ||
                            "N/A"}
                        </Text>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Text strong className="block mb-2 text-gray-700">
                          Circular Economy Practices
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {s4.circular_economy_practices_reuse_take_back_epr_refurbishment ||
                            "N/A"}
                        </Text>
                      </div>
                    </div>
                  ),
                )}
              </Collapse.Panel>
            )}

            {/* BOM Items */}
            {questionnaireData.bom?.length > 0 && (
              <Collapse.Panel
                header={
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Layers size={16} className="text-gray-600" />
                    </div>
                    <span className="font-medium">BOM Items</span>
                    <Tag color="default">
                      {questionnaireData.bom.length} items
                    </Tag>
                  </div>
                }
                key="bom"
              >
                <Table
                  dataSource={questionnaireData.bom}
                  columns={[
                    { title: "Code", dataIndex: "code", key: "code" },
                    {
                      title: "Material Number",
                      dataIndex: "material_number",
                      key: "material_number",
                    },
                    {
                      title: "Component Name",
                      dataIndex: "component_name",
                      key: "component_name",
                    },
                    {
                      title: "Production Location",
                      dataIndex: "production_location",
                      key: "production_location",
                    },
                  ]}
                  pagination={false}
                  size="small"
                  rowKey="bom_id"
                />
              </Collapse.Panel>
            )}
          </Collapse>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <ClipboardList size={48} className="text-gray-300 mb-4" />
            <Text type="secondary">No questionnaire data available</Text>
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
};

export default PCFRequestView;
