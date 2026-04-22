import React, { useState } from "react";
import {
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Leaf,
    Truck,
    Factory,
    RefreshCw,
    ExternalLink,
    Maximize,
    X,
    ChevronLeft,
    Calendar
} from "lucide-react";
import { DatePicker } from "antd";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    subValue: string;
    trend?: number;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    positiveIsGood?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subValue,
    trend,
    icon: Icon,
    iconBg,
    iconColor,
    positiveIsGood = false
}) => {
    const hasTrend = typeof trend === "number";
    const isPositive = hasTrend && trend! > 0;
    const isGood = positiveIsGood ? isPositive : !isPositive;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`${iconBg} ${iconColor} p-2.5 rounded-xl`}>
                    <Icon className="w-5 h-5" />
                </div>
                {hasTrend && (
                    <div className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-bold ${isGood
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-600'
                        }`}>
                        {isPositive ? '+' : ''}{trend}%
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <p className="text-xs text-gray-400">{subValue}</p>
            </div>
        </div>
    );
};

interface ChartCardProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    onViewDetails?: () => void;
    showExpand?: boolean;
    onExpand?: () => void;
}

export const ChartCard: React.FC<ChartCardProps> = ({
    title,
    subtitle,
    children,
    onViewDetails,
    showExpand,
    onExpand
}) => {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-base font-bold text-gray-900">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-3">
                    {showExpand && (
                        <button
                            onClick={onExpand}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#B3E699] rounded-lg text-xs font-bold text-[#52C41A] hover:bg-green-50 transition-colors cursor-pointer"
                        >
                            <Maximize className="w-3.5 h-3.5" />
                            Expand
                        </button>
                    )}
                    {onViewDetails && (
                        <button
                            onClick={onViewDetails}
                            className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors cursor-pointer"
                        >
                            View Details
                        </button>
                    )}
                </div>
            </div>
            <div className="h-[300px] w-full">
                {children}
            </div>
        </div>
    );
};

export const ChartModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors group cursor-pointer"
                    >
                        <X className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
                <div className="p-6 sm:p-8 h-[500px] sm:h-[600px] overflow-x-auto chart-scrollbar">
                    <div className="h-full min-w-[600px]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DetailedHeader: React.FC<{
    title: string;
    subtitle: string;
    onBack: () => void;
    icon?: LucideIcon;
}> = ({ title, subtitle, onBack, icon: Icon = Leaf }) => {
    return (
        <div className="space-y-6 mb-8">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-900 font-bold hover:text-green-600 transition-colors group cursor-pointer"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Dashboard
            </button>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-green-500 p-3 rounded-xl shadow-lg shadow-green-100">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        <p className="text-sm text-gray-400">{subtitle}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface DashboardHeaderProps {
    dateRange: "month" | "quarter" | "custom";
    onDateRangeChange: (range: "month" | "quarter" | "custom") => void;
    customDates?: [any, any] | null;
    onCustomDatesChange?: (dates: [any, any] | null) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    dateRange,
    onDateRangeChange,
    customDates,
    onCustomDatesChange,
}) => {
    return (
        <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-[#1A5D1A] via-[#2E8B2E] to-[#52C41A] p-6 shadow-lg">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-white/5 rounded-full" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3.5 rounded-2xl border border-white/20">
                        <Leaf className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Product Carbon Footprint Dashboard</h1>
                        <p className="text-sm text-green-100 mt-1">Comprehensive carbon footprint metrics across product lifecycle</p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2.5">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-1">
                            {(["month", "quarter", "custom"] as const).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => onDateRangeChange(r)}
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
                            onChange={(dates) => onCustomDatesChange?.(dates as [any, any] | null)}
                            size="small"
                            className="!bg-white/15 !backdrop-blur-sm !border-white/20 !rounded-xl !h-8 [&_.ant-picker-input>input]:!text-white [&_.ant-picker-input>input::placeholder]:!text-white/60 [&_.ant-picker-separator]:!text-white/80 [&_.ant-picker-suffix]:!text-white/80 [&_.ant-picker-clear]:!text-white/80 [&_.ant-picker-active-bar]:!bg-white"
                            suffixIcon={<Calendar className="w-3.5 h-3.5 text-white/80" />}
                            style={{ width: 240 }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};


// ── Shared Chart Tooltip ──────────────────────────────────────
export const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100/80">
            {label && (
                <p className="text-xs font-semibold text-gray-500 mb-1.5 tracking-wide uppercase">{label}</p>
            )}
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                    <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color || '#22C55E' }}
                    />
                    <span className="text-xs text-gray-500">{entry.name}:</span>
                    <span className="text-sm font-bold text-gray-900">
                        {typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const chartTooltipCursor = { fill: 'rgba(34,197,94,0.04)', radius: 4 };